import type { ContentPost } from "../types";
import { calendarDateTimeToUtcIso } from "./timezone";
import type { BufferConfig } from "./bufferTypes";

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

export function finalCaption(post: ContentPost) {
  return `${post.caption}\n\n${post.cta}\n\n${post.hashtags.join(" ")}`;
}

export function createBufferPostInput(post: ContentPost, config: BufferConfig) {
  const channelId = config.channels[post.platform];
  if (!channelId) throw new Error(`Missing channel mapping for ${post.platform}.`);

  const input: Record<string, unknown> = {
    text: finalCaption(post),
    channelId,
    schedulingType: "automatic",
    mode: "customScheduled",
    dueAt: calendarDateTimeToUtcIso(post.date, post.recommendedTime, config.timezone),
  };

  if (post.assetUrl && post.assetType === "image") input.assets = [{ image: { url: post.assetUrl } }];
  if (post.assetUrl && post.assetType === "video") input.assets = [{ video: { url: post.assetUrl, thumbnailUrl: post.thumbnailUrl } }];
  if (post.assetUrl && post.assetType === "link") input.assets = [{ link: { url: post.assetUrl } }];

  return input;
}

/*
 * Server-side only. Do not import this module into browser/React code.
 * Buffer credentials must come from process.env / GitHub Actions secrets.
 */
