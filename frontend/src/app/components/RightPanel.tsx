import type { ChatSource } from "../lib/api";
import {
  Lightbulb,
  ClipboardCheck,
  BookMarked,
  File,
} from "lucide-react";

type RightPanelProps = {
  onToolClick: (tool: "examples" | "question" | "evaluate" | "summarize") => void;
  mode: "document" | "hybrid";
  sources: ChatSource[];
};

export default function RightPanel({ onToolClick, mode, sources }: RightPanelProps) {
  const tools = [
    {
      id: "examples" as const,
      icon: Lightbulb,
      label: "Generate Real-Life Examples",
      color: "amber",
    },
    {
      id: "question" as const,
      icon: ClipboardCheck,
      label: "Generate Practice Test",
      color: "blue",
    },
    {
      id: "summarize" as const,
      icon: BookMarked,
      label: "Summarize What I Learned",
      color: "purple",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      amber: "hover:bg-amber-50 hover:border-amber-300",
      blue: "hover:bg-blue-50 hover:border-blue-300",
      green: "hover:bg-green-50 hover:border-green-300",
      purple: "hover:bg-purple-50 hover:border-purple-300",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="hidden lg:block w-96 bg-white border-l border-slate-200 flex-col overflow-y-auto">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg text-slate-900 mb-2">Learning Tools</h3>
        <p className="text-sm text-slate-500 mb-4">
          {mode === "document"
            ? "Document-grounded mode keeps answers tightly anchored to source material."
            : "Hybrid mode starts from the documents, then expands with broader examples."}
        </p>
        <div className="space-y-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onToolClick(tool.id)}
                className={`w-full flex items-center gap-3 p-3 border border-slate-200 rounded-xl transition-all ${getColorClasses(tool.color)}`}
              >
                <Icon className="size-5 text-slate-700 flex-shrink-0" />
                <span className="text-sm text-slate-700 text-left">{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg text-slate-900 mb-4">Latest Sources</h3>
        {sources.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            Send a question in document-grounded mode to see source documents here.
          </div>
        ) : (
          <div className="space-y-3">
            {sources.map((source, index) => (
              <div
                key={`${source.documentTitle}-${source.chunkIndex}-${index}`}
                className="p-4 border rounded-xl border-blue-300 bg-blue-50"
              >
                <div className="flex items-start gap-3 mb-2">
                  <File className="size-5 text-slate-600 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm text-slate-900 break-words">{source.documentTitle}</p>
                    <p className="text-xs text-slate-500">Chunk {source.chunkIndex}</p>
                  </div>
                </div>
                <div className="inline-block rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                  Used in the latest answer
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
