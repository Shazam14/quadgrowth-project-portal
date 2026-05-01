import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

type Role = "client" | "cgm" | "admin";

const ROLE_HOME: Record<Role, string> = {
  client: "/portal",
  cgm: "/hub",
  admin: "/admin",
};

function requiredRoleForPath(pathname: string): Role | null {
  if (pathname.startsWith("/portal")) return "client";
  if (pathname.startsWith("/hub")) return "cgm";
  if (pathname.startsWith("/admin")) return "admin";
  return null;
}

// Admin can reach every namespace. CGMs can also access /portal and /roadmap.
function canAccess(userRole: Role, required: Role): boolean {
  if (userRole === "admin") return true;
  if (userRole === "cgm" && required === "client") return true;
  return userRole === required;
}

async function fetchRole(
  supabase: Awaited<ReturnType<typeof updateSession>>["supabase"],
  userId: string,
): Promise<Role | null> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return (data?.role as Role | undefined) ?? null;
}

export async function middleware(request: NextRequest) {
  const { response, supabase, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Logged-in user visiting /login → send to their role home
  if (user && pathname === "/login") {
    const role = await fetchRole(supabase, user.id);
    const home = role ? ROLE_HOME[role] : "/";
    return NextResponse.redirect(new URL(home, request.url));
  }

  const required = requiredRoleForPath(pathname);
  if (!required) return response;

  // Unauthenticated → /login?next=<original>
  if (!user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated → role check
  const role = await fetchRole(supabase, user.id);
  if (!role || !canAccess(role, required)) {
    const home = role ? ROLE_HOME[role] : "/";
    return NextResponse.redirect(new URL(home, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything except Next.js internals and static assets
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
