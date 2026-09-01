import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מיפוי צרכים מובילים — מסע אל האופק",
  description: "טופס משוב למובילות ומובילי התכנית.",
  robots: { index: false, follow: false },
};

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
