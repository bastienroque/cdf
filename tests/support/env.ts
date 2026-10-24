export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required env var ${name}. Add it to .env.local (or .env.test).`,
    );
  }
  return value;
}

// Safety switch: tests that create/modify/delete data are skipped unless this is "true".
// Only enable it against a development or staging database, never production.
export const MUTATIONS_ALLOWED = process.env.E2E_ALLOW_MUTATIONS === "true";
export const MUTATIONS_SKIP_REASON =
  "Writes data. Set E2E_ALLOW_MUTATIONS=true (dev/staging DB only) to run.";
