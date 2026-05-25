#!/usr/bin/env node
import { bufferGraphql, getBufferConfig, getOrganizationsQuery } from "./buffer-runtime.mjs";

try {
  const config = getBufferConfig();
  const data = await bufferGraphql(getOrganizationsQuery, {}, config);
  const orgs = data.account?.organizations || [];
  if (!orgs.length) console.log("No Buffer organizations returned.");
  for (const org of orgs) {
    console.log(`id: ${org.id}`);
    console.log(`name: ${org.name || "(unnamed)"}`);
    if (org.ownerEmail) console.log(`ownerEmail: ${org.ownerEmail}`);
    console.log("---");
  }
  console.log("Set the selected value as GitHub secret BUFFER_ORGANIZATION_ID.");
} catch (error) {
  console.error(error.message);
  console.error("Set BUFFER_API_KEY first, then rerun npm run buffer:orgs.");
  process.exit(1);
}
