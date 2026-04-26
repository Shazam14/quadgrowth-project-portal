"use client";

import { useState } from "react";
import { CHECKLIST_DATA } from "../_data/checklists";
import "./checklists.css";

export default function ChecklistsPage() {
  const total = CHECKLIST_DATA.reduce((sum, g) => sum + g.items.length, 0);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const doneCount = Object.values(checked).filter(Boolean).length;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function reset() {
    setChecked({});
  }

  return (
    <main className="checklists">
      <header className="checklists__header">
        <h1>✅ Operational Checklists</h1>
        <p className="checklists__sub">
          Track everything from pre-call prep to client onboarding and monthly
          delivery.
        </p>
      </header>

      <div className="checklists__summary">
        <div className="checklists__stat">
          <span className="checklists__stat-num" data-testid="checklist-done">{doneCount}</span>
          <span className="checklists__stat-label">Completed</span>
        </div>
        <div className="checklists__divider" />
        <div className="checklists__stat">
          <span className="checklists__stat-num">{total}</span>
          <span className="checklists__stat-label">Total Items</span>
        </div>
        <div className="checklists__divider" />
        <div className="checklists__stat">
          <span className="checklists__stat-num">{pct}%</span>
          <span className="checklists__stat-label">Progress</span>
        </div>
        <button type="button" className="checklists__reset" onClick={reset}>
          ↺ Reset All
        </button>
      </div>

      {CHECKLIST_DATA.map((group, gi) => (
        <section key={gi} className="checklists__group" data-testid="checklist-group">
          <h2>{group.group}</h2>
          <ul className="checklists__list">
            {group.items.map((item, ii) => {
              const id = `${gi}-${ii}`;
              const isChecked = !!checked[id];
              return (
                <li
                  key={id}
                  className={`checklists__item ${isChecked ? "is-checked" : ""}`}
                  data-testid="checklist-item"
                >
                  <input
                    type="checkbox"
                    className="checklists__checkbox"
                    checked={isChecked}
                    onChange={() => toggle(id)}
                  />
                  <div className="checklists__item-body">
                    <span className="checklists__item-title">{item.title}</span>
                    <span className="checklists__item-sub">{item.sub}</span>
                  </div>
                  <span
                    className={`checklists__tag checklists__tag--${item.tag}`}
                  >
                    {item.tag}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </main>
  );
}
