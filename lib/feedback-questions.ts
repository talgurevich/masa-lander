/**
 * Single source of truth for the /leader-feedback survey.
 *
 * The page renders from this list, the API route validates against it, and the
 * Google Sheet header row is built from the labels — so changing the survey
 * means editing this file and nothing else.
 *
 * Design note: this is a needs assessment, not a satisfaction survey. Leaders
 * are asked what they actually did last week, not what tools they think they
 * want — hence the open questions all sit BEFORE the menu of candidate tools in
 * `would_help`. Showing that menu first would contaminate the only unprompted
 * answers we get.
 */

type Base = {
  id: string;
  label: string;
  required: boolean;
  help?: string;
  /** Heading rendered above the first question carrying a new section name. */
  section?: string;
};

export type Question =
  | (Base & { type: "short"; placeholder?: string })
  | (Base & { type: "long"; placeholder?: string })
  | (Base & { type: "scale"; min: number; max: number; minLabel?: string; maxLabel?: string })
  | (Base & { type: "choice"; options: string[] })
  | (Base & { type: "multi"; options: string[]; max?: number });

export type Answer = string | string[];

/** Longest accepted free-text answer, in characters. */
const MAX_LONG = 3000;
const MAX_SHORT = 200;

// NOTE: the option lists in `time_sinks`, `tools_today` and `would_help` are
// still first-draft guesses about how the program actually runs day to day.
// Wrong options are worse than no options — people pick the closest match and
// the data looks confident but isn't. Worth a review before this goes out.
export const QUESTIONS: Question[] = [
  {
    id: "name",
    type: "short",
    section: "קצת עליכם",
    label: "שם מלא",
    required: true,
    placeholder: "ישראל ישראלי",
  },
  {
    id: "role",
    type: "choice",
    label: "התפקיד שלכם",
    required: true,
    options: ["מובילי קבוצה", "רכז/ת", "מנהל/ת אזור", "צוות מטה", "אחר"],
  },

  {
    id: "admin_hours",
    type: "choice",
    section: "לאן הולך הזמן",
    label: "כמה שעות בשבוע אתם משקיעים בעבודה אדמיניסטרטיבית — כל מה שאינו מפגש עם המשתתפים?",
    required: true,
    options: ["פחות משעה", "1–3 שעות", "3–6 שעות", "6–10 שעות", "יותר מ-10 שעות"],
  },
  {
    id: "time_sinks",
    type: "multi",
    label: "אילו מהמשימות האלה גוזלות מכם הכי הרבה זמן?",
    help: "אפשר לבחור עד 3",
    required: true,
    max: 3,
    options: [
      "מעקב נוכחות",
      "תיאום מפגשים ולוחות זמנים",
      "תקשורת שוטפת עם משתתפים",
      "מעקב אחרי משתתפים שזקוקים לתשומת לב",
      "דיווחים למטה",
      "טפסים ואישורים",
      "הכנת תכנים למפגש",
      "ניהול תקציב והוצאות",
      "גיוס ורישום",
    ],
  },
  {
    id: "tools_today",
    type: "multi",
    label: "באילו כלים אתם משתמשים בפועל היום?",
    help: "בחרו כל מה שרלוונטי — מעניין אותנו מה באמת קורה, לא מה אמור לקרות",
    required: true,
    options: [
      "וואטסאפ",
      "אקסל / גוגל שיטס",
      "נייר ומחברת",
      "Monday",
      "גוגל פורמס",
      "יומן גוגל",
      "שיחות טלפון",
      "הזיכרון שלי",
      "אחר",
    ],
  },

  {
    id: "slow_task",
    type: "long",
    section: "איפה זה נשבר",
    label: "חשבו על הפעם האחרונה שבה משהו לקח לכם הרבה יותר זמן ממה שהיה צריך. מה קרה?",
    required: true,
    placeholder: "ככל שתתארו את המקרה הספציפי בפירוט, כך נוכל לעזור יותר...",
  },
  {
    id: "duplicate_entry",
    type: "long",
    label: "יש משהו שאתם עושים שוב ושוב, במקומות שונים, והייתם רוצים להפוך אותו לפשוט יותר? מה ואיך?",
    required: false,
    placeholder: "לדוגמה: רושמים נוכחות במחברת ואז מעתיקים לאקסל",
  },
  {
    id: "workaround",
    type: "long",
    label: "בניתם לעצמכם פתרון עוקף — קובץ אקסל פרטי, תבנית הודעה קבועה, צ'קליסט? ספרו לנו עליו.",
    required: false,
    placeholder: "אופציונלי, אבל זה בדיוק סוג הדבר שהכי עוזר לנו",
  },
  {
    id: "find_info",
    type: "scale",
    label: "עד כמה קל לכם למצוא מידע על משתתף/ת ספציפי/ת כשאתם צריכים אותו?",
    required: true,
    min: 1,
    max: 5,
    minLabel: "קשה מאוד",
    maxLabel: "קל מאוד",
  },

  {
    id: "magic_button",
    type: "long",
    section: "המשאלה",
    label: "אם היה לכם כפתור קסם שעושה בשבילכם דבר אחד אוטומטית — מה הוא היה עושה?",
    required: true,
    placeholder: "אין הגבלות. מה הדבר שהכי הייתם רוצים שפשוט יקרה מעצמו?",
  },
  {
    id: "would_help",
    type: "multi",
    label: "מה מהרשימה הזו היה עוזר לכם הכי הרבה?",
    help: "אפשר לבחור עד 3",
    required: true,
    max: 3,
    options: [
      "אפליקציית נוכחות בלחיצה",
      "מרכז מידע אחד לכל משתתף",
      "שליחת הודעות מרוכזת",
      "דיווח אוטומטי למטה",
      "מאגר תכנים ומערכי מפגש משותף",
      "טפסים דיגיטליים עם חתימה",
      "לוח זמנים משותף",
    ],
  },
  {
    id: "device",
    type: "choice",
    label: "באיזה מכשיר אתם עושים את רוב העבודה האדמיניסטרטיבית?",
    required: true,
    options: ["נייד", "מחשב", "שניהם במידה שווה"],
  },
  {
    id: "interview",
    type: "choice",
    label: "נשמח לשיחה של 20 דקות כדי להעמיק. מתאים לכם?",
    required: true,
    options: ["כן, בשמחה", "אולי, תלוי מתי", "לא הפעם"],
  },
];

/** Column headers for the Google Sheet, in row order. */
export const SHEET_HEADERS = ["חותמת זמן", ...QUESTIONS.map((q) => q.label)];

/** Normalizes a raw submitted value into the shape its question expects. */
export function normalizeAnswer(q: Question, raw: unknown): Answer {
  if (q.type === "multi") {
    if (!Array.isArray(raw)) return [];
    return raw.map((v) => String(v).trim()).filter((v) => q.options.includes(v));
  }
  return String(raw ?? "").trim();
}

/**
 * Validates one answer. Returns a Hebrew error message, or "" when valid.
 * Used by both the browser and the route handler — never trust the client copy.
 */
export function validateAnswer(q: Question, value: Answer): string {
  const empty = Array.isArray(value) ? value.length === 0 : value.length === 0;
  if (empty) return q.required ? "שדה חובה" : "";

  switch (q.type) {
    case "short":
      if (typeof value !== "string") return "תשובה לא תקינה";
      if (value.length < 2) return "תשובה קצרה מדי";
      if (value.length > MAX_SHORT) return `עד ${MAX_SHORT} תווים`;
      return "";
    case "long":
      if (typeof value !== "string") return "תשובה לא תקינה";
      if (value.length > MAX_LONG) return `עד ${MAX_LONG} תווים`;
      return "";
    case "scale": {
      const n = Number(value);
      if (!Number.isInteger(n) || n < q.min || n > q.max) return "נא לבחור דירוג";
      return "";
    }
    case "choice":
      if (typeof value !== "string" || !q.options.includes(value)) return "נא לבחור אפשרות";
      return "";
    case "multi":
      if (!Array.isArray(value)) return "תשובה לא תקינה";
      if (q.max && value.length > q.max) return `אפשר לבחור עד ${q.max}`;
      return "";
  }
}

/** Validates a whole submission. Returns question id -> error message. */
export function validateSubmission(answers: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const q of QUESTIONS) {
    const msg = validateAnswer(q, normalizeAnswer(q, answers[q.id]));
    if (msg) errors[q.id] = msg;
  }
  return errors;
}

/** Flattens a validated submission into one sheet row, matching SHEET_HEADERS. */
export function toSheetRow(answers: Record<string, unknown>, timestamp: string): string[] {
  return [
    timestamp,
    ...QUESTIONS.map((q) => {
      const v = normalizeAnswer(q, answers[q.id]);
      return Array.isArray(v) ? v.join(", ") : v;
    }),
  ];
}
