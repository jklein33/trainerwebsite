import nextEnv from "@next/env";

// Management API credentials are separate from project service_role keys.
// Never print the full Auth configuration: it can include SMTP/provider secrets.
nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });

const project = "vppuzvcyqpfbclkosfxm";
const endpoint = `https://api.supabase.com/v1/projects/${project}/config/auth`;
const additions = [
  "http://127.0.0.1:3000/auth/callback**",
  "https://trainerwebsite-*-exodus-intelligence.vercel.app/auth/callback**",
];

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--apply")) {
    throw new Error("Usage: node scripts/configure-staging-auth.mjs [--apply]");
  }
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "SUPABASE_ACCESS_TOKEN is missing. An authorized project administrator must supply a Management API token through the local environment. A service_role key cannot be used here.",
    );
  }

  async function request(method, body) {
    const response = await fetch(endpoint, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: "error",
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) {
      // Do not print response bodies, headers or fetch errors containing secrets.
      throw new Error(
        `Management API ${method} failed (HTTP ${response.status}).${
          response.status === 401 || response.status === 403
            ? " A valid token with project Auth configuration permissions is required; API access does not bypass the account role."
            : " Inspect project status before retrying."
        }`,
      );
    }
    return response.json();
  }

  const current = await request("GET");
  if (typeof current.uri_allow_list !== "string") {
    throw new Error("Unexpected Auth configuration response; no changes made.");
  }
  const existing = current.uri_allow_list
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const missing = additions.filter((url) => !existing.includes(url));
  console.log(
    JSON.stringify({
      project,
      existingRedirectCount: existing.length,
      additions: missing,
    }),
  );
  if (!missing.length) {
    console.log("Both redirect patterns are already configured.");
    return;
  }
  if (!args.includes("--apply")) {
    console.log(
      "Read-only check complete. Use --apply to append the listed redirects.",
    );
    return;
  }

  const merged = [...new Set([...existing, ...additions])];
  await request("PATCH", { uri_allow_list: merged.join(",") });
  const verified = await request("GET");
  const actual = (verified.uri_allow_list ?? "")
    .split(",")
    .map((s) => s.trim());
  if (!merged.every((url) => actual.includes(url))) {
    throw new Error(
      "The update was sent, but verification did not find all expected redirects. Inspect the configuration before retrying.",
    );
  }
  console.log(
    "Verified: both redirect patterns are allowed and existing entries are preserved. Site URL, email confirmation and SMTP settings were not changed.",
  );
}

main().catch((error) => {
  // Only expose our own validation messages; redact native network errors.
  console.error(
    error instanceof Error && error.constructor === Error
      ? error.message
      : "Management API request failed. Verify connectivity and credentials; no credentials were printed.",
  );
  process.exitCode = 1;
});
