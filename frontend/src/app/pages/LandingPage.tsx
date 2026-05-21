import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Brain, BookOpen, Sparkles } from "lucide-react";
import { getTutors, type Tutor } from "../lib/api";
import { clearAppSession, patchAppSession } from "../lib/session";

export default function LandingPage() {
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadTutor() {
      try {
        const tutors = await getTutors();
        if (!active) return;

        const firstTutor = tutors[0] ?? null;
        setTutor(firstTutor);
        if (firstTutor) {
          clearAppSession();
          patchAppSession({ tutorId: firstTutor.id, tutor: firstTutor, currentMode: "document" });
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load tutor");
        }
      }
    }

    loadTutor();
    return () => {
      active = false;
    };
  }, []);

  const promptChips = tutor?.starterPrompts ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="size-12 text-blue-600" />
            <h1 className="text-5xl text-slate-900">{tutor?.name ?? "Confirmation Bias Tutor"}</h1>
          </div>
          <h2 className="text-3xl text-slate-700 mb-4">Learn Confirmation Bias with an AI Tutor</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {tutor?.description ??
              "Master critical thinking skills through personalized lessons, interactive practice, and an intelligent AI tutor that adapts to your learning style."}
          </p>
          {error && (
            <p className="mt-4 text-sm text-rose-600">
              {error}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="size-8 text-purple-600" />
              <h3 className="text-2xl text-slate-900">Document-Grounded Tutor</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Learn from carefully curated materials. The tutor prioritizes accurate,
              source-based explanations and avoids unsupported claims.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="size-2 bg-purple-500 rounded-full"></div>
              <span>Evidence-based responses</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="size-8 text-blue-600" />
              <h3 className="text-2xl text-slate-900">Hybrid AI Tutor</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Start from the source materials, then explore broader examples and
              practical connections to school, social media, and AI tools.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="size-2 bg-blue-500 rounded-full"></div>
              <span>Enhanced with real-life context</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          <button
            onClick={() => navigate("/setup")}
            disabled={!tutor}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-xl text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            Start Learning
          </button>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-md border border-slate-200">
          <h4 className="text-lg text-slate-700 mb-4">Quick Start Questions:</h4>
          <div className="flex flex-wrap gap-3">
            {promptChips.map((prompt) => (
              <button
                key={prompt}
                onClick={() => navigate("/tutor", { state: { initialPrompt: prompt } })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm transition-colors border border-slate-300"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
