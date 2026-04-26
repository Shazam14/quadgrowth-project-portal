import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Dev/test-only sign-in: returns 404 in production. Used by Playwright
// globalSetup to log in demo accounts without going through the email
// magic-link flow (admin-generated links use implicit flow with #fragment
// tokens that never reach the server).
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const email = new URL(request.url).searchParams.get("email");
  if (!email) return new NextResponse("Missing email", { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (error || !data.properties?.email_otp) {
    return new NextResponse(error?.message ?? "generateLink failed", {
      status: 500,
    });
  }

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token: data.properties.email_otp,
    type: "magiclink",
  });
  if (verifyError) {
    return new NextResponse(verifyError.message, { status: 500 });
  }

  return NextResponse.redirect(new URL("/", request.url));
}
