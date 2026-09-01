/**
 * Minimal Google Sheets append client.
 *
 * Deliberately dependency-free: a service-account JWT signed with node crypto,
 * exchanged for an access token, then a plain fetch to the Sheets REST API.
 * Pulling in `googleapis` for one append call is not worth ~50MB of node_modules.
 *
 * Required env (see README):
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL  service account address
 *   GOOGLE_PRIVATE_KEY            PEM key, literal \n escapes are unescaped here
 */

import { createSign } from "crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";

let cachedToken: { value: string; expiresAt: number } | null = null;

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getAccessToken(email: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  // Reuse until a minute before expiry, so a warm lambda isn't re-authing per submit.
  if (cachedToken && cachedToken.expiresAt > now + 60) return cachedToken.value;

  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({ iss: email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 })
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const signature = b64url(signer.sign(privateKey));
  const assertion = `${header}.${claims}.${signature}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) throw new Error(`google_token_failed:${res.status}:${await res.text()}`);

  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: json.access_token, expiresAt: now + json.expires_in };
  return json.access_token;
}

function readKey(): { email: string; privateKey: string } | null {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const raw = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !raw) return null;
  // Vercel env vars keep newlines as literal backslash-n.
  return { email, privateKey: raw.replace(/\\n/g, "\n") };
}

async function sheetsFetch(
  token: string,
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  return fetch(`https://sheets.googleapis.com/v4/spreadsheets/${path}`, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
}

/**
 * Builds an A1 range. With no tab configured this returns a bare range, which
 * the Sheets API resolves to the FIRST sheet in the spreadsheet — deliberate,
 * because a sheet created in a Hebrew locale names its first tab "גיליון1", not
 * "Sheet1", and hardcoding either one breaks for half the world.
 */
function a1(tab: string | undefined, cells: string): string {
  return encodeURIComponent(tab ? `${tab}!${cells}` : cells);
}

// Header check costs an extra API call, so do it once per process, not per submit.
const headerChecked = new Set<string>();

async function ensureHeaderRow(token: string, sheetId: string, tab: string | undefined, headers: string[]) {
  const key = `${sheetId}:${tab ?? ""}`;
  if (headerChecked.has(key)) return;

  const range = a1(tab, "A1:A1");
  const res = await sheetsFetch(token, `${sheetId}/values/${range}`);
  if (!res.ok) throw new Error(`sheet_read_failed:${res.status}:${await res.text()}`);

  const json = (await res.json()) as { values?: string[][] };
  if (!json.values?.length) {
    const writeRange = a1(tab, "A1");
    const put = await sheetsFetch(
      token,
      `${sheetId}/values/${writeRange}?valueInputOption=RAW`,
      { method: "PUT", body: JSON.stringify({ values: [headers] }) }
    );
    if (!put.ok) throw new Error(`sheet_header_failed:${put.status}:${await put.text()}`);
  }
  headerChecked.add(key);
}

/**
 * Appends one row, writing the header row first if the sheet is still empty.
 * Throws on any failure so the caller can decide what to tell the user.
 */
export async function appendRow(row: string[], headers: string[]): Promise<void> {
  const creds = readKey();
  const sheetId = process.env.FEEDBACK_SHEET_ID;
  if (!creds || !sheetId) throw new Error("sheets_not_configured");
  // Optional: only set this if the answers must land on a specific tab.
  const tab = process.env.FEEDBACK_SHEET_TAB?.trim() || undefined;

  const token = await getAccessToken(creds.email, creds.privateKey);
  await ensureHeaderRow(token, sheetId, tab, headers);

  const range = a1(tab, "A1");
  const res = await sheetsFetch(
    token,
    `${sheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    { method: "POST", body: JSON.stringify({ values: [row] }) }
  );
  if (!res.ok) throw new Error(`sheet_append_failed:${res.status}:${await res.text()}`);
}

/** True when the server has everything it needs to write to the sheet. */
export function sheetsConfigured(): boolean {
  return Boolean(readKey() && process.env.FEEDBACK_SHEET_ID);
}
