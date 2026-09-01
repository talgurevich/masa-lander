"use client";

import { Fragment, FormEvent, useRef, useState } from "react";
import {
  Answer,
  QUESTIONS,
  Question,
  normalizeAnswer,
  validateSubmission,
} from "@/lib/feedback-questions";

type SubmitState = "idle" | "submitting" | "success" | "error";

function blankAnswers(): Record<string, Answer> {
  return Object.fromEntries(QUESTIONS.map((q) => [q.id, q.type === "multi" ? [] : ""]));
}

export default function LeaderFeedback() {
  const [answers, setAnswers] = useState<Record<string, Answer>>(blankAnswers);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const formRef = useRef<HTMLFormElement>(null);

  function setAnswer(id: string, value: Answer) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => (prev[id] ? { ...prev, [id]: "" } : prev));
  }

  function toggleMulti(id: string, option: string, max?: number) {
    const current = (answers[id] as string[]) ?? [];
    if (current.includes(option)) {
      setAnswer(id, current.filter((o) => o !== option));
      return;
    }
    if (max && current.length >= max) return;
    setAnswer(id, [...current, option]);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitState === "submitting") return;

    const next = validateSubmission(answers);
    setErrors(next);
    const firstBad = QUESTIONS.find((q) => next[q.id]);
    if (firstBad) {
      const el = formRef.current?.querySelector<HTMLElement>(`[data-q="${firstBad.id}"]`);
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      el?.querySelector<HTMLElement>("input, textarea, select")?.focus();
      return;
    }

    const payload = Object.fromEntries(QUESTIONS.map((q) => [q.id, normalizeAnswer(q, answers[q.id])]));

    setSubmitState("submitting");
    try {
      const res = await fetch("/api/leader-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload, website: "" }),
      });
      if (!res.ok) throw new Error("submit_failed");
      setSubmitState("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitState("error");
    }
  }

  return (
    <>
      <header className="slim-header">
        <div className="wrap nav">
          <a className="brand" href="https://www.masaelhaofek.org/" aria-label="מסע אל האופק">
            <img src="/logo.avif" alt="מסע אל האופק" />
          </a>
        </div>
      </header>

      <section className="block register survey">
        <div className="wrap">
          <p className="eyebrow">מיפוי צרכים מובילים</p>
          <h2 className="sec-title">אילו כלים דיגיטליים חסרים לכם?</h2>
          <div className="sec-rule"></div>
          <p className="sec-lead">
            אנחנו רוצים להבין איפה הזמן שלכם הולך לאיבוד, כדי לבנות כלים שיחזירו אותו אליכם. כ-7 דקות, ואין תשובות נכונות — הכי חשוב לנו הכנות שלכם.
          </p>

          {/* Previews the themes of the survey before people commit to filling it in. */}
          <div className="intro-themes">
            <div className="theme">
              <h3>איפה זה נשבר?</h3>
              <p>חשבו על הפעם האחרונה שבה משהו לקח לכם הרבה יותר זמן ממה שהיה צריך. מה קרה?</p>
            </div>
            <div className="theme">
              <h3>מה חוזר על עצמו?</h3>
              <p>יש משהו שאתם עושים שוב ושוב, במקומות שונים, והייתם רוצים להפוך אותו לפשוט יותר? מה ואיך?</p>
            </div>
            <div className="theme">
              <h3>אם היה לכם פתרון קסם…</h3>
              <p>איזה כלי או פתרון היה יכול לחסוך לכם זמן, להקל על העבודה או לשפר אותה?</p>
            </div>
          </div>

          <div className="form-card">
            {submitState !== "success" && (
              <form ref={formRef} onSubmit={onSubmit} noValidate>
                {QUESTIONS.map((q, i) => (
                  <Fragment key={q.id}>
                    {q.section && q.section !== QUESTIONS[i - 1]?.section && (
                      <h3 className="q-section">{q.section}</h3>
                    )}
                    <QuestionField
                      q={q}
                      value={answers[q.id]}
                      error={errors[q.id] || ""}
                      onChange={(v) => setAnswer(q.id, v)}
                      onToggle={(o) => toggleMulti(q.id, o, q.type === "multi" ? q.max : undefined)}
                    />
                  </Fragment>
                ))}

                <input
                  type="text"
                  name="website"
                  className="hp-field"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div className="form-submit">
                  <button type="submit" className="btn btn-primary" disabled={submitState === "submitting"}>
                    {submitState === "submitting" ? "שולח..." : "שליחת המשוב"}
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
                <p>המשוב שלך התקבל. זה בדיוק מה שיעזור לנו לבנות את הכלים הנכונים.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer>
        <div className="foot-bottom">© 2026 מסע אל האופק. כל הזכויות שמורות.</div>
      </footer>
    </>
  );
}

function QuestionField({
  q,
  value,
  error,
  onChange,
  onToggle,
}: {
  q: Question;
  value: Answer;
  error: string;
  onChange: (v: Answer) => void;
  onToggle: (option: string) => void;
}) {
  const text = typeof value === "string" ? value : "";
  const picked = Array.isArray(value) ? value : [];

  return (
    <div className={`field full${error ? " bad" : ""}`} data-q={q.id}>
      <label htmlFor={q.id}>
        {q.label} {q.required && <span className="req">*</span>}
      </label>
      {q.help && <span className="q-help">{q.help}</span>}

      {q.type === "short" && (
        <input
          type="text"
          id={q.id}
          value={text}
          placeholder={q.placeholder}
          className={error ? "invalid" : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {q.type === "long" && (
        <textarea
          id={q.id}
          rows={4}
          value={text}
          placeholder={q.placeholder}
          className={error ? "invalid" : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {q.type === "scale" && (
        <div className="scale" role="radiogroup" aria-label={q.label}>
          {q.minLabel && <span className="scale-end">{q.minLabel}</span>}
          {Array.from({ length: q.max - q.min + 1 }, (_, i) => String(q.min + i)).map((n) => (
            <label key={n} className={`scale-dot${text === n ? " on" : ""}`}>
              <input
                type="radio"
                name={q.id}
                value={n}
                checked={text === n}
                onChange={() => onChange(n)}
              />
              {n}
            </label>
          ))}
          {q.maxLabel && <span className="scale-end">{q.maxLabel}</span>}
        </div>
      )}

      {q.type === "choice" && (
        <div className="opt-list" role="radiogroup" aria-label={q.label}>
          {q.options.map((o) => (
            <label key={o} className={`opt${text === o ? " on" : ""}`}>
              <input type="radio" name={q.id} value={o} checked={text === o} onChange={() => onChange(o)} />
              <span>{o}</span>
            </label>
          ))}
        </div>
      )}

      {q.type === "multi" && (
        <div className="opt-list">
          {q.options.map((o) => {
            const on = picked.includes(o);
            const capped = Boolean(q.max) && !on && picked.length >= (q.max as number);
            return (
              <label key={o} className={`opt${on ? " on" : ""}${capped ? " capped" : ""}`}>
                <input
                  type="checkbox"
                  value={o}
                  checked={on}
                  disabled={capped}
                  onChange={() => onToggle(o)}
                />
                <span>{o}</span>
              </label>
            );
          })}
        </div>
      )}

      <span className="err">{error}</span>
    </div>
  );
}
