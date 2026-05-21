import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Brain, BookText, Lightbulb, GraduationCap, MessageCircle, Cpu, Loader2 } from "lucide-react";
import {
  createStudyGoal,
  generateStudyPlan,
  getTutors,
  type StudyGoalType,
  type Tutor,
} from "../lib/api";
import { getAppSession, patchAppSession } from "../lib/session";

const goals = [
  {
    id: "theoretical",
    icon: BookText,
    title: "Theoretical Understanding",
    description: "Learn the core concepts, definitions, and psychological foundations of confirmation bias.",
    color: "blue",
    goalType: "THEORETICAL_UNDERSTANDING" as StudyGoalType,
  },
  {
    id: "real-life",
    icon: Lightbulb,
    title: "Real-Life Application",
    description: "Discover how confirmation bias appears in everyday situations and decision-making.",
    color: "amber",
    goalType: "REAL_LIFE_APPLICATION" as StudyGoalType,
  },
  {
    id: "ai-tech",
    icon: Cpu,
    title: "AI and Technology Focus",
    description: "Understand how confirmation bias affects AI systems, algorithms, and technology use.",
    color: "purple",
    goalType: "DEEP_STUDY" as StudyGoalType,
  },
  {
    id: "exam",
    icon: GraduationCap,
    title: "Exam / Quiz Preparation",
    description: "Practice with targeted questions and get ready for assessments with focused study.",
    color: "green",
    goalType: "EXAM_PREP" as StudyGoalType,
  },
  {
    id: "reflection",
    icon: MessageCircle,
    title: "Reflection and Critical Thinking",
    description: "Develop metacognitive skills and learn to identify bias in your own thinking.",
    color: "rose",
    goalType: "DEEP_STUDY" as StudyGoalType,
  },
];

export default function GoalSetupPage() {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [customGoal, setCustomGoal] = useState("");
  const [tutor, setTutor] = useState<Tutor | null>(getAppSession().tutor ?? null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function ensureTutor() {
      if (tutor) return;
      try {
        const tutors = await getTutors();
        if (!active) return;
        const firstTutor = tutors[0] ?? null;
        setTutor(firstTutor);
        if (firstTutor) {
          patchAppSession({ tutorId: firstTutor.id, tutor: firstTutor });
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load tutor");
        }
      }
    }

    ensureTutor();
    return () => {
      active = false;
    };
  }, [tutor]);

  async function handleGeneratePlan() {
    if (!tutor) return;

    const goalConfig = goals.find((goal) => goal.id === selectedGoal);
    const goalText = customGoal.trim() || goalConfig?.title;
    const goalType = goalConfig?.goalType ?? "DEEP_STUDY";

    if (!goalText) return;

    setIsGenerating(true);
    setError(null);

    try {
      const studyGoal = await createStudyGoal(tutor.id, goalText, goalType);
      const studyPlan = await generateStudyPlan(tutor.id, studyGoal.id);

      patchAppSession({
        tutorId: tutor.id,
        tutor,
        studyGoalId: studyGoal.id,
        studyPlanId: studyPlan.id,
        sessionId: undefined,
        activeStudyPlanItemId: studyPlan.items[0]?.id,
      });

      navigate("/plan");
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : "Failed to generate plan");
    } finally {
      setIsGenerating(false);
    }
  }

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-50 border-blue-300 hover:border-blue-500 text-blue-700",
      amber: "bg-amber-50 border-amber-300 hover:border-amber-500 text-amber-700",
      purple: "bg-purple-50 border-purple-300 hover:border-purple-500 text-purple-700",
      green: "bg-green-50 border-green-300 hover:border-green-500 text-green-700",
      rose: "bg-rose-50 border-rose-300 hover:border-rose-500 text-rose-700",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getSelectedColorClasses = (color: string) => {
    const colors = {
      blue: "border-blue-600 ring-2 ring-blue-200",
      amber: "border-amber-600 ring-2 ring-amber-200",
      purple: "border-purple-600 ring-2 ring-purple-200",
      green: "border-green-600 ring-2 ring-green-200",
      rose: "border-rose-600 ring-2 ring-rose-200",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="size-10 text-blue-600" />
            <h1 className="text-4xl text-slate-900">What do you want to learn today?</h1>
          </div>
          <p className="text-lg text-slate-600">
            Choose a learning goal to create your personalized study plan
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {goals.map((goal) => {
            const Icon = goal.icon;
            const isSelected = selectedGoal === goal.id;
            return (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                className={`p-6 rounded-2xl border-2 transition-all text-left ${getColorClasses(goal.color)} ${isSelected ? getSelectedColorClasses(goal.color) : ""}`}
              >
                <Icon className="size-8 mb-3" />
                <h3 className="text-xl mb-2 text-slate-900">{goal.title}</h3>
                <p className="text-sm text-slate-600">{goal.description}</p>
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-md border border-slate-200 mb-8">
          <label className="block text-lg text-slate-700 mb-3">
            Or describe your own goal:
          </label>
          <textarea
            value={customGoal}
            onChange={(event) => setCustomGoal(event.target.value)}
            placeholder="Describe your goal... (e.g., I want to understand how confirmation bias affects social media algorithms)"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            rows={3}
          />
        </div>

        {error && (
          <p className="mb-6 text-center text-sm text-rose-600">{error}</p>
        )}

        <div className="text-center">
          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating || (!selectedGoal && !customGoal.trim()) || !tutor}
            className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-xl text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating && <Loader2 className="size-5 animate-spin" />}
            {isGenerating ? "Generating Study Plan..." : "Generate Study Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
