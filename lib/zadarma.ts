import { createHash, createHmac } from "crypto";

// Zadarma REST API signature (matches PHP SDK exactly):
// sign = base64( hmac_sha1_hex( method + paramsStr + md5(paramsStr), secret ) )
// Note: PHP hash_hmac returns hex by default; base64_encode encodes that hex string —
// NOT the raw binary. Buffer.from(hex).toString('base64') replicates this.
function buildAuthHeader(method: string, params: Record<string, string>): string {
  const apiKey = process.env.ZADARMA_API_KEY!;
  const secret = process.env.ZADARMA_API_SECRET!;
  const paramsStr = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  const md5 = createHash("md5").update(paramsStr).digest("hex");
  const toSign = method + paramsStr + md5;
  const hmacHex = createHmac("sha1", secret).update(toSign).digest("hex");
  const signature = Buffer.from(hmacHex).toString("base64");
  return `${apiKey}:${signature}`;
}

// Fetches a short-lived WebRTC widget key from Zadarma (valid 72 hrs).
// ZADARMA_SIP_LOGIN = the SIP login for the PBX extension (e.g. "391528").
// Must be called server-side — uses ZADARMA_API_KEY + ZADARMA_API_SECRET.
// Returns null on failure (widget silently absent; hub still works).
export async function getWebRtcKey(): Promise<string | null> {
  const sip = process.env.ZADARMA_SIP_LOGIN;
  if (!process.env.ZADARMA_API_KEY || !process.env.ZADARMA_API_SECRET || !sip) return null;

  const method = "/v1/webrtc/get_key/";
  const params = { sip };

  try {
    const res = await fetch(
      `https://api.zadarma.com${method}?sip=${encodeURIComponent(sip)}`,
      {
        headers: { Authorization: buildAuthHeader(method, params) },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      console.error("[zadarma] get_key HTTP", res.status, await res.text());
      return null;
    }

    const data = (await res.json()) as { status: string; key?: string };
    if (data.status !== "success") {
      console.error("[zadarma] get_key error response", data);
      return null;
    }
    return data.key ?? null;
  } catch (err) {
    console.error("[zadarma] get_key error", err);
    return null;
  }
}
