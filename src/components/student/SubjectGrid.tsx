"use client";

import { SUBJECTS } from "@/lib/student/subjects";
import { SubjectCard } from "@/components/student/SubjectCard";

export function SubjectGrid() {
  return (
    <section className="px-6 pb-24 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            Choose Your Battlefield
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Every subject is calibrated by our AI engine — pick one to enter
            the exam zone.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SUBJECTS.map((subject, index) => (
            <SubjectCard key={subject.slug} subject={subject} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
