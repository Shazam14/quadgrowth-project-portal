import { createHash, createHmac } from "crypto";

// Zadarma REST API signature: base64(hmac_sha1(md5(params_string), api_secret))
// params_string = alphabetically sorted query string (empty string when no params)
function buildAuthHeader(paramsString: string): string {
  const apiKey = process.env.ZADARMA_API_KEY!;
  const secret = process.env.ZADARMA_API_SECRET!;
  const md5 = createHash("md5").update(paramsString).digest("hex");
  const signature = createHmac("sha1", secret).update(md5).digest("base64");
  return `Zadarma ${apiKey}:${signature}`;
}

// Fetches a short-lived WebRTC widget key from Zadarma.
// Must be called server-side — uses ZADARMA_API_KEY + ZADARMA_API_SECRET.
// Returns null on failure (widget silently absent; hub still works).
export async function getWebRtcKey(): Promise<string | null> {
  if (!process.env.ZADARMA_API_KEY || !process.env.ZADARMA_API_SECRET) return null;

  try {
    const res = await fetch("https://api.zadarma.com/v1/webrtc/get_key/", {
      headers: { Authorization: buildAuthHeader("") },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("[zadarma] get_key HTTP", res.status, await res.text());
      return null;
    }

    const data = (await res.json()) as { key?: string };
    return data.key ?? null;
  } catch (err) {
    console.error("[zadarma] get_key error", err);
    return null;
  }
}
