"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CalendarClock,
  Link2,
  Loader2,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/client";
import { CornerBrackets } from "@/components/ui/CornerBrackets";
import type { ScheduleEntry, ScheduleEventType } from "@/lib/academic-hub/types";

interface ScheduleRow {
  id: string;
  title: string;
  subject: string;
  event_type: ScheduleEventType;
  batch: string | null;
  starts_at: string;
  ends_at: string;
  join_url: string | null;
  notes: string;
}

type LoadState =
  | { status: "unconfigured" }
  | { status: "loading" }
  | { status: "ready"; entries: ScheduleEntry[] };

const EVENT_TYPE_LABEL: Record<ScheduleEventType, string> = {
  class: "Class",
  exam: "Exam",
  event: "Event",
};

const EVENT_TYPE_BADGE: Record<ScheduleEventType, string> = {
  class: "bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30",
  exam: "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/30",
  event: "bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/30",
};

function formatRange(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const dateLabel = start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const startLabel = start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const endLabel = end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${dateLabel} · ${startLabel} – ${endLabel}`;
}

function rowToEntry(row: ScheduleRow): ScheduleEntry {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    eventType: row.event_type,
    batch: row.batch,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    joinUrl: row.join_url,
    notes: row.notes,
  };
}

export function SchedulePanel() {
  const supabase = useMemo(() => (isSupabaseConfigured ? createClient() : null), []);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [eventType, setEventType] = useState<ScheduleEventType>("class");
  const [batch, setBatch] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [joinUrl, setJoinUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    if (!supabase) {
      setState({ status: "unconfigured" });
      return;
    }

    const { data, error } = await supabase
      .from("class_schedule")
      .select("id, title, subject, event_type, batch, starts_at, ends_at, join_url, notes")
      .order("starts_at", { ascending: true });

    if (error || !data) {
      setState({ status: "ready", entries: [] });
      return;
    }

    setState({ status: "ready", entries: (data as ScheduleRow[]).map(rowToEntry) });
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const resetForm = () => {
    setTitle("");
    setSubject("");
    setEventType("class");
    setBatch("");
    setStartsAt("");
    setEndsAt("");
    setJoinUrl("");
    setNotes("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setFormError(null);

    if (!title.trim() || !subject.trim() || !startsAt || !endsAt) {
      setFormError("Title, subject, start time, and end time are required.");
      return;
    }
    if (new Date(endsAt) <= new Date(startsAt)) {
      setFormError("End time must be after start time.");
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.from("class_schedule").insert({
      title: title.trim(),
      subject: subject.trim(),
      event_type: eventType,
      batch: batch.trim() || null,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      join_url: eventType === "class" && joinUrl.trim() ? joinUrl.trim() : null,
      notes: notes.trim(),
    });
    setIsSaving(false);

    if (error) {
      setFormError("Couldn't save this entry. Make sure you're signed in as an admin.");
      return;
    }

    resetForm();
    void load();
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    setDeletingId(id);
    const { error } = await supabase.from("class_schedule").delete().eq("id", id);
    setDeletingId(null);
    if (!error) void load();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-10 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/30">
            <CalendarClock className="h-5 w-5 text-cyan-400" />
          </span>
          <div>
            <h1 className="text-glow text-2xl font-bold text-white sm:text-3xl">Schedule</h1>
            <p className="mt-1 text-sm text-slate-500">
              Classes, exams, and events — every entry with a join link shows up as a virtual class on a student&apos;s schedule.
            </p>
          </div>
        </div>
      </motion.div>

      {state.status === "unconfigured" && (
        <p className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 text-sm text-slate-500">
          Supabase isn&apos;t configured in this environment, so the schedule can&apos;t load —
          expected in local/preview setups without env vars set.
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="card-glow relative space-y-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md"
      >
        <CornerBrackets colorClass="text-cyan-400/50" alwaysVisible />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sched-title" className="text-sm font-medium text-slate-300">Title</label>
            <input
              id="sched-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Rotational Dynamics — Live Class"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div>
            <label htmlFor="sched-subject" className="text-sm font-medium text-slate-300">Subject</label>
            <input
              id="sched-subject"
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="e.g. Physics"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div>
            <label htmlFor="sched-type" className="text-sm font-medium text-slate-300">Type</label>
            <select
              id="sched-type"
              value={eventType}
              onChange={(event) => setEventType(event.target.value as ScheduleEventType)}
              className="mt-2 w-full appearance-none rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
            >
              <option value="class" className="bg-slate-900">Class</option>
              <option value="exam" className="bg-slate-900">Exam</option>
              <option value="event" className="bg-slate-900">Event</option>
            </select>
          </div>
          <div>
            <label htmlFor="sched-batch" className="text-sm font-medium text-slate-300">
              Batch <span className="text-slate-600">(optional — blank shows to everyone)</span>
            </label>
            <input
              id="sched-batch"
              type="text"
              value={batch}
              onChange={(event) => setBatch(event.target.value)}
              placeholder="e.g. Batch A"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div>
            <label htmlFor="sched-starts" className="text-sm font-medium text-slate-300">Starts</label>
            <input
              id="sched-starts"
              type="datetime-local"
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div>
            <label htmlFor="sched-ends" className="text-sm font-medium text-slate-300">Ends</label>
            <input
              id="sched-ends"
              type="datetime-local"
              value={endsAt}
              onChange={(event) => setEndsAt(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          {eventType === "class" && (
            <div className="sm:col-span-2">
              <label htmlFor="sched-join" className="text-sm font-medium text-slate-300">
                Join link <span className="text-slate-600">(Zoom, Google Meet, etc.)</span>
              </label>
              <input
                id="sched-join"
                type="url"
                value={joinUrl}
                onChange={(event) => setJoinUrl(event.target.value)}
                placeholder="https://meet.google.com/..."
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
          )}
          <div className="sm:col-span-2">
            <label htmlFor="sched-notes" className="text-sm font-medium text-slate-300">
              Notes <span className="text-slate-600">(optional)</span>
            </label>
            <textarea
              id="sched-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              className="mt-2 w-full resize-none rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
        </div>

        {formError && (
          <p className="flex items-center gap-2 text-sm text-rose-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSaving || !supabase}
          className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_20px_-4px_rgba(6,182,212,0.7)] transition-all hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add to Schedule
        </button>
      </form>

      <div className="card-glow relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
        <CornerBrackets colorClass="text-cyan-400/50" alwaysVisible />

        {state.status === "loading" && (
          <div className="space-y-2 p-6">
            <div className="h-14 animate-pulse rounded-xl bg-slate-800/50" />
            <div className="h-14 animate-pulse rounded-xl bg-slate-800/50" />
          </div>
        )}

        {state.status === "ready" && state.entries.length === 0 && (
          <p className="p-6 text-sm text-slate-500">No schedule entries yet — add one above.</p>
        )}

        {state.status === "ready" &&
          state.entries.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 px-6 py-4 last:border-0"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${EVENT_TYPE_BADGE[entry.eventType]}`}
                  >
                    {EVENT_TYPE_LABEL[entry.eventType]}
                  </span>
                  <p className="text-sm font-semibold text-white">{entry.title}</p>
                  {entry.joinUrl && <Video className="h-3.5 w-3.5 text-cyan-400" />}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {entry.subject} · {formatRange(entry.startsAt, entry.endsAt)}
                  {entry.batch ? ` · ${entry.batch}` : " · All batches"}
                </p>
                {entry.joinUrl && (
                  <a
                    href={entry.joinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300"
                  >
                    <Link2 className="h-3 w-3" />
                    {entry.joinUrl}
                  </a>
                )}
              </div>
              <button
                type="button"
                onClick={() => void handleDelete(entry.id)}
                disabled={deletingId === entry.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-rose-500/50 hover:text-rose-300 disabled:opacity-50"
              >
                {deletingId === entry.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Remove
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
