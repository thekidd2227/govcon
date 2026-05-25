#!/usr/bin/env node
/**
 * SourceDeck Premium Content Agent — spec audit.
 *
 * Verifies that the product-spec artifacts are present and coherent. This is
 * a static check; it does not call watsonx, GitHub, or Buffer, and it does
 * not require any secrets.
 *
 * Failures exit non-zero so this can run in CI.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();

const REQUIRED_FILES = [
  "docs/sourcedeck-premium-content-agent.md",
  "docs/sourcedeck-content-agent-ingestion.md",
  "docs/sourcedeck-content-agent-prompt-strategy.md",
  "docs/examples/sourcedeck-premium-content-agent-examples.md",
  "src/content/arcg/sourcedeckPremiumContentAgent.ts",
];

const failures = [];
const passes = [];

function relRead(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) return null;
  return fs.readFileSync(abs, "utf8");
}

// ─── 1. File presence ───────────────────────────────────────────────────
const fileContents = {};
for (const rel of REQUIRED_FILES) {
  const body = relRead(rel);
  if (body === null) {
    failures.push(`missing required file: ${rel}`);
    continue;
  }
  fileContents[rel] = body;
  passes.push(`present: ${rel}`);
}

// All subsequent checks need the docs corpus joined. Skip them if any file
// is missing — keeps the failure messages targeted.
const corpus = Object.values(fileContents).join("\n\n");

if (Object.keys(fileContents).length === REQUIRED_FILES.length) {
  // ─── 2. Highest-tier-only language ─────────────────────────────────────
  if (/highest[ _-]?(paid[ _-]?)?tier|highest_paid_tier_only|highest tier|top tier/i.test(corpus)) {
    passes.push("highest-tier-only language present");
  } else {
    failures.push("missing highest-tier-only language");
  }

  // ─── 3. watsonx mentioned ──────────────────────────────────────────────
  if (/watsonx/i.test(corpus)) {
    passes.push("watsonx mentioned");
  } else {
    failures.push("watsonx is not mentioned in the spec");
  }

  // ─── 4. Repository / document / link ingestion mentioned ───────────────
  const ingestionRequired = ["github", "gitlab", "bitbucket"];
  for (const term of ingestionRequired) {
    if (new RegExp(term, "i").test(corpus)) {
      passes.push(`ingestion source mentioned: ${term}`);
    } else {
      failures.push(`ingestion source missing: ${term}`);
    }
  }
  if (/document|pdf|markdown|upload/i.test(corpus)) {
    passes.push("document ingestion mentioned");
  } else {
    failures.push("document ingestion not mentioned");
  }
  if (/link|url/i.test(corpus)) {
    passes.push("link / URL ingestion mentioned");
  } else {
    failures.push("link / URL ingestion not mentioned");
  }

  // ─── 5. No free-tier inclusion claim ───────────────────────────────────
  // Catch phrases that would imply free-tier access. Skip negative phrases
  // like "no free tier access" or "free tier: no access".
  const freeTierLines = corpus.split("\n").filter((line) => {
    const l = line.toLowerCase();
    if (!l.includes("free")) return false;
    // Phrases that ASSERT free-tier inclusion (problematic):
    const positiveClaim =
      /\b(free tier|free plan)\b.*\b(includes|access|available|yes|enabled|supports|gets)\b/i.test(line) ||
      /\b(available|included|enabled)\b.*\bfree (tier|plan)\b/i.test(line) ||
      /\bfree (tier|plan):\s*(yes|enabled|included|available|on)\b/i.test(line);
    // Phrases that DENY free-tier inclusion (fine):
    const negativeClaim =
      /\bno (access|premium|content agent|inclusion)\b/i.test(line) ||
      /\bfree:.*\b(no access|no agent|no drafts|no premium)\b/i.test(line) ||
      /\bnot (part of|available on|in) the free (tier|plan)\b/i.test(line);
    return positiveClaim && !negativeClaim;
  });
  if (freeTierLines.length === 0) {
    passes.push("no free-tier inclusion claim");
  } else {
    failures.push(`free-tier inclusion claim detected: ${freeTierLines[0].trim()}`);
  }

  // ─── 6. No auto-posting claim ──────────────────────────────────────────
  // Flag lines that ASSERT auto-posting. A line that mentions auto-post but
  // also includes a denial verb (no/never/not/decline/refuse/requires
  // approval, etc.) or sets autoPublish: false is fine.
  const autoPostLines = corpus.split("\n").filter((line) => {
    const l = line.toLowerCase();
    const hasAutoPostMention =
      /auto[\s-]?post|automatically (post|publish)|publishes automatically/.test(l);
    if (!hasAutoPostMention) return false;
    const hasDenial =
      /\b(no|never|not|does not|do not|must not|cannot|without|decline[sd]?|refuse[sd]?|reject[sd]?|prohibit[sd]?|forbid[sd]?|require[sd]?\s+(?:user\s+)?approval|per[\s-]post (?:approval|review))\b/.test(
        l
      ) ||
      /\bautopublish:\s*false\b/.test(l) ||
      /\bnever publish/.test(l);
    return !hasDenial;
  });
  if (autoPostLines.length === 0) {
    passes.push("no auto-posting claim");
  } else {
    failures.push(`auto-posting claim detected: ${autoPostLines[0].trim()}`);
  }

  // ─── 7. No unsupported compliance certification claim ──────────────────
  // Look for assertions of compliance status that would require certification.
  const complianceClaims = corpus.split("\n").filter((line) => {
    return /\b(SOC ?2|ISO ?27001|HIPAA|FedRAMP|CMMC|FISMA|PCI[ -]?DSS|GDPR)\b.{0,30}\b(certified|compliant|authorized|accredited|attested)\b/i.test(
      line
    );
  });
  if (complianceClaims.length === 0) {
    passes.push("no unsupported compliance certification claim");
  } else {
    failures.push(`unsupported compliance claim detected: ${complianceClaims[0].trim()}`);
  }

  // ─── 8. LinkedIn examples use 10–12 hashtags ───────────────────────────
  // ─── 9. Facebook examples use 3–6 hashtags ─────────────────────────────
  // Parse the examples doc into sections (## N. ...) and check each section's
  // hashtag block against the platform-appropriate range.
  const examplesBody = fileContents["docs/examples/sourcedeck-premium-content-agent-examples.md"];
  const sections = examplesBody.split(/^## \d+\. /m).slice(1);
  let linkedinChecks = 0;
  let facebookChecks = 0;

  for (const raw of sections) {
    const lines = raw.split("\n");
    const heading = (lines[0] || "").trim();

    // Locate the "Hashtags (N):" header line; the actual tags live on the
    // next non-blank line. Tolerate markdown bold (**Hashtags (10):**) and
    // backtick-wrapped tag lines.
    let headerIdx = -1;
    for (let j = 0; j < lines.length; j++) {
      if (/Hashtags?\s*\(\d+\)/i.test(lines[j])) {
        headerIdx = j;
        break;
      }
    }
    if (headerIdx === -1) continue;
    let tagLine = "";
    for (let j = headerIdx + 1; j < lines.length; j++) {
      if (lines[j].trim()) {
        tagLine = lines[j].replace(/[`*]/g, "");
        break;
      }
    }
    const tagCount = (tagLine.match(/#[A-Za-z0-9_]+/g) || []).length;

    // Determine platform from explicit signals in the section: section
    // heading, "Draft post (Platform)" markers, or the recommended post
    // type identifier.
    const headerHay = (heading + "\n" + raw.slice(0, 800)).toLowerCase();
    const draftPostPlatform =
      raw.match(/Draft post \(([^)]+)\)/i)?.[1]?.toLowerCase() || "";
    const recommendedType =
      raw.match(/Recommended post type:\s*`?([^`\n]+)`?/i)?.[1]?.toLowerCase() ||
      "";

    const facebookContentTypes = new Set([
      "service_education",
      "community_trust",
      "owner_update",
      "project_update",
      "customer_problem_solution",
      "business_tip",
      "soft_offer",
    ]);
    const linkedinContentTypes = new Set([
      "text_authority",
      "poll",
      "document_pdf_outline",
      "product_feature_spotlight",
      "service_explainer",
      "govcon_authority",
      "pipeline_lesson",
      "website_cta",
      "founder_note",
      "operational_lesson",
      "build_in_public",
      "comment_led_question",
    ]);

    const isFacebook =
      /facebook/.test(headerHay) ||
      /facebook/.test(draftPostPlatform) ||
      facebookContentTypes.has(recommendedType.trim());
    const isLinkedIn =
      !isFacebook &&
      (/linkedin/.test(headerHay) ||
        /linkedin/.test(draftPostPlatform) ||
        linkedinContentTypes.has(recommendedType.trim()));

    if (isFacebook) {
      facebookChecks += 1;
      if (tagCount < 3 || tagCount > 6) {
        failures.push(
          `Facebook example "${heading}" uses ${tagCount} hashtags — expected 3–6`
        );
      } else {
        passes.push(`Facebook example "${heading}" hashtag count OK (${tagCount})`);
      }
    } else if (isLinkedIn) {
      linkedinChecks += 1;
      if (tagCount < 10 || tagCount > 12) {
        failures.push(
          `LinkedIn example "${heading}" uses ${tagCount} hashtags — expected 10–12`
        );
      } else {
        passes.push(`LinkedIn example "${heading}" hashtag count OK (${tagCount})`);
      }
    }
  }

  if (linkedinChecks === 0) failures.push("no LinkedIn examples found in examples doc");
  if (facebookChecks === 0) failures.push("no Facebook examples found in examples doc");
}

// ─── Report ─────────────────────────────────────────────────────────────
console.log("SourceDeck Premium Content Agent — spec audit");
console.log(`  passes:   ${passes.length}`);
console.log(`  failures: ${failures.length}`);
console.log("");
for (const p of passes) console.log(`  ✓ ${p}`);
if (failures.length) {
  console.log("");
  console.error("FAIL:");
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log("");
console.log("OK: spec audit passed.");
