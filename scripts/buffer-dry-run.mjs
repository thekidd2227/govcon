#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2).filter((arg) => arg !== "--execute");
if (!args.includes("--dry-run")) args.unshift("--dry-run");
const result = spawnSync(process.execPath, ["scripts/buffer-schedule-calendar.mjs", ...args], { stdio: "inherit" });
process.exit(result.status || 0);
