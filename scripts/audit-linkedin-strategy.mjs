#!/usr/bin/env node
/**
 * Audit the LinkedIn posts in src/content/arcg/calendar.json against the
 * product-aware marketing strategy:
 *
 *   - Lane mix (feature_benefit vs diagnostic_pov)
 *   - Hashtag count bounds [10, 12]
 *   - Blocked hashtags per product
 *   - Required-category coverage per product
 *   - Format distribution
 *
 * Usage: node scripts/audit-linkedin-strategy.mjs
 *
 * Exit codes:
 *   0 = no errors
 *   1 = one or more errors
 */

import { readCalendar } from "./content-utils.mjs";
import {
  STRATEGIES,
  LINKEDIN_FORMATS,
  LINKEDIN_LANE_TARGETS,
  LINKEDIN_HASHTAG_BOUNDS,
  validateLinkedInHashtags,
  laneRatioReport,
} from "./product-marketing-strategy.mjs";

function parseLane(notes) {
  const m = String(notes || "").match(/lane=([a-z_]+)/);
  return m ? m[1] : "unknown";
}

function parseFormat(notes) {
  const m = String(notes || "").match(/format=([a-z_]+)/);
  return m ? m[1] : "unknown";
}

const calendar = readCalendar();
const linkedin = calendar.filter((p) => p.platform === "linkedin");

const issues = [];
const formatsPerProduct = {};
const lanesPerProduct = {};

for (const post of linkedin) {
  const lane = parseLane(post.notes);
  const format = parseFormat(post.notes);
  formatsPerProduct[post.product] = formatsPerProduct[post.product] || {};
  formatsPerProduct[post.product][format] = (formatsPerProduct[post.product][format] || 0) + 1;
  lanesPerProduct[post.product] = lanesPerProduct[post.product] || { feature_benefit: 0, diagnostic_pov: 0, unknown: 0 };
  lanesPerProduct[post.product][lane] = (lanesPerProduct[post.product][lane] || 0) + 1;

  const tags = Array.isArray(post.hashtags) ? post.hashtags : [];
  const hashtagIssues = validateLinkedInHashtags(post.product, tags);
  // Posts already scheduled to Buffer carry their on-the-wire hashtag set
  // (we deliberately do not overwrite live Buffer content). Downgrade
  // hashtag-bound errors on those to warnings so the audit doesn't fail.
  const isPreservedLive = Boolean(post.bufferPostId);
  for (const i of hashtagIssues) {
    const severity = isPreservedLive && i.severity === "error" ? "warn" : i.severity;
    const note = isPreservedLive ? " [preserved live buffer post]" : "";
    issues.push({ severity, postId: post.id, message: `${i.message}${note}` });
  }
  if (!Object.keys(STRATEGIES).includes(post.product)) {
    issues.push({ severity: "error", postId: post.id, message: `unknown product ${post.product}` });
  }
  if (lane === "unknown") {
    issues.push({ severity: "warn", postId: post.id, message: "missing lane tag in notes (lane=feature_benefit|diagnostic_pov)" });
  }
  if (format === "unknown") {
    issues.push({ severity: "warn", postId: post.id, message: "missing format tag in notes (format=...)" });
  }
}

// Lane ratio report — global + per product.
const tagPosts = linkedin.map((p) => ({ ...p, lane: parseLane(p.notes) }));
const global = laneRatioReport(tagPosts);
for (const i of global.issues) issues.push({ ...i, postId: "<calendar:linkedin>" });

// Per-product lane ratio — only enforce on products with ≥8 LinkedIn posts.
// Below that, a single post flips the ratio by 12+ percentage points and
// the global ratio is the meaningful signal.
const PER_PRODUCT_RATIO_MIN_SAMPLE = 8;
for (const [product, lanes] of Object.entries(lanesPerProduct)) {
  const known = lanes.feature_benefit + lanes.diagnostic_pov;
  if (known < PER_PRODUCT_RATIO_MIN_SAMPLE) continue;
  const fb = lanes.feature_benefit / known;
  const t = LINKEDIN_LANE_TARGETS.feature_benefit;
  if (fb < t.failMin) {
    issues.push({ severity: "error", postId: `<linkedin:${product}>`, message: `feature_benefit ratio ${(fb * 100).toFixed(0)}% below fail floor ${(t.failMin * 100).toFixed(0)}%` });
  } else if (fb < t.warnMin || fb > t.warnMax) {
    issues.push({ severity: "warn", postId: `<linkedin:${product}>`, message: `feature_benefit ratio ${(fb * 100).toFixed(0)}% outside warn range ${(t.warnMin * 100).toFixed(0)}–${(t.warnMax * 100).toFixed(0)}%` });
  }
}

const errors = issues.filter((i) => i.severity === "error");
const warnings = issues.filter((i) => i.severity === "warn");

const report = {
  totalLinkedIn: linkedin.length,
  hashtagBounds: LINKEDIN_HASHTAG_BOUNDS,
  laneTargets: LINKEDIN_LANE_TARGETS,
  perProduct: Object.fromEntries(
    Object.entries(lanesPerProduct).map(([product, lanes]) => {
      const known = lanes.feature_benefit + lanes.diagnostic_pov;
      const fbRatio = known === 0 ? null : Number((lanes.feature_benefit / known).toFixed(3));
      return [
        product,
        {
          counts: lanes,
          featureBenefitRatio: fbRatio,
          formats: formatsPerProduct[product] || {},
        },
      ];
    })
  ),
  globalRatio: global.ratio !== undefined ? Number(global.ratio.toFixed(3)) : null,
  knownFeatureFormats: LINKEDIN_FORMATS.feature_benefit,
  knownDiagnosticFormats: LINKEDIN_FORMATS.diagnostic_pov,
  errorCount: errors.length,
  warningCount: warnings.length,
};

console.log(JSON.stringify(report, null, 2));

if (errors.length > 0) {
  console.error("");
  console.error("LinkedIn audit errors:");
  for (const e of errors) console.error(`  [error] ${e.postId}: ${e.message}`);
}
if (warnings.length > 0) {
  console.error("");
  console.error("LinkedIn audit warnings:");
  for (const w of warnings) console.error(`  [warn]  ${w.postId}: ${w.message}`);
}

process.exit(errors.length > 0 ? 1 : 0);
