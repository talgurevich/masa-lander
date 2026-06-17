import { NextRequest, NextResponse } from "next/server";

const MONDAY_API_URL = "https://api.monday.com/v2";

const COLUMN_IDS = {
  email: "lead_email",
  phone: "lead_phone",
  city: "text_mkvvdrmy",
  age: "text_mkx75p70",
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
  const phone = String(body.phone ?? "").trim();
  const email = String(body.email ?? "").trim();
  const city = String(body.city ?? "").trim();
  const age = String(body.age ?? "").trim();

  if (name.length < 2) return NextResponse.json({ error: "invalid_name" }, { status: 400 });
  if (!/^[0-9+\-\s()]{9,15}$/.test(phone)) return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "invalid_email" }, { status: 400 });

  const columnValues: Record<string, unknown> = {
    [COLUMN_IDS.email]: { email, text: email },
    [COLUMN_IDS.phone]: { phone: phone.replace(/[^\d+]/g, ""), countryShortName: "IL" },
  };
  if (city) columnValues[COLUMN_IDS.city] = city;
  if (age) columnValues[COLUMN_IDS.age] = age;

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
