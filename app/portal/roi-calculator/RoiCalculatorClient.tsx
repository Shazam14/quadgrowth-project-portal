"use client";

import { useState } from "react";

const AUD = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

export default function RoiCalculatorClient() {
  const [ltv, setLtv] = useState("3000");
  const [bookings, setBookings] = useState("12");

  const ltvNum = Math.max(0, Number(ltv) || 0);
  const bookingsNum = Math.max(0, Math.floor(Number(bookings) || 0));
  const total = ltvNum * bookingsNum;

  return (
    <div className="roi__shell">
      <form className="roi__form" onSubmit={(e) => e.preventDefault()}>
        <div className="roi__field">
          <label htmlFor="roi-ltv" className="roi__label">
            Patient lifetime value (AUD)
          </label>
          <input
            id="roi-ltv"
            type="number"
            inputMode="decimal"
            min="0"
            step="100"
            className="roi__input"
            data-testid="roi-ltv"
            value={ltv}
            onChange={(e) => setLtv(e.target.value)}
          />
          <p className="roi__hint">
            Average revenue from one patient over the life of the relationship.
          </p>
        </div>

        <div className="roi__field">
          <label htmlFor="roi-bookings" className="roi__label">
            Confirmed bookings
          </label>
          <input
            id="roi-bookings"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            className="roi__input"
            data-testid="roi-bookings"
            value={bookings}
            onChange={(e) => setBookings(e.target.value)}
          />
          <p className="roi__hint">
            Leads that actually showed up and booked an appointment.
          </p>
        </div>
      </form>

      <aside className="roi__result" data-testid="roi-result">
        <span className="roi__result-label">Estimated revenue</span>
        <span className="roi__result-total" data-testid="roi-total">
          {AUD.format(total)}
        </span>
        <p className="roi__result-formula">
          <strong>{AUD.format(ltvNum)}</strong> LTV × <strong>{bookingsNum}</strong>{" "}
          {bookingsNum === 1 ? "booking" : "bookings"}
        </p>
        <p className="roi__result-footnote">
          Top-line estimate only. Doesn&apos;t account for retention churn or campaign
          costs — your campaign manager can layer those in on the next call.
        </p>
      </aside>
    </div>
  );
}
