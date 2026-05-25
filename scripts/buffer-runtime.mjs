import { appendScheduleLog, captionHash, finalCaption, loadLocalEnv } from "./content-utils.mjs";

export const BUFFER_ENDPOINT = "https://api.buffer.com";

export const getOrganizationsQuery = `
query GetOrganizations {
  account {
    organizations {
      id
      name
      ownerEmail
    }
  }
}`;

export const getChannelsQuery = `
query GetChannels($organizationId: ID!) {
  channels(input: { organizationId: $organizationId }) {
    id
    name
    displayName
    service
    isQueuePaused
  }
}`;

export const createPostMutation = `
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    ... on PostActionSuccess {
      post {
        id
        text
      }
    }
    ... on MutationError {
      message
    }
  }
}`;

export function getBufferConfig({ requireApiKey = true } = {}) {
  loadLocalEnv();
  const config = {
    apiKey: process.env.BUFFER_API_KEY,
    organizationId: process.env.BUFFER_ORGANIZATION_ID,
    timezone: process.env.BUFFER_TIMEZONE || "America/New_York",
    scheduleMode: process.env.BUFFER_SCHEDULE_MODE || "schedule",
    channels: {
      linkedin: process.env.BUFFER_CHANNEL_LINKEDIN,
      instagram: process.env.BUFFER_CHANNEL_INSTAGRAM,
      facebook: process.env.BUFFER_CHANNEL_FACEBOOK,
    },
  };
  if (requireApiKey && !config.apiKey) {
    throw new Error("Missing BUFFER_API_KEY. Add it as a GitHub Actions secret or local environment variable.");
  }
  return config;
}

export async function bufferGraphql(query, variables = {}, config = getBufferConfig()) {
  const response = await fetch(BUFFER_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    // Surface the actual Buffer error (GraphQL errors or REST error body)
    // instead of just the status code. Without this, HTTP 400 surfaces as
    // "Buffer API request failed with HTTP 400." with no clue why.
    const detail =
      payload?.errors?.map?.((e) => e?.message).filter(Boolean).join("; ") ||
      payload?.error?.message ||
      payload?.message ||
      (typeof payload === "object" ? JSON.stringify(payload).slice(0, 500) : "");
    throw new Error(
      `Buffer API request failed with HTTP ${response.status}${detail ? `: ${detail}` : "."}`
    );
  }
  if (payload.errors?.length) throw new Error(`Buffer GraphQL error: ${payload.errors.map((e) => e.message).join("; ")}`);
  return payload.data;
}

function parseRecommendedTime(value) {
  const match = String(value).match(/^(\d{2}):(\d{2})$/);
  if (!match) throw new Error(`Invalid recommendedTime "${value}". Expected HH:MM.`);
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

function timeZoneOffsetMs(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute), Number(values.second));
  return asUtc - date.getTime();
}

export function dueAtForPost(post, timeZone) {
  const [year, month, day] = post.date.split("-").map(Number);
  const { hour, minute } = parseRecommendedTime(post.recommendedTime);
  const localAsUtc = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offset = timeZoneOffsetMs(localAsUtc, timeZone);
  return new Date(localAsUtc.getTime() - offset).toISOString();
}

function isLocalFileUrl(url) {
  return typeof url === "string" && url.startsWith("file://");
}

const HTTPS_URL_RE = /^https:\/\//;
function isPublicHttpsUrl(url) {
  return typeof url === "string" && HTTPS_URL_RE.test(url) && !isLocalFileUrl(url);
}

/**
 * Pick the first usable public https asset URL on a post. Returns null when
 * neither assetUrl nor assetUrls[] yields one. Local file:// paths are not
 * Buffer-ready and never returned.
 */
export function pickPublicAssetUrl(post) {
  if (isPublicHttpsUrl(post?.assetUrl)) return post.assetUrl;
  if (Array.isArray(post?.assetUrls)) {
    const u = post.assetUrls.find((candidate) => isPublicHttpsUrl(candidate));
    if (u) return u;
  }
  return null;
}

/**
 * Split-scheduling classifier.
 *
 * Routes posts based on two axes: whether a public asset URL exists AND
 * whether the post was *planned* as text-only (assetType === "none"):
 *
 *   • public https assetUrl present      → route: "media"
 *   • no assetUrl + instagram            → route: "skip" (reason: instagram_requires_media)
 *   • no assetUrl + assetType "none"
 *         + linkedin|facebook            → route: "planned-text-only"
 *   • no assetUrl + assetType NOT "none"
 *         + linkedin|facebook            → route: "skip" (reason: missing_media)
 *   • no assetUrl + unknown platform     → route: "skip" (reason: missing_media)
 *
 * The key distinction: a LinkedIn/Facebook post with assetType "image" that
 * lacks a public URL is NOT a valid text-only post — it's a media post whose
 * asset hasn't been generated/uploaded yet. Only posts explicitly planned as
 * text-only (assetType "none") route through the text path.
 *
 * Pure function — no I/O, no env reads. Safe to call in tests and dry-runs.
 */
export function classifyPostForBuffer(post) {
  const publicUrl = pickPublicAssetUrl(post);
  const platform = post?.platform;
  const plannedTextOnly = !post?.assetType || post.assetType === "none";

  if (publicUrl) return { route: "media", publicUrl, reason: null };

  if (platform === "instagram") {
    return { route: "skip", publicUrl: null, reason: "instagram_requires_media" };
  }
  if (platform === "linkedin" || platform === "facebook") {
    if (plannedTextOnly) {
      return { route: "planned-text-only", publicUrl: null, reason: null };
    }
    return { route: "skip", publicUrl: null, reason: "missing_media" };
  }
  return { route: "skip", publicUrl: null, reason: "missing_media" };
}

export function createPostInput(post, config, opts = {}) {
  const channelId = config.channels[post.platform];
  const input = {
    text: finalCaption(post),
    channelId,
    schedulingType: "automatic",
    mode: "customScheduled",
    dueAt: dueAtForPost(post, config.timezone),
  };

  const requireMedia = Boolean(opts.requireMedia);
  const skipMissingMedia = Boolean(opts.skipMissingMedia);
  const allowCarouselSingleImage = Boolean(opts.allowCarouselSingleImage);
  // Explicit text-only mode: the caller (split-scheduler) has already decided
  // this post should be scheduled without media. Do NOT attach assets even if
  // a URL exists, and do NOT raise __missingMedia.
  const textOnly = Boolean(opts.textOnly);

  // Local file paths are NEVER sent to Buffer. They are not Buffer-ready.
  const safeAssetUrl = post.assetUrl && !isLocalFileUrl(post.assetUrl) ? post.assetUrl : null;
  const safeAssetUrls = Array.isArray(post.assetUrls)
    ? post.assetUrls.filter((u) => u && !isLocalFileUrl(u))
    : [];

  if (!textOnly) {
    if (post.assetType === "image" && safeAssetUrl) {
      input.assets = [{ image: { url: safeAssetUrl } }];
    } else if (post.assetType === "video" && safeAssetUrl) {
      input.assets = [{ video: { url: safeAssetUrl, thumbnailUrl: post.thumbnailUrl } }];
    } else if (post.assetType === "link" && safeAssetUrl) {
      input.assets = [{ link: { url: safeAssetUrl } }];
    } else if (post.assetType === "carousel" && safeAssetUrls.length > 0) {
      // Carousel handling — Buffer's public GraphQL schema for multi-image
      // carousels (Instagram) is not fully documented. We do NOT attempt to
      // attach multiple images unless explicitly authorized to fall back to a
      // single-image preview.
      if (allowCarouselSingleImage) {
        input.assets = [{ image: { url: safeAssetUrls[0] } }];
        input.__carouselFallback = true;
      } else {
        input.__carouselUnverified = true;
      }
    }
  }

  // Buffer requires per-platform metadata for Instagram and Facebook.
  // Correct path (confirmed via introspection):
  //   CreatePostInput.metadata -> PostInputMetaData -> <platform>PostMetadataInput
  // Instagram: type NON_NULL(PostType), shouldShareToFeed NON_NULL(Boolean)
  // Facebook:  type NON_NULL(PostTypeFacebook)
  // LinkedIn:  no required type field
  //
  // Facebook still requires metadata.facebook.type for text-only posts, so
  // we attach metadata regardless of textOnly. Instagram is never text-only
  // under the split-scheduling policy, so its metadata path is unaffected.
  if (post.platform === "instagram") {
    const instagramType = post.instagramType || (post.format === "reel" ? "reel" : "post");
    input.metadata = {
      instagram: {
        type: instagramType,
        shouldShareToFeed: instagramType !== "story",
      },
    };
  } else if (post.platform === "facebook") {
    const facebookType = post.facebookType || (post.format === "reel" ? "reel" : "post");
    input.metadata = {
      facebook: {
        type: facebookType,
      },
    };
  }

  if (!textOnly && !input.assets) {
    if (requireMedia || skipMissingMedia) {
      input.__missingMedia = true;
    }
  }
  return input;
}

function describeCreatePostInputShape(input, { channelDataDropped = false } = {}) {
  const keys = Object.keys(input).filter((k) => !k.startsWith("__"));
  const parts = [`keys: [${keys.join(", ")}]`];
  if (input.channelId) parts.push("channelId: ***");
  if (input.metadata?.instagram) parts.push(`meta.instagram.type: ${input.metadata.instagram.type}`);
  if (input.metadata?.facebook) parts.push(`meta.facebook.type: ${input.metadata.facebook.type}`);
  if (Array.isArray(input.assets)) {
    const assetDesc = input.assets.map((a) => {
      const kind = a.image ? "image" : a.video ? "video" : a.link ? "link" : "unknown";
      return kind;
    }).join(", ");
    parts.push(`assets: [${assetDesc}]`);
  }
  if (channelDataDropped) parts.push("channelData: dropped");
  return `{ ${parts.join(", ")} }`;
}

function toGraphqlCreatePostInput(input) {
  // Buffer's CreatePostInput requires channelId at the top level. channelData
  // and channels[] are not valid fields on CreatePostInput, so drop them along
  // with internal flags (prefixed __) before sending.
  const {
    channelData: _channelData,
    __carouselFallback,
    __carouselUnverified,
    __missingMedia,
    ...rest
  } = input;
  return rest;
}

export async function schedulePost(post, config, opts = {}) {
  const input = createPostInput(post, config, opts);
  if (!input.channelId) throw new Error(`Missing channel mapping for ${post.platform}.`);
  if (!opts.textOnly) {
    if (input.__carouselUnverified) {
      throw new Error(
        `Skipping ${post.id}: carousel multi-image attachment is not verified against Buffer GraphQL schema. ` +
          `Pass --allow-carousel-single-image to attach the first image as a fallback, or generate as a single image.`
      );
    }
    if (input.__missingMedia && (opts.requireMedia || opts.skipMissingMedia)) {
      const flag = opts.requireMedia ? "--require-media" : "--skip-missing-media";
      throw new Error(`Skipping ${post.id}: ${flag} is set but no Buffer-ready assetUrl.`);
    }
  }
  const channelDataDropped = Boolean(input.channelData);
  const graphqlInput = toGraphqlCreatePostInput(input);
  console.log(`buffer createPost input shape ${post.id}: ${describeCreatePostInputShape(graphqlInput, { channelDataDropped })}`);
  const data = await bufferGraphql(createPostMutation, { input: graphqlInput }, config);
  const result = data.createPost;
  if (result.message) throw new Error(result.message);
  const record = {
    postId: post.id,
    product: post.product,
    platform: post.platform,
    channelId: input.channelId,
    dueAt: input.dueAt,
    bufferPostId: result.post.id,
    status: "scheduled",
    scheduledAt: new Date().toISOString(),
    captionHash: captionHash(post),
  };
  appendScheduleLog(record);
  return record;
}
