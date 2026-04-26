"use client";

import { useMemo, useState } from "react";
import { QA_DATA, CATEGORIES, type QACategory } from "../_data/flashcards";
import "./flashcards.css";

type Filter = QACategory | "all";

const CAT_LABEL: Record<QACategory, string> = {
  discovery: "Discovery Call",
  objection: "Objection",
  pricing: "Pricing",
  results: "Results & ROI",
  technical: "Technical",
};

export default function FlashcardsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const filtered = useMemo(
    () => (filter === "all" ? QA_DATA : QA_DATA.filter((c) => c.cat === filter)),
    [filter],
  );

  const total = filtered.length;
  const safeIndex = total === 0 ? 0 : Math.min(index, total - 1);
  const card = filtered[safeIndex];
  const progressPct = total === 0 ? 0 : ((safeIndex + 1) / total) * 100;

  function handleFilter(next: Filter) {
    setFilter(next);
    setIndex(0);
    setFlipped(false);
  }

  function handleNext() {
    setFlipped(false);
    setIndex((i) => (i + 1) % total);
  }

  function handlePrev() {
    setFlipped(false);
    setIndex((i) => (i - 1 + total) % total);
  }

  function handleShuffle() {
    setFlipped(false);
    setIndex(Math.floor(Math.random() * total));
  }

  return (
    <main className="flashcards">
      <header className="flashcards__header">
        <h1>💬 Q&amp;A Flashcards</h1>
        <p className="flashcards__sub">
          Study the most common questions dental clinic owners will ask. Click a
          card to reveal the answer.
        </p>
      </header>

      <div className="flashcards__filters">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            data-testid="qa-filter"
            className={`flashcards__filter ${filter === cat.key ? "is-active" : ""}`}
            onClick={() => handleFilter(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flashcards__progress">
        <span data-testid="qa-current">{safeIndex + 1}</span>
        <span>of</span>
        <span data-testid="qa-total">{QA_DATA.length}</span>
        <div className="flashcards__progress-bar">
          <div
            className="flashcards__progress-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <p className="flashcards__hint">👆 Click the card to reveal the answer</p>

      <div
        className={`flashcards__card ${flipped ? "flipped" : ""}`}
        data-testid="qa-card"
        onClick={() => setFlipped((f) => !f)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
      >
        <div className="flashcards__inner">
          <div className="flashcards__face">
            <span className="flashcards__label">Question</span>
            <span className="flashcards__cat">{card ? CAT_LABEL[card.cat] : ""}</span>
            <p className="flashcards__q">{card?.q ?? ""}</p>
          </div>
          <div className="flashcards__face flashcards__face--back">
            <span className="flashcards__label">Answer</span>
            <span className="flashcards__cat">{card ? CAT_LABEL[card.cat] : ""}</span>
            <p className="flashcards__a">{card?.a ?? ""}</p>
          </div>
        </div>
      </div>

      <div className="flashcards__nav">
        <button
          type="button"
          className="flashcards__btn"
          onClick={handlePrev}
          disabled={total < 2}
        >
          ← Previous
        </button>
        <button
          type="button"
          className="flashcards__btn"
          onClick={handleShuffle}
          disabled={total < 2}
        >
          🔀 Shuffle
        </button>
        <button
          type="button"
          className="flashcards__btn is-primary"
          data-testid="qa-next"
          onClick={handleNext}
          disabled={total < 2}
        >
          Next →
        </button>
      </div>
    </main>
  );
}
