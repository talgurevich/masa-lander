import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מסע אל האופק – כניסה למערכות",
  description: "כניסה למערכות של מסע אל האופק: אתר המשתתפים והבוגרים, וכלי הצוות.",
};

// The system gate, not a marketing page. The members' site is its own Vercel project
// (github.com/talgurevich/member-tools); the staff tools are this site's /tools, rewritten
// to the masa-tools project (see next.config.mjs). Keep the chips in step with those hubs.
const DOORS = [
  {
    kind: "members",
    href: "https://members.masaelhaofek.co.il",
    url: "members.masaelhaofek.co.il",
    title: "משתתפים ובוגרים",
    who: "לכל מי שמשתתף או השתתף בתוכנית",
    chips: ["פירמידת התעסוקה", "בונה קורות חיים", "תרגילים וחומרים"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#164B55" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
        <circle cx="17" cy="9" r="2.4" />
        <path d="M15.8 14.2c2.4-.3 4.3 1.2 4.8 4.3" />
      </svg>
    ),
  },
  {
    kind: "staff",
    href: "/tools",
    url: "masaelhaofek.co.il/tools",
    title: "צוות התוכנית",
    who: "לאנשי הצוות הרשומים בבורד הצוות",
    chips: ["גאנט פעילויות", "ספר התוכנית", "שאלוני בוגרים", "הרשאות כניסה"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7A6230" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3.5" y="7.5" width="17" height="12" rx="2" />
        <path d="M9 7.5V5.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5.5v2" />
        <path d="M3.5 12.5h17" />
      </svg>
    ),
  },
];

export default function Portal() {
  return (
    <div className="gate">
      <header className="gate-wrap gate-header">
        <span className="gate-logo">
          <img src="/logo.avif" alt="מסע אל האופק" />
        </span>
        <span className="gate-tag">כניסה למערכות</span>
      </header>

      <main className="gate-wrap gate-main">
        <div>
          <h1 className="gate-title">לאן נכנסים?</h1>
          <p className="gate-lead">
            כל המערכות של מסע אל האופק במקום אחד. בחרו את האזור שלכם והתחברו עם Google או עם קוד שנשלח למייל.
          </p>
        </div>

        <div className="gate-doors">
          {DOORS.map((d) => (
            <a key={d.kind} href={d.href} className={`gate-door gate-${d.kind}`}>
              <div className="gate-door-head">
                <span className="gate-icon">{d.icon}</span>
                <div>
                  <h2>{d.title}</h2>
                  <p className="gate-door-who">{d.who}</p>
                </div>
              </div>
              <ul className="gate-chips">
                {d.chips.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <div className="gate-door-foot">
                <span className="gate-url" dir="ltr">
                  {d.url}
                </span>
                <span className="gate-btn">
                  כניסה
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M15 6l-6 6 6 6" />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>

        <p className="gate-help">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0C6CD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5" />
            <circle cx="12" cy="7.8" r="0.6" />
          </svg>
          <span>
            לא בטוחים? משתתפים ובוגרים נכנסים לאתר המשתתפים, אנשי צוות לכלי הצוות. בשני המקרים נכנסים עם המייל שרשום אצלנו בתוכנית.
          </span>
        </p>
      </main>

      <footer className="gate-wrap gate-footer">
        <span>מסע אל האופק</span>
        <a href="https://www.masaelhaofek.org">לאתר התוכנית</a>
      </footer>
    </div>
  );
}
