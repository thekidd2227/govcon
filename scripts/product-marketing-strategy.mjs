/**
 * Product marketing strategy — single source of truth for the product-aware
 * LinkedIn marketing agent.
 *
 * Every claim, feature, hashtag, format, and CTA in this file must trace back
 * to a row in `docs/product-marketing-evidence-inventory.md`. If a feature is
 * not confirmed in the repo/docs, it is either marked candidate (for
 * conceptual messaging only) or omitted entirely.
 *
 * Consumed by:
 *  - scripts/generate-monthly-content-calendar.mjs (LinkedIn copy build)
 *  - scripts/audit-linkedin-strategy.mjs (post-build audit)
 *  - src/content/arcg/quality.ts (in-app validator parity rules)
 */

/* ───────────────────────────────────────────────────────────────────────── *
 * LinkedIn lane mix.
 *
 * The agent writes two lanes of LinkedIn content:
 *  - feature_benefit: product/service features, benefits, use cases,
 *    workflows, buyer value, product education.
 *  - diagnostic_pov: diagnostic/POV/leak-style content (operator essays,
 *    contrarian POVs, mini case studies, polls, founder notes).
 *
 * Target mix per the product-aware marketing spec: 75% feature_benefit,
 * 25% diagnostic_pov. The audit warns outside [65%, 85%] and fails below
 * 50%.
 * ───────────────────────────────────────────────────────────────────────── */

export const LINKEDIN_LANE_TARGETS = {
  feature_benefit: { target: 0.75, warnMin: 0.65, warnMax: 0.85, failMin: 0.5 },
  diagnostic_pov:  { target: 0.25, warnMin: 0.15, warnMax: 0.35, failMin: 0.0 },
};

/* ───────────────────────────────────────────────────────────────────────── *
 * LinkedIn post formats.
 *
 * 10 feature/benefit formats + 10 diagnostic/POV formats. The generator
 * picks a format deterministically based on (product, day, index) so the
 * mix stays predictable and re-runnable.
 * ───────────────────────────────────────────────────────────────────────── */

export const LINKEDIN_FORMATS = {
  feature_benefit: [
    "product_feature_spotlight",
    "benefit_breakdown",
    "workflow_walkthrough",
    "use_case_post",
    "feature_to_outcome",
    "product_education",
    "buyer_problem_solution",
    "product_comparison_without_named_competitors",
    "release_or_build_update",
    "document_pdf_prompt",
  ],
  diagnostic_pov: [
    "text_diagnostic",
    "leak_breakdown",
    "contrarian_pov",
    "mini_case_study",
    "before_after",
    "checklist",
    "founder_note",
    "poll_prompt",
    "website_traffic_cta",
    "comment_led_question",
  ],
};

/**
 * LinkedIn formats that are intentionally text-only. These posts ship
 * to Buffer without media by design — they are not "missing media."
 *
 * Target: ~20% of LinkedIn posts planned as text-only, ~80% media.
 * The actual ratio depends on the rotation; the validator warns when
 * text-only drifts above 30% or media drops below 70%.
 */
export const LINKEDIN_TEXT_ONLY_FORMATS = new Set([
  "document_pdf_prompt",
  "text_diagnostic",
  "contrarian_pov",
  "founder_note",
  "poll_prompt",
  "comment_led_question",
]);

/* ───────────────────────────────────────────────────────────────────────── *
 * Per-product strategy. Each product has the same shape so the generator
 * and validator can iterate uniformly.
 * ───────────────────────────────────────────────────────────────────────── */

export const STRATEGIES = {
  /* ──────────────────────────── ARCG SYSTEMS ──────────────────────────── */
  arcg: {
    productName: "ARCG Systems",
    site: "arcgsystems.com",
    positioning:
      "ARCG Systems diagnoses operational leaks, blueprints the operating model, then builds the systems that fix the leak. We do not automate broken logic — we make the leak visible first.",
    buyerProfiles: [
      "small-business-owners",
      "property-managers",
      "service-companies",
      "government-contractors",
      "caribbean-latam-operators",
    ],
    painPoints: [
      "manual handoffs that drop revenue between teams",
      "reporting that lives in three spreadsheets nobody trusts",
      "intake and qualification handled by whoever happens to answer",
      "vendor dispatch and SLA tracking done in text threads",
      "federal contracting capability + subcontracting work scattered across docs",
      "accountability gaps where 'someone will follow up' becomes nobody",
      "scheduling and routing built on tribal knowledge",
    ],
    // Each feature row maps to evidence-inventory ARCG verified surface.
    confirmedFeatures: [
      {
        id: "operational-waste-diagnostic",
        name: "Operational Waste Diagnostic",
        evidence: "i18n.assessment.sub, src/pages/Diagnostics.tsx",
        oneLiner: "Six-flow diagnostic that surfaces the operating leak before any build.",
      },
      {
        id: "ai-automation-lead-systems",
        name: "AI Automation & Lead Systems",
        evidence: "i18n.capabilities.cap1*",
        oneLiner: "24/7 intake and qualification so no inquiry sits unanswered.",
      },
      {
        id: "operational-intelligence-reporting",
        name: "Operational Intelligence & Reporting",
        evidence: "i18n.capabilities.cap2*",
        oneLiner: "Automated reporting that shows the operating picture, not raw rows.",
      },
      {
        id: "facilities-property-support",
        name: "Facilities & Property Support",
        evidence: "i18n.capabilities.cap3*, src/pages/FacilitiesSupport.tsx",
        oneLiner: "Vendor dispatch and SLA tracking with a real next action attached.",
      },
      {
        id: "federal-compliance-govcon",
        name: "Federal Compliance & GovCon Systems",
        evidence: "i18n.capabilities.cap4*, src/pages/FederalAccess.tsx",
        oneLiner: "SAM.gov registration, capability statements, and subcontracting plans handled as one workflow.",
      },
      {
        id: "data-management-processing",
        name: "Data Management & Processing",
        evidence: "i18n.capabilities.cap5*",
        oneLiner: "Structured intake and CRM integration so data lands in the right place the first time.",
      },
      {
        id: "teaming-subcontract-strategy",
        name: "Teaming & Subcontract Strategy",
        evidence: "i18n.capabilities.cap6*",
        oneLiner: "Set-aside positioning and teaming so smaller operators stay competitive on federal work.",
      },
      {
        id: "methodology",
        name: "Diagnose → Prioritize → Design → Build → Test → Launch → Stabilize → Expand",
        evidence: "i18n.howItWorks.h2",
        oneLiner: "Eight-step methodology that makes the leak visible before code ships.",
      },
    ],
    benefits: [
      "leaks become visible before the operating cost compounds",
      "the workflow is mapped before automation runs on top of it",
      "reporting tells you the next action, not just the last number",
      "vendor / facility work gets a real SLA and a real next step",
      "federal capability work lives in one place instead of seven",
      "intake stops depending on who happens to remember",
    ],
    useCases: [
      "service company losing revenue on no-shows and missed callbacks",
      "property manager juggling vendors across multiple buildings",
      "small GovCon team tracking bids, docs, follow-up in spreadsheets",
      "operator scaling Caribbean / LatAm operations needing one operating picture",
      "owner who 'has the dashboard somewhere' but can't show next actions",
    ],
    proofSafeTalkingPoints: [
      "Certifications: SDVOSB, HUBZone, MBE, DBE, SBE.",
      "Method: Diagnose → Prioritize → Design → Build → Test → Launch → Stabilize → Expand.",
      "Operating proof is the Content Command Center the team uses internally.",
      "Federal access work is grounded in SAM.gov registration + capability statement workflows.",
    ],
    ctas: {
      feature_benefit: [
        "Start the diagnostic at arcgsystems.com/diagnostics.",
        "Book a 30-minute Operational Waste Diagnostic at arcgsystems.com/assessment.",
        "See the eight-step methodology at arcgsystems.com.",
        "Map the operating leak before you automate. arcgsystems.com.",
      ],
      diagnostic_pov: [
        "DM 'AUDIT' to map the operating leak.",
        "DM 'DIAGNOSTIC' for the six-flow walkthrough.",
        "Comment 'LEAK' and I'll send the diagnostic outline.",
        "Reply with the workflow you'd map first — I'll send back the diagnostic angle.",
      ],
    },
    blockedClaims: [
      "guaranteed ROI",
      "guaranteed revenue lift",
      "we automate everything overnight",
      "fake clients, fake testimonials, named clients not in the repo",
      "AI agency generic positioning",
    ],
    // 10–12 LinkedIn hashtags per post. Brand-tier always included; theme
    // and audience tags rotate to keep the tag set fresh per post.
    hashtagSchema: {
      brand: ["#ARCGSystems", "#OperationalIntelligence", "#OperationalWasteDiagnostic", "#WorkflowAudit"],
      themePool: [
        "#OperationalAudit", "#LeakDetection", "#BusinessDiagnostic",
        "#BusinessBlueprint", "#SystemDesign", "#ProcessFirst",
        "#OperationalWaste", "#LeanOps", "#WasteReduction",
        "#DataVisibility", "#OpsReporting", "#BusinessClarity",
        "#WorkflowFix", "#Accountability", "#VendorOps",
        "#DispatchOps", "#FieldOps", "#GovCon",
        "#SAMgov", "#FederalContracting", "#CapabilityStatement",
        "#SubcontractStrategy", "#CRMIntegration", "#StructuredIntake",
      ],
      audiencePool: [
        "#SmallBusiness", "#FounderLife", "#OperatorMindset",
        "#PropertyManagement", "#ServiceBusiness", "#FieldService",
        "#SmallBusinessGovCon", "#FederalBusiness", "#CaribbeanBusiness",
        "#LatAmOps", "#GlobalOperators", "#OpsLeaders",
      ],
      // Tags we never use on LinkedIn ARCG posts — generic spam / off-brand.
      blockedTags: [
        "#AI", "#Automation", "#Innovation", "#DigitalTransformation",
        "#Business", "#Success", "#Entrepreneur", "#Motivation",
        "#Inspiration", "#Hustle", "#Growth", "#Marketing",
      ],
      // Validator must enforce ≥2 tags from these required categories.
      requiredCategories: {
        operations_or_diagnostic: [
          "#OperationalIntelligence", "#OperationalWasteDiagnostic", "#OperationalAudit",
          "#WorkflowAudit", "#LeakDetection", "#BusinessDiagnostic",
          "#OperationalWaste", "#LeanOps", "#WorkflowFix", "#OpsReporting",
        ],
      },
    },
  },

  /* ──────────────────────────── SOURCEDECK ────────────────────────────── */
  sourcedeck: {
    productName: "SourceDeck",
    site: "sourcedeck.app",
    positioning:
      "SourceDeck is the command center for GovCon and small-business operators — one source of truth for bids, vendors, documents, follow-up, pipeline, reporting, and next actions. It is not generic project management.",
    buyerProfiles: [
      "government-contractors",
      "small-business-owners",
      "service-companies",
      "mixed",
    ],
    painPoints: [
      "the bid pipeline lives in someone's head plus a CRM plus a chat thread",
      "documents need to be 'found' instead of 'opened'",
      "follow-up depends on whoever remembers to circle back",
      "vendor info and capability docs scattered across drives",
      "no single view a stakeholder could read in 30 seconds",
      "compliance reminders living on a sticky note",
      "team handoffs that lose the next action between stages",
    ],
    confirmedFeatures: [
      {
        id: "command-center",
        name: "GovCon / small-business command center",
        evidence: "operator-stated; routing /sourcedeck → sourcedeck.app",
        oneLiner: "A single operating picture across the GovCon workflow.",
      },
      {
        id: "source-of-truth",
        name: "Source-of-truth workspace",
        evidence: "operator-stated",
        oneLiner: "Bids, vendors, documents, follow-up, pipeline, reporting, next actions in one place.",
      },
      {
        id: "bid-pipeline",
        name: "Opportunity / bid pipeline",
        evidence: "operator-stated (candidate)",
        oneLiner: "Pipeline view a stakeholder can read in 30 seconds.",
      },
      {
        id: "document-tracking",
        name: "Document tracking",
        evidence: "operator-stated (candidate)",
        oneLiner: "Capability statements, past performance, NDAs — opened, not hunted.",
      },
      {
        id: "vendor-tracking",
        name: "Vendor tracking",
        evidence: "operator-stated (candidate)",
        oneLiner: "Subs, teammates, suppliers — visible with status, not buried in email.",
      },
      {
        id: "compliance-reminders",
        name: "Compliance reminders",
        evidence: "operator-stated (candidate)",
        oneLiner: "Renewals, registrations, set-aside windows surfaced before they expire.",
      },
      {
        id: "capture-proposal-workflow",
        name: "Capture / proposal workflow",
        evidence: "operator-stated (candidate)",
        oneLiner: "Capture → proposal → submission stages without losing the next action.",
      },
    ],
    benefits: [
      "the next bid is visible before someone has to ask",
      "documents open instead of having to be found",
      "follow-up becomes a system, not a memory test",
      "stakeholder updates take 30 seconds instead of an afternoon",
      "new team members ramp without the founder in the room",
      "compliance windows surface before they expire",
    ],
    useCases: [
      "GovCon team running 12+ active opportunities across multiple agencies",
      "small business juggling teaming partners, capability docs, and follow-ups",
      "service company that wants pipeline visibility past the CRM",
      "operator who needs one screen for everything bid-related",
    ],
    proofSafeTalkingPoints: [
      "SourceDeck is positioned as a command center, not generic project management.",
      "Source-of-truth framing: one place for bids, vendors, documents, follow-up, pipeline, reporting, next actions.",
      "Naming an Asana/Trello-style competitor is off-positioning and not used.",
    ],
    ctas: {
      feature_benefit: [
        "See the command center at sourcedeck.app.",
        "Open sourcedeck.app and map what your team still tracks manually.",
        "Walk through the SourceDeck operating picture at sourcedeck.app.",
        "Visit sourcedeck.app to see the source-of-truth setup.",
      ],
      diagnostic_pov: [
        "DM 'SOURCEDECK' for the command center walkthrough.",
        "Comment 'PIPELINE' and I'll send the source-of-truth breakdown.",
        "Reply with one bid stage you'd centralize first — I'll send the SourceDeck angle.",
        "DM 'GOVCON' for the GovCon operating-picture outline.",
      ],
    },
    blockedClaims: [
      "generic project management positioning",
      "another Asana / Trello / Notion / Monday framing",
      "named-competitor comparisons",
      "named federal-customer claims",
      "feature claims beyond the candidate list (anything outside operator-stated positioning)",
    ],
    hashtagSchema: {
      brand: ["#SourceDeck", "#GovCon", "#CommandCenter", "#SourceOfTruth"],
      themePool: [
        "#GovConOperations", "#SAMgov", "#FederalContracting",
        "#SmallBusinessGovCon", "#CapabilityStatement", "#SubcontractStrategy",
        "#OpsCenter", "#ControlTower", "#OneSystem",
        "#OpsClarity", "#DocumentControl", "#AuditReady",
        "#ComplianceOps", "#FollowUpFunnel", "#PipelineDiscipline",
        "#OpsRigor", "#ReportingHub", "#OpsDashboard",
        "#TaskOps", "#VendorControl", "#ExecutionLayer",
        "#ProposalWorkflow", "#CaptureManagement", "#BidPipeline",
      ],
      audiencePool: [
        "#GovernmentContractors", "#FederalBusiness", "#FederalContractors",
        "#SmallBusinessOwners", "#FounderLife", "#OperatorMindset",
        "#ServiceBusiness", "#FieldService", "#OpsLeaders",
      ],
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
  },

  /* ──────────────────────────── CHARTNAV ──────────────────────────────── */
  chartnav: {
    productName: "ChartNav",
    site: "chartnavmd.com",
    positioning:
      "ChartNav is an ophthalmology workflow and documentation platform. Intake, exam, imaging, orders, signoff, export — one role-aware page, billing-aware but not a billing engine. ChartNav supports clinical work; it never replaces clinical review.",
    buyerProfiles: [
      "ophthalmology-practices",
      "mixed",
    ],
    painPoints: [
      "charting that pulls focus away from the patient",
      "technician-to-physician handoffs where notes get lost",
      "imaging metadata that lives outside the chart",
      "exam documentation rebuilt at end of day from memory",
      "billing surprises that trace back to documentation gaps, not coding",
      "role confusion between technician and physician views",
    ],
    confirmedFeatures: [
      {
        id: "ophthalmology-workflow",
        name: "Ophthalmology workflow positioning",
        evidence: "src/pages/chartnav/Ophthalmology.tsx, Platform.tsx #ophthalmology",
        oneLiner: "Built around how ophthalmology actually runs, not generic SOAP templates.",
      },
      {
        id: "module-architecture",
        name: "Module-based architecture",
        evidence: "Platform.tsx #modules",
        oneLiner: "Modules per workflow stage so the chart stays focused on the visit.",
      },
      {
        id: "role-aware",
        name: "Role-aware: technician + physician",
        evidence: "Platform.tsx #roles",
        oneLiner: "The technician sees what the technician needs; the physician sees what the physician needs.",
      },
      {
        id: "exam-flow",
        name: "Intake → exam → imaging → orders → signoff → export",
        evidence: "Platform.tsx #flow",
        oneLiner: "One flow, six stages, no app-switching mid-visit.",
      },
      {
        id: "continuity",
        name: "Continuity / handoff support",
        evidence: "Platform.tsx #continuity",
        oneLiner: "Handoffs stay visible so the chart doesn't get rebuilt at end of day.",
      },
      {
        id: "implementation-guidance",
        name: "Implementation guidance",
        evidence: "src/pages/chartnav/Implementation.tsx, Platform.tsx #implementation",
        oneLiner: "Practice-onboarding guidance, not a 'figure it out yourself' rollout.",
      },
      {
        id: "billing-aware-workflow",
        name: "Billing-aware workflow (not a billing engine)",
        evidence: "src/content/arcg/quality.ts safety claims",
        oneLiner: "Documentation built so coders aren't translating after the fact.",
      },
    ],
    benefits: [
      "the exam stays with the patient, not with the keyboard",
      "technician-to-physician handoffs are visible, not assumed",
      "imaging metadata stays in the chart",
      "documentation is ready at signoff, not at end of day",
      "billing reads cleanly because documentation reads cleanly",
      "new technicians ramp faster against a role-aware workflow",
    ],
    useCases: [
      "ophthalmology practice losing exam time to charting friction",
      "clinic where imaging metadata is re-entered into the chart",
      "team where the technician-to-physician handoff goes missing",
      "practice prepping for documentation review and audit readiness",
    ],
    proofSafeTalkingPoints: [
      "ChartNav is positioned as ophthalmology workflow + documentation, not a diagnostic AI.",
      "Role-aware (technician + physician).",
      "Flow: intake → exam → imaging → orders → signoff → export.",
      "Continuity and handoff support is in the platform positioning.",
      "Implementation guidance is provided.",
      "Billing-aware, not a billing engine.",
    ],
    ctas: {
      feature_benefit: [
        "See the ChartNav workflow at chartnavmd.com.",
        "Book a ChartNav workflow review from chartnavmd.com.",
        "Walk through the role-aware ophthalmology flow at chartnavmd.com.",
        "Open chartnavmd.com to see the intake-to-export flow.",
      ],
      diagnostic_pov: [
        "DM 'CHARTNAV' for the ophthalmology workflow walkthrough.",
        "Comment 'WORKFLOW' and I'll send the role-aware breakdown.",
        "Reply with the handoff you'd want to fix first — I'll send the ChartNav angle.",
        "DM 'CHARTING' for the documentation-readiness outline.",
      ],
    },
    blockedClaims: [
      "autonomous diagnosis",
      "AI diagnoses patients",
      "FDA approved / FDA cleared / FDA certified",
      "HIPAA compliant / HIPAA certified",
      "SOC 2 compliant",
      "guaranteed billing / guaranteed reimbursement",
      "replaces EMR / EHR",
      "replaces physician judgment",
      "patient-identifiable imagery in any prompt",
      "named EMR vendors without confirmation",
      "specific retina-module features (until repo confirmed)",
    ],
    hashtagSchema: {
      brand: ["#ChartNav", "#Ophthalmology", "#ClinicalWorkflow", "#DocumentationReadiness"],
      themePool: [
        "#EyeCare", "#OphthalmologyPractice", "#OphthalmologyOps",
        "#OphthalmologyTech", "#EHRWorkflow", "#EMRWorkflow",
        "#ClinicalDocumentation", "#ClinicalHandoff", "#TeamCare",
        "#ClinicOps", "#PatientIntake", "#ClinicalImaging",
        "#WorkflowCare", "#ClinicalSignoff", "#OrdersWorkflow",
        "#ExportReady", "#WorkflowOverBilling", "#PatientFocus",
        "#PatientExperience", "#HumanFirst", "#ChartReady",
        "#DocPrep", "#ClinicReady", "#RoleAwareCharting",
      ],
      audiencePool: [
        "#Ophthalmology", "#EyeCare", "#OphthalmologyPractice",
        "#MedicalPractice", "#ClinicOperations", "#OphthalmicTechnician",
        "#OphthalmologyResident", "#PracticeAdministrator",
      ],
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
  },

  /* ──────────────────────────── REZY ──────────────────────────────────── */
  rezy: {
    productName: "Rezy",
    site: null,
    positioning:
      "Rezy is being built as a property command layer — maintenance, tenants, vendors, tasks, documents, reporting in one operating picture. Pre-launch only: every post must use coming-soon, early-access, or waitlist language.",
    buyerProfiles: [
      "property-managers",
      "small-business-owners",
      "mixed",
    ],
    painPoints: [
      "maintenance requests dropping between text threads and email",
      "tenant complaints arriving before the operator hears about the leak",
      "vendor work tracked in a spreadsheet that nobody updates",
      "reporting to owners assembled from three tools the night before",
      "no single place that shows building state",
    ],
    confirmedFeatures: [
      {
        id: "property-command-layer",
        name: "Property command layer",
        evidence: "navbar future-product mention; pre-launch positioning",
        oneLiner: "Coming soon: one operating picture across maintenance, tenants, vendors, tasks, documents, reporting.",
      },
      {
        id: "maintenance-control",
        name: "Maintenance control (coming soon)",
        evidence: "pre-launch positioning",
        oneLiner: "Maintenance request → assignment → close, visible, in one place.",
      },
      {
        id: "tenant-visibility",
        name: "Tenant visibility (coming soon)",
        evidence: "pre-launch positioning",
        oneLiner: "What's open, what's stuck, what's overdue — before the tenant has to call.",
      },
      {
        id: "vendor-task-control",
        name: "Vendor / task control (coming soon)",
        evidence: "pre-launch positioning",
        oneLiner: "Vendor work tracked as tasks with a real next action.",
      },
      {
        id: "document-reporting",
        name: "Document + owner reporting (coming soon)",
        evidence: "pre-launch positioning",
        oneLiner: "Owner updates assembled from system state, not from late-night spreadsheets.",
      },
      {
        id: "early-access-cohort",
        name: "Early-access cohort shaping roadmap",
        evidence: "pre-launch positioning",
        oneLiner: "The waitlist is where Rezy's roadmap actually gets set.",
      },
    ],
    benefits: [
      "maintenance won't go invisible for 24 hours",
      "tenant calls stop being the first signal that something broke",
      "vendor work has one place to live",
      "owner reporting reads cleanly because it isn't assembled by hand",
      "early-access operators shape the roadmap before launch",
    ],
    useCases: [
      "property manager juggling multiple buildings without one operating picture (coming soon)",
      "operator who wants maintenance + tenant + vendor visibility in one tool (coming soon)",
      "small landlord tired of fixing maintenance through text threads (early access)",
    ],
    proofSafeTalkingPoints: [
      "Rezy is pre-launch. Every claim is framed as coming soon, early access, or waitlist.",
      "No active-customer claims, no production-availability claims, no named integrations until confirmed.",
      "Early-access cohort is real positioning — the waitlist shapes the roadmap.",
    ],
    ctas: {
      feature_benefit: [
        "Join the Rezy early-access waitlist.",
        "Request early access to the Rezy property command layer.",
        "Join the waitlist before the property command layer opens.",
        "DM 'EARLY ACCESS' for the Rezy pre-launch preview.",
      ],
      diagnostic_pov: [
        "DM 'REZY' for the coming-soon preview.",
        "Comment 'WAITLIST' and I'll add you to the early-access list.",
        "Reply with the property workflow you'd want visible first — early-access cohort is shaping the roadmap.",
        "Join the waitlist if you want the early-access build to reflect your operation.",
      ],
    },
    blockedClaims: [
      "Launched / Now Available / Production-ready",
      "Active customer claims",
      "Named integrations until confirmed",
      "Any specific feature claim without 'coming soon' framing",
      "Pricing claims",
      "Specific platform integrations (Yardi, AppFolio, Buildium, etc.)",
    ],
    hashtagSchema: {
      brand: ["#Rezy", "#PropertyCommandLayer", "#PropTech", "#EarlyAccess"],
      themePool: [
        "#PropertyOps", "#PropertyManagement", "#MaintenanceOps",
        "#WorkOrders", "#PropertyMaintenance", "#TenantExperience",
        "#TenantOps", "#ResidentExperience", "#VendorManagement",
        "#TaskFlow", "#PropertyReporting", "#OwnerUpdates",
        "#OpsTransparency", "#JoinTheWaitlist", "#OperatorsOnly",
        "#OperatorWaitlist", "#ComingSoon", "#PreLaunch",
        "#BuildInPublic", "#OperatorBuilt",
      ],
      audiencePool: [
        "#PropertyManagement", "#PropertyManager", "#Landlord",
        "#REI", "#RealEstateInvesting", "#MultifamilyOps",
        "#SmallBusinessOwners", "#FounderLife", "#OperatorMindset",
      ],
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
  },
};

/* ───────────────────────────────────────────────────────────────────────── *
 * Hashtag bounds for LinkedIn posts.
 * Spec: 10–12 product-specific hashtags per LinkedIn post.
 * ───────────────────────────────────────────────────────────────────────── */
export const LINKEDIN_HASHTAG_BOUNDS = { min: 10, max: 12 };

/* ───────────────────────────────────────────────────────────────────────── *
 * Lane assignment.
 *
 * Deterministic 75/25 split per LinkedIn post position. The 4th of every
 * 4-post window is diagnostic_pov, the rest are feature_benefit. This
 * produces ~25% diagnostic_pov per product per month, hitting the spec.
 * ───────────────────────────────────────────────────────────────────────── */
export function linkedinLaneFor(index) {
  return index % 4 === 3 ? "diagnostic_pov" : "feature_benefit";
}

/* ───────────────────────────────────────────────────────────────────────── *
 * Format selector. Deterministic but rotates per lane so the same product
 * doesn't pile up the same format three weeks running.
 * ───────────────────────────────────────────────────────────────────────── */
export function linkedinFormatFor(product, lane, index) {
  const list = LINKEDIN_FORMATS[lane];
  return list[(index + product.length) % list.length];
}

/* ───────────────────────────────────────────────────────────────────────── *
 * Hashtag composer for LinkedIn.
 *
 * Always pulls the 4 brand tags, then fills theme + audience tags
 * deterministically (per post index) until the count lands in [min, max].
 * Caller passes the validator the same schema so warnings match what
 * actually shipped.
 * ───────────────────────────────────────────────────────────────────────── */
export function composeLinkedInHashtags(product, audience, index) {
  const strat = STRATEGIES[product];
  if (!strat) throw new Error(`Unknown product: ${product}`);
  const { brand, themePool, audiencePool, requiredCategories = {} } = strat.hashtagSchema;
  const bounds = LINKEDIN_HASHTAG_BOUNDS;

  const out = [];
  const seen = new Set();
  const push = (tag) => {
    if (!tag) return;
    const k = tag.toLowerCase();
    if (seen.has(k)) return;
    if (out.length >= bounds.max) return;
    seen.add(k);
    out.push(tag);
  };

  // Brand tier (always).
  brand.forEach(push);

  // Required-category coverage — at least 2 from each required bucket.
  for (const tags of Object.values(requiredCategories)) {
    let added = 0;
    for (let i = 0; i < tags.length && added < 2; i += 1) {
      const tag = tags[(index + i) % tags.length];
      if (!seen.has(tag.toLowerCase())) {
        push(tag);
        added += 1;
      }
    }
  }

  // Theme rotation.
  const themeStart = (index * 3) % themePool.length;
  for (let i = 0; i < themePool.length && out.length < bounds.max - 1; i += 1) {
    push(themePool[(themeStart + i) % themePool.length]);
  }

  // Audience rotation — try the audience-specific tags first.
  const audienceTags = audiencePool;
  const audStart = (index * 2) % audienceTags.length;
  for (let i = 0; i < audienceTags.length && out.length < bounds.max; i += 1) {
    push(audienceTags[(audStart + i) % audienceTags.length]);
  }

  // Backfill from theme pool if we're still under min.
  let bf = 0;
  while (out.length < bounds.min && bf < themePool.length) {
    push(themePool[(themeStart + bf + 7) % themePool.length]);
    bf += 1;
  }

  return out.slice(0, bounds.max);
}

/* ───────────────────────────────────────────────────────────────────────── *
 * Format-specific hook + body builders. Keeps the LinkedIn copy
 * recognizably product-aware while staying within the evidence-inventory
 * surface.
 * ───────────────────────────────────────────────────────────────────────── */

function pick(list, index) {
  return list[((index % list.length) + list.length) % list.length];
}

function pickFeature(strategy, index) {
  return pick(strategy.confirmedFeatures, index);
}

function pickBenefit(strategy, index) {
  return pick(strategy.benefits, index);
}

function pickUseCase(strategy, index) {
  return pick(strategy.useCases, index);
}

function pickPain(strategy, index) {
  return pick(strategy.painPoints, index);
}

function pickProof(strategy, index) {
  return pick(strategy.proofSafeTalkingPoints, index);
}

function rezyComingSoon(text) {
  // Force coming-soon language on Rezy copy so quality.ts passes.
  if (/coming soon|early access|waitlist|preview|not launched|pre-launch/i.test(text)) {
    return text;
  }
  return `${text} (Rezy is in pre-launch — early access only.)`;
}

const FORMAT_BUILDERS = {
  /* ──────────────────────────── FEATURE / BENEFIT ────────────────────── */
  product_feature_spotlight(strategy, index) {
    const feat = pickFeature(strategy, index);
    return {
      hook: `${strategy.productName} — ${feat.name}. ${feat.oneLiner}`,
      body: `${feat.name} is one of the parts of ${strategy.productName} that actually moves the operating picture. ${feat.oneLiner} If your team is patching this with a spreadsheet, you already know the cost.`,
    };
  },
  benefit_breakdown(strategy, index) {
    const benefit = pickBenefit(strategy, index);
    return {
      hook: `What ${strategy.productName} actually changes for the operator: ${benefit}.`,
      body: `Operators don't buy features. They buy what changes Monday morning. With ${strategy.productName}, ${benefit}. That's the practical benefit — not the headline.`,
    };
  },
  workflow_walkthrough(strategy, index) {
    const feat = pickFeature(strategy, index + 1);
    return {
      hook: `Walkthrough: how ${strategy.productName} handles ${feat.name.toLowerCase()}.`,
      body: `${feat.oneLiner} Inside ${strategy.productName}, that's not a side feature — it's part of how the operating picture stays current. ${pickProof(strategy, index)}`,
    };
  },
  use_case_post(strategy, index) {
    const useCase = pickUseCase(strategy, index);
    return {
      hook: `Use case: ${useCase}.`,
      body: `This is exactly the operator ${strategy.productName} is built for. ${pickBenefit(strategy, index + 2)} — that's the practical outcome, not a brochure line.`,
    };
  },
  feature_to_outcome(strategy, index) {
    const feat = pickFeature(strategy, index);
    const benefit = pickBenefit(strategy, index + 1);
    return {
      hook: `${feat.name} → ${benefit}. That's the ${strategy.productName} chain in one line.`,
      body: `${feat.oneLiner} The outcome the operator actually feels: ${benefit}. Feature on its own is noise. Feature → outcome is the part you can sell internally.`,
    };
  },
  product_education(strategy, index) {
    return {
      hook: `Most operators get ${strategy.productName} wrong on the first look. Here's what it actually is.`,
      body: `${strategy.positioning} ${pickProof(strategy, index + 3)}`,
    };
  },
  buyer_problem_solution(strategy, index) {
    const pain = pickPain(strategy, index);
    const feat = pickFeature(strategy, index + 2);
    return {
      hook: `Problem: ${pain}. ${strategy.productName} answer: ${feat.name}.`,
      body: `If ${pain}, that's the operating leak ${feat.name} was built for. ${feat.oneLiner}`,
    };
  },
  product_comparison_without_named_competitors(strategy, index) {
    return {
      hook: `Why ${strategy.productName} reads differently than the generic tools in the category.`,
      body: `Generic tools in the category solve "store the thing." ${strategy.productName} solves "make the next action visible." ${pickProof(strategy, index + 1)} No comparison to named tools — just the difference operators actually feel.`,
    };
  },
  release_or_build_update(strategy, index) {
    const feat = pickFeature(strategy, index);
    return {
      hook: `Build update on ${strategy.productName}: ${feat.name}.`,
      body: `Where we are with ${feat.name}: ${feat.oneLiner} The roadmap stays anchored to the operational leaks and workflow handoffs operators actually open in production.`,
    };
  },
  document_pdf_prompt(strategy, index) {
    return {
      hook: `Saving the ${strategy.productName} one-pager for operators who want to walk through it offline.`,
      body: `If you want the ${strategy.productName} walkthrough as a PDF — features, workflow, fit — DM and I'll send it. No gate.`,
    };
  },

  /* ──────────────────────────── DIAGNOSTIC / POV ─────────────────────── */
  text_diagnostic(strategy, index) {
    const pain = pickPain(strategy, index);
    return {
      hook: `Diagnostic angle: ${pain}. Most operators only see it after the third quarter of compounded loss.`,
      body: `The pattern: ${pain}. The diagnosis: not a tool problem, an operating-picture problem. ${strategy.productName} sits on the operating-picture side of that line.`,
    };
  },
  leak_breakdown(strategy, index) {
    const pain = pickPain(strategy, index + 1);
    return {
      hook: `Where the leak actually sits: ${pain}.`,
      body: `Operators read this as "we just need to tighten up." It's almost always structural. ${pain} compounds quietly. ${strategy.productName} surfaces it.`,
    };
  },
  contrarian_pov(strategy, index) {
    return {
      hook: `Contrarian POV: more software is not the answer. A clear operating picture is.`,
      body: `${strategy.positioning} The unpopular take: most operators don't need another tool — they need to see the leak before they buy the tool. ${pickProof(strategy, index)}`,
    };
  },
  mini_case_study(strategy, index) {
    const useCase = pickUseCase(strategy, index);
    return {
      hook: `Anonymized operator pattern (${strategy.productName} fit): ${useCase}.`,
      body: `The pattern (no client name, no inflated numbers): operator runs the workflow above, the leak compounds, the diagnostic surfaces it, the next move is structural. Where ${strategy.productName} sits in the picture: ${pickBenefit(strategy, index + 1)}.`,
    };
  },
  before_after(strategy, index) {
    return {
      hook: `Before: ${pickPain(strategy, index)}. After: ${pickBenefit(strategy, index)}.`,
      body: `That's the shift ${strategy.productName} is built to support. No magic — just an operating picture the team can actually act on.`,
    };
  },
  checklist(strategy, index) {
    const feats = [pickFeature(strategy, index), pickFeature(strategy, index + 1), pickFeature(strategy, index + 2)];
    return {
      hook: `${strategy.productName} readiness checklist — three things to look at before adding another tool.`,
      body: `1) ${feats[0].oneLiner}\n2) ${feats[1].oneLiner}\n3) ${feats[2].oneLiner}\nIf any of these read like "we wing it," that's the operating leak.`,
    };
  },
  founder_note(strategy, index) {
    return {
      hook: `Founder note on ${strategy.productName}: we don't build features that don't make the leak visible.`,
      body: `${strategy.positioning} ${pickProof(strategy, index)}`,
    };
  },
  poll_prompt(strategy, index) {
    const pain = pickPain(strategy, index);
    return {
      hook: `Quick poll for operators: which of these costs you the most right now — ${pain}?`,
      body: `Drop a comment with the leak you'd diagnose first. ${strategy.productName} is built around exactly this conversation.`,
    };
  },
  website_traffic_cta(strategy, index) {
    return {
      hook: `If you want the ${strategy.productName} walkthrough, the short version lives on the site.`,
      body: `${strategy.positioning} ${strategy.site ? `Walk it at ${strategy.site}.` : "Pre-launch — DM for the early-access preview."}`,
    };
  },
  comment_led_question(strategy, index) {
    return {
      hook: `Operators — what's the workflow you'd put under a command center first?`,
      body: `Comment the workflow and I'll send back the ${strategy.productName} angle on it. No pitch, just the diagnostic read.`,
    };
  },
};

export function buildLinkedInPostContent(product, lane, format, audience, index) {
  const strategy = STRATEGIES[product];
  if (!strategy) throw new Error(`Unknown product: ${product}`);
  const builder = FORMAT_BUILDERS[format];
  if (!builder) throw new Error(`Unknown LinkedIn format: ${format}`);

  const { hook, body } = builder(strategy, index);
  const ctas = strategy.ctas[lane] || strategy.ctas.feature_benefit;
  const cta = pick(ctas, index);
  const hashtags = composeLinkedInHashtags(product, audience, index);

  // Rezy coming-soon enforcement at the copy layer (validator backs this).
  const safeHook = product === "rezy" ? rezyComingSoon(hook) : hook;
  const safeBody = product === "rezy" ? rezyComingSoon(body) : body;

  const caption = `${safeHook}\n\n${safeBody}\n\n${cta}`;

  return { hook: safeHook, body: safeBody, cta, caption, hashtags, format, lane };
}

/* ───────────────────────────────────────────────────────────────────────── *
 * Validator helpers — exported so quality.ts (via a small bridge) and the
 * audit script share one definition of "valid LinkedIn hashtag set".
 * ───────────────────────────────────────────────────────────────────────── */

export function validateLinkedInHashtags(product, hashtags) {
  const issues = [];
  const bounds = LINKEDIN_HASHTAG_BOUNDS;
  const strat = STRATEGIES[product];
  if (!strat) return [{ severity: "error", message: `unknown product: ${product}` }];

  const count = hashtags.length;
  if (count < bounds.min) issues.push({ severity: "error", message: `LinkedIn ${product} has ${count} hashtags; min is ${bounds.min}` });
  if (count > bounds.max) issues.push({ severity: "error", message: `LinkedIn ${product} has ${count} hashtags; max is ${bounds.max}` });

  const lower = hashtags.map((t) => String(t).toLowerCase());
  const dupes = lower.filter((tag, i) => lower.indexOf(tag) !== i);
  if (dupes.length) issues.push({ severity: "error", message: `duplicate hashtag(s): ${[...new Set(dupes)].join(", ")}` });

  const blocked = strat.hashtagSchema.blockedTags.map((t) => t.toLowerCase());
  const hits = lower.filter((tag) => blocked.includes(tag));
  if (hits.length) issues.push({ severity: "error", message: `blocked hashtag(s) for ${product}: ${[...new Set(hits)].join(", ")}` });

  const required = strat.hashtagSchema.requiredCategories || {};
  for (const [name, list] of Object.entries(required)) {
    const listLower = list.map((t) => t.toLowerCase());
    const matches = lower.filter((tag) => listLower.includes(tag));
    if (matches.length < 2) {
      issues.push({ severity: "error", message: `LinkedIn ${product} needs ≥2 hashtags from category "${name}"; found ${matches.length}` });
    }
  }

  return issues;
}

export function summarizeLinkedInLanes(posts) {
  const totals = { feature_benefit: 0, diagnostic_pov: 0, unknown: 0, total: 0 };
  for (const post of posts) {
    if (post.platform !== "linkedin") continue;
    totals.total += 1;
    const lane = post.lane || (post.notes?.includes("lane=diagnostic_pov") ? "diagnostic_pov"
      : post.notes?.includes("lane=feature_benefit") ? "feature_benefit"
      : "unknown");
    totals[lane] = (totals[lane] || 0) + 1;
  }
  return totals;
}

export function laneRatioReport(posts) {
  const totals = summarizeLinkedInLanes(posts);
  const issues = [];
  if (totals.total === 0) return { totals, issues };
  const fbRatio = totals.feature_benefit / totals.total;
  const t = LINKEDIN_LANE_TARGETS.feature_benefit;
  if (fbRatio < t.failMin) {
    issues.push({ severity: "error", message: `LinkedIn feature_benefit ratio ${(fbRatio * 100).toFixed(0)}% is below fail floor ${(t.failMin * 100).toFixed(0)}%` });
  } else if (fbRatio < t.warnMin || fbRatio > t.warnMax) {
    issues.push({ severity: "warn", message: `LinkedIn feature_benefit ratio ${(fbRatio * 100).toFixed(0)}% is outside warn range ${(t.warnMin * 100).toFixed(0)}–${(t.warnMax * 100).toFixed(0)}%` });
  }
  return { totals, ratio: fbRatio, issues };
}
