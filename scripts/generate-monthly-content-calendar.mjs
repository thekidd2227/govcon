#!/usr/bin/env node
import { parseArgs, resolveMonth, writeCalendar, readCalendar } from "./content-utils.mjs";
import {
  STRATEGIES as PRODUCT_STRATEGIES,
  LINKEDIN_TEXT_ONLY_FORMATS,
  buildLinkedInPostContent,
  linkedinLaneFor,
  linkedinFormatFor,
} from "./product-marketing-strategy.mjs";
import { spawnSync } from "node:child_process";

const PLATFORMS = ["linkedin", "instagram", "facebook"];
const DEFAULT_MIX = { arcg: 35, sourcedeck: 30, chartnav: 25, rezy: 10 };
const COUNTS_90 = { arcg: 32, sourcedeck: 27, chartnav: 22, rezy: 9 };

const platformTimes = {
  linkedin: ["08:25", "08:45", "09:10", "12:05", "16:20"],
  instagram: ["11:35", "12:15", "12:45", "15:45", "18:05"],
  facebook: ["09:30", "10:25", "18:15", "18:50", "19:20"],
};

const platformFormats = {
  linkedin: ["text", "document", "carousel", "article"],
  instagram: ["carousel", "reel", "image", "story"],
  // 5-item list: "text" appears once → 6/30 = 20% text-only (80/20 target).
  facebook: ["text", "image", "video", "carousel", "image"],
};

const audiences = {
  arcg: ["small-business-owners", "property-managers", "service-companies", "government-contractors", "caribbean-latam-operators", "mixed"],
  sourcedeck: ["government-contractors", "small-business-owners", "mixed", "service-companies"],
  chartnav: ["ophthalmology-practices", "mixed"],
  rezy: ["property-managers", "small-business-owners", "mixed"],
};

const strategies = {
  arcg: {
    themes: ["operational-intelligence", "diagnose-operational-leaks", "blueprint-before-build", "do-not-automate-broken-logic", "operational-waste-diagnostic", "reporting-visibility", "manual-handoff-failure", "vendor-dispatch"],
    // Hooks aim for pattern-interrupt, concrete-not-abstract, identity-led
    // (about the operator, not the product), and ≤140 chars where possible.
    hooks: [
      "Your most expensive line item is the one nobody knows is leaking.",
      "If your team needs three apps to answer \"where is that?\", it's not a tools problem. It's an operating picture problem.",
      "Automation on broken logic doesn't fix the leak. It just makes the leak run faster.",
      "Every \"we'll fix that next quarter\" is a leak compounding interest.",
      "Operators don't lose money on bad decisions. They lose it on invisible workflow gaps.",
      "A clear blueprint beats a fast build. Every time. Operators who skip the blueprint pay for it twice.",
      "You don't need more software. You need a map of where work is actually leaking.",
      "Reporting that lives in three spreadsheets isn't reporting. It's evidence of the leak.",
      "The diagnostic happens before the build. Always. We do it. You see it.",
      "The dashboard that finally shows the leak is more valuable than the one that hides it.",
      "If the workflow is broken, automation only makes the leak move faster.",
      "The next operating decision should not depend on who happens to remember.",
    ],
    ctas: [
      "Start the diagnostic at arcgsystems.com/diagnostics.",
      "Book a diagnostic call through arcgsystems.com/assessment.",
      "DM 'AUDIT' to map the operating leak.",
      "Use ARCG to blueprint the workflow before the build.",
    ],
    body: (theme, audience) => `ARCG Systems helps ${label(audience)} diagnose operational leaks before automation. The work is simple on purpose: map the workflow, identify broken logic, blueprint the operating model, then build only what should exist. Theme: ${title(theme)}.`,
    hashtags: ["#ARCGSystems", "#OperationalIntelligence", "#OperationalWaste", "#WorkflowAudit"],
  },
  sourcedeck: {
    themes: ["command-center", "govcon-pipeline-visibility", "source-of-truth", "document-control", "follow-up-control", "reporting-hub", "vendor-and-task-control", "execution-layer"],
    hooks: [
      "If your team can't name the next bid, the next document, and the next follow-up without scrolling, you don't have visibility.",
      "SourceDeck isn't another project tool. It's the operating picture you've been building in your head.",
      "The GovCon pipeline doesn't fail at the bid. It fails at the handoff between bid and execution.",
      "Pipeline in your CRM isn't pipeline. Pipeline in SourceDeck is what your team can act on tomorrow.",
      "A command center turns \"I'll get back to you\" into a visible next action.",
      "Small businesses don't lose contracts to bigger competitors. They lose contracts to scattered execution.",
      "Three apps + four spreadsheets + one group chat is not visibility. It's noise pretending to be coverage.",
      "Document control is the unsexy thing that decides whether the contract survives audit.",
      "The next bid is already in your inbox. SourceDeck is what surfaces it.",
      "Source of truth isn't a feature. It's whether your team is reading the same page or guessing.",
      "Real visibility shows up the day someone new joins the team and they can ramp without you in the room.",
      "A bid pipeline you can't show to a stakeholder in 30 seconds isn't a pipeline.",
    ],
    ctas: [
      "See the command center at sourcedeck.app.",
      "DM 'SOURCEDECK' for the command center walkthrough.",
      "Open sourcedeck.app and map what your team still tracks manually.",
      "Use SourceDeck to centralize pipeline, documents, and next actions.",
    ],
    body: (theme, audience) => `SourceDeck is a command center for ${label(audience)} who need visibility across bids, vendors, documents, follow-up, pipeline, reporting, and next actions. It is not generic project management. It is the execution layer after the operating leaks are diagnosed and the system is blueprinted. Theme: ${title(theme)}.`,
    hashtags: ["#SourceDeck", "#GovCon", "#CommandCenter", "#OperationalVisibility"],
  },
  chartnav: {
    themes: ["exam-documentation", "technician-to-physician-handoff", "intake-charting-imaging", "orders-signoff-export", "billing-aware-workflow", "stay-with-the-patient", "documentation-readiness"],
    hooks: [
      "The exam doesn't suffer from too little technology. It suffers from technology that pulls focus from the patient.",
      "Charting should disappear into the workflow, not interrupt it.",
      "Intake, imaging, exam, orders, signoff — they belong on one page, not in four mental checklists.",
      "The technician-to-physician handoff is where 80% of \"where did that note go?\" lives.",
      "Documentation that needs translating before it can be billed is a workflow problem, not a coder problem.",
      "ChartNav is built around how ophthalmology actually runs, not around generic SOAP templates.",
      "The fastest exam isn't the shortest. It's the one where every handoff stays visible.",
      "If you're rebuilding the chart at the end of the day, the workflow lost.",
      "Stay with the patient. Let ChartNav stay with the workflow.",
      "Better documentation context is the cheapest billing improvement most clinics never invest in.",
      "The next signoff shouldn't be a search. It should be a click.",
      "Imaging metadata that lives outside the chart is metadata you'll re-enter twice.",
    ],
    ctas: [
      "See the ChartNav workflow at chartnavmd.com.",
      "Book a ChartNav workflow review from chartnavmd.com.",
      "DM 'CHARTNAV' for the ophthalmology workflow walkthrough.",
      "Map the exam documentation handoff before the next clinic day.",
    ],
    body: (theme) => `ChartNav is an ophthalmology workflow and documentation platform for intake, charting, imaging, orders, signoff, and export readiness. It is billing-aware, but not a billing engine. It supports clinical documentation workflow and does not replace clinical review or make autonomous diagnosis claims. Theme: ${title(theme)}.`,
    hashtags: ["#ChartNav", "#Ophthalmology", "#ClinicalWorkflow", "#Documentation"],
  },
  rezy: {
    themes: ["property-command-layer", "maintenance-control", "tenant-visibility", "vendor-task-control", "document-reporting", "early-access", "waitlist"],
    hooks: [
      "Rezy isn't shipped yet. The waitlist exists for operators tired of fixing maintenance through text threads.",
      "Property management runs on handoffs. The handoffs need a layer above the tools.",
      "Maintenance becomes a complaint when it loses visibility for 24 hours. Rezy is being built to close that window.",
      "Tenants, vendors, tasks, documents, reporting — one operating picture is coming.",
      "Early-access operators are shaping what the property command layer becomes.",
      "The next tenant call shouldn't be the first time you hear about the leak.",
      "Property command isn't a dashboard. It's a way of seeing the building before the building tells you.",
      "Rezy waitlist: for property operators who want visibility before the next escalation.",
      "Coming soon. Built with operators, not for users.",
      "The early-access cohort is where Rezy's roadmap actually gets set.",
      "If maintenance, billing, and tenant comms each live in their own tool, you don't have a system. You have inventory.",
      "Pre-launch positioning only. Rezy is being built deliberately, with the early-access cohort.",
    ],
    ctas: [
      "Join the Rezy early access waitlist.",
      "DM 'REZY' for the coming soon preview.",
      "Request early access to the Rezy property command layer.",
      "Join the waitlist before the property command layer opens.",
    ],
    body: (theme, audience) => `Rezy is coming soon as a property management command layer for ${label(audience)}. The focus is maintenance, tenants, vendors, tasks, documents, and reporting in one operating picture. This is early access and waitlist positioning only, not a launched-product claim. Theme: ${title(theme)}.`,
    hashtags: ["#Rezy", "#PropertyManagement", "#MaintenanceOps", "#EarlyAccess"],
  },
};

/* ───────────────────────────────────────────────────────────────────────── *
 * Layered hashtag pools — composed at post-build time to reach ≥7 tags.
 * Order: brand (4) → theme (2) → audience (2) → platform (1) = 9 total.
 * Dedup keeps it clean if any tag appears in multiple pools.
 * ───────────────────────────────────────────────────────────────────────── */

const THEME_HASHTAGS = {
  // ARCG themes
  "operational-intelligence":   ["#OperationalIntelligence", "#BusinessOps", "#ProcessIntelligence"],
  "diagnose-operational-leaks": ["#OperationalAudit",        "#LeakDetection", "#BusinessDiagnostic"],
  "blueprint-before-build":     ["#BusinessBlueprint",       "#SystemDesign",  "#ScaleSmart"],
  "do-not-automate-broken-logic": ["#AutomationDoneRight",   "#StopBreakingAutomation", "#ProcessFirst"],
  "operational-waste-diagnostic": ["#OperationalWaste",      "#LeanOps",       "#WasteReduction"],
  "reporting-visibility":       ["#DataVisibility",          "#OpsReporting",  "#BusinessClarity"],
  "manual-handoff-failure":     ["#WorkflowFix",             "#Accountability","#ProcessGap"],
  "vendor-dispatch":            ["#VendorOps",               "#DispatchOps",   "#FieldOps"],
  // SourceDeck themes
  "command-center":             ["#CommandCenter",           "#OpsCenter",     "#ControlTower"],
  "govcon-pipeline-visibility": ["#GovCon",                  "#SAMgov",        "#FederalContracting"],
  "source-of-truth":            ["#SourceOfTruth",           "#OneSystem",     "#OpsClarity"],
  "document-control":           ["#DocumentControl",         "#AuditReady",    "#ComplianceOps"],
  "follow-up-control":          ["#FollowUpFunnel",          "#PipelineDiscipline", "#OpsRigor"],
  "reporting-hub":              ["#ReportingHub",            "#OpsDashboard",  "#BusinessIntelligence"],
  "vendor-and-task-control":    ["#TaskOps",                 "#VendorControl", "#ExecutionLayer"],
  "execution-layer":            ["#ExecutionOps",            "#ScaleOps",      "#OpsLeadership"],
  // ChartNav themes
  "exam-documentation":         ["#ClinicalDocumentation",   "#EHRWorkflow",   "#PatientFirst"],
  "technician-to-physician-handoff": ["#ClinicalHandoff",    "#TeamCare",      "#ClinicOps"],
  "intake-charting-imaging":    ["#PatientIntake",           "#ClinicalImaging", "#WorkflowCare"],
  "orders-signoff-export":      ["#ClinicalSignoff",         "#OrdersWorkflow","#ExportReady"],
  "billing-aware-workflow":     ["#ClinicalBilling",         "#WorkflowOverBilling", "#RevenueClarity"],
  "stay-with-the-patient":      ["#PatientFocus",            "#PatientExperience", "#HumanFirst"],
  "documentation-readiness":    ["#ChartReady",              "#DocPrep",       "#ClinicReady"],
  // Rezy themes
  "property-command-layer":     ["#PropTech",                "#PropertyCommand", "#OperatorTools"],
  "maintenance-control":        ["#MaintenanceOps",          "#WorkOrders",    "#PropertyMaintenance"],
  "tenant-visibility":          ["#TenantExperience",        "#TenantOps",     "#ResidentExperience"],
  "vendor-task-control":        ["#VendorManagement",        "#TaskFlow",      "#PropertyOps"],
  "document-reporting":         ["#PropertyReporting",       "#OwnerUpdates",  "#OpsTransparency"],
  "early-access":               ["#EarlyAccess",             "#JoinTheWaitlist", "#OperatorsOnly"],
  "waitlist":                   ["#JoinTheWaitlist",         "#OperatorWaitlist", "#ComingSoon"],
};

const AUDIENCE_HASHTAGS = {
  "small-business-owners":        ["#SmallBusiness",         "#FounderLife",   "#OperatorMindset"],
  "property-managers":            ["#PropertyManagement",    "#PropertyManager", "#REI"],
  "service-companies":            ["#ServiceBusiness",       "#FieldService",  "#TradesPro"],
  "government-contractors":       ["#GovCon",                "#SmallBusinessGovCon", "#FederalBusiness"],
  "caribbean-latam-operators":    ["#CaribbeanBusiness",     "#LatAmOps",      "#GlobalOperators"],
  "ophthalmology-practices":      ["#Ophthalmology",         "#EyeCare",       "#MedicalPractice"],
  "mixed":                        ["#OperatorsOnly",         "#BusinessOwners","#OpsLeaders"],
};

const PLATFORM_HASHTAGS = {
  linkedin:   ["#LinkedInB2B"],
  instagram:  ["#BusinessReels"],
  facebook:   ["#BusinessOwnersUSA"],
};

function composeHashtags(strategy, theme, audience, platform) {
  const tags = [
    ...strategy.hashtags,
    ...(THEME_HASHTAGS[theme] || []).slice(0, 2),
    ...(AUDIENCE_HASHTAGS[audience] || []).slice(0, 2),
    ...(PLATFORM_HASHTAGS[platform] || []).slice(0, 1),
  ];
  // Dedup preserving first-occurrence order. Cap at 10 — anything more
  // reads as spam on LinkedIn and breaks Instagram's recommended count.
  const seen = new Set();
  const out = [];
  for (const tag of tags) {
    const k = tag.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(tag);
    if (out.length >= 10) break;
  }
  return out;
}

function title(value) {
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function label(value) {
  return title(value).toLowerCase();
}

function pick(list, index) {
  return list[index % list.length];
}

function parseProductMix(raw) {
  if (!raw) return DEFAULT_MIX;
  const mix = {};
  for (const pair of String(raw).split(",")) {
    const [product, value] = pair.split("=");
    if (!strategies[product]) throw new Error(`Unknown product in --product-mix: ${product}`);
    mix[product] = Number(value);
  }
  return { ...DEFAULT_MIX, ...mix };
}

function countsForMix(mix) {
  const entries = Object.entries(mix);
  const raw = entries.map(([product, percent]) => [product, (Number(percent) / 100) * 90]);
  const counts = Object.fromEntries(raw.map(([product, value]) => [product, Math.floor(value)]));
  let remaining = 90 - Object.values(counts).reduce((sum, count) => sum + count, 0);
  raw
    .map(([product, value]) => [product, value - Math.floor(value)])
    .sort((a, b) => b[1] - a[1])
    .forEach(([product]) => {
      if (remaining > 0) {
        counts[product] += 1;
        remaining -= 1;
      }
    });
  return counts;
}

function productSequence(mix) {
  const target = JSON.stringify(mix) === JSON.stringify(DEFAULT_MIX) ? COUNTS_90 : countsForMix(mix);
  const counts = { ...target };
  const sequence = [];
  for (let i = 0; i < 90; i += 1) {
    const available = Object.entries(counts).filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1]);
    const [product] = available[i % Math.min(available.length, 4)];
    sequence.push(product);
    counts[product] -= 1;
  }
  return sequence;
}

// Track per-product LinkedIn position so lane + format rotation stays
// deterministic per product, not per global index.
const linkedinCounters = {};
function nextLinkedInIndex(product) {
  const n = linkedinCounters[product] || 0;
  linkedinCounters[product] = n + 1;
  return n;
}

function buildLinkedInPost({ month, day, index, product }) {
  const strategy = strategies[product];
  const productStrategy = PRODUCT_STRATEGIES[product];
  const audience = pick(audiences[product], index + day);
  const liIndex = nextLinkedInIndex(product);
  const lane = linkedinLaneFor(liIndex);
  const format = linkedinFormatFor(product, lane, liIndex);
  const content = buildLinkedInPostContent(product, lane, format, audience, liIndex);

  // Map lane/format → a calendar `format` enum value the type system allows.
  const postFormat =
    format === "document_pdf_prompt" ? "document"
    : format === "poll_prompt" ? "text"
    : "text";

  // 80/20 media targeting: text-only formats get assetType "none" (planned
  // text-only); all other formats get "image" (media planned, needs gen).
  const isPlannedTextOnly = LINKEDIN_TEXT_ONLY_FORMATS.has(format);
  const assetType = isPlannedTextOnly ? "none" : "image";

  const date = `${month}-${String(day).padStart(2, "0")}`;
  const createdAt = `${month}-01T00:00:00-04:00`;

  // Use the first confirmed feature as theme anchor (deterministic).
  const feat = productStrategy.confirmedFeatures[liIndex % productStrategy.confirmedFeatures.length];
  const theme = feat.id;

  return {
    id: `${month}-${String(day).padStart(2, "0")}-linkedin-${product}`,
    date,
    platform: "linkedin",
    product,
    recommendedTime: pick(platformTimes.linkedin, index + day),
    format: postFormat,
    audience,
    theme,
    hook: content.hook,
    caption: content.caption,
    imagePrompt: `${title(product)} LinkedIn visual anchored on ${feat.name}: credible operator workspace, ${feat.oneLiner} No secret data, no fake screenshots.`,
    videoPrompt: `${title(product)} 10-12s LinkedIn concept tied to ${feat.name}: ${feat.oneLiner}`,
    cta: content.cta,
    hashtags: content.hashtags,
    assetType,
    status: "approved",
    notes: `lane=${lane}; format=${format}; mediaPlanning=${isPlannedTextOnly ? "text-only" : "media"}; ${product === "rezy" ? "Coming soon / early access only." : "Product-aware LinkedIn rotation."}`,
    sourceAngle: `${title(product)} LinkedIn ${lane} (${format}) anchored on ${feat.name} for ${title(audience)}.`,
    createdAt,
    updatedAt: createdAt,
  };
}

function buildPost({ month, day, platform, index, product }) {
  if (platform === "linkedin") {
    return buildLinkedInPost({ month, day, index, product });
  }
  const strategy = strategies[product];
  const theme = pick(strategy.themes, index + day);
  const audience = pick(audiences[product], index + day);
  const hook = pick(strategy.hooks, index + day);
  // Use day alone (not index+day) for format rotation — the global index
  // increments by 3 per day across 3 platforms, which causes (index+day)%N
  // to lock to a constant per platform when N divides 4. Day-only rotation
  // gives each platform a genuine cycle through its format list.
  const format = pick(platformFormats[platform], day - 1);
  const cta = pick(strategy.ctas, index + day);
  const date = `${month}-${String(day).padStart(2, "0")}`;
  const createdAt = `${month}-01T00:00:00-04:00`;
  const perspective = platform === "instagram" ? "Saveable visual angle" : "Plain-language owner angle";
  const body = strategy.body(theme, audience);
  const caption = `${perspective} ${day}.${index % 3 + 1}: ${hook}\n\n${body}\n\nThe practical move is to make the leak, handoff, source of truth, and next action visible before more work is pushed through the same system.`;

  return {
    id: `${month}-${String(day).padStart(2, "0")}-${platform}-${product}`,
    date,
    platform,
    product,
    recommendedTime: pick(platformTimes[platform], index + day),
    format,
    audience,
    theme,
    hook,
    caption,
    imagePrompt: `${title(product)} visual for ${title(theme)}: credible operator workspace, visible source of truth, next actions, documents, handoffs, and reporting. Platform ${platform}. No secret data, no fake screenshots.`,
    videoPrompt: `${title(product)} 10-12 second video concept for ${title(theme)}: scattered work becomes a clear operating picture, then a specific next action appears. Platform ${platform}.`,
    cta,
    hashtags: composeHashtags(strategy, theme, audience, platform),
    // Instagram: always media. Facebook: "text" format → planned text-only,
    // all other formats → media. This targets ~80% media / ~20% text-only.
    assetType: platform === "instagram" ? "image"
      : (platform === "facebook" && format === "text") ? "none"
      : "image",
    status: "approved",
    notes: product === "rezy" ? "Coming soon / early access only." : "Generated monthly rotation.",
    sourceAngle: `${title(product)} monthly content rotation: ${title(theme)} for ${title(audience)}.`,
    createdAt,
    updatedAt: createdAt,
  };
}

function generate(month, mix) {
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  if (daysInMonth < 30) throw new Error(`${month} has ${daysInMonth} days; generator requires at least 30 days.`);
  const sequence = productSequence(mix);
  const posts = [];
  let index = 0;
  for (let day = 1; day <= 30; day += 1) {
    for (const platform of PLATFORMS) {
      posts.push(buildPost({ month, day, platform, index, product: sequence[index] }));
      index += 1;
    }
  }
  return posts;
}

const args = parseArgs();
const month = resolveMonth(args.month);
const mix = parseProductMix(args["product-mix"]);
let posts = generate(month, mix);
const counts = posts.reduce((acc, post) => ({ ...acc, [post.product]: (acc[post.product] || 0) + 1 }), {});

// --no-preserve-scheduled: clean regenerate, drop existing Buffer state.
// Default behavior preserves the live state of posts that have already been
// scheduled to Buffer — their captions, hooks, hashtags, mediaPrompt, and
// generated asset URLs stay aligned with what Buffer actually has.
const preserveScheduled = args["no-preserve-scheduled"] ? false : true;
let preservedCount = 0;
if (preserveScheduled) {
  let existingById;
  try {
    const existing = readCalendar();
    existingById = new Map(existing.map((p) => [p.id, p]));
  } catch {
    existingById = new Map();
  }
  posts = posts.map((next) => {
    const prev = existingById.get(next.id);
    if (!prev || !prev.bufferPostId) return next;
    preservedCount += 1;
    // Keep the live Buffer-side fields AND the on-the-wire content from the
    // prior run. The repo should reflect what Buffer actually has.
    return {
      ...next,
      hook: prev.hook,
      caption: prev.caption,
      hashtags: prev.hashtags,
      imagePrompt: prev.imagePrompt,
      videoPrompt: prev.videoPrompt,
      cta: prev.cta,
      // Keep classification metadata aligned with on-the-wire content so
      // the audit doesn't claim a format/lane that the post was not built
      // against. notes/theme/sourceAngle reflect what Buffer actually has.
      notes: prev.notes,
      theme: prev.theme,
      sourceAngle: prev.sourceAngle,
      format: prev.format,
      audience: prev.audience,
      assetUrl: prev.assetUrl,
      assetUrls: prev.assetUrls,
      assetType: prev.assetType,
      mediaStatus: prev.mediaStatus,
      mediaMode: prev.mediaMode,
      mediaProvider: prev.mediaProvider,
      mediaPrompt: prev.mediaPrompt,
      mediaPromptHash: prev.mediaPromptHash,
      mediaRelevanceScore: prev.mediaRelevanceScore,
      assetStorageProvider: prev.assetStorageProvider,
      assetStoragePath: prev.assetStoragePath,
      generatedAssetLocalPath: prev.generatedAssetLocalPath,
      bufferPostId: prev.bufferPostId,
      bufferDueAt: prev.bufferDueAt,
      updatedAt: prev.updatedAt || next.updatedAt,
    };
  });
}

if (args["dry-run"]) {
  console.log(JSON.stringify({ month, count: posts.length, counts, preservedCount, sample: posts.slice(0, 4) }, null, 2));
  process.exit(0);
}

writeCalendar(posts);
console.log(`Generated ${posts.length} posts for ${month}`);
console.log(`Product mix: ${Object.entries(counts).map(([product, count]) => `${product}=${count}`).join(", ")}`);
if (preserveScheduled) {
  console.log(`Preserved live state of ${preservedCount} already-scheduled post(s).`);
}

const validation = spawnSync(process.execPath, ["scripts/validate-content-calendar.mjs"], { stdio: "inherit" });
if (validation.status !== 0) process.exit(validation.status || 1);
