import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createHash } from "node:crypto";

export const ROOT = process.cwd();
export const CALENDAR_PATH = resolve(ROOT, "src/content/arcg/calendar.json");
export const EXPORT_DIR = resolve(ROOT, "exports");
export const BUFFER_LOG_PATH = resolve(ROOT, "logs/buffer-schedule-log.jsonl");

export const PLATFORMS = ["linkedin", "instagram", "facebook"];
export const PRODUCTS = ["arcg", "sourcedeck", "chartnav", "rezy"];
export const STATUSES = ["draft", "approved", "scheduled", "published", "archived"];
export const AUDIENCES = ["small-business-owners", "property-managers", "service-companies", "government-contractors", "caribbean-latam-operators", "ophthalmology-practices", "mixed"];
export const ASSET_TYPES = ["image", "video", "carousel", "link", "none"];
export const MEDIA_STATUSES = ["not_started", "planned", "prompt_ready", "generating", "generated", "uploaded", "ready", "failed", "skipped"];
export const VISIBILITY_SENTENCE = "this isn't an ai problem. it's an operational visibility problem.";

export function parseArgs(argv = process.argv.slice(2)) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

export function resolveMonth(monthArg) {
  if (!monthArg || monthArg === true || monthArg === "next") {
    const now = new Date();
    const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`;
  }
  if (!/^\d{4}-\d{2}$/.test(monthArg)) throw new Error(`Invalid month "${monthArg}". Use YYYY-MM or next.`);
  return monthArg;
}

export function readCalendar() {
  return JSON.parse(readFileSync(CALENDAR_PATH, "utf8"));
}

export function writeCalendar(posts) {
  writeFileSync(CALENDAR_PATH, `${JSON.stringify(posts, null, 2)}\n`, "utf8");
}

export function finalCaption(post) {
  return `${post.caption}\n\n${post.cta}\n\n${(post.hashtags || []).join(" ")}`;
}

export function captionHash(post) {
  return createHash("sha256").update(finalCaption(post)).digest("hex");
}

export function csvCell(value) {
  if (value === null || value === undefined) return "";
  const text = Array.isArray(value) ? value.join(" ") : String(value);
  if (!/[",\n\r]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

export function csvRow(cells) {
  return cells.map(csvCell).join(",");
}

export function captionSkeleton(caption) {
  return String(caption || "")
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "url")
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 42)
    .join(" ");
}

export function loadLocalEnv() {
  for (const name of [".env.local", ".env"]) {
    const path = resolve(ROOT, name);
    if (!existsSync(path)) continue;
    for (const raw of readFileSync(path, "utf8").split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#") || !line.includes("=")) continue;
      const [key, ...rest] = line.split("=");
      if (!process.env[key]) process.env[key] = rest.join("=").replace(/^['"]|['"]$/g, "");
    }
  }
}

export function readScheduledIds() {
  if (!existsSync(BUFFER_LOG_PATH)) return new Set();
  const ids = new Set();
  for (const line of readFileSync(BUFFER_LOG_PATH, "utf8").split("\n").filter(Boolean)) {
    try {
      const row = JSON.parse(line);
      if (row.postId && row.status === "scheduled") ids.add(row.postId);
    } catch {
      // Ignore malformed local log rows.
    }
  }
  return ids;
}

export function appendScheduleLog(record) {
  mkdirSync(dirname(BUFFER_LOG_PATH), { recursive: true });
  appendFileSync(BUFFER_LOG_PATH, `${JSON.stringify(record)}\n`, "utf8");
}
