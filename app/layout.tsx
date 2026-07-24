import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UniBridge | Connect. Belong. Succeed.",
  description:
    "UniBridge helps international students find compatible friends, study partners, event buddies, and practical university guidance."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
