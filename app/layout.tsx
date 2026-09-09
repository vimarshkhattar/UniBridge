import type { Metadata } from "next";
import { TiltEffect } from "@/components/tilt-effect";
import "./globals.css";

export const metadata: Metadata = {
  title: "UniBridge | Connect. Belong. Succeed.",
  description:
    "UniBridge is for new college students and transfer students who face problems when coming to a new university. Find study partners, friends, event buddies, and practical university guidance."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        {children}
        <TiltEffect />
      </body>
    </html>
  );
}
