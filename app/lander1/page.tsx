"use client";

import { FormEvent, useRef, useState } from "react";

type FieldKey = "name" | "idnum" | "email" | "phone" | "city" | "programCity" | "dob" | "source" | "consent";
type SubmitState = "idle" | "submitting" | "success" | "error";

const PROGRAM_CITIES = [
  "ראשון לציון",
  "פתח תקוה",
  "בת ים",
  "נתניה",
  "אשקלון",
  "אשדוד",
  "ירושלים",
  "חיפה",
  "עכו",
  "בית שאן/עמק הירדן/עמק המעיינות",
  "קריית מלאכי + קריית גת",
  "נהריה/מטה אשר/מעלה יוסף/שלומי",
  "בית ג'אן/חורפיש/פקיעין",
  "ירכא/ג'וליס/יאנוח ג'ת",
  "מעלה אדומים",
  "יקנעם",
];

const HEARD_SOURCES = [
  "סמס משרד הביטחון",
  "מרכז הצעירים",
  "חברים",
  "פרסום",
  "אחר",
  "שער לעתיד",
  "פייסבוק- ממומן",
  "רשתות חברתיות",
  "האגף להכוונת חיילים משוחררים ומילואים",
];

const blankErrors: Record<FieldKey, boolean> = {
  name: false, idnum: false, email: false, phone: false, city: false,
  programCity: false, dob: false, source: false, consent: false,
};

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [errors, setErrors] = useState<Record<FieldKey, boolean>>(blankErrors);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitState === "submitting") return;

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      idnum: String(fd.get("idnum") || "").trim(),
      gender: String(fd.get("gender") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      city: String(fd.get("city") || "").trim(),
      programCity: String(fd.get("programCity") || "").trim(),
      dob: String(fd.get("dob") || "").trim(),
      source: String(fd.get("source") || "").trim(),
      consent: fd.get("consent") === "on",
    };

    const next: Record<FieldKey, boolean> = {
      name: payload.name.length < 2,
      idnum: !/^\d{9}$/.test(payload.idnum),
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email),
      phone: !/^[0-9+\-\s()]{9,15}$/.test(payload.phone),
      city: payload.city.length < 2,
      programCity: !payload.programCity,
      dob: !/^\d{4}-\d{2}-\d{2}$/.test(payload.dob),
      source: !payload.source,
      consent: !payload.consent,
    };
    setErrors(next);
    const firstBad = (Object.keys(next) as FieldKey[]).find((k) => next[k]);
    if (firstBad) {
      const el = formRef.current?.querySelector<HTMLElement>(`#${firstBad}`);
      el?.focus();
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    setSubmitState("submitting");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("submit_failed");
      setSubmitState("success");
    } catch {
      setSubmitState("error");
    }
  }

  function clearError(key: FieldKey) {
    setErrors((prev) => (prev[key] ? { ...prev, [key]: false } : prev));
  }

  return (
    <>
      {/* ===== Header ===== */}
      <header>
        <div className="wrap nav">
          <a className="brand" href="#top" aria-label="מסע אל האופק">
            <img src="/logo.avif" alt="מסע אל האופק" />
          </a>
          <nav className="nav-links">
            <a href="#about">הסיפור שלנו</a>
            <a href="#movie">הסרט</a>
            <a href="#register">הרשמה</a>
            <a href="#contact">צרו קשר</a>
          </nav>
          <div className="nav-cta">
            <a href="#register" className="btn btn-primary">הירשמו עכשיו</a>
          </div>
          <button
            className="hamb"
            aria-label="תפריט"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
        <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
          <a href="#about" onClick={() => setMenuOpen(false)}>הסיפור שלנו</a>
          <a href="#movie" onClick={() => setMenuOpen(false)}>הסרט</a>
          <a href="#register" onClick={() => setMenuOpen(false)}>הרשמה</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>צרו קשר</a>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="hero" id="top">
        <div className="hero-photo" role="img" aria-label="מסע אל האופק"></div>
        <div className="overlay"></div>
        <div className="wrap hero-inner">
          <h1>המסע שלך אחרי השחרור, מתחיל כאן.</h1>
          <p className="sub">
            התוכנית מובילה לצעירות וצעירים אחרי שירות צבאי ולאומי — שנה של צמיחה, חברּות ומשמעות.
          </p>
          <div className="hero-actions">
            <a href="#register" className="btn btn-light">בואו להיות חלק</a>
            <a href="#movie" className="btn btn-ghost">צפו בסרט ▸</a>
          </div>
        </div>
      </section>

      {/* ===== About ===== */}
      <section className="block" id="about">
        <div className="wrap">
          <p className="eyebrow">הסיפור שלנו</p>
          <h2 className="sec-title">מקום שמאמין בך</h2>
          <div className="sec-rule"></div>
          <p className="sec-lead">
            &ldquo;מסע אל האופק&rdquo; מלווה צעירות וצעירים בשנים שאחרי השירות — צומת הדרכים שבו מתעצבים החלומות, הזהות והכיוון. אנחנו כאן כדי לתת כלים, קהילה ותמיכה לכל מי שמחפש את הצעד הבא.
          </p>
        </div>
      </section>

      {/* ===== Movie ===== */}
      <section className="block movie" id="movie">
        <div className="wrap">
          <p className="eyebrow">הסרט שלנו</p>
          <h2 className="sec-title">הצצה אל המסע</h2>
          <div className="sec-rule"></div>
          <div className="video-frame">
            <iframe
              src="https://player.vimeo.com/video/1066327145?title=0&byline=0&portrait=0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="מסע אל האופק"
            />
          </div>
        </div>
      </section>

      {/* ===== Register ===== */}
      <section className="block register" id="register">
        <div className="wrap">
          <p className="eyebrow">הצטרפו אלינו</p>
          <h2 className="sec-title">הרשמה למסע</h2>
          <div className="sec-rule"></div>
          <p className="sec-lead">השאירו פרטים ונחזור אליכם עם כל המידע על המסע הקרוב.</p>

          <div className="form-card">
            {submitState !== "success" && (
              <form ref={formRef} onSubmit={onSubmit} noValidate>
                <div className={`field full${errors.name ? " bad" : ""}`}>
                  <label htmlFor="name">שם מלא <span className="req">*</span></label>
                  <input
                    type="text" id="name" name="name" autoComplete="name"
                    placeholder="ישראל ישראלי"
                    className={errors.name ? "invalid" : ""}
                    onInput={() => clearError("name")}
                  />
                  <span className="err">נא להזין שם מלא</span>
                </div>
                <div className="grid2">
                  <div className={`field${errors.idnum ? " bad" : ""}`}>
                    <label htmlFor="idnum">תעודת זהות <span className="req">*</span></label>
                    <input
                      type="text" id="idnum" name="idnum" inputMode="numeric"
                      maxLength={9} placeholder="9 ספרות"
                      className={errors.idnum ? "invalid" : ""}
                      onInput={() => clearError("idnum")}
                    />
                    <span className="err">תעודת זהות חייבת להיות 9 ספרות</span>
                  </div>
                  <div className="field">
                    <label htmlFor="gender">מגדר</label>
                    <select id="gender" name="gender" defaultValue="">
                      <option value="">בחרו...</option>
                      <option value="זכר">זכר</option>
                      <option value="נקבה">נקבה</option>
                    </select>
                  </div>
                  <div className={`field${errors.email ? " bad" : ""}`}>
                    <label htmlFor="email">אימייל <span className="req">*</span></label>
                    <input
                      type="email" id="email" name="email" autoComplete="email"
                      placeholder="name@email.com" dir="ltr" style={{ textAlign: "right" }}
                      className={errors.email ? "invalid" : ""}
                      onInput={() => clearError("email")}
                    />
                    <span className="err">כתובת אימייל לא תקינה</span>
                  </div>
                  <div className={`field${errors.phone ? " bad" : ""}`}>
                    <label htmlFor="phone">טלפון <span className="req">*</span></label>
                    <input
                      type="tel" id="phone" name="phone" inputMode="tel" autoComplete="tel"
                      placeholder="050-0000000"
                      className={errors.phone ? "invalid" : ""}
                      onInput={() => clearError("phone")}
                    />
                    <span className="err">מספר טלפון לא תקין</span>
                  </div>
                  <div className={`field${errors.city ? " bad" : ""}`}>
                    <label htmlFor="city">עיר מגורים <span className="req">*</span></label>
                    <input
                      type="text" id="city" name="city" autoComplete="address-level2"
                      placeholder="תל אביב"
                      className={errors.city ? "invalid" : ""}
                      onInput={() => clearError("city")}
                    />
                    <span className="err">נא להזין עיר מגורים</span>
                  </div>
                  <div className={`field${errors.dob ? " bad" : ""}`}>
                    <label htmlFor="dob">תאריך לידה <span className="req">*</span></label>
                    <input
                      type="date" id="dob" name="dob"
                      min="1960-01-01" max="2010-12-31"
                      className={errors.dob ? "invalid" : ""}
                      onInput={() => clearError("dob")}
                    />
                    <span className="err">נא לבחור תאריך לידה</span>
                  </div>
                  <div className={`field full${errors.programCity ? " bad" : ""}`}>
                    <label htmlFor="programCity">אשמח להרשם לתכנית בעיר/רשות <span className="req">*</span></label>
                    <select
                      id="programCity" name="programCity" defaultValue=""
                      className={errors.programCity ? "invalid" : ""}
                      onChange={() => clearError("programCity")}
                    >
                      <option value="">בחרו עיר/רשות...</option>
                      {PROGRAM_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <span className="err">נא לבחור עיר/רשות</span>
                  </div>
                  <div className={`field full${errors.source ? " bad" : ""}`}>
                    <label htmlFor="source">דרך מי שמעתי עליכם? <span className="req">*</span></label>
                    <select
                      id="source" name="source" defaultValue=""
                      className={errors.source ? "invalid" : ""}
                      onChange={() => clearError("source")}
                    >
                      <option value="">בחרו...</option>
                      {HEARD_SOURCES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <span className="err">נא לבחור</span>
                  </div>
                </div>
                <div className={`field full consent-field${errors.consent ? " bad" : ""}`}>
                  <label className="consent-label" htmlFor="consent">
                    <input
                      type="checkbox" id="consent" name="consent"
                      onChange={() => clearError("consent")}
                    />
                    <span>אני מאשר/ת העברה של הפרטים שלי למשרד הביטחון לאישור, בכדי שאוכל להשתתף בתוכנית <span className="req">*</span></span>
                  </label>
                  <span className="err">חובה לאשר על מנת להמשיך</span>
                </div>
                <div className="form-submit">
                  <button type="submit" className="btn btn-primary" disabled={submitState === "submitting"}>
                    {submitState === "submitting" ? "שולח..." : "שליחה"}
                  </button>
                </div>
                {submitState === "error" && (
                  <p className="submit-error">משהו השתבש. אנא נסו שוב בעוד רגע.</p>
                )}
              </form>
            )}

            {submitState === "success" && (
              <div className="form-success show">
                <div className="check">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3>תודה רבה!</h3>
                <p>קיבלנו את הפרטים שלך — ניצור איתך קשר בקרוב.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer id="contact">
        <div className="wrap foot-top">
          <div className="foot-brand">
            <img src="/logo.avif" alt="מסע אל האופק" />
            <p>מלווים צעירות וצעירים אחרי השירות אל הצעד הבא — בקהילה שמאמינה בהם.</p>
            <div className="socials">
              <a href="https://www.facebook.com/masaelhaofek2021/?locale=he_IL" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-2.9h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6v1.8h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z"/></svg>
              </a>
              <a href="https://www.instagram.com/masaaelhaofek/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.3 1 .4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .3-2.2.4-1.3.1-1.6.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.3-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.3 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.4-.5.2-.9.4-1.3.8-.4.4-.6.8-.8 1.3-.2.4-.3 1-.4 2.1C2.7 9.5 2.7 9.9 2.7 12s0 2.5.1 3.3c.1 1.1.2 1.7.4 2.1.2.5.4.9.8 1.3.4.4.8.6 1.3.8.4.2 1 .3 2.1.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.9-.4 1.3-.8.4-.4.6-.8.8-1.3.2-.4.3-1 .4-2.1.1-1.2.1-1.6.1-3.3s0-2.5-.1-3.3c-.1-1.1-.2-1.7-.4-2.1-.2-.5-.4-.9-.8-1.3-.4-.4-.8-.6-1.3-.8-.4-.2-1-.3-2.1-.4-1.2-.1-1.6-.1-4.7-.1zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 8a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2zm6.3-8.2a1.1 1.1 0 1 1-2.3 0 1.1 1.1 0 0 1 2.3 0z"/></svg>
              </a>
              <a href="https://www.linkedin.com/company/%D7%9E%D7%A1%D7%A2-%D7%90%D7%9C-%D7%94%D7%90%D7%95%D7%A4%D7%A7-%D7%AA%D7%9B%D7%A0%D7%99%D7%AA/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 18.34V9.67H5.67v8.67h2.67zM7 8.5a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1zm11.34 9.84v-4.75c0-2.55-1.36-3.74-3.18-3.74-1.47 0-2.12.81-2.49 1.38V9.67h-2.67c.04.76 0 8.67 0 8.67h2.67v-4.84c0-.24.02-.48.09-.65.19-.48.63-.97 1.37-.97.97 0 1.36.74 1.36 1.82v4.64h2.85z"/></svg>
              </a>
              <a href="https://api.whatsapp.com/send?phone=972522404848" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24"><path d="M17.5 14.4c-.3-.2-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1.1 1.1-1.1 2.7c0 1.6 1.1 3.1 1.3 3.3.2.2 2.2 3.4 5.4 4.8.8.3 1.4.5 1.8.7.8.2 1.4.2 2 .1.6-.1 1.8-.7 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.1-1.3c1.5.8 3.2 1.3 4.9 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.3c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.3.9.9-3.2-.2-.3c-.9-1.4-1.3-3-1.3-4.6 0-4.6 3.7-8.3 8.3-8.3 2.2 0 4.3.9 5.9 2.4 1.6 1.6 2.4 3.6 2.4 5.9 0 4.6-3.7 8.3-8.3 8.3z"/></svg>
              </a>
            </div>
          </div>
          <div className="foot-col">
            <h4>ניווט</h4>
            <a href="#about">הסיפור שלנו</a>
            <a href="#movie">הסרט</a>
            <a href="#register">הרשמה</a>
          </div>
          <div className="foot-col">
            <h4>דברו איתנו</h4>
            <a href="mailto:office@mafligimelhaofek.org">office@mafligimelhaofek.org</a>
            <a href="https://www.masaelhaofek.org/" target="_blank" rel="noopener noreferrer">לאתר הראשי ▸</a>
            <a href="#register">להרשמה למסע ▸</a>
          </div>
        </div>
        <div className="foot-bottom">© 2026 מסע אל האופק. כל הזכויות שמורות.</div>
      </footer>
    </>
  );
}
