import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Brain,
  CheckCircle2,
  Lightbulb,
  ThumbsUp,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Loader2,
} from "lucide-react";
import { generateSessionSummary, type SessionSummary } from "../lib/api";
import { clearAppSession, getAppSession } from "../lib/session";

type ReflectionLocationState = {
  summary?: SessionSummary;
};

export default function ReflectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [summary, setSummary] = useState<SessionSummary | null>(
    ((location.state ?? {}) as ReflectionLocationState).summary ?? null
  );
  const [isLoading, setIsLoading] = useState(!summary);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      if (summary) return;

      const sessionId = getAppSession().sessionId;
      if (!sessionId) {
        setError("No active session found for reflection.");
        setIsLoading(false);
        return;
      }

      try {
        const generated = await generateSessionSummary(sessionId);
        if (!active) return;
        setSummary(generated);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load summary");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadSummary();
    return () => {
      active = false;
    };
  }, [summary]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="size-12 text-blue-600" />
            <h1 className="text-4xl text-slate-900">Learning Summary</h1>
          </div>
          <p className="text-lg text-slate-600">
            Reflect on your progress and plan your next steps
          </p>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl p-8 shadow-md border border-slate-200 flex items-center gap-3 text-slate-600">
            <Loader2 className="size-5 animate-spin text-blue-600" />
            <span>Generating your reflection summary...</span>
          </div>
        ) : error || !summary ? (
          <div className="bg-white rounded-2xl p-8 shadow-md border border-slate-200">
            <p className="text-rose-600">{error ?? "No summary available."}</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl p-8 shadow-md border border-slate-200 mb-6">
              <h2 className="text-2xl text-slate-900 mb-4">What You Learned</h2>
              <p className="text-slate-600 mb-6">{summary.summaryText}</p>

              <div className="mb-6">
                <h3 className="text-lg text-slate-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-green-600" />
                  Completed Lessons ({summary.completedLessonCount})
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {summary.completedLessons.length > 0 ? (
                    summary.completedLessons.map((lesson) => (
                      <div
                        key={lesson}
                        className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <CheckCircle2 className="size-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{lesson}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
                      No lessons were marked complete yet, but your conversation history was still summarized.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg text-slate-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="size-5 text-amber-600" />
                  Key Concepts Mastered
                </h3>
                <div className="space-y-2">
                  {summary.keyConcepts.map((concept) => (
                    <div
                      key={concept}
                      className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <div className="size-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                      <span className="text-sm text-slate-700">{concept}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md border border-slate-200 mb-6">
              <h2 className="text-2xl text-slate-900 mb-4 flex items-center gap-2">
                <ThumbsUp className="size-6 text-green-600" />
                Your Strengths
              </h2>
              <div className="space-y-3">
                {summary.strengths.map((strength) => (
                  <div
                    key={strength}
                    className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <ThumbsUp className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md border border-slate-200 mb-6">
              <h2 className="text-2xl text-slate-900 mb-4 flex items-center gap-2">
                <AlertCircle className="size-6 text-amber-600" />
                Areas to Review
              </h2>
              <div className="space-y-3">
                {summary.improvementAreas.map((area) => (
                  <div
                    key={area}
                    className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg"
                  >
                    <BookOpen className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{area}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 shadow-lg mb-8 text-white">
              <div className="flex items-start gap-4">
                <ArrowRight className="size-8 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl mb-3">Recommended Next Step</h2>
                  <p className="text-blue-50 mb-4">{summary.recommendedNextStep}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="size-2 bg-white rounded-full"></div>
                    <span className="text-blue-100">Estimated time studied: {summary.totalStudyMinutes} minutes</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  clearAppSession();
                  navigate("/setup");
                }}
                className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="size-5" />
                Restart with New Goal
              </button>
              <button
                onClick={() => navigate("/tutor")}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                <ArrowRight className="size-5" />
                Continue Learning
              </button>
            </div>

            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="text-3xl text-blue-600 mb-2">
                  {summary.completedLessonCount} / {summary.totalLessonCount}
                </div>
                <div className="text-sm text-slate-600">Lessons Completed</div>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="text-3xl text-purple-600 mb-2">{summary.totalStudyMinutes} min</div>
                <div className="text-sm text-slate-600">Total Study Time</div>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="text-3xl text-green-600 mb-2">
                  {summary.averageScore !== null ? `${summary.averageScore.toFixed(1)} / 5` : "N/A"}
                </div>
                <div className="text-sm text-slate-600">Average Score</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
