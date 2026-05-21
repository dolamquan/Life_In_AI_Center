import type { Evaluation } from "../lib/api";
import { CheckCircle2, ThumbsUp, Lightbulb, ArrowRight } from "lucide-react";

type FeedbackCardProps = {
  evaluation: Evaluation;
};

export default function FeedbackCard({ evaluation }: FeedbackCardProps) {
  return (
    <div className="max-w-2xl mx-auto bg-white border-2 border-green-300 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <CheckCircle2 className="size-6 text-green-600" />
        <div>
          <h3 className="text-lg text-slate-900">Answer Feedback</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Score:</span>
            <span className="text-lg text-green-600">{evaluation.score} / 5</span>
          </div>
        </div>
      </div>

      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
        <div className="flex items-start gap-3">
          <ThumbsUp className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm text-green-900 mb-1">Strength</h4>
            <p className="text-sm text-slate-700">{evaluation.strength}</p>
          </div>
        </div>
      </div>

      <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-start gap-3">
          <Lightbulb className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm text-amber-900 mb-1">Area for Improvement</h4>
            <p className="text-sm text-slate-700">{evaluation.improvement}</p>
          </div>
        </div>
      </div>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h4 className="text-sm text-blue-900 mb-2">Enhanced Answer</h4>
        <p className="text-sm text-slate-700">{evaluation.betterAnswer}</p>
      </div>

      <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
        <div className="flex items-start gap-3">
          <ArrowRight className="size-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm text-purple-900 mb-1">Follow-up Question</h4>
            <p className="text-sm text-slate-700">{evaluation.followUpQuestion}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
