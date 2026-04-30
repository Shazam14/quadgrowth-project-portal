import { createAdminClient } from "@/lib/supabase/admin";
import { createHash, createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Zadarma signature: base64(hmac_sha1(md5(rawBody), api_secret))
// Verify on first live hit — if scheme differs, swap here.
function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.ZADARMA_API_SECRET!;
  const bodyMd5 = createHash("md5").update(rawBody).digest("hex");
  const expected = createHmac("sha1", secret).update(bodyMd5).digest("base64");
  return expected === signature;
}

// GET: Zadarma handshake — echo back zd_echo param to confirm URL ownership
export async function GET(request: NextRequest) {
  const echo = request.nextUrl.searchParams.get("zd_echo");
  if (!echo) return new NextResponse("ok", { status: 200 });
  return new NextResponse(echo, { status: 200 });
}

// POST: Zadarma call event (form-encoded body)
export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const signature = request.headers.get("Signature") ?? "";
  if (signature && !verifySignature(rawBody, signature)) {
    console.error("[zadarma/webhook] signature mismatch");
    // Return 200 — non-2xx causes Zadarma to disable the webhook URL
    return NextResponse.json({ ok: false, error: "signature_mismatch" });
  }

  const params = new URLSearchParams(rawBody);
  const event = params.get("event");

  // Only persist completed calls
  if (event !== "NOTIFY_END") {
    return NextResponse.json({ ok: true, skipped: event });
  }

  const cgmId = process.env.ZADARMA_CGM_USER_ID;
  if (!cgmId) {
    console.error("[zadarma/webhook] ZADARMA_CGM_USER_ID not set");
    return NextResponse.json({ ok: false, error: "no_cgm_id" });
  }

  // pbx_call_id is the stable cross-leg ID; fall back to call_id
  const zadarmaCallId = params.get("pbx_call_id") ?? params.get("call_id");
  const prospectPhone = params.get("destination") ?? params.get("called_did") ?? "";
  const durationS = parseInt(params.get("duration") ?? "0", 10);
  const started = params.get("started");   // "YYYY-MM-DD HH:MM:SS" UTC from Zadarma
  const finished = params.get("finished");
  const recordingUrl = params.get("recording") ?? null;

  const db = createAdminClient();
  const { error } = await db.from("calls").upsert(
    {
      cgm_id: cgmId,
      prospect_phone: prospectPhone,
      zadarma_call_id: zadarmaCallId,
      started_at: started ? new Date(started + " UTC").toISOString() : null,
      ended_at: finished ? new Date(finished + " UTC").toISOString() : null,
      duration_s: durationS,
      recording_url: recordingUrl,
    },
    { onConflict: "zadarma_call_id" },
  );

  if (error) {
    console.error("[zadarma/webhook] db error", error);
    return NextResponse.json({ ok: false, error: "db_error" });
  }

  return NextResponse.json({ ok: true });
}
