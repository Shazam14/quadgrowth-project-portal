import RoiCalculatorClient from "./RoiCalculatorClient";
import "./roi-calculator.css";

export const metadata = { title: "ROI Calculator" };

export default function RoiCalculatorPage() {
  return (
    <main className="roi" data-testid="roi-calculator">
      <p className="roi__eyebrow">/portal · roi calculator</p>
      <header className="roi__header">
        <h1>ROI Calculator</h1>
        <p>
          Patient lifetime value × confirmed bookings. A quick read on what this campaign
          is worth at the door.
        </p>
      </header>
      <RoiCalculatorClient />
    </main>
  );
}
