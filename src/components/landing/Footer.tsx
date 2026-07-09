import Link from "next/link";
import { Activity } from "lucide-react";

const FOOTER_LINKS = {
  Product: [
    { label: "AI Exam Generator", href: "/#features" },
    { label: "White-Label Portal", href: "/#features" },
    { label: "Student Analytics", href: "/#features" },
    { label: "Live Mock Exams", href: "/exams" },
  ],
  Company: [
    { label: "Pricing", href: "/#pricing" },
    { label: "Contact Sales", href: "/#contact-sales" },
  ],
  Resources: [
    { label: "Demo Quiz", href: "/exams" },
    { label: "Digital Library", href: "/library" },
    { label: "AI Guru", href: "/ai-guru" },
    { label: "Institute Onboarding", href: "/#pricing" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-slate-800 px-6 py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/40">
                <Activity className="h-4 w-4 text-cyan-400" strokeWidth={2.25} />
              </span>
              <span className="text-base font-semibold text-white">
                TestPulse <span className="text-cyan-400">AI</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              The AI exam engine built for coaching institutes and educators
              who need speed, scale, and their own brand on top.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-sm font-semibold text-slate-200">
                {heading}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 transition-colors hover:text-cyan-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} TestPulse AI. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
