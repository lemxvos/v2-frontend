import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
  preview = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  preview?: boolean;
}) {
  return (
    <div>
      {!preview ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[60vh] bg-[#0d0d0f] border border-white/5 rounded-xl px-5 py-4 text-sm text-[#ddd] placeholder-[#333] focus:outline-none focus:border-white/10 resize-none leading-relaxed font-mono transition-colors"
        />
      ) : (
        <div className="prose prose-invert max-w-none bg-[#0d0d0f] border border-white/5 rounded-xl p-5 text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || ""}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
