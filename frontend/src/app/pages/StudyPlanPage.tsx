import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Brain, Clock, CheckCircle2, Circle, PlayCircle, Target, Loader2 } from "lucide-react";
import { getStudyPlan, type StudyPlan } from "../lib/api";
import { getAppSession, patchAppSession } from "../lib/session";

export default function StudyPlanPage() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPlan() {
      const session = getAppSession();
      if (!session.studyPlanId) {
        setError("No study plan found. Generate one first.");
        setIsLoading(false);
        return;
      }

      try {
        const loadedPlan = await getStudyPlan(session.studyPlanId);
        if (!active) return;
        setPlan(loadedPlan);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load study plan");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadPlan();
    return () => {
      active = false;
    };
  }, []);

  const completedLessons = plan?.items.filter((item) => item.completed) ?? [];
  const totalDuration = plan?.items.reduce((sum, item) => sum + item.estimatedMinutes, 0) ?? 0;
  const progress = plan && plan.items.length > 0 ? (completedLessons.length / plan.items.length) * 100 : 0;

  const goalTitle = plan?.studyGoal?.goalText ?? "Custom Learning Goal";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-md border border-slate-200 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="size-10 text-blue-600" />
            <h1 className="text-3xl text-slate-900">Your Personalized Study Plan</h1>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2 className="size-5 animate-spin" />
              <span>Loading study plan...</span>
            </div>
          ) : error ? (
            <p className="text-rose-600">{error}</p>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <Target className="size-6 text-purple-600" />
                  <div>
                    <p className="text-sm text-slate-500">Learning Goal</p>
                    <p className="text-slate-900">{goalTitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="size-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-slate-500">Estimated Time</p>
                    <p className="text-slate-900">{plan?.estimatedTime ?? `${totalDuration} minutes`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-6 text-green-600" />
                  <div>
                    <p className="text-sm text-slate-500">Progress</p>
                    <p className="text-slate-900">{completedLessons.length} / {plan?.items.length ?? 0} lessons</p>
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm text-slate-600 mb-2">
                  <span>Overall Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {!isLoading && plan && (
          <div className="space-y-4">
            {plan.items.map((lesson) => {
              const isCompleted = lesson.completed;
              return (
                <div
                  key={lesson.id}
                  className={`bg-white rounded-2xl p-6 shadow-md border transition-all ${isCompleted ? "border-green-300 bg-green-50" : "border-slate-200"}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      {isCompleted ? (
                        <CheckCircle2 className="size-6 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="size-6 text-slate-400 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl text-slate-900">{lesson.title}</h3>
                          <span className="text-sm text-slate-500 flex items-center gap-1">
                            <Clock className="size-4" />
                            {lesson.estimatedMinutes} min
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{lesson.objective}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        patchAppSession({ activeStudyPlanItemId: lesson.id, sessionId: undefined });
                        navigate("/tutor", { state: { studyPlanItemId: lesson.id } });
                      }}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${isCompleted ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md"}`}
                    >
                      <PlayCircle className="size-5" />
                      {isCompleted ? "Review" : "Start Lesson"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => navigate("/setup")}
            className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Change Goal
          </button>
          <button
            onClick={() => {
              const firstLessonId = plan?.items[0]?.id;
              patchAppSession({ activeStudyPlanItemId: firstLessonId, sessionId: undefined });
              navigate("/tutor", { state: { studyPlanItemId: firstLessonId } });
            }}
            disabled={!plan?.items.length}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-md disabled:opacity-50"
          >
            Start First Lesson
          </button>
        </div>
      </div>
    </div>
  );
}
