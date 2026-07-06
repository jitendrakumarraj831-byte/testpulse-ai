import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TestPulse AI | AI-Powered Exam Engine for Coaching Institutes",
  description:
    "TestPulse AI helps coaching institutes and educators generate AI-crafted exams, run a white-labeled student portal, and track performance analytics in real time.",
  keywords: [
    "TestPulse AI",
    "AI exam generator",
    "coaching institute software",
    "white label test portal",
    "student analytics",
    "online mock exams",
  ],
  authors: [{ name: "TestPulse AI" }],
  openGraph: {
    title: "TestPulse AI | AI-Powered Exam Engine for Coaching Institutes",
    description:
      "Generate exams with AI, launch a white-labeled portal, and track student performance in real time.",
    siteName: "TestPulse AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
