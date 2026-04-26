import PersonaCoachClient from "./PersonaCoachClient";
import { PERSONAS } from "./_data/personas";
import "./persona-coach.css";

export const metadata = { title: "Persona Coach · QuadGrowth Hub" };

export default function PersonaCoachPage() {
  const personasForClient = PERSONAS.map(({ id, label, blurb }) => ({ id, label, blurb }));

  return (
    <main className="persona-coach" data-testid="persona-coach">
      <p className="persona-coach__eyebrow">/hub/persona-coach</p>
      <header className="persona-coach__header">
        <h1>AI Persona Coach</h1>
        <p>
          Practice live against a tough prospect. Pick a persona, open the call, and the AI stays
          in character so you can rehearse objections and discovery without burning a real lead.
        </p>
      </header>
      <PersonaCoachClient personas={personasForClient} />
    </main>
  );
}
