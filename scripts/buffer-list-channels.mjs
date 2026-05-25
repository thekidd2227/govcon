#!/usr/bin/env node
// Queries Buffer GraphQL for channels via account nesting.
// Falls back to schema introspection on failure so the field name can be diagnosed.
import { getBufferConfig, BUFFER_ENDPOINT } from "./buffer-runtime.mjs";

async function gql(apiKey, query, variables = {}) {
  const res = await fetch(BUFFER_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { body });
  if (body.errors?.length) throw new Error(body.errors.map((e) => e.message).join("; "));
  return body.data;
}

const config = getBufferConfig();

// Strategy 1: account { channels } — new API nesting
const accountChannelsQuery = `
query {
  account {
    channels {
      id
      name
      displayName
      service
      isQueuePaused
    }
  }
}`;

// Strategy 2: account { currentOrganization { channels } }
const currentOrgChannelsQuery = `
query {
  account {
    currentOrganization {
      channels {
        id
        name
        displayName
        service
        isQueuePaused
      }
    }
  }
}`;

// Strategy 3: schema introspection — lists all top-level query fields so we know what exists
const introspectQuery = `
{
  __schema {
    queryType {
      fields { name description }
    }
  }
}`;

function printChannels(channels) {
  if (!channels?.length) { console.log("No channels returned."); return; }
  for (const ch of channels) {
    console.log(`id: ${ch.id}`);
    console.log(`service: ${ch.service || ""}`);
    console.log(`name: ${ch.name || ch.displayName || ""}`);
    console.log(`isQueuePaused: ${Boolean(ch.isQueuePaused)}`);
    console.log("---");
  }
  console.log("Suggested secret mappings:");
  console.log("BUFFER_CHANNEL_LINKEDIN=<LinkedIn channel id>");
  console.log("BUFFER_CHANNEL_INSTAGRAM=<Instagram channel id>");
  console.log("BUFFER_CHANNEL_FACEBOOK=<Facebook channel id>");
}

try {
  console.log("Trying account { channels } ...");
  const d1 = await gql(config.apiKey, accountChannelsQuery);
  if (d1?.account?.channels) { printChannels(d1.account.channels); process.exit(0); }
} catch (e) { console.warn("account.channels failed:", e.message); }

try {
  console.log("Trying account { currentOrganization { channels } } ...");
  const d2 = await gql(config.apiKey, currentOrgChannelsQuery);
  if (d2?.account?.currentOrganization?.channels) {
    printChannels(d2.account.currentOrganization.channels); process.exit(0);
  }
} catch (e) { console.warn("account.currentOrganization.channels failed:", e.message); }

// Fallback: dump schema so we can identify the correct field
console.log("Both channel queries failed. Running schema introspection...");
try {
  const schema = await gql(config.apiKey, introspectQuery);
  const fields = schema?.__schema?.queryType?.fields || [];
  console.log("Top-level query fields available:");
  for (const f of fields) console.log(`  ${f.name}: ${f.description || ""}`);
} catch (e) {
  console.error("Introspection also failed:", e.message);
}
process.exit(1);
