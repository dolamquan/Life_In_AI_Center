import { useState } from "react";
import { HelpCircle, Send } from "lucide-react";

type QuestionCardProps = {
  question: string;
  questionType: "KNOWLEDGE" | "REFLECTION";
  onSubmit: (answer: string) => void;
  isSubmitting?: boolean;
};

export default function QuestionCard({ question, questionType, onSubmit, isSubmitting = false }: QuestionCardProps) {
  const [answer, setAnswer] = useState("");

  return (
    <div className="max-w-2xl mx-auto bg-white border-2 border-blue-300 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <HelpCircle className="size-6 text-blue-600" />
        <div>
          <h3 className="text-lg text-slate-900">Practice Question</h3>
          <span className="text-sm text-blue-600">
            {questionType === "REFLECTION" ? "Reflection" : "Knowledge Check"}
          </span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
        <p className="text-slate-900">{question}</p>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-slate-700 mb-2">Your answer:</label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          className="w-full px-4 py-3 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          rows={4}
        />
      </div>

      <button
        onClick={() => onSubmit(answer)}
        disabled={!answer.trim() || isSubmitting}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="size-5" />
        {isSubmitting ? "Checking Answer..." : "Submit Answer"}
      </button>
    </div>
  );
}
