import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { CalendarClock, Link2, Video } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { ScheduleEntry, ScheduleEventType } from "@/lib/academic-hub/types";

export const metadata: Metadata = {
  title: "Schedule | TestPulse AI",
  description: "Your upcoming classes, exams, and events.",
};

export const dynamic = "force-dynamic";

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

function formatDateHeading(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function formatTimeRange(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const end = new Date(endsAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${start} – ${end}`;
}

export default async function StudentSchedulePage() {
  noStore();

  if (!isSupabaseConfigured) {
    redirect("/auth/login?redirect=/student/schedule");
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/student/schedule");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("batch")
    .eq("id", user.id)
    .maybeSingle();

  const { data } = await supabase
    .from("class_schedule")
    .select("id, title, subject, event_type, batch, starts_at, ends_at, join_url, notes")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  const myBatch = profile?.batch ?? null;
  const entries: ScheduleEntry[] = ((data ?? []) as ScheduleRow[])
    .filter((row) => !row.batch || row.batch === myBatch)
    .map((row) => ({
      id: row.id,
      title: row.title,
      subject: row.subject,
      eventType: row.event_type,
      batch: row.batch,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      joinUrl: row.join_url,
      notes: row.notes,
    }));

  const groups = new Map<string, ScheduleEntry[]>();
  for (const entry of entries) {
    const dayKey = entry.startsAt.slice(0, 10);
    const group = groups.get(dayKey);
    if (group) {
      group.push(entry);
    } else {
      groups.set(dayKey, [entry]);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-10 lg:px-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-300">
          <CalendarClock className="h-3.5 w-3.5" />
          Your schedule
        </div>
        <h1 className="text-glow mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Upcoming Classes &amp; Events
        </h1>
        <p className="mt-2 max-w-2xl text-base text-slate-400">
          Live classes with a join link, exams, and institute events — everything ahead of you.
        </p>
      </div>

      {entries.length === 0 && (
        <p className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-500">
          Nothing on your schedule yet — check back once your institute publishes classes or events.
        </p>
      )}

      <div className="space-y-8">
        {[...groups.entries()].map(([day, dayEntries]) => (
          <div key={day}>
            <h2 className="text-sm font-semibold text-slate-400">
              {formatDateHeading(dayEntries[0].startsAt)}
            </h2>
            <div className="mt-3 space-y-3">
              {dayEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${EVENT_TYPE_BADGE[entry.eventType]}`}
                      >
                        {EVENT_TYPE_LABEL[entry.eventType]}
                      </span>
                      <p className="text-sm font-semibold text-white">{entry.title}</p>
                    </div>
                    <p className="text-xs text-slate-500">
                      {entry.subject} · {formatTimeRange(entry.startsAt, entry.endsAt)}
                    </p>
                  </div>
                  {entry.notes && <p className="mt-2 text-sm text-slate-400">{entry.notes}</p>}
                  {entry.joinUrl && (
                    <a
                      href={entry.joinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_20px_-4px_rgba(6,182,212,0.7)] transition-all hover:bg-cyan-400"
                    >
                      <Video className="h-4 w-4" />
                      Join Class
                      <Link2 className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
