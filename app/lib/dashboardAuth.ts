// Password-only dashboard auth. No Supabase, no user account — just a
// password stored in env (DASHBOARD_PASSWORD) and a signed session cookie
// so nobody can fake being logged in by just setting a cookie by hand.

export const DASHBOARD_SESSION_COOKIE = "dashboard_session";

const SESSION_PAYLOAD = "dashboard-authenticated";

function getSecret(): string {
  const secret = process.env.DASHBOARD_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "DASHBOARD_SESSION_SECRET is not set. Add it to .env.local."
    );
  }
  return secret;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return toHex(signature);
}

export async function createSessionCookieValue(): Promise<string> {
  return sign(SESSION_PAYLOAD);
}

export async function isValidSessionCookie(
  value: string | undefined
): Promise<boolean> {
  if (!value) return false;
  const expected = await sign(SESSION_PAYLOAD);

  if (value.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < value.length; i++) {
    mismatch |= value.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}
