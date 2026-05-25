import type { BufferConfig } from "./bufferTypes";

export const BUFFER_GRAPHQL_ENDPOINT = "https://api.buffer.com";

export async function bufferGraphql<TData>(
  query: string,
  variables: Record<string, unknown> = {},
  config?: Pick<BufferConfig, "apiKey">,
): Promise<TData> {
  const apiKey = config?.apiKey ?? process.env.BUFFER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing BUFFER_API_KEY. Add it as a GitHub Actions secret or local environment variable.");
  }

  const response = await fetch(BUFFER_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Buffer API request failed with HTTP ${response.status}.`);
  if (payload.errors?.length) {
    throw new Error(`Buffer GraphQL error: ${payload.errors.map((error: { message: string }) => error.message).join("; ")}`);
  }
  return payload.data as TData;
}
