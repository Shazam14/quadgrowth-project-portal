import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import TeamTable from "./TeamTable";
import "./team.css";

export const metadata = { title: "Team · Admin" };
export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const [{ data: { user } }, { data: authData }, { data: profiles }] = await Promise.all([
    supabase.auth.getUser(),
    admin.auth.admin.listUsers(),
    admin.from("profiles").select("id, role, full_name, created_at"),
  ]);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p]),
  );

  const members = (authData?.users ?? [])
    .map((u) => {
      const p = profileMap.get(u.id);
      return {
        id: u.id,
        email: u.email ?? "—",
        full_name: p?.full_name ?? null,
        role: (p?.role ?? "cgm") as "client" | "cgm" | "admin",
        created_at: u.created_at,
      };
    })
    .sort((a, b) => a.email.localeCompare(b.email));

  return (
    <main className="team" data-testid="team-page">
      <p className="team__eyebrow">/admin · team</p>
      <header className="team__header">
        <h1>Team</h1>
        <p>All users — assign roles to give access to the Hub, Portal, or Admin.</p>
      </header>

      <div className="team__count" data-testid="team-count">
        {members.length} user{members.length === 1 ? "" : "s"}
      </div>

      <TeamTable members={members} currentUserId={user?.id ?? ""} />
    </main>
  );
}
