import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Brain,
  CheckCircle2,
  HelpCircle,
  Send,
  Loader2,
  ArrowLeft,
  RotateCcw,
  ThumbsUp,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import {
  completeStudyPlanItem,
  evaluateAnswer,
  generateQuestion,
  type Evaluation,
  type FrontendTutorMode,
  type Question,
} from "../lib/api";
import { getAppSession } from "../lib/session";

type PracticeTestLocationState = {
  sessionId?: number;
  mode?: FrontendTutorMode;
  activeStudyPlanItemId?: number;
  lessonTitle?: string;
};

export default function PracticeTestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state ?? {}) as PracticeTestLocationState;

  const session = getAppSession();
  const sessionId = routeState.sessionId ?? session.sessionId;
  const mode = routeState.mode ?? session.currentMode ?? "document";
  const activeStudyPlanItemId = routeState.activeStudyPlanItemId ?? session.activeStudyPlanItemId;
  const lessonTitle = routeState.lessonTitle;

  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passed, setPassed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadQuestion() {
    if (!sessionId) {
      setError("No active session. Go back to the chat and start a session first.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const q = await generateQuestion(sessionId, "KNOWLEDGE");
      setQuestion(q);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate question");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadQuestion();
  }, []);

  async function handleSubmit() {
    if (!question || !answer.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await evaluateAnswer(question.id, answer.trim(), mode);
      setEvaluation(result);
      if (result.score >= 3) {
        if (activeStudyPlanItemId) {
          try {
            await completeStudyPlanItem(activeStudyPlanItemId);
          } catch {
            // best-effort — don't block the pass screen
          }
        }
        setPassed(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to evaluate answer");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTryAgain() {
    setQuestion(null);
    setAnswer("");
    setEvaluation(null);
    setPassed(false);
    await loadQuestion();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/tutor")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="size-5" />
            <span className="text-sm">Back to Chat</span>
          </button>
          <div className="h-5 w-px bg-slate-300" />
          <div className="flex items-center gap-2">
            <Brain className="size-6 text-blue-600" />
            <div>
              <h1 className="text-lg text-slate-900">Practice Test</h1>
              {lessonTitle && <p className="text-xs text-slate-500">{lessonTitle}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {/* Loading */}
        {isLoading && (
          <div className="bg-white rounded-2xl p-12 shadow-md border border-slate-200 flex flex-col items-center gap-4">
            <Loader2 className="size-10 text-blue-600 animate-spin" />
            <p className="text-slate-600">Generating your practice question...</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="bg-rose-50 border border-rose-300 rounded-2xl p-6">
            <p className="text-rose-700 text-sm">{error}</p>
            <button
              onClick={() => navigate("/tutor")}
              className="mt-4 text-sm text-rose-600 underline"
            >
              Go back to chat
            </button>
          </div>
        )}

        {/* Passed screen */}
        {passed && evaluation && (
          <div className="bg-white border-2 border-green-400 rounded-2xl p-10 shadow-lg text-center">
            <CheckCircle2 className="size-20 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl text-green-900 mb-2">You Passed!</h2>
            <p className="text-green-700 mb-1">
              Score: <span className="text-2xl">{evaluation.score} / 5</span>
            </p>
            {lessonTitle && (
              <p className="text-green-600 mt-2 mb-6">
                <strong>"{lessonTitle}"</strong> is now complete.
              </p>
            )}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 text-left">
              <div className="flex items-start gap-3">
                <ThumbsUp className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm text-green-900 mb-1">What you got right</h4>
                  <p className="text-sm text-slate-700">{evaluation.strength}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate("/plan")}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                Back to Study Plan
              </button>
              <button
                onClick={() => navigate("/tutor")}
                className="px-6 py-3 border border-green-400 text-green-700 rounded-xl hover:bg-green-50 transition-colors"
              >
                Continue Chatting
              </button>
            </div>
          </div>
        )}

        {/* Question + answer form */}
        {!isLoading && !error && question && !passed && (
          <>
            <div className="bg-white rounded-2xl border-2 border-blue-300 p-8 shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle className="size-7 text-blue-600" />
                <div>
                  <h2 className="text-xl text-slate-900">Knowledge Check</h2>
                  <p className="text-sm text-slate-500">
                    Score 3/5 or higher to complete this lesson
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
                <p className="text-slate-900 text-lg leading-relaxed">{question.questionText}</p>
              </div>

              {!evaluation && (
                <>
                  <label className="block text-sm text-slate-700 mb-2">Your answer:</label>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={5}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 mb-4"
                  />
                  <button
                    onClick={() => void handleSubmit()}
                    disabled={!answer.trim() || isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="size-5" />
                    {isSubmitting ? "Checking Answer..." : "Submit Answer"}
                  </button>
                </>
              )}
            </div>

            {/* Feedback for failed attempt */}
            {evaluation && evaluation.score < 3 && (
              <div className="space-y-4">
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6">
                  <p className="text-lg text-amber-900 mb-1">
                    Score: <span className="font-semibold">{evaluation.score} / 5</span>
                  </p>
                  <p className="text-sm text-amber-700">
                    You need 3 or higher to pass. Review the feedback and try again!
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                    <ThumbsUp className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm text-green-900 mb-1">Strength</h4>
                      <p className="text-sm text-slate-700">{evaluation.strength}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                    <Lightbulb className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm text-amber-900 mb-1">Area for Improvement</h4>
                      <p className="text-sm text-slate-700">{evaluation.improvement}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <h4 className="text-sm text-blue-900 mb-2">Enhanced Answer</h4>
                    <p className="text-sm text-slate-700">{evaluation.betterAnswer}</p>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-3">
                    <ArrowRight className="size-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm text-purple-900 mb-1">Follow-up to think about</h4>
                      <p className="text-sm text-slate-700">{evaluation.followUpQuestion}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => void handleTryAgain()}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    <RotateCcw className="size-5" />
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate("/tutor")}
                    className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Go Back to Chat
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
