# 🗺️ TestPulse AI - Production-Ready Master Roadmap

## 📦 MODULE 1: AUTH & GLOBAL ROUTING (Status: 100% Verified)
- [x] 1.1 – Create and sync user profiles table with auth triggers in Supabase.
- [x] 1.2 – Implement server/client-side role-based automated route landing logic.
- [x] 1.3 – Isolate Layout Shells completely (AdminShell vs StudentAppHeader) so no shared layouts leak.

## 🎓 MODULE 2: COMPREHENSIVE HOMEPAGE REFACTOR & STUDENT CORE (Current Phase)
- [x] 2.1 – **Public Reading Platform (`/src/app/page.tsx`)**: The public "/" is a guest-facing reading and practice platform, open with no sign-in required (browse the library preview, practice Current Affairs, chat with AI Guru). The two-entry-point login gateway (Student Login / Admin Login) lives at `/portal`: a signed-in student's home shows their schedule, outstanding homework, consistency streak, Reward Vault, and Exam Arena access; a signed-in admin's home shows the fee ledger, today's attendance, student directory, and exam deployment controls. *Fully wired with real state and zero placeholders.*
- [x] 2.2 – **Reading Room & Digital Library (`/src/app/library`)**: Build a complete interface with subcategories for books, chapter notes, and premium catalogs, connected directly to a Supabase resource schema.
- [x] 2.3 – **AI Doubt Solver (`/src/app/ai-guru`)**: Create a complete, stylized chat workspace connected to an LLM endpoint for 24/7 student academic queries.
- [x] 2.4 – **Gamified Reward Vault**: `award_learning_points()` (security-definer Postgres function) computes a student's real streak/activity state server-side from their own `student_responses` history and awards idempotent, ledger-backed utility points — +10 for a day with a test submitted, plus a one-time bonus at each 3/7/14/30/60/100-day streak milestone. Stored in `reward_points_ledger`, surfaced on the signed-in student home via `RewardVaultCard`. No client-writable point values (every row is written by the function, never a direct table insert) and no redemption/spend catalog yet — earn-and-store only, same scoping discipline as 4.2's manual fee ledger.
- [x] 2.5 – **Public Homepage & Enterprise Showcase**: The guest-facing "/" also carries the full pre-login product story — an illustrative subject showcase grid, the real library preview, core pillar deep-dives (Student Academic Hub / Management Suite & ERP / Exam Arena & AI Guru), white-label preview, enterprise feature grid, a step-by-step institute onboarding flow, and pricing — folded in from the former `/product` page.

## 💰 MODULE 3: MONETIZATION & ENTERPRISE MANAGEMENT
- [ ] 3.1 – **Premium Content Lock**: Embed a secure lock mechanism utilizing an `is_premium` flag on exams and documents, requiring validation tokens to unlock. *Not started — the current premium gate on `/library` is "signed in or not" only (see `library_catalog()` in schema.sql); there's no token/entitlement system yet.*
- [ ] 3.2 – **B2B Tenant & Lead Tools**: Build management tables for onboarding third-party institutes and capturing active student registration data securely. *Not started — `demo_requests` captures inbound sales leads only, not a multi-tenant institute model.*

## 🏫 MODULE 4: SCHOOL & COACHING MANAGEMENT SUITE
- [x] 4.1 – **Student Academic Hub**: Schedule/timetable (with virtual-class join links), homework assignments with submission + grading, and admin-recorded attendance — both the admin management side and the student-facing views, backed by real Supabase tables and RLS.
- [x] 4.2 – **Fee Tracking & Receipts**: Manual fee ledger (admin records payments received) and receipt generation — no live payment gateway/online collection.
- [x] 4.3 – **Report Card Generation**: `/admin/report-cards` (`ReportCardPanel` + `getReportCardData()`) aggregates a selected student's real exam accuracy (overall and per-subject, from `student_responses`), attendance rate (from `attendance_records`), and assignment grades/status (from `assignments` + `assignment_submissions`) into one print-ready report — same browser print-to-PDF pattern as the 4.2 fee receipt, no new PDF dependency.

---
### 🚨 STRICT OPERATIONAL DIRECTIVE FOR CLAUDE:
1. Every module step must be written with 100% complete logic. No '// TODO' or 'add code here' comments allowed.
2. After finishing a module completely, you must modify this `ROADMAP.md` file, update the checkmark `[ ]` to `[x]`, and perform a clean git commit.
