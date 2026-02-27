import React, { ForwardedRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownEditorProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  preview?: boolean;
}

const MarkdownEditor = React.forwardRef(function MarkdownEditor(
  { value, onChange, placeholder, preview = false }: MarkdownEditorProps,
  ref: ForwardedRef<HTMLTextAreaElement>
) {
  return (
    <div>
      {!preview ? (
        <textarea
          ref={ref}
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
});

export default MarkdownEditor;
