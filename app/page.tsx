import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מסע אל האופק",
};

// The members' tools live in their own Vercel project (github.com/talgurevich/member-tools);
// the team tools are this site's /tools, rewritten to the masa-tools project (see next.config.mjs).
const DOORS = [
  {
    href: "https://members.masaelhaofek.co.il",
    title: "משתתפי התוכנית",
    text: "הכלים, התרגילים והחומרים שלכם במסע",
    cta: "כניסה למשתתפים",
    primary: true,
  },
  {
    href: "/tools",
    title: "צוות התוכנית",
    text: "לוח פעילות, מדריך התוכנית וכלי הצוות",
    cta: "כניסה לצוות",
    primary: false,
  },
];

export default function Portal() {
  return (
    <main className="hero portal">
      <div className="hero-photo" aria-hidden />
      <div className="overlay" aria-hidden />
      <div className="hero-inner">
        <img className="portal-logo" src="/logo.avif" alt="מסע אל האופק" />
        <h1>מסע אל האופק</h1>
        <p className="sub">לאן ממשיכים?</p>
        <div className="portal-doors">
          {DOORS.map((d) => (
            <a key={d.href} href={d.href} className="portal-door">
              <h2>{d.title}</h2>
              <p>{d.text}</p>
              <span className={`btn ${d.primary ? "btn-primary" : "btn-ghost-dark"}`}>{d.cta} ←</span>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
