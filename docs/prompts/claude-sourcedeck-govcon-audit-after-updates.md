# Claude Prompt — SourceDeck GovCon Audit After Updates

You are inside the `sourcedeck-app` repo with full file access.

Your task is to inspect the actual current repo and recommend the next improvements for Charlie's GovCon workflow.

Do not assume files exist. Inspect first.

Focus areas:

- services/govcon/*
- services/ai/*
- api/index.js
- main.js
- preload.js
- sourcedeck.html
- test/govcon-core.test.js
- test/credential-boundary.test.js
- package.json
- README.md

Primary business goal:

Help Charlie land federal micro-purchases, simplified acquisition opportunities, and small contracts under a conservative $250K ceiling using any NAICS, subcontractor-supported execution, and legal relationship-building with CORs/program offices when the outreach window is safe.

Core rules:

- SourceDeck app code stays in sourcedeck-app.
- GOVCON repo is only record/doctrine/spec/prompt layer.
- Deterministic gates come before Watsonx or any AI reasoning.
- Watsonx may explain, draft, and organize; it must not decide.
- KILL stays KILL.
- MORE_RESEARCH_NEEDED stays MORE_RESEARCH_NEEDED.
- RED_RESTRICTED blocks outreach drafts.
- Failed margin stress blocks quote recommendation.
- LOW/UNKNOWN confidence cannot become verified fact.

Inspect and report:

1. What GovCon/Fed Agent modules are present.
2. What was implemented correctly.
3. What is missing or duplicated.
4. Whether app code is safely behind preload -> ipcMain -> api/index.js -> services.
5. Whether credentials are exposed to renderer.
6. Whether fast-cash under-$250K workflow is actually usable by Charlie.
7. Whether legal outreach-window controls are strong enough.
8. Whether sub-sourcing and micro quote packet flows are practical.
9. What to build next in priority order.

Then propose a patch plan.

Do not make broad rewrites unless necessary. Favor small, testable modules.
