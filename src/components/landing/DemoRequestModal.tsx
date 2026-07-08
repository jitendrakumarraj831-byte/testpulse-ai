"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2, Send, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { DemoRequestInsert } from "@/lib/landing/demo-requests";

const PLAN_OPTIONS = ["Starter", "Growth", "Enterprise", "Not sure yet"];

interface DemoRequestModalProps {
  isOpen: boolean;
  initialPlan: string;
  onClose: () => void;
}

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export function DemoRequestModal({
  isOpen,
  initialPlan,
  onClose,
}: DemoRequestModalProps) {
  const [instituteName, setInstituteName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [planInterest, setPlanInterest] = useState(initialPlan);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPlanInterest(initialPlan);
      setStatus("idle");
      setErrorMessage("");
    }
  }, [isOpen, initialPlan]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const resetForm = () => {
    setInstituteName("");
    setContactName("");
    setEmail("");
    setPhone("");
    setMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const payload: DemoRequestInsert = {
      institute_name: instituteName.trim(),
      contact_name: contactName.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      plan_interest: planInterest,
      message: message.trim() || null,
    };

    try {
      const supabase = createClient();
      const { error } = await supabase.from("demo_requests").insert(payload);
      if (error) throw error;
      setStatus("success");
      resetForm();
    } catch (error) {
      console.error("Failed to save demo request:", error);
      setStatus("error");
      setErrorMessage(
        "We couldn't reach our servers just now. Please try again, or email us directly.",
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-request-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            className="card-glow relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-md"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {status === "success" ? (
              <div className="flex flex-col items-center gap-3 px-8 py-14 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30">
                  <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                </span>
                <h3 className="text-lg font-semibold text-white">
                  Request received
                </h3>
                <p className="max-w-sm text-sm text-slate-400">
                  Thanks — our team will reach out within one business day to
                  schedule your live demo.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-4 inline-flex items-center justify-center rounded-full border border-slate-700 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-500/50 hover:text-cyan-300"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-7 sm:px-8">
                <h3
                  id="demo-request-title"
                  className="text-lg font-semibold text-white"
                >
                  Request a live demo
                </h3>
                <p className="mt-1.5 text-sm text-slate-400">
                  Tell us a bit about your institute and we&apos;ll set up a
                  walkthrough tailored to your batch size.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="institute-name"
                      className="text-xs font-medium text-slate-400"
                    >
                      Institute / school name
                    </label>
                    <input
                      id="institute-name"
                      required
                      value={instituteName}
                      onChange={(event) => setInstituteName(event.target.value)}
                      placeholder="Apex Coaching Institute"
                      className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-name"
                      className="text-xs font-medium text-slate-400"
                    >
                      Your name
                    </label>
                    <input
                      id="contact-name"
                      required
                      value={contactName}
                      onChange={(event) => setContactName(event.target.value)}
                      placeholder="Priya Sharma"
                      className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="text-xs font-medium text-slate-400"
                    >
                      Phone (optional)
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+91 98765 43210"
                      className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="email"
                      className="text-xs font-medium text-slate-400"
                    >
                      Work email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="priya@apexcoaching.com"
                      className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="plan-interest"
                      className="text-xs font-medium text-slate-400"
                    >
                      Plan of interest
                    </label>
                    <select
                      id="plan-interest"
                      value={planInterest}
                      onChange={(event) => setPlanInterest(event.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white outline-none transition-colors focus:border-cyan-500/50"
                    >
                      {PLAN_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="message"
                      className="text-xs font-medium text-slate-400"
                    >
                      Anything specific you&apos;d like us to cover? (optional)
                    </label>
                    <textarea
                      id="message"
                      rows={3}
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="e.g. WhatsApp report cards for 4 branches"
                      className="mt-1.5 w-full resize-none rounded-lg border border-slate-800 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/50"
                    />
                  </div>
                </div>

                {status === "error" && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_40px_-4px_rgba(6,182,212,0.9)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Request Live Demo
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
