import type { Example } from "../lib/api";
import { Lightbulb, MessageSquare } from "lucide-react";

type ExampleCardsProps = {
  examples: Example[];
  categoryLabel: string;
};

export default function ExampleCards({ examples, categoryLabel }: ExampleCardsProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-white border-2 border-purple-300 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="size-5 text-purple-600" />
          <h3 className="text-lg text-slate-900">Real-Life Examples</h3>
        </div>
        <p className="text-sm text-slate-600">
          Here are some examples related to {categoryLabel.toLowerCase()}.
        </p>
      </div>

      {examples.map((example, index) => (
        <div
          key={`${example.title}-${index}`}
          className="bg-white border-2 rounded-2xl p-6 shadow-md border-amber-300 bg-amber-50"
        >
          <div className="flex items-center gap-3 mb-3">
            <Lightbulb className="size-6 text-amber-600" />
            <h4 className="text-lg text-slate-900">{example.title}</h4>
          </div>

          <p className="text-sm text-slate-600">{example.description}</p>
        </div>
      ))}
    </div>
  );
}
