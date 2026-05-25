#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { BUFFER_LOG_PATH } from "./content-utils.mjs";

if (!existsSync(BUFFER_LOG_PATH)) {
  console.log("No local Buffer schedule log found yet.");
  console.log("Live Buffer queue check requires confirming Buffer posts query schema.");
  process.exit(0);
}

const rows = readFileSync(BUFFER_LOG_PATH, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
const byPlatform = {};
const byProduct = {};
for (const row of rows) {
  byPlatform[row.platform] = (byPlatform[row.platform] || 0) + 1;
  byProduct[row.product] = (byProduct[row.product] || 0) + 1;
}

console.log("Local scheduled count by platform:");
console.log(JSON.stringify(byPlatform, null, 2));
console.log("Local scheduled count by product:");
console.log(JSON.stringify(byProduct, null, 2));
console.log("Next 10 scheduled posts from local log:");
console.log(JSON.stringify(rows.sort((a, b) => String(a.dueAt).localeCompare(String(b.dueAt))).slice(0, 10), null, 2));
console.log("Note: live Buffer queue check requires confirming Buffer posts query schema. No live results are faked.");
