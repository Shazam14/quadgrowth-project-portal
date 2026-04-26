import { SCRIPTS_DATA } from "../_data/scripts";
import "./scripts.css";

export const metadata = { title: "Lead Gen Scripts" };

export default function ScriptsPage() {
  return (
    <main className="scripts">
      <header className="scripts__header">
        <h1>📞 Lead Gen Scripts</h1>
        <p className="scripts__sub">
          Ready-to-use email, phone, and follow-up scripts for reaching Melbourne
          dental clinics. Click any script to expand.
        </p>
      </header>

      <div className="scripts__list">
        {SCRIPTS_DATA.map((script, si) => (
          <details key={si} className="scripts__entry" data-testid="script-entry">
            <summary className="scripts__summary">
              <span className="scripts__summary-icon" aria-hidden>
                {script.icon}
              </span>
              <span className="scripts__summary-text">
                <h2>{script.title}</h2>
                <span className="scripts__summary-desc">{script.desc}</span>
              </span>
              <span className="scripts__summary-chevron" aria-hidden>
                ▾
              </span>
            </summary>
            <div className="scripts__body">
              {script.steps.map((step, stepI) => (
                <div
                  key={stepI}
                  className="scripts__step"
                  data-testid="script-step"
                >
                  <span className="scripts__step-label">{step.label}</span>
                  <p className="scripts__step-text">{step.text}</p>
                  {step.note && (
                    <p
                      className="scripts__step-note"
                      dangerouslySetInnerHTML={{ __html: step.note }}
                    />
                  )}
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </main>
  );
}
