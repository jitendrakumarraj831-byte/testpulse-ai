import { Bot, User } from "lucide-react";
import { MarkdownMessage } from "@/components/ai-guru/MarkdownMessage";
import type { ChatMessage } from "@/lib/ai-guru/types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-3">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-cyan-50 sm:max-w-[70%]">
          {message.content}
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 ring-1 ring-cyan-500/30">
          <User className="h-4 w-4 text-cyan-300" />
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/10 ring-1 ring-violet-500/30">
        <Bot className="h-4 w-4 text-violet-300" />
      </span>
      <div className="card-glow max-w-[85%] rounded-2xl rounded-tl-sm border border-slate-800 bg-slate-900/60 px-4 py-3 backdrop-blur-md sm:max-w-[70%]">
        <MarkdownMessage content={message.content} />
      </div>
    </div>
  );
}
