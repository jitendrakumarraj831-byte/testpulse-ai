"use client";

import { useRef, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";

interface QuestionDropZoneProps {
  isProcessing: boolean;
  onFile: (file: File) => void;
}

export function QuestionDropZone({ isProcessing, onFile }: QuestionDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onFile(file);
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        if (!isProcessing) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        if (!isProcessing) handleFiles(event.dataTransfer.files);
      }}
      onClick={() => !isProcessing && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
      }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center backdrop-blur-md transition-all duration-300 ${
        isDragging
          ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_45px_-10px_rgba(6,182,212,0.7)]"
          : "border-slate-700 bg-slate-900/40 hover:border-cyan-500/50 hover:bg-slate-900/60"
      } ${isProcessing ? "pointer-events-none opacity-60" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.csv"
        className="hidden"
        disabled={isProcessing}
        onChange={(event) => handleFiles(event.target.files)}
      />

      <span
        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/30 transition-transform duration-300 ${
          isDragging ? "scale-110" : ""
        }`}
      >
        {isProcessing ? (
          <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />
        ) : (
          <UploadCloud className="h-7 w-7 text-cyan-400" />
        )}
      </span>

      <p className="mt-4 text-sm font-semibold text-white">
        {isProcessing
          ? "Reading your file…"
          : "Drag & drop your Excel or CSV file here"}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        or click to browse &middot; .xlsx and .csv supported
      </p>
    </div>
  );
}
