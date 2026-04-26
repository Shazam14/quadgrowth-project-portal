import { createClient } from "@/lib/supabase/server";
import { upsertEntry } from "./actions";
import "./admin-bible.css";

type EntryRow = {
  id: string;
  category_id: string;
  name: string;
  icon: string | null;
  url: string | null;
  login: string | null;
  notes: string | null;
  sort_order: number;
  bible_credentials: { password: string } | { password: string }[] | null;
};

function getPassword(entry: EntryRow): string {
  const cred = entry.bible_credentials;
  if (!cred) return "";
  if (Array.isArray(cred)) return cred[0]?.password ?? "";
  return cred.password ?? "";
}

export default async function AdminBiblePage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("bible_categories")
    .select("id, label, sort_order")
    .order("sort_order");

  const { data: entries } = await supabase
    .from("bible_entries")
    .select(
      "id, category_id, name, icon, url, login, notes, sort_order, bible_credentials(password)",
    )
    .order("category_id")
    .order("sort_order")
    .returns<EntryRow[]>();

  const cats = categories ?? [];
  const list = entries ?? [];

  return (
    <main className="admin-bible">
      <header>
        <h1>🔐 Company Bible — Admin</h1>
        <p>Add or edit credentials. Changes are visible immediately on /hub/bible.</p>
      </header>

      <section className="admin-bible__add">
        <h2>Add new entry</h2>
        <form
          action={upsertEntry}
          data-testid="bible-add-form"
          className="admin-bible__form"
        >
          <label>
            <span>Category</span>
            <select name="category_id" required defaultValue="">
              <option value="" disabled>
                Choose…
              </option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Name</span>
            <input name="name" required placeholder="Tool name" />
          </label>
          <label>
            <span>Icon</span>
            <input name="icon" placeholder="📢" maxLength={4} />
          </label>
          <label>
            <span>URL</span>
            <input name="url" placeholder="example.com" />
          </label>
          <label>
            <span>Login</span>
            <input name="login" placeholder="email@example.com" />
          </label>
          <label>
            <span>Password</span>
            <input name="password" placeholder="REPLACE_ME" />
          </label>
          <label className="admin-bible__notes">
            <span>Notes</span>
            <textarea name="notes" rows={2} />
          </label>
          <button type="submit">Add entry</button>
        </form>
      </section>

      <section className="admin-bible__list">
        <h2>Existing entries ({list.length})</h2>
        {cats.map((cat) => {
          const inCat = list.filter((e) => e.category_id === cat.id);
          if (inCat.length === 0) return null;
          return (
            <div key={cat.id} className="admin-bible__category">
              <h3>{cat.label}</h3>
              {inCat.map((entry) => (
                <form
                  key={entry.id}
                  action={upsertEntry}
                  data-testid="bible-edit-form"
                  data-entry-name={entry.name}
                  className="admin-bible__form admin-bible__form--row"
                >
                  <input type="hidden" name="id" value={entry.id} />
                  <input
                    type="hidden"
                    name="category_id"
                    value={entry.category_id}
                  />
                  <label>
                    <span>Name</span>
                    <input name="name" defaultValue={entry.name} required />
                  </label>
                  <label>
                    <span>Icon</span>
                    <input
                      name="icon"
                      defaultValue={entry.icon ?? ""}
                      maxLength={4}
                    />
                  </label>
                  <label>
                    <span>URL</span>
                    <input name="url" defaultValue={entry.url ?? ""} />
                  </label>
                  <label>
                    <span>Login</span>
                    <input name="login" defaultValue={entry.login ?? ""} />
                  </label>
                  <label>
                    <span>Password</span>
                    <input
                      name="password"
                      defaultValue={getPassword(entry)}
                    />
                  </label>
                  <label className="admin-bible__notes">
                    <span>Notes</span>
                    <textarea
                      name="notes"
                      rows={1}
                      defaultValue={entry.notes ?? ""}
                    />
                  </label>
                  <button type="submit">Save</button>
                </form>
              ))}
            </div>
          );
        })}
      </section>
    </main>
  );
}
