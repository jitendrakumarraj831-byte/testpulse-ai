"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Bot, RotateCcw, Send, Sparkles } from "lucide-react";
import { MessageBubble } from "@/components/ai-guru/MessageBubble";
import type { ChatMessage } from "@/lib/ai-guru/types";
import type { ChatResponse } from "@/app/api/chat/route";

const MAX_INPUT_LENGTH = 4000;

const SUGGESTED_PROMPTS = [
  "Explain Newton's second law with an example",
  "Walk me through solving a quadratic equation",
  "What's the difference between mitosis and meiosis?",
  "Summarize the main causes of World War I",
];

function makeId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function AiGuruWorkspace() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { id: makeId(), role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setErrorNotice(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = (await response.json()) as ChatResponse;
      setMessages((current) => [
        ...current,
        { id: makeId(), role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      console.error("[ai-guru] Failed to get a reply:", error);
      setErrorNotice("Couldn't reach AI Guru just now. Please try again.");
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "assistant",
          content: "I couldn't reach the AI engine just now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  }

  function handleClear() {
    setMessages([]);
    setErrorNotice(null);
  }

  return (
    <div className="mx-auto flex min-h-[75vh] w-full max-w-4xl flex-1 flex-col px-4 pt-8 pb-4 lg:px-8">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-500/30">
            <Bot className="h-5.5 w-5.5 text-violet-300" />
          </span>
          <div>
            <h1 className="text-glow text-lg font-bold text-white sm:text-xl">AI Guru</h1>
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
              </span>
              24/7 academic doubt solver
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-rose-500/40 hover:text-rose-300"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear chat
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex h-full flex-col items-center justify-center gap-6 text-center"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-500/10 ring-1 ring-violet-500/30">
              <Sparkles className="h-8 w-8 text-violet-300" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">Ask me anything about your studies</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Step-by-step explanations, worked examples, and quick concept
                reviews — available around the clock.
              </p>
            </div>
            <div className="grid w-full max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-left text-sm text-slate-300 backdrop-blur-md transition-all hover:border-violet-500/40 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isLoading && (
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/10 ring-1 ring-violet-500/30">
                  <Bot className="h-4 w-4 text-violet-300" />
                </span>
                <div className="card-glow flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-slate-800 bg-slate-900/60 px-4 py-3.5 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" />
                </div>
              </div>
            )}
            <div ref={scrollAnchorRef} />
          </div>
        )}
      </div>

      {errorNotice && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {errorNotice}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-3 border-t border-slate-800 pt-4">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value.slice(0, MAX_INPUT_LENGTH))}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question… (Shift+Enter for a new line)"
          rows={1}
          disabled={isLoading}
          className="max-h-40 min-h-[3rem] flex-1 resize-none rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500 text-slate-950 shadow-[0_0_25px_-6px_rgba(139,92,246,0.8)] transition-all hover:bg-violet-400 hover:shadow-[0_0_35px_-4px_rgba(139,92,246,0.95)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
