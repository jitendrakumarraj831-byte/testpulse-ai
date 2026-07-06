import { Activity } from "lucide-react";

const FOOTER_LINKS = {
  Product: [
    { label: "AI Exam Generator", href: "#features" },
    { label: "White-Label Portal", href: "#features" },
    { label: "Student Analytics", href: "#features" },
    { label: "Live Mock Exams", href: "#features" },
  ],
  Company: [
    { label: "About", href: "#about" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact Sales", href: "#contact" },
  ],
  Resources: [
    { label: "Demo Quiz", href: "#demo-quiz" },
    { label: "Institute Onboarding", href: "#create-account" },
    { label: "Help Center", href: "#help" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-slate-800 px-6 py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <a href="#top" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/40">
                <Activity className="h-4 w-4 text-cyan-400" strokeWidth={2.25} />
              </span>
              <span className="text-base font-semibold text-white">
                TestPulse <span className="text-cyan-400">AI</span>
              </span>
            </a>
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
                    <a
                      href={link.href}
                      className="text-sm text-slate-500 transition-colors hover:text-cyan-400"
                    >
                      {link.label}
                    </a>
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
          <div className="flex gap-6">
            <a
              href="#privacy"
              className="text-xs text-slate-600 transition-colors hover:text-cyan-400"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              className="text-xs text-slate-600 transition-colors hover:text-cyan-400"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
