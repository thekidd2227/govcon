/**
 * Media prompt validator.
 *
 * Mirrors the rules in `mediaPromptBuilder.ts`. Used by:
 *   - scripts/generate-media-plan.mjs (CSV with score + errors per post)
 *   - scripts/generate-media-assets.mjs (block generation when score is
 *     below MEDIA_MIN_RELEVANCE_SCORE and MEDIA_REQUIRE_HOOK_SPECIFIC=true)
 *   - scripts/media-validate-assets.mjs (state validation after generation)
 *
 * Returns a score 0..100 plus structured errors and warnings.
 */

import type { ContentPost } from "../types";
import type { MediaPromptResult, MediaPromptValidation } from "./mediaTypes";

/* ─────────────────────────────────────────────────────────────────────── *
 * Generic banned wording for image prompts
 * ─────────────────────────────────────────────────────────────────────── */

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

const ARCG_REQUIRED_CONCEPTS = [
  "operational leak",
  "leak",
  "blueprint",
  "workflow",
  "dashboard",
  "dispatch",
  "reporting",
  "compliance",
];

const SOURCEDECK_REQUIRED_CONCEPTS = [
  "command center",
  "control tower",
  "source of truth",
  "pipeline",
  "dashboard",
  "operating picture",
];

const CHARTNAV_FORBIDDEN_VISUALS = [
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

const CHARTNAV_REQUIRED_CONCEPTS = [
  "intake",
  "imaging",
  "exam",
  "orders",
  "signoff",
  "sign-off",
  "export readiness",
  "handoff",
];

const REZY_REQUIRED_CONCEPTS = ["coming soon", "waitlist", "early access", "pre-launch"];

/* ─────────────────────────────────────────────────────────────────────── *
 * Helpers
 * ─────────────────────────────────────────────────────────────────────── */

function lower(s: string): string {
  return (s || "").toLowerCase();
}

function any(text: string, terms: string[]): boolean {
  const l = lower(text);
  return terms.some((t) => l.includes(t));
}

function none(text: string, terms: string[]): boolean {
  return !any(text, terms);
}

/** Heuristic: does the prompt reference at least 4 consecutive words from the hook? */
function promptReferencesHook(hook: string, prompt: string): boolean {
  const cleanHook = lower(hook).replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);
  if (cleanHook.length < 4) return any(prompt, [lower(hook)]);
  const p = lower(prompt);
  // sliding window of 4 hook tokens
  for (let i = 0; i + 4 <= cleanHook.length; i++) {
    const window = cleanHook.slice(i, i + 4).join(" ");
    if (p.includes(window)) return true;
  }
  // direct quoted hook
  return p.includes(lower(hook)) || p.includes(`"${lower(hook)}"`);
}

/* ─────────────────────────────────────────────────────────────────────── *
 * Validator
 * ─────────────────────────────────────────────────────────────────────── */

export function validateMediaPrompt(
  post: ContentPost,
  result: MediaPromptResult
): MediaPromptValidation {
  const errors: { field: string; message: string }[] = [];
  const warnings: { field: string; message: string }[] = [];
  let score = 100;

  const fullPrompt = `${result.mediaPrompt}\n${result.promptBrief}\n${(result.carouselSlides || [])
    .map((s) => s.visualPrompt)
    .join("\n")}`;
  // Strip "Forbidden:" lines + "no X" tokens before scanning so the
  // validator does not flag phrases the prompt is telling the model
  // to AVOID.
  const prompt = fullPrompt
    .split(/\n+/)
    .filter((line) => !/^\s*forbidden\s*:/i.test(line))
    .join("\n")
    .replace(
      /\bno\s+(robots|robot|humanoid ai|handshake|handshakes|conference rooms?|generic office scenes?|stock-photo people|stock photo people|city skyline backgrounds|skyline|patient faces|patient face|patient-identifiable|patient identifiable|patient name|chart record numbers|autonomous diagnosis|fda approved|fda cleared|fda certified|hipaa certified|hipaa certification|guaranteed billing|guarantee billing|doctors in white coats stock photos|generic project management ui|trello\/asana lookalike screens|kanban with sticky notes|launched-product claim|live-pricing screens)\b/gi,
      ""
    );

  // ── hard errors ────────────────────────────────────────────────────────
  if (!post.product) errors.push({ field: "product", message: "missing product on post" });
  if (!post.platform) errors.push({ field: "platform", message: "missing platform on post" });
  if (!post.audience) errors.push({ field: "audience", message: "missing audience on post" });

  if (!promptReferencesHook(post.hook, prompt)) {
    errors.push({
      field: "mediaPrompt",
      message: "media prompt does not reference the exact hook or a direct hook-derived phrase",
    });
    score -= 25;
  }
  if (!result.visualMetaphor || !result.visualMetaphor.trim()) {
    errors.push({ field: "visualMetaphor", message: "missing visual metaphor" });
  }
  if (!/why this visual belongs to this exact post/i.test(prompt)) {
    errors.push({
      field: "mediaPrompt",
      message: "media prompt must explain why the visual belongs to this exact post",
    });
    score -= 15;
  }
  if (!result.forbiddenElements?.length) {
    errors.push({ field: "forbiddenElements", message: "missing forbiddenElements list" });
  }
  if (any(prompt, GENERIC_VISUAL_LANGUAGE)) {
    const offenders = GENERIC_VISUAL_LANGUAGE.filter((t) => lower(prompt).includes(t));
    errors.push({
      field: "mediaPrompt",
      message: `prompt contains generic / stock-photo visual language: ${offenders.join(", ")}`,
    });
    score -= 15;
  }

  // ── platform & CTA presence ────────────────────────────────────────────
  if (!lower(prompt).includes(post.platform)) {
    errors.push({
      field: "mediaPrompt",
      message: `prompt is not platform-specific (does not mention "${post.platform}")`,
    });
    score -= 10;
  }
  const intentRefs = [
    "diagnostic", "waitlist", "early access", "command center",
    "assessment", "dm ", "campaign intent",
  ];
  if (!any(prompt, intentRefs)) {
    warnings.push({
      field: "mediaPrompt",
      message: "prompt does not reference CTA / campaign intent",
    });
    score -= 10;
  }

  // ── audience reference ─────────────────────────────────────────────────
  if (!lower(prompt).includes(post.audience.replace(/-/g, " "))) {
    warnings.push({
      field: "mediaPrompt",
      message: `prompt does not mention audience "${post.audience}"`,
    });
    score -= 15;
  }

  // ── overlay text ────────────────────────────────────────────────────────
  if (!result.overlayText || result.overlayText.split(/\s+/).filter(Boolean).length === 0) {
    warnings.push({ field: "overlayText", message: "missing overlay text" });
    score -= 10;
  } else if (result.overlayText.split(/\s+/).filter(Boolean).length > 6) {
    warnings.push({
      field: "overlayText",
      message: `overlay text is longer than 6 words (${result.overlayText.split(/\s+/).filter(Boolean).length})`,
    });
  }

  // ── product-specific rules ─────────────────────────────────────────────
  if (post.product === "arcg" && none(prompt, ARCG_REQUIRED_CONCEPTS)) {
    errors.push({
      field: "mediaPrompt",
      message:
        "ARCG prompt missing required concept (operational leak / blueprint / workflow / dashboard / dispatch / reporting / compliance)",
    });
    score -= 20;
  }
  if (post.product === "sourcedeck" && none(prompt, SOURCEDECK_REQUIRED_CONCEPTS)) {
    errors.push({
      field: "mediaPrompt",
      message:
        "SourceDeck prompt missing required concept (command center / control tower / source-of-truth / pipeline / dashboard / operating picture)",
    });
    score -= 20;
  }
  if (post.product === "chartnav") {
    if (any(prompt, CHARTNAV_FORBIDDEN_VISUALS)) {
      const offenders = CHARTNAV_FORBIDDEN_VISUALS.filter((t) => lower(prompt).includes(t));
      errors.push({
        field: "mediaPrompt",
        message: `ChartNav prompt contains forbidden visual claim: ${offenders.join(", ")}`,
      });
      score -= 30;
    }
    if (none(prompt, CHARTNAV_REQUIRED_CONCEPTS)) {
      errors.push({
        field: "mediaPrompt",
        message:
          "ChartNav prompt missing clinical-workflow concept (intake / imaging / exam / orders / signoff / export readiness / handoff)",
      });
      score -= 20;
    }
  }
  if (post.product === "rezy" && none(prompt, REZY_REQUIRED_CONCEPTS)) {
    errors.push({
      field: "mediaPrompt",
      message: "Rezy prompt missing coming-soon / waitlist / early-access frame",
    });
    score -= 20;
  }

  // clamp
  if (score < 0) score = 0;
  if (score > 100) score = 100;

  return { score, errors, warnings };
}
