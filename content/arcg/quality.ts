import {
  ASSET_TYPES,
  AUDIENCES,
  PLATFORMS,
  PRODUCTS,
  STATUSES,
} from "./types";
import type { ContentPost } from "./types";

export type Severity = "error" | "warn";

export interface ValidationIssue {
  postId: string;
  field: string;
  severity: Severity;
  message: string;
}

export interface ValidationReport {
  total: number;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HHMM = /^\d{2}:\d{2}$/;
const VISIBILITY_SENTENCE = "this isn't an ai problem. it's an operational visibility problem.";

const BUYER_PAIN_TERMS = [
  "operational leak",
  "operational waste",
  "leak",
  "waste",
  "diagnos",
  "blueprint",
  "visibility",
  "command center",
  "source of truth",
  "pipeline",
  "document",
  "bid",
  "vendor",
  "follow-up",
  "handoff",
  "intake",
  "chart",
  "exam",
  "maintenance",
  "reporting",
  "sla",
  "compliance",
  "manual",
  "spreadsheet",
  "next action",
];

const FORBIDDEN_AI_HYPE = [
  "ai is the future",
  "ai revolution",
  "unlock the power of ai",
  "cutting-edge ai",
  "ai magic",
  "10x",
];

const CHARTNAV_FORBIDDEN = [
  "autonomously diagnoses",
  "diagnoses patients",
  "guaranteed billing",
  "guarantees billing",
  "hipaa certified",
  "hipaa certification",
  "fda approved",
  "fda cleared",
  "replaces clinical review",
  "replaces the physician",
];

/* ───────────────────────────────────────────────────────────────────────── *
 * Product-aware LinkedIn hashtag rules — mirrors
 * scripts/product-marketing-strategy.mjs. The script-side validator is the
 * authoritative source for the marketing agent; this in-app validator
 * exists so the website / Content Command Center surface the same warnings
 * when calendar.json is loaded.
 * ───────────────────────────────────────────────────────────────────────── */

const LINKEDIN_HASHTAG_BOUNDS = { min: 10, max: 12 } as const;

const LINKEDIN_HASHTAG_RULES: Record<
  "arcg" | "sourcedeck" | "chartnav" | "rezy",
  {
    blockedTags: string[];
    requiredCategories: Record<string, string[]>;
  }
> = {
  arcg: {
    blockedTags: [
      "#AI", "#Automation", "#Innovation", "#DigitalTransformation",
      "#Business", "#Success", "#Entrepreneur", "#Motivation",
      "#Inspiration", "#Hustle", "#Growth", "#Marketing",
    ],
    requiredCategories: {
      operations_or_diagnostic: [
        "#OperationalIntelligence", "#OperationalWasteDiagnostic", "#OperationalAudit",
        "#WorkflowAudit", "#LeakDetection", "#BusinessDiagnostic",
        "#OperationalWaste", "#LeanOps", "#WorkflowFix", "#OpsReporting",
      ],
    },
  },
  sourcedeck: {
    blockedTags: [
      "#Asana", "#Trello", "#Notion", "#Monday", "#ClickUp",
      "#ProjectManagement", "#ProjectManager",
      "#AI", "#Automation", "#Innovation", "#DigitalTransformation",
      "#Business", "#Success", "#Entrepreneur", "#Motivation",
      "#Marketing",
    ],
    requiredCategories: {
      govcon_or_command_center: [
        "#GovCon", "#GovConOperations", "#SAMgov", "#FederalContracting",
        "#SmallBusinessGovCon", "#CommandCenter", "#OpsCenter", "#ControlTower",
        "#SourceOfTruth", "#OneSystem", "#CapabilityStatement", "#BidPipeline",
      ],
    },
  },
  chartnav: {
    blockedTags: [
      "#FDA", "#FDAapproved", "#HIPAA", "#HIPAACompliant", "#SOC2",
      "#AIDiagnosis", "#AutonomousAI", "#AIBilling", "#BillingGuarantee",
      "#AI", "#Automation", "#Innovation", "#DigitalHealth",
      "#HealthcareAI", "#MedicalAI",
    ],
    requiredCategories: {
      ophthalmology_or_retina: [
        "#Ophthalmology", "#EyeCare", "#OphthalmologyPractice",
        "#OphthalmologyOps", "#OphthalmologyTech", "#OphthalmicTechnician",
      ],
      emr_or_documentation: [
        "#EHRWorkflow", "#EMRWorkflow", "#ClinicalDocumentation",
        "#DocumentationReadiness", "#ChartReady", "#DocPrep",
        "#ClinicalWorkflow", "#ClinicalSignoff",
      ],
    },
  },
  rezy: {
    blockedTags: [
      "#Yardi", "#AppFolio", "#Buildium", "#RealPage",
      "#AI", "#Automation", "#Innovation", "#DigitalTransformation",
      "#Business", "#Success", "#Entrepreneur", "#Motivation",
    ],
    requiredCategories: {
      property_or_propTech: [
        "#PropTech", "#PropertyOps", "#PropertyManagement",
        "#MaintenanceOps", "#WorkOrders", "#PropertyMaintenance",
        "#TenantExperience", "#TenantOps", "#PropertyReporting",
        "#PropertyCommandLayer",
      ],
      coming_soon_or_waitlist: [
        "#EarlyAccess", "#JoinTheWaitlist", "#OperatorWaitlist",
        "#ComingSoon", "#PreLaunch", "#BuildInPublic", "#OperatorBuilt",
      ],
    },
  },
};

const LINKEDIN_LANE_TARGETS = {
  feature_benefit: { warnMin: 0.65, warnMax: 0.85, failMin: 0.5 },
} as const;

function laneFromPost(post: ContentPost): "feature_benefit" | "diagnostic_pov" | "unknown" {
  const notes = (post.notes || "").toLowerCase();
  if (notes.includes("lane=feature_benefit")) return "feature_benefit";
  if (notes.includes("lane=diagnostic_pov")) return "diagnostic_pov";
  return "unknown";
}

function includesAny(value: string, terms: string[]) {
  const lower = value.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

export function captionSkeleton(caption: string) {
  return caption
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "url")
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 42)
    .join(" ");
}

function issue(postId: string, field: string, severity: Severity, message: string): ValidationIssue {
  return { postId, field, severity, message };
}

function validateOne(post: ContentPost): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const id = post?.id || "<missing-id>";
  const combined = `${post.hook || ""}\n${post.caption || ""}\n${post.cta || ""}\n${post.sourceAngle || ""}`;
  const lowerCombined = combined.toLowerCase();
  const hookWords = (post.hook || "").trim().split(/\s+/).filter(Boolean);

  if (!post.id || typeof post.id !== "string") issues.push(issue(id, "id", "error", "missing or non-string id"));
  if (!post.date || !ISO_DATE.test(post.date)) issues.push(issue(id, "date", "error", "missing or malformed date"));
  if (!PLATFORMS.includes(post.platform)) issues.push(issue(id, "platform", "error", `unsupported platform: ${post.platform}`));
  if (!PRODUCTS.includes(post.product)) issues.push(issue(id, "product", "error", `unsupported product: ${post.product}`));
  if (!HHMM.test(post.recommendedTime || "")) issues.push(issue(id, "recommendedTime", "error", "missing or malformed recommendedTime"));
  if (!STATUSES.includes(post.status)) issues.push(issue(id, "status", "error", `unsupported status: ${post.status}`));
  if (!AUDIENCES.includes(post.audience)) issues.push(issue(id, "audience", "error", `unsupported audience: ${post.audience}`));
  if (post.assetType && !ASSET_TYPES.includes(post.assetType)) issues.push(issue(id, "assetType", "error", `unsupported assetType: ${post.assetType}`));
  if (!post.hook?.trim()) issues.push(issue(id, "hook", "error", "missing hook"));
  if (!post.caption?.trim()) issues.push(issue(id, "caption", "error", "missing caption"));
  if (!post.cta?.trim()) issues.push(issue(id, "cta", "error", "missing CTA"));
  if (!post.imagePrompt?.trim() && !post.videoPrompt?.trim()) issues.push(issue(id, "media", "error", "missing imagePrompt and videoPrompt"));

  // ── media pipeline validation ───────────────────────────────────────────
  const mediaRequiresPrompt = new Set([
    "planned", "prompt_ready", "generating", "generated", "uploaded", "ready",
  ]);
  if (post.mediaStatus && mediaRequiresPrompt.has(post.mediaStatus) && !post.mediaPrompt) {
    issues.push(issue(id, "mediaPrompt", "error", `mediaStatus=${post.mediaStatus} requires mediaPrompt`));
  }
  if (post.mediaStatus === "ready") {
    const hasUrl = Boolean(post.assetUrl) || (Array.isArray(post.assetUrls) && post.assetUrls.length > 0);
    if (!hasUrl) issues.push(issue(id, "assetUrl", "error", "mediaStatus=ready requires assetUrl or assetUrls"));
    const urls = [post.assetUrl, ...(post.assetUrls || [])].filter(Boolean);
    if (urls.some((u) => String(u).startsWith("file://"))) {
      issues.push(issue(id, "assetUrl", "error", "mediaStatus=ready cannot use local file:// assetUrl"));
    }
    if (post.assetType === "carousel") {
      const slideUrls = (post.carouselSlides || []).map((s) => s.assetUrl).filter(Boolean);
      if (!((post.assetUrls || []).length > 0 || slideUrls.length > 0)) {
        issues.push(issue(id, "assetUrls", "error", "carousel mediaStatus=ready requires assetUrls[] or slide assetUrls"));
      }
    }
  }

  if (post.hook && post.hook.length < 18) issues.push(issue(id, "hook", "warn", "hook shorter than 18 characters"));
  if (hookWords.length < 4) issues.push(issue(id, "hook", "warn", "hook has fewer than 4 words"));
  if (hookWords.length <= 1) issues.push(issue(id, "hook", "warn", "one-word hook"));
  if (includesAny((post.hook || "").toLowerCase(), FORBIDDEN_AI_HYPE)) issues.push(issue(id, "hook", "warn", "hook leans on generic AI hype"));
  if (!includesAny(lowerCombined, BUYER_PAIN_TERMS)) issues.push(issue(id, "caption", "warn", "caption needs clearer operating pain, visibility, command center, or workflow language"));
  if (!/dm\s+['"]?[a-z]+['"]?|https?:\/\/|[a-z0-9.-]+\.[a-z]{2,}|diagnostic call|assessment|early access|waitlist|command center|book|schedule|open|see|start|map|use/i.test(post.cta || "")) {
    issues.push(issue(id, "cta", "warn", "CTA must include a DM keyword, URL, diagnostic call, assessment, early access, or command center action"));
  }

  if (post.product === "sourcedeck") {
    if (!/SourceDeck|sourcedeck\.app/.test(combined)) issues.push(issue(id, "product", "error", "SourceDeck posts must mention SourceDeck or sourcedeck.app"));
    if (/(^|[^a-z])(generic project management tool|generic project management app|just project management|another project management tool)/i.test(combined)) issues.push(issue(id, "caption", "error", "SourceDeck must not be positioned as generic project management"));
  }

  if (post.product === "chartnav") {
    if (includesAny(lowerCombined, CHARTNAV_FORBIDDEN)) {
      issues.push(issue(id, "caption", "error", "ChartNav post contains forbidden clinical, billing, HIPAA, FDA, or review-replacement claim"));
    }
  }

  if (post.product === "rezy") {
    if (!/coming soon|early access|waitlist|preview|not launched|pre-launch/i.test(combined)) {
      issues.push(issue(id, "caption", "error", "Rezy posts must stay coming soon, early access, waitlist, or similar"));
    }
  }

  if (post.product === "arcg" && /^(SourceDeck|ChartNav|Rezy)\b/i.test((post.hook || "").trim())) {
    issues.push(issue(id, "hook", "warn", "ARCG posts must not lead with SourceDeck/ChartNav/Rezy"));
  }

  // ── LinkedIn product-aware hashtag rules ────────────────────────────────
  if (post.platform === "linkedin") {
    const rules = LINKEDIN_HASHTAG_RULES[post.product as keyof typeof LINKEDIN_HASHTAG_RULES];
    const tags = Array.isArray(post.hashtags) ? post.hashtags : [];
    const count = tags.length;
    // Posts already live in Buffer carry their on-the-wire content; we do
    // not regenerate over them. Downgrade hashtag-bound errors to warnings
    // so the validator doesn't fail on a post the agent intentionally left
    // alone.
    const preserved = Boolean(post.bufferPostId);
    const boundsSeverity: Severity = preserved ? "warn" : "error";
    const preservedNote = preserved ? " (preserved live Buffer post)" : "";
    if (count < LINKEDIN_HASHTAG_BOUNDS.min) {
      issues.push(issue(id, "hashtags", boundsSeverity, `LinkedIn post has ${count} hashtags; min is ${LINKEDIN_HASHTAG_BOUNDS.min}${preservedNote}`));
    }
    if (count > LINKEDIN_HASHTAG_BOUNDS.max) {
      issues.push(issue(id, "hashtags", boundsSeverity, `LinkedIn post has ${count} hashtags; max is ${LINKEDIN_HASHTAG_BOUNDS.max}${preservedNote}`));
    }
    const lower = tags.map((t) => String(t).toLowerCase());
    const dupes = lower.filter((tag, i) => lower.indexOf(tag) !== i);
    if (dupes.length) {
      issues.push(issue(id, "hashtags", "error", `duplicate LinkedIn hashtags: ${[...new Set(dupes)].join(", ")}`));
    }
    if (rules) {
      const blocked = rules.blockedTags.map((t) => t.toLowerCase());
      const hits = lower.filter((tag) => blocked.includes(tag));
      if (hits.length) {
        issues.push(issue(id, "hashtags", "error", `blocked LinkedIn hashtag(s) for ${post.product}: ${[...new Set(hits)].join(", ")}`));
      }
      for (const [name, list] of Object.entries(rules.requiredCategories)) {
        const listLower = list.map((t) => t.toLowerCase());
        const matches = lower.filter((tag) => listLower.includes(tag));
        if (matches.length < 2) {
          issues.push(issue(id, "hashtags", boundsSeverity, `LinkedIn ${post.product} needs ≥2 hashtags from "${name}"; found ${matches.length}${preservedNote}`));
        }
      }
    }
  }

  return issues;
}

export function validateCalendar(posts: ContentPost[]): ValidationReport {
  const issues: ValidationIssue[] = [];
  const ids = new Map<string, number>();
  const datePlatforms = new Map<string, number>();
  const skeletons = new Map<string, string[]>();
  let visibilitySentenceCount = 0;

  for (const post of posts || []) {
    issues.push(...validateOne(post));
    if (post.id) ids.set(post.id, (ids.get(post.id) || 0) + 1);
    if (post.date && post.platform) {
      const key = `${post.date}|${post.platform}`;
      datePlatforms.set(key, (datePlatforms.get(key) || 0) + 1);
    }
    if (post.caption) {
      const skeleton = captionSkeleton(post.caption);
      if (!skeletons.has(skeleton)) skeletons.set(skeleton, []);
      skeletons.get(skeleton)?.push(post.id);
      visibilitySentenceCount += [...post.caption.toLowerCase().matchAll(new RegExp(VISIBILITY_SENTENCE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))].length;
    }
  }

  for (const [id, count] of ids) {
    if (count > 1) issues.push(issue(id, "id", "error", `duplicate id appears ${count}x`));
  }
  for (const [key, count] of datePlatforms) {
    if (count > 1) issues.push(issue("<group>", "date+platform", "error", `duplicate same-date/same-platform: ${key} (${count} posts)`));
  }
  for (const [skeleton, idsForSkeleton] of skeletons) {
    if (skeleton && idsForSkeleton.length > 3) {
      issues.push(issue("<group>", "caption", "warn", `repeated caption skeleton appears ${idsForSkeleton.length}x: ${idsForSkeleton.slice(0, 6).join(", ")}`));
    }
  }
  if (visibilitySentenceCount > 8) {
    issues.push(issue("<calendar>", "caption", "warn", `exact visibility sentence appears ${visibilitySentenceCount}x; maximum is 8`));
  }

  // ── LinkedIn lane ratio audit (feature_benefit vs diagnostic_pov) ───────
  const liPosts = (posts || []).filter((p) => p.platform === "linkedin");
  if (liPosts.length > 0) {
    const lanes = { feature_benefit: 0, diagnostic_pov: 0, unknown: 0 };
    for (const p of liPosts) {
      const lane = laneFromPost(p);
      lanes[lane] += 1;
    }
    const known = lanes.feature_benefit + lanes.diagnostic_pov;
    if (known === 0) {
      issues.push(issue("<calendar>", "lane", "warn", "LinkedIn posts have no lane tagging (notes lane=feature_benefit|diagnostic_pov)"));
    } else {
      const fbRatio = lanes.feature_benefit / known;
      const t = LINKEDIN_LANE_TARGETS.feature_benefit;
      if (fbRatio < t.failMin) {
        issues.push(issue("<calendar>", "lane", "error", `LinkedIn feature_benefit ratio ${(fbRatio * 100).toFixed(0)}% below fail floor ${(t.failMin * 100).toFixed(0)}%`));
      } else if (fbRatio < t.warnMin || fbRatio > t.warnMax) {
        issues.push(issue("<calendar>", "lane", "warn", `LinkedIn feature_benefit ratio ${(fbRatio * 100).toFixed(0)}% outside warn range ${(t.warnMin * 100).toFixed(0)}–${(t.warnMax * 100).toFixed(0)}%`));
      }
    }
  }

  // ── 80/20 media-to-text ratio audit (LinkedIn + Facebook) ───────────
  for (const platform of ["linkedin", "facebook"] as const) {
    const platPosts = (posts || []).filter((p) => p.platform === platform);
    if (platPosts.length < 5) continue;
    const mediaPlanned = platPosts.filter((p) => p.assetType && p.assetType !== "none").length;
    const textPlanned = platPosts.filter((p) => !p.assetType || p.assetType === "none").length;
    const total = mediaPlanned + textPlanned;
    if (total === 0) continue;
    const mediaRatio = mediaPlanned / total;
    const textRatio = textPlanned / total;
    if (textRatio > 0.30) {
      issues.push(issue("<calendar>", "mediaRatio", "warn",
        `${platform} text-only ratio ${(textRatio * 100).toFixed(0)}% exceeds 30% target max (${textPlanned}/${total} posts)`));
    }
    if (mediaRatio < 0.70) {
      issues.push(issue("<calendar>", "mediaRatio", "warn",
        `${platform} media ratio ${(mediaRatio * 100).toFixed(0)}% below 70% target min (${mediaPlanned}/${total} posts)`));
    }
  }

  return {
    total: (posts || []).length,
    errors: issues.filter((i) => i.severity === "error"),
    warnings: issues.filter((i) => i.severity === "warn"),
  };
}
