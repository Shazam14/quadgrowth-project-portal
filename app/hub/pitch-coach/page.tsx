import PitchCoachClient from "./PitchCoachClient";
import "./pitch-coach.css";

export const metadata = { title: "Pitch Coach · QuadGrowth Hub" };

export default function PitchCoachPage() {
  return (
    <main className="pitch-coach" data-testid="pitch-coach">
      <p className="pitch-coach__eyebrow">/hub/pitch-coach</p>
      <header className="pitch-coach__header">
        <h1>AI Pitch Coach</h1>
        <p>
          Paste a pitch, objection, lead profile, or scenario. Get a tight critique and your next move.
        </p>
      </header>
      <PitchCoachClient />
    </main>
  );
}
