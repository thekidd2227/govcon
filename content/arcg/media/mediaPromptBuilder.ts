/**
 * Hook-specific media prompt builder.
 *
 * Every prompt must answer:
 *   - What is the buyer seeing?
 *   - What is broken?
 *   - What operational leak / workflow failure is visible?
 *   - What dashboard, pipeline, document, handoff, task, bid, patient
 *     workflow, or property operation is shown?
 *   - Why does this visual belong to THIS hook and not another post?
 *
 * The builder is deterministic — same post in, same prompt out. The
 * companion validator (`mediaPromptValidator.ts`) blocks generation if
 * the prompt fails the product-specific rules.
 */

import type { ContentPost } from "../types";
import type {
  MediaPromptResult,
  MediaCarouselSlide,
  PromptContext,
} from "./mediaTypes";

/* ─────────────────────────────────────────────────────────────────────── *
 * Product visual systems
 * ─────────────────────────────────────────────────────────────────────── */

const PRODUCT_VISUAL_SYSTEM = {
  arcg: {
    palette:
      "dark navy (#0A0C12) and charcoal background, gold (#C9941A) accent, " +
      "muted teal (#4ec9b0) for healthy states, red (#e06060) for leaks",
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
    requiredConcepts: [
      "operational leak",
      "blueprint",
      "workflow",
      "dashboard",
      "dispatch",
      "reporting",
      "compliance",
    ],
  },
  sourcedeck: {
    palette:
      "dark control-tower aesthetic — deep slate, gold accents, " +
      "phosphor-green for active states, red for blocked items",
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
    requiredConcepts: [
      "command center",
      "control tower",
      "source of truth",
      "pipeline",
      "dashboard",
      "operating picture",
    ],
  },
  chartnav: {
    palette:
      "clean clinical white-and-charcoal, navy and gold accents, " +
      "calm and uncluttered — no medical-device feel, no thermometer-icon clichés",
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
    requiredConcepts: [
      "intake",
      "imaging",
      "exam",
      "orders",
      "signoff",
      "export readiness",
      "handoff",
    ],
  },
  rezy: {
    palette:
      "warm slate background, gold accent, calm operational vibe, " +
      "with a clearly visible 'Coming Soon' / 'Early Access' / 'Waitlist' frame",
    primarySubjects: [
      "property operations layer mockup with coming-soon badge",
      "maintenance board preview with waitlist call-to-action",
      "tenant/vendor/task dashboard with early-access badge",
      "regional ops console with pre-launch frame",
    ],
    forbidden: [
      "no launched-product claim",
      "no live-pricing screens",
      "no robots",
      "no handshakes",
      "no conference rooms",
    ],
    requiredConcepts: [
      "coming soon",
      "waitlist",
      "early access",
      "property operations",
    ],
  },
} as const;

/* ─────────────────────────────────────────────────────────────────────── *
 * Platform sizing
 *
 * OpenAI's image-generation surface (gpt-image-1 family and successors)
 * accepts a fixed set of pixel dimensions. We pick the closest supported
 * size per platform and document the fallback inline.
 * ─────────────────────────────────────────────────────────────────────── */

const PLATFORM_SIZE = {
  linkedin: { aspectRatio: "16:9" as const, size: "1536x1024" },
  instagram: { aspectRatio: "4:5" as const, size: "1024x1536" },
  facebook: { aspectRatio: "1:1" as const, size: "1024x1024" },
};

/* ─────────────────────────────────────────────────────────────────────── *
 * Helpers
 * ─────────────────────────────────────────────────────────────────────── */

function trimHook(hook: string, maxLen = 180): string {
  const t = (hook || "").trim();
  return t.length > maxLen ? t.slice(0, maxLen - 1) + "…" : t;
}

/** Burned-in overlay text: 6 words max, derived from the hook. */
function overlayFromHook(hook: string): string {
  const cleaned = (hook || "")
    .replace(/[^\w\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(" ").filter(Boolean);
  return words.slice(0, 6).join(" ");
}

function pickVisualMetaphor(ctx: PromptContext): string {
  const v = PRODUCT_VISUAL_SYSTEM[ctx.product].primarySubjects;
  // deterministic — index by a stable hash of the post id, not random
  let h = 0;
  for (const c of ctx.postId) h = ((h << 5) - h + c.charCodeAt(0)) | 0;
  return v[Math.abs(h) % v.length];
}

function ctaIntent(cta: string): string {
  const c = (cta || "").toLowerCase();
  if (c.includes("diagnostic")) return "book diagnostic call";
  if (c.includes("waitlist") || c.includes("early access")) return "join early access";
  if (c.includes("command center") || c.includes("sourcedeck.app")) return "open command center";
  if (c.includes("assessment")) return "share operating detail";
  if (c.includes("dm ")) return "DM keyword";
  return "campaign intent";
}

/* ─────────────────────────────────────────────────────────────────────── *
 * Prompt building
 * ─────────────────────────────────────────────────────────────────────── */

function ctxFromPost(post: ContentPost): PromptContext {
  return {
    postId: post.id,
    platform: post.platform,
    product: post.product,
    audience: post.audience,
    hook: post.hook,
    caption: post.caption,
    cta: post.cta,
    theme: post.theme,
    sourceAngle: post.sourceAngle || "",
  };
}

function singleImagePrompt(ctx: PromptContext, overlayText: string,
                            visualMetaphor: string): string {
  const visual = PRODUCT_VISUAL_SYSTEM[ctx.product];
  const platformSize = PLATFORM_SIZE[ctx.platform].size;
  const hook = trimHook(ctx.hook);
  return [
    `Generate an editorial ${ctx.platform} visual for ${ctx.product.toUpperCase()} (${platformSize}).`,
    `Audience: ${ctx.audience.replace(/-/g, " ")}.`,
    `Campaign intent: ${ctaIntent(ctx.cta)}.`,
    `This image must visualize THIS specific hook: "${hook}".`,
    `Visual metaphor: ${visualMetaphor}.`,
    `Why this visual belongs to this exact post: it translates "${hook}" into a ${visualMetaphor} for ${ctx.product.toUpperCase()}, tied to ${ctaIntent(ctx.cta)} for ${ctx.audience.replace(/-/g, " ")}.`,
    `Show the operational leak / workflow failure the hook describes — make the broken thing readable in one glance.`,
    `Required concepts visible in the scene: ${visual.requiredConcepts.join(", ")}.`,
    `Style: ${visual.palette}. Editorial, high-resolution, photographic-realism for any UI screens, no stock-photo people, no logos that are not ARCG, SourceDeck, ChartNav, or Rezy.`,
    `Composition: visual-first, with a small overlay text in the bottom-left reading exactly: "${overlayText}". Do not render long captions inside the image.`,
    `Forbidden: ${visual.forbidden.join("; ")}.`,
    `Theme: ${ctx.theme}. Source angle: ${ctx.sourceAngle || "(none)"}.`,
  ].join("\n");
}

function carouselSlides(ctx: PromptContext): MediaCarouselSlide[] {
  const visual = PRODUCT_VISUAL_SYSTEM[ctx.product];
  const hook = trimHook(ctx.hook);
  const intent = ctaIntent(ctx.cta);
  const audience = ctx.audience.replace(/-/g, " ");

  const slideTemplates: Array<{
    headline: string;
    subheadline?: string;
    visualBrief: string;
  }> = [
    {
      headline: hook.length > 60 ? hook.slice(0, 57) + "…" : hook,
      subheadline: `For ${audience}`,
      visualBrief: `Slide 1 — Hook. Visualize the buyer pain in the hook: "${hook}". Show the broken workflow / leaking pipeline / unclear dashboard the operator is staring at.`,
    },
    {
      headline: "The problem operators don't name",
      subheadline: ctx.theme,
      visualBrief: `Slide 2 — Problem. Show the manual workaround the team uses today (spreadsheet sprawl, group chats, sticky notes). Same product visual system as slide 1.`,
    },
    {
      headline: "What it actually costs",
      visualBrief: `Slide 3 — Hidden cost. Show the downstream consequence (missed SLA, dropped intake, audit gap). Make the cost legible — a metric, a missed handoff, a red status pill.`,
    },
    {
      headline: `${ctx.product.toUpperCase()} fits here`,
      subheadline:
        ctx.product === "rezy"
          ? "Coming soon · join the waitlist"
          : `Where ${ctx.product.toUpperCase()} sits in the workflow`,
      visualBrief: `Slide 4 — Product frame. Show ${ctx.product.toUpperCase()}'s ${visual.primarySubjects[0]} as the layer that surfaces the missing visibility. Keep the dashboard plausible, not a sci-fi mockup.`,
    },
    {
      headline: intent === "campaign intent" ? "Next step" : intent,
      subheadline: ctx.cta,
      visualBrief: `Slide 5 — CTA. Closing card with the campaign intent ("${intent}") and ${ctx.product.toUpperCase()} brand mark. Quiet composition, gold accent, no stock photography.`,
    },
  ];

  return slideTemplates.map((slide, idx) => {
    const visualPrompt = [
      slide.visualBrief,
      `Audience: ${audience}.`,
      `Why this visual belongs to this exact post: it turns "${hook}" into slide ${idx + 1}'s ${slide.headline} frame for ${ctx.product.toUpperCase()} and the "${intent}" action.`,
      `Style: ${visual.palette}.`,
      `Required concepts: ${visual.requiredConcepts.join(", ")}.`,
      `Forbidden: ${visual.forbidden.join("; ")}.`,
      `Image size: ${PLATFORM_SIZE.instagram.size} (Instagram carousel portrait).`,
      `This slide is part of a 5-slide carousel for post ${ctx.postId}.`,
    ].join("\n");
    return {
      slideNumber: idx + 1,
      headline: slide.headline,
      subheadline: slide.subheadline,
      visualPrompt,
    };
  });
}

/* ─────────────────────────────────────────────────────────────────────── *
 * Public API
 * ─────────────────────────────────────────────────────────────────────── */

export function buildMediaPrompt(post: ContentPost): MediaPromptResult {
  const ctx = ctxFromPost(post);
  const overlayText = overlayFromHook(post.hook);
  const visualMetaphor = pickVisualMetaphor(ctx);
  const { aspectRatio, size } = PLATFORM_SIZE[ctx.platform];
  const visual = PRODUCT_VISUAL_SYSTEM[ctx.product];

  const isCarousel =
    post.platform === "instagram" &&
    (post.format === "carousel" || post.assetType === "image");

  if (isCarousel && post.format === "carousel") {
    const slides = carouselSlides(ctx);
    return {
      mediaPrompt: slides
        .map((s) => `[Slide ${s.slideNumber}]\n${s.visualPrompt}`)
        .join("\n\n---\n\n"),
      promptBrief: `Instagram carousel · 5 slides · ${post.product.toUpperCase()} · ` +
        `hook "${trimHook(post.hook, 80)}"`,
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
    mediaPrompt: singleImagePrompt(ctx, overlayText, visualMetaphor),
    promptBrief:
      `${post.platform} ${ctx.product.toUpperCase()} single image · ` +
      `hook "${trimHook(post.hook, 80)}"`,
    forbiddenElements: [...visual.forbidden],
    requiredElements: [...visual.requiredConcepts],
    visualMetaphor,
    overlayText,
    aspectRatio,
    size,
    assetType: "image",
  };
}

export const __test__ = {
  PRODUCT_VISUAL_SYSTEM,
  PLATFORM_SIZE,
  overlayFromHook,
  pickVisualMetaphor,
};
