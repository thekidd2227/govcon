# GovCon Content System

> Stub — to be populated with the content system architecture for ARCG cross-brand marketing.

## System Overview

The ARCG content system generates, validates, schedules, and publishes social media content across LinkedIn, Instagram, and Facebook for four product brands: ARCG, SourceDeck, ChartNav, and Rezy.

## Components

| Component | Location | Purpose |
|---|---|---|
| Calendar JSON | `content/arcg/calendar.json` | Master content calendar |
| Quality Validator | `content/arcg/quality.ts` | Post validation and scoring |
| Export Pipeline | `content/arcg/exportCalendar.ts` | CSV export for Buffer/Metricool |
| Buffer Publisher | `content/arcg/buffer/` | Buffer API scheduling |
| Media Pipeline | `content/arcg/media/` | AI image generation and hosting |
| Content Agent | `content/arcg/sourcedeckPremiumContentAgent.ts` | Premium content generation |
| Automation Scripts | `scripts/` | CLI tooling for all pipeline stages |
| GitHub Workflow | `.github/workflows/buffer-content-pipeline.yml` | CI/CD automation |

## Content Banks (to be created)

- `content/banks/content-pillars.json` — core messaging themes per brand
- `content/banks/hook-bank.json` — tested hooks indexed by pain point
- `content/banks/cta-bank.json` — call-to-action variants by platform

## Pipeline Flow

1. Generate monthly calendar (`content:generate:month`)
2. Validate (`content:validate`)
3. Export (`content:export`)
4. Generate media (`media:generate`)
5. Schedule to Buffer (`buffer:schedule`)
