import { NextRequest, NextResponse } from "next/server";
import { QUESTIONS, SHEET_HEADERS, toSheetRow, validateSubmission } from "@/lib/feedback-questions";
import { appendRow, sheetsConfigured } from "@/lib/google-sheets";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!sheetsConfigured()) {
    return NextResponse.json({ error: "server_not_configured" }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Hidden field no human sees; bots fill it in.
  if (String(body.website ?? "").trim()) {
    return NextResponse.json({ ok: true });
  }

  const answers = (body.answers ?? {}) as Record<string, unknown>;
  const errors = validateSubmission(answers);
  if (Object.keys(errors).length) {
    return NextResponse.json({ error: "invalid_answers", errors }, { status: 400 });
  }

  const timestamp = new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" });

  try {
    await appendRow(toSheetRow(answers, timestamp), SHEET_HEADERS);
  } catch (err) {
    // The sheet write is the only place a submission can be lost, so log enough
    // to recover the answers by hand if Google is having a bad day.
    console.error("leader-feedback append failed", err);
    console.error("lost submission", JSON.stringify(answers));
    return NextResponse.json({ error: "storage_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ questions: QUESTIONS.length, configured: sheetsConfigured() });
}
