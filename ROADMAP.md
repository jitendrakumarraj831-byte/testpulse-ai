# 🗺️ TestPulse AI - Production-Ready Master Roadmap

## 📦 MODULE 1: AUTH & GLOBAL ROUTING (Status: 100% Verified)
- [x] 1.1 – Create and sync user profiles table with auth triggers in Supabase.
- [x] 1.2 – Implement server/client-side role-based automated route landing logic.
- [x] 1.3 – Isolate Layout Shells completely (AdminShell vs StudentAppHeader) so no shared layouts leak.

## 🎓 MODULE 2: COMPREHENSIVE HOMEPAGE REFACTOR & STUDENT CORE (Current Phase)
- [x] 2.1 – **Unified Dynamic Homepage (`/src/app/page.tsx`)**: Fully refactor the root page. If logged out, render the landing page. If logged in as Student, render their complete Dashboard grid directly. If logged in as Admin, render the System Control Center. *Must be fully wired with real state and zero placeholders.*
- [x] 2.2 – **Reading Room & Digital Library (`/src/app/library`)**: Build a complete interface with subcategories for books, chapter notes, and premium catalogs, connected directly to a Supabase resource schema.
- [x] 2.3 – **AI Doubt Solver (`/src/app/ai-guru`)**: Create a complete, stylized chat workspace connected to an LLM endpoint for 24/7 student academic queries.
- [ ] 2.4 – **Gamified Reward Vault**: Fully write the logic tracking student consistency streaks and milestones to award redeemable utility points.

## 💰 MODULE 3: MONETIZATION & ENTERPRISE MANAGEMENT
- [ ] 3.1 – **Premium Content Lock**: Embed a secure lock mechanism utilizing an `is_premium` flag on exams and documents, requiring validation tokens to unlock.
- [ ] 3.2 – **B2B Tenant & Lead Tools**: Build management tables for onboarding third-party institutes and capturing active student registration data securely.

---
### 🚨 STRICT OPERATIONAL DIRECTIVE FOR CLAUDE:
1. Every module step must be written with 100% complete logic. No '// TODO' or 'add code here' comments allowed.
2. After finishing a module completely, you must modify this `ROADMAP.md` file, update the checkmark `[ ]` to `[x]`, and perform a clean git commit.
