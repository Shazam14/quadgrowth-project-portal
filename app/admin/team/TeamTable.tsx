"use client";

import { useTransition } from "react";
import { updateRole } from "./actions";

type TeamMember = {
  id: string;
  email: string;
  full_name: string | null;
  role: "client" | "cgm" | "admin";
  created_at: string;
};

const ROLES = ["client", "cgm", "admin"] as const;

function RoleSelect({ member, disabled }: { member: TeamMember; disabled: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      className="team__role-select"
      defaultValue={member.role}
      disabled={disabled || pending}
      onChange={(e) => {
        const role = e.target.value as TeamMember["role"];
        startTransition(() => updateRole(member.id, role));
      }}
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  );
}

export default function TeamTable({
  members,
  currentUserId,
}: {
  members: TeamMember[];
  currentUserId: string;
}) {
  if (members.length === 0) {
    return (
      <div className="team__empty" data-testid="team-empty">
        No users yet.
      </div>
    );
  }

  return (
    <div className="team__table-wrap">
      <table className="team__table" data-testid="team-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id} data-testid="team-row">
              <td>{m.full_name ?? "—"}</td>
              <td className="team__email">{m.email}</td>
              <td>
                <RoleSelect member={m} disabled={m.id === currentUserId} />
              </td>
              <td className="team__date">
                {new Date(m.created_at).toLocaleDateString("en-AU", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
