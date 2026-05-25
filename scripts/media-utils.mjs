/**
 * JS-port of src/content/arcg/media/{mediaPromptBuilder,mediaPromptValidator}.ts
 *
 * Keep these two surfaces in sync. The TS files are the source of truth for
 * the React admin view; this .mjs is the runtime for Node scripts.
 */

import { createHash } from "node:crypto";

const PRODUCT_VISUAL_SYSTEM = {
  arcg: {
    palette:
      "dark navy (#0A0C12) and charcoal background, gold (#C9941A) accent, muted teal for healthy states, red for leaks",
    primarySubjects: [
      "operational leak map",
      "workflow blueprint",
      "ops dashboard",
      "vendor dispatch board",
      "reporting visibility console",
      "handoff diagram",
      "SLA tracker",
    ],
    forbidden: [
      "no robots",
      "no humanoid AI characters",
      "no handshakes",
      "no conference rooms",
      "no stock-photo business people",
      "no generic office scenes",
      "no city skyline backgrounds",
    ],
    requiredConcepts: ["operational leak", "blueprint", "workflow", "dashboard", "dispatch", "reporting", "compliance"],
  },
  sourcedeck: {
    palette: "dark control-tower aesthetic — deep slate, gold accents, phosphor-green for active states, red for blocked items",
    primarySubjects: [
      "GovCon command center screen",
      "bid pipeline dashboard",
      "document tracker with status pills",
      "task control tower",
      "source-of-truth operating picture",
      "small-business operating console",
    ],
    forbidden: [
      "no generic project management UI",
      "no Trello/Asana lookalike screens",
      "no kanban with sticky notes",
      "no robots",
      "no handshakes",
      "no conference rooms",
    ],
    requiredConcepts: ["command center", "control tower", "source of truth", "pipeline", "dashboard", "operating picture"],
  },
  chartnav: {
    palette: "clean clinical white-and-charcoal, navy and gold accents, calm and uncluttered",
    primarySubjects: [
      "ophthalmology intake checklist",
      "imaging readiness board",
      "exam-to-orders workflow",
      "technician-to-physician handoff diagram",
      "documentation completeness tracker",
      "export-readiness console",
    ],
    forbidden: [
      "no patient faces",
      "no patient-identifiable imagery",
      "no chart record numbers",
      "no autonomous diagnosis visuals",
      "no FDA/HIPAA certification badges",
      "no guaranteed-billing claims",
      "no doctors in white coats stock photos",
    ],
    requiredConcepts: ["intake", "imaging", "exam", "orders", "signoff", "export readiness", "handoff"],
  },
  rezy: {
    palette: "warm slate background, gold accent, with a clearly visible 'Coming Soon' / 'Early Access' / 'Waitlist' frame",
    primarySubjects: [
      "property operations layer mockup with coming-soon badge",
      "maintenance board preview with waitlist call-to-action",
      "tenant/vendor/task dashboard with early-access badge",
      "regional ops console with pre-launch frame",
    ],
    forbidden: ["no launched-product claim", "no live-pricing screens", "no robots", "no handshakes", "no conference rooms"],
    requiredConcepts: ["coming soon", "waitlist", "early access", "property operations"],
  },
};

const PLATFORM_SIZE = {
  linkedin: { aspectRatio: "16:9", size: "1536x1024" },
  instagram: { aspectRatio: "4:5", size: "1024x1536" },
  facebook: { aspectRatio: "1:1", size: "1024x1024" },
};

const GENERIC_VISUAL_LANGUAGE = [
  "generic business",
  "stock photo",
  "stock-photo",
  "office setting",
  "conference room",
  "handshake",
  "two professionals shaking hands",
  "team meeting",
  "boardroom",
  "skyline",
  "robot",
  "humanoid ai",
  "futuristic robot",
  "ai magic",
  "lightbulb idea",
  "brainstorm",
];

const ARCG_REQUIRED = ["operational leak", "leak", "blueprint", "workflow", "dashboard", "dispatch", "reporting", "compliance"];
const SOURCEDECK_REQUIRED = ["command center", "control tower", "source of truth", "pipeline", "dashboard", "operating picture"];
const CHARTNAV_FORBIDDEN = [
  "patient face",
  "patient-identifiable",
  "patient identifiable",
  "patient name",
  "autonomous diagnosis",
  "fda approved",
  "fda cleared",
  "fda certified",
  "hipaa certified",
  "hipaa certification",
  "guaranteed billing",
  "guarantee billing",
];
const CHARTNAV_REQUIRED = ["intake", "imaging", "exam", "orders", "signoff", "sign-off", "export readiness", "handoff"];
const REZY_REQUIRED = ["coming soon", "waitlist", "early access", "pre-launch"];

const lower = (s) => String(s || "").toLowerCase();
const any = (t, terms) => { const l = lower(t); return terms.some((x) => l.includes(x)); };
const none = (t, terms) => !any(t, terms);

function trimHook(hook, maxLen = 180) {
  const t = String(hook || "").trim();
  return t.length > maxLen ? t.slice(0, maxLen - 1) + "…" : t;
}

function overlayFromHook(hook) {
  const cleaned = String(hook || "").replace(/[^\w\s'-]/g, " ").replace(/\s+/g, " ").trim();
  return cleaned.split(" ").filter(Boolean).slice(0, 6).join(" ");
}

function pickVisualMetaphor(product, postId) {
  const list = PRODUCT_VISUAL_SYSTEM[product]?.primarySubjects || [];
  if (!list.length) return "operational workflow scene";
  let h = 0;
  for (const c of String(postId)) h = ((h << 5) - h + c.charCodeAt(0)) | 0;
  return list[Math.abs(h) % list.length];
}

/* ─────────────────────────────────────────────────────────────────────── *
 * Per-post composition variety — deterministic by postId so each post in
 * the month gets a visually distinct scene even when product / palette /
 * required-concepts overlap. Each axis rotates independently.
 * ─────────────────────────────────────────────────────────────────────── */

const COMPOSITION_VARIANTS = [
  "wide horizontal hero shot of a single large console screen, off-center subject, generous negative space on the right",
  "isometric 3/4 view of a multi-panel operations layout, depth and layering",
  "macro detail close-up on one widget or metric, shallow depth of field, blurred surrounding interface",
  "top-down flat-lay of a workflow diagram on a dark desk, gold accent annotations",
  "side-by-side split: broken/manual state on the left, organized state on the right, vertical divider",
  "vertical stacked-card composition of three connected steps, arrows between them",
  "before/after framing with a subtle red→green progression cue",
  "single hand-held tablet or laptop in a real environment, screen content readable, surroundings out of focus",
];

const CAMERA_MOODS = [
  "early-morning shift change, low warm lighting",
  "after-hours ops room, single screen glow",
  "mid-day live war-room, alert energy",
  "remote field environment with a single device in foreground",
  "quiet planning session, paper sketches next to a screen",
  "split-screen control tower at peak activity",
  "calm post-resolution moment, healthy green status dominating",
  "tense pre-deadline focus, red SLA timer prominent",
];

const FOCAL_ANCHORS = {
  arcg: [
    "a single red SLA-breach widget centered as the protagonist",
    "a vendor dispatch board with one row highlighted in gold",
    "an operational-leak map with one tagged failure point",
    "a workflow blueprint sketch annotated with red ink",
    "a reporting dashboard with one metric drilled into",
    "a handoff diagram with a missing-owner gap glowing",
    "an SLA tracker line chart crossing a threshold",
    "an ops dashboard with red leak indicators and gold healthy states side-by-side",
  ],
  sourcedeck: [
    "a single bid card moving across a pipeline lane",
    "a document tracker row turning from amber to green",
    "a command-center map with one active mission node",
    "a source-of-truth screen showing a contradiction between two systems being resolved",
    "a task control-tower view with one priority lane highlighted",
    "an operating-picture screen with mission status cards",
    "a small-business console with one decision waiting for approval",
    "a GovCon capture pipeline focused on one bid in 'next step' state",
  ],
  chartnav: [
    "an intake checklist with one missing field highlighted",
    "an imaging readiness board with one waiting-for-tech row",
    "an exam-to-orders workflow with one signoff pending",
    "a documentation completeness tracker with one chart at 80%",
    "an export-readiness console showing one record blocked",
    "a technician-to-physician handoff with one queued case",
    "an ophthalmology workflow lane with one bottleneck visible",
    "a calm clinical workflow view with one card flagged for review",
  ],
  rezy: [
    "a property operations layer mockup with a 'coming soon' overlay",
    "a maintenance board preview with a waitlist banner",
    "a tenant/vendor/task dashboard with an early-access frame",
    "a regional ops console with a pre-launch lock badge",
    "a property command layer wireframe with a join-waitlist button",
    "a maintenance dispatch screen behind a frosted 'preview' overlay",
    "an owner reporting screen with an 'early access' chip",
    "a regional property map view with an 'opening soon' state",
  ],
};

/** FNV-1a 32-bit. Better avalanche than djb2 — needed because the lists
 *  are small (8 entries) and naive hashes produce same-day collisions
 *  for posts whose ids differ only by platform. */
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function hashPostId(postId) {
  return fnv1a(String(postId || ""));
}

/** Per-axis hash: mixes the axis name in so the same post id rotates
 *  through each axis independently. */
function hashAxis(postId, axis) {
  return fnv1a(`${axis}|${String(postId || "")}`);
}

function pickVariant(list, postId, axis) {
  if (!list?.length) return "";
  return list[hashAxis(postId, axis) % list.length];
}

function ctaIntent(cta) {
  const c = lower(cta);
  if (c.includes("diagnostic")) return "book diagnostic call";
  if (c.includes("waitlist") || c.includes("early access")) return "join early access";
  if (c.includes("command center") || c.includes("sourcedeck.app")) return "open command center";
  if (c.includes("assessment")) return "share operating detail";
  if (c.includes("dm ")) return "DM keyword";
  return "campaign intent";
}

function singleImagePrompt(post, overlayText, visualMetaphor) {
  const visual = PRODUCT_VISUAL_SYSTEM[post.product];
  const platformSize = PLATFORM_SIZE[post.platform].size;
  const hook = trimHook(post.hook);
  // Each axis is hashed with a different salt so the same post id rotates
  // through composition / camera / focal anchor independently.
  const composition = pickVariant(COMPOSITION_VARIANTS, post.id, "composition");
  const cameraMood = pickVariant(CAMERA_MOODS, post.id, "mood");
  const focalAnchor = pickVariant(FOCAL_ANCHORS[post.product] || [], post.id, "focal");
  // Touch a SUBSET of the product's required concepts per post, not all of
  // them — forcing all 7 in every scene was producing the same hub-and-spoke
  // dashboard for every post. Subset rotates by id.
  const conceptList = visual.requiredConcepts;
  const subsetSize = Math.min(3, conceptList.length);
  const subsetStart = hashPostId(post.id) % conceptList.length;
  const conceptSubset = Array.from({ length: subsetSize }, (_, i) =>
    conceptList[(subsetStart + i) % conceptList.length]
  );

  return [
    `Generate an editorial ${post.platform} visual for ${post.product.toUpperCase()} (${platformSize}).`,
    `Audience: ${post.audience.replace(/-/g, " ")}.`,
    `Campaign intent: ${ctaIntent(post.cta)}.`,
    `This image must visualize THIS specific hook: "${hook}".`,
    `Visual metaphor: ${visualMetaphor}.`,
    `Focal anchor (the protagonist of the frame): ${focalAnchor}.`,
    `Composition style: ${composition}.`,
    `Scene mood: ${cameraMood}.`,
    `Why this visual belongs to this exact post: it translates "${hook}" into a ${visualMetaphor} for ${post.product.toUpperCase()}, tied to ${ctaIntent(post.cta)} for ${post.audience.replace(/-/g, " ")}.`,
    `Show the operational leak / workflow failure the hook describes — make the broken thing readable in one glance.`,
    `Anchor on these concepts ONLY (do not try to cram every operational concept into one frame): ${conceptSubset.join(", ")}.`,
    `Visual distinctness requirement: this image must NOT recreate the generic multi-panel "blue-dashboard with red and gold widgets" composition. Every post in this campaign needs a different camera angle, different focal subject, and different scene framing. If your default impulse is "a wide dashboard with several widgets", reject it and use the composition style and focal anchor above instead.`,
    `Style: ${visual.palette}. Editorial, high-resolution, photographic-realism for any UI screens, no stock-photo people, no logos that are not ARCG, SourceDeck, ChartNav, or Rezy.`,
    `Overlay text: place exactly "${overlayText}" as a small label in the bottom-left of the frame. Do not render long captions inside the image. Do not generate any other in-image text.`,
    `Forbidden: ${visual.forbidden.join("; ")}.`,
    `Theme: ${post.theme}. Source angle: ${post.sourceAngle || "(none)"}.`,
  ].join("\n");
}

function carouselSlides(post) {
  const visual = PRODUCT_VISUAL_SYSTEM[post.product];
  const hook = trimHook(post.hook);
  const intent = ctaIntent(post.cta);
  const audience = post.audience.replace(/-/g, " ");
  const templates = [
    {
      headline: hook.length > 60 ? hook.slice(0, 57) + "…" : hook,
      subheadline: `For ${audience}`,
      visualBrief: `Slide 1 — Hook. Visualize the buyer pain in the hook: "${hook}". Show the broken workflow / leaking pipeline / unclear dashboard the operator is staring at.`,
    },
    {
      headline: "The problem operators don't name",
      subheadline: post.theme,
      visualBrief: `Slide 2 — Problem. Show the manual workaround the team uses today (spreadsheet sprawl, group chats, sticky notes). Same product visual system as slide 1.`,
    },
    {
      headline: "What it actually costs",
      visualBrief: `Slide 3 — Hidden cost. Show the downstream consequence (missed SLA, dropped intake, audit gap). Make the cost legible — a metric, a missed handoff, a red status pill.`,
    },
    {
      headline: `${post.product.toUpperCase()} fits here`,
      subheadline: post.product === "rezy" ? "Coming soon · join the waitlist" : `Where ${post.product.toUpperCase()} sits in the workflow`,
      visualBrief: `Slide 4 — Product frame. Show ${post.product.toUpperCase()}'s ${visual.primarySubjects[0]} as the layer that surfaces the missing visibility. Keep the dashboard plausible, not a sci-fi mockup.`,
    },
    {
      headline: intent === "campaign intent" ? "Next step" : intent,
      subheadline: post.cta,
      visualBrief: `Slide 5 — CTA. Closing card with the campaign intent ("${intent}") and ${post.product.toUpperCase()} brand mark. Quiet composition, gold accent, no stock photography.`,
    },
  ];
  return templates.map((s, idx) => ({
    slideNumber: idx + 1,
    headline: s.headline,
    subheadline: s.subheadline,
    visualPrompt: [
      s.visualBrief,
      `Audience: ${audience}.`,
      `Why this visual belongs to this exact post: it turns "${hook}" into slide ${idx + 1}'s ${s.headline} frame for ${post.product.toUpperCase()} and the "${intent}" action.`,
      `Style: ${visual.palette}.`,
      `Required concepts: ${visual.requiredConcepts.join(", ")}.`,
      `Forbidden: ${visual.forbidden.join("; ")}.`,
      `Image size: ${PLATFORM_SIZE.instagram.size} (Instagram carousel portrait).`,
      `This slide is part of a 5-slide carousel for post ${post.id}.`,
    ].join("\n"),
  }));
}

export function buildMediaPrompt(post) {
  const overlayText = overlayFromHook(post.hook);
  const visualMetaphor = pickVisualMetaphor(post.product, post.id);
  const { aspectRatio, size } = PLATFORM_SIZE[post.platform];
  const visual = PRODUCT_VISUAL_SYSTEM[post.product];
  const isCarousel = post.platform === "instagram" && post.format === "carousel";
  if (isCarousel) {
    const slides = carouselSlides(post);
    return {
      mediaPrompt: slides.map((s) => `[Slide ${s.slideNumber}]\n${s.visualPrompt}`).join("\n\n---\n\n"),
      promptBrief: `Instagram carousel · 5 slides · ${post.product.toUpperCase()} · hook "${trimHook(post.hook, 80)}"`,
      forbiddenElements: [...visual.forbidden],
      requiredElements: [...visual.requiredConcepts],
      visualMetaphor,
      overlayText,
      aspectRatio: PLATFORM_SIZE.instagram.aspectRatio,
      size: PLATFORM_SIZE.instagram.size,
      assetType: "carousel",
      carouselSlides: slides,
    };
  }
  return {
    mediaPrompt: singleImagePrompt(post, overlayText, visualMetaphor),
    promptBrief: `${post.platform} ${post.product.toUpperCase()} single image · hook "${trimHook(post.hook, 80)}"`,
    forbiddenElements: [...visual.forbidden],
    requiredElements: [...visual.requiredConcepts],
    visualMetaphor,
    overlayText,
    aspectRatio,
    size,
    assetType: "image",
  };
}

function promptReferencesHook(hook, prompt) {
  const cleanHook = lower(hook).replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);
  if (cleanHook.length < 4) return any(prompt, [lower(hook)]);
  const p = lower(prompt);
  for (let i = 0; i + 4 <= cleanHook.length; i++) {
    const window = cleanHook.slice(i, i + 4).join(" ");
    if (p.includes(window)) return true;
  }
  return p.includes(lower(hook)) || p.includes(`"${lower(hook)}"`);
}

/** Strip negated / forbidden-list sections so the validator doesn't see
 *  the literal phrases the prompt is telling the model to AVOID. */
function stripNegatedSegments(prompt) {
  return String(prompt || "")
    .split(/\n+/)
    .filter((line) => !/^\s*forbidden\s*:/i.test(line))
    .join("\n")
    // also drop "no X; no Y" style inline lists (defensive — our prompts
    // generally keep them on the Forbidden line, but the carousel slides
    // also include "Forbidden: ..." that the line filter above catches).
    .replace(/\bno\s+(robots|robot|humanoid ai|handshake|handshakes|conference rooms?|generic office scenes?|stock-photo people|stock photo people|city skyline backgrounds|skyline|patient faces|patient face|patient-identifiable|patient identifiable|patient name|chart record numbers|autonomous diagnosis|fda approved|fda cleared|fda certified|hipaa certified|hipaa certification|guaranteed billing|guarantee billing|doctors in white coats stock photos|generic project management ui|trello\/asana lookalike screens|kanban with sticky notes|launched-product claim|live-pricing screens)\b/gi, "");
}

export function validateMediaPrompt(post, result) {
  const errors = [];
  const warnings = [];
  let score = 100;
  const fullPrompt = `${result.mediaPrompt}\n${result.promptBrief}\n${(result.carouselSlides || []).map((s) => s.visualPrompt).join("\n")}`;
  const prompt = stripNegatedSegments(fullPrompt);

  if (!post.product) errors.push({ field: "product", message: "missing product on post" });
  if (!post.platform) errors.push({ field: "platform", message: "missing platform on post" });
  if (!post.audience) errors.push({ field: "audience", message: "missing audience on post" });

  if (!promptReferencesHook(post.hook, prompt)) {
    errors.push({ field: "mediaPrompt", message: "media prompt does not reference the exact hook or a direct hook-derived phrase" });
    score -= 25;
  }
  if (!result.visualMetaphor || !result.visualMetaphor.trim()) errors.push({ field: "visualMetaphor", message: "missing visual metaphor" });
  if (!/why this visual belongs to this exact post/i.test(prompt)) {
    errors.push({ field: "mediaPrompt", message: "media prompt must explain why the visual belongs to this exact post" });
    score -= 15;
  }
  if (!result.forbiddenElements?.length) errors.push({ field: "forbiddenElements", message: "missing forbiddenElements list" });
  if (any(prompt, GENERIC_VISUAL_LANGUAGE)) {
    const offenders = GENERIC_VISUAL_LANGUAGE.filter((t) => lower(prompt).includes(t));
    errors.push({ field: "mediaPrompt", message: `prompt contains generic / stock-photo visual language: ${offenders.join(", ")}` });
    score -= 15;
  }
  if (!lower(prompt).includes(post.platform)) {
    errors.push({ field: "mediaPrompt", message: `prompt is not platform-specific (does not mention "${post.platform}")` });
    score -= 10;
  }
  if (!any(prompt, ["diagnostic", "waitlist", "early access", "command center", "assessment", "dm ", "campaign intent"])) {
    warnings.push({ field: "mediaPrompt", message: "prompt does not reference CTA / campaign intent" });
    score -= 10;
  }
  if (!lower(prompt).includes(post.audience.replace(/-/g, " "))) {
    warnings.push({ field: "mediaPrompt", message: `prompt does not mention audience "${post.audience}"` });
    score -= 15;
  }
  if (!result.overlayText || !result.overlayText.split(/\s+/).filter(Boolean).length) {
    warnings.push({ field: "overlayText", message: "missing overlay text" });
    score -= 10;
  }

  if (post.product === "arcg" && none(prompt, ARCG_REQUIRED)) {
    errors.push({ field: "mediaPrompt", message: "ARCG prompt missing required concept (operational leak / blueprint / workflow / dashboard / dispatch / reporting / compliance)" });
    score -= 20;
  }
  if (post.product === "sourcedeck" && none(prompt, SOURCEDECK_REQUIRED)) {
    errors.push({ field: "mediaPrompt", message: "SourceDeck prompt missing required concept (command center / control tower / source-of-truth / pipeline / dashboard / operating picture)" });
    score -= 20;
  }
  if (post.product === "chartnav") {
    if (any(prompt, CHARTNAV_FORBIDDEN)) {
      const offenders = CHARTNAV_FORBIDDEN.filter((t) => lower(prompt).includes(t));
      errors.push({ field: "mediaPrompt", message: `ChartNav prompt contains forbidden visual claim: ${offenders.join(", ")}` });
      score -= 30;
    }
    if (none(prompt, CHARTNAV_REQUIRED)) {
      errors.push({ field: "mediaPrompt", message: "ChartNav prompt missing clinical-workflow concept (intake / imaging / exam / orders / signoff / export readiness / handoff)" });
      score -= 20;
    }
  }
  if (post.product === "rezy" && none(prompt, REZY_REQUIRED)) {
    errors.push({ field: "mediaPrompt", message: "Rezy prompt missing coming-soon / waitlist / early-access frame" });
    score -= 20;
  }

  if (score < 0) score = 0;
  if (score > 100) score = 100;
  return { score, errors, warnings };
}

export function hashPrompt(prompt) {
  return createHash("sha256").update(String(prompt)).digest("hex").slice(0, 16);
}

export function outputPathFor({ postId, month, product, platform, slideNumber }) {
  const baseDir = process.env.MEDIA_OUTPUT_DIR || ".generated-media";
  const filename = slideNumber
    ? `${postId}-slide-${String(slideNumber).padStart(2, "0")}.png`
    : `${postId}.png`;
  return `${baseDir}/${month}/${product}/${platform}/${filename}`;
}

export const PLATFORM_SIZES = PLATFORM_SIZE;
export const PRODUCT_RULES = PRODUCT_VISUAL_SYSTEM;
