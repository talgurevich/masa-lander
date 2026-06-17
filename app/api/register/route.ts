import { NextRequest, NextResponse } from "next/server";

const MONDAY_API_URL = "https://api.monday.com/v2";

const COL = {
  idnum: "text_mkwa1m96",
  gender: "color_mkwxty2w",
  email: "lead_email",
  phone: "lead_phone",
  city: "text_mkvvdrmy",
  programCity: "color_mm0ea80g",
  dob: "date_mkvvvnmp",
  source: "color_mkvvx7se",
  consent: "color_mkvvsn1r",
} as const;

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const token = process.env.MONDAY_API_TOKEN;
  const boardId = process.env.MONDAY_BOARD_ID;
  if (!token || !boardId) {
    return NextResponse.json({ error: "server_not_configured" }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const idnum = String(body.idnum ?? "").trim();
  const gender = String(body.gender ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const city = String(body.city ?? "").trim();
  const programCity = String(body.programCity ?? "").trim();
  const dob = String(body.dob ?? "").trim();
  const source = String(body.source ?? "").trim();
  const consent = body.consent === true;

  if (name.length < 2) return NextResponse.json({ error: "invalid_name" }, { status: 400 });
  if (!/^\d{9}$/.test(idnum)) return NextResponse.json({ error: "invalid_idnum" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  if (!/^[0-9+\-\s()]{9,15}$/.test(phone)) return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  if (city.length < 2) return NextResponse.json({ error: "invalid_city" }, { status: 400 });
  if (!programCity) return NextResponse.json({ error: "invalid_program_city" }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return NextResponse.json({ error: "invalid_dob" }, { status: 400 });
  if (!source) return NextResponse.json({ error: "invalid_source" }, { status: 400 });
  if (!consent) return NextResponse.json({ error: "consent_required" }, { status: 400 });

  const columnValues: Record<string, unknown> = {
    [COL.idnum]: idnum,
    [COL.email]: { email, text: email },
    [COL.phone]: { phone: phone.replace(/[^\d+]/g, ""), countryShortName: "IL" },
    [COL.city]: city,
    [COL.programCity]: { label: programCity },
    [COL.dob]: { date: dob },
    [COL.source]: { label: source },
    [COL.consent]: { label: "מאשר.ת" },
  };
  if (gender) columnValues[COL.gender] = { label: gender };

  const query = `mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
    create_item(board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
      id
    }
  }`;

  const variables = {
    boardId,
    itemName: name,
    columnValues: JSON.stringify(columnValues),
  };

  try {
    const res = await fetch(MONDAY_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({ query, variables }),
    });
    const data = await res.json();
    const itemId = data?.data?.create_item?.id;
    if (!res.ok || data?.errors || !itemId) {
      console.error("Monday API error:", JSON.stringify(data));
      return NextResponse.json({ error: "crm_error" }, { status: 502 });
    }
    return NextResponse.json({ ok: true, id: itemId });
  } catch (err) {
    console.error("Network error to Monday:", err);
    return NextResponse.json({ error: "network_error" }, { status: 502 });
  }
}
