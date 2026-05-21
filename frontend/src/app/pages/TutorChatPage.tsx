import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Brain,
  BookOpen,
  Sparkles,
  Send,
  Loader2,
  Menu,
  X,
  CheckCircle2,
  Circle,
} from "lucide-react";
import RightPanel from "../components/RightPanel";
import ExampleCards from "../components/ExampleCards";
import {
  createChatSession,
  generateExamples,
  generateSessionSummary,
  getChatMessages,
  getStudyPlan,
  getTutors,
  sendChatMessage,
  toFrontendMode,
  type ChatMessage,
  type Example,
  type FrontendTutorMode,
  type StudyPlan,
  type Tutor,
} from "../lib/api";
import { getAppSession, patchAppSession } from "../lib/session";

type TutorLocationState = {
  initialPrompt?: string;
  studyPlanItemId?: number;
};

function lessonCategory(lessonTitle?: string) {
  const normalized = lessonTitle?.toLowerCase() ?? "";
  if (normalized.includes("teen")) return { key: "teen-life", label: "Teen Life" };
  if (normalized.includes("social")) return { key: "social-media", label: "Social Media" };
  if (normalized.includes("group")) return { key: "friend-groups", label: "Friend Groups" };
  if (normalized.includes("ai")) return { key: "ai-chatbots", label: "AI Chatbots" };
  if (normalized.includes("everyday")) return { key: "decision-making", label: "Decision-Making" };
  return { key: "school", label: "School" };
}

export default function TutorChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state ?? {}) as TutorLocationState;
  const autoPromptSent = useRef(false);

  const savedSession = getAppSession();
  const [mode, setMode] = useState<FrontendTutorMode>(savedSession.currentMode ?? "document");
  const [tutor, setTutor] = useState<Tutor | null>(savedSession.tutor ?? null);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [activeStudyPlanItemId, setActiveStudyPlanItemId] = useState<number | undefined>(
    routeState.studyPlanItemId ?? savedSession.activeStudyPlanItemId
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [examples, setExamples] = useState<Example[]>([]);
  const [exampleCategoryLabel, setExampleCategoryLabel] = useState("School");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const session = getAppSession();
        let resolvedTutor = session.tutor ?? null;

        if (!resolvedTutor) {
          const tutors = await getTutors();
          resolvedTutor = tutors[0] ?? null;
          if (!resolvedTutor) throw new Error("No tutors are available.");
        }

        if (!active) return;
        setTutor(resolvedTutor);
        patchAppSession({ tutorId: resolvedTutor.id, tutor: resolvedTutor });

        if (session.studyPlanId) {
          const loadedPlan = await getStudyPlan(session.studyPlanId);
          if (!active) return;
          setStudyPlan(loadedPlan);
        }

        let sessionId = session.sessionId;
        if (!sessionId) {
          const createdSession = await createChatSession(resolvedTutor.id, mode);
          sessionId = createdSession.id;
          if (!active) return;
          patchAppSession({ sessionId, currentMode: toFrontendMode(createdSession.mode) });
          setMode(toFrontendMode(createdSession.mode));
        }

        const loadedMessages = await getChatMessages(sessionId);
        if (!active) return;
        setMessages(loadedMessages);
      } catch (bootstrapError) {
        if (active) {
          setError(bootstrapError instanceof Error ? bootstrapError.message : "Failed to load chat");
        }
      } finally {
        if (active) setIsBootstrapping(false);
      }
    }

    bootstrap();
    return () => { active = false; };
  }, [mode]);

  useEffect(() => {
    patchAppSession({ currentMode: mode });
  }, [mode]);

  useEffect(() => {
    if (!routeState.initialPrompt || autoPromptSent.current || isBootstrapping) return;
    autoPromptSent.current = true;
    void handleSendMessage(routeState.initialPrompt);
  }, [isBootstrapping, routeState.initialPrompt]);

  const sessionId = getAppSession().sessionId;

  const activeLesson = useMemo(
    () => studyPlan?.items.find((item) => item.id === activeStudyPlanItemId),
    [activeStudyPlanItemId, studyPlan]
  );

  const latestSources = useMemo(() => {
    return [...messages]
      .reverse()
      .find((m) => m.role === "assistant" && m.sources.length > 0)?.sources ?? [];
  }, [messages]);

  async function refreshMessages() {
    const currentSessionId = getAppSession().sessionId;
    if (!currentSessionId) return;
    setMessages(await getChatMessages(currentSessionId));
  }

  async function handleSendMessage(overrideMessage?: string) {
    const currentSessionId = getAppSession().sessionId;
    const messageText = (overrideMessage ?? input).trim();
    if (!currentSessionId || !messageText) return;

    setError(null);
    setIsSending(true);

    const optimisticMessage: ChatMessage = {
      id: Date.now(),
      sessionId: currentSessionId,
      role: "user",
      content: messageText,
      sources: [],
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInput("");

    try {
      await sendChatMessage(currentSessionId, messageText, mode, activeStudyPlanItemId);
      await refreshMessages();
    } catch (sendError) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      setError(sendError instanceof Error ? sendError.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  }

  async function handleSelectLesson(itemId: number) {
    if (itemId === activeStudyPlanItemId) {
      setSidebarOpen(false);
      return;
    }

    setActiveStudyPlanItemId(itemId);
    patchAppSession({ activeStudyPlanItemId: itemId });
    setSidebarOpen(false);
    setMessages([]);
    setExamples([]);
    setError(null);

    if (!tutor) return;
    try {
      const createdSession = await createChatSession(tutor.id, mode);
      patchAppSession({ sessionId: createdSession.id });
    } catch (selectError) {
      setError(selectError instanceof Error ? selectError.message : "Failed to start lesson");
    }
  }

  async function handleToolClick(tool: "examples" | "question" | "evaluate" | "summarize") {
    const currentSessionId = getAppSession().sessionId;
    if (!tutor || !currentSessionId) return;

    setError(null);

    try {
      if (tool === "examples") {
        const category = lessonCategory(activeLesson?.title);
        const result = await generateExamples(tutor.id, category.key, mode);
        setExamples(result.examples);
        setExampleCategoryLabel(category.label);
        return;
      }

      if (tool === "question") {
        navigate("/practice-test", {
          state: {
            sessionId: currentSessionId,
            mode,
            activeStudyPlanItemId,
            lessonTitle: activeLesson?.title,
          },
        });
        return;
      }

      const summary = await generateSessionSummary(currentSessionId);
      navigate("/reflection", { state: { summary } });
    } catch (toolError) {
      setError(toolError instanceof Error ? toolError.message : "Tool action failed");
    }
  }

  const lessons = studyPlan?.items ?? [];
  const completedLessons = lessons.filter((l) => l.completed).length;

  return (
    <div className="h-screen flex bg-slate-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "block" : "hidden"} md:block w-80 bg-white border-r border-slate-200 flex flex-col`}>
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="size-6 text-blue-600" />
              <h2 className="text-xl text-slate-900">Study Plan</h2>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-500 hover:text-slate-700">
              <X className="size-5" />
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Progress</span>
              <span>{completedLessons} / {lessons.length || tutor?.suggestedLessons.length || 0}</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                style={{ width: `${lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {(lessons.length > 0
              ? lessons
              : (tutor?.suggestedLessons ?? []).map((title, index) => ({ id: index + 1, title, completed: false }))
            ).map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => { if ("estimatedMinutes" in lesson) void handleSelectLesson(lesson.id); }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                  activeStudyPlanItemId === lesson.id ? "bg-blue-50 border border-blue-200" : "hover:bg-slate-100"
                }`}
              >
                {lesson.completed ? (
                  <CheckCircle2 className="size-5 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="size-5 text-slate-400 flex-shrink-0" />
                )}
                <span className="text-sm text-slate-700">{lesson.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() => navigate("/plan")}
            className="w-full px-4 py-2 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Back to Study Plan
          </button>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-slate-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-500 hover:text-slate-700">
                <Menu className="size-5" />
              </button>
              <Brain className="size-6 text-blue-600" />
              <div>
                <h1 className="text-xl text-slate-900">{tutor?.name ?? "AI Tutor"}</h1>
                {activeLesson && <p className="text-sm text-slate-500">{activeLesson.title}</p>}
              </div>
            </div>

            <div className="flex gap-2 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setMode("document")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                  mode === "document" ? "bg-white shadow-sm text-slate-900" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BookOpen className="size-4" />
                Document-Grounded
              </button>
              <button
                onClick={() => setMode("hybrid")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                  mode === "hybrid" ? "bg-white shadow-sm text-slate-900" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sparkles className="size-4" />
                Hybrid AI
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isBootstrapping ? (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 flex items-center gap-3 text-slate-600">
                <Loader2 className="size-5 animate-spin text-blue-600" />
                <span>Preparing your tutor session...</span>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={`${message.id}-${message.createdAt}`}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-2xl rounded-2xl px-6 py-4 ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "bg-white border border-slate-200 text-slate-900"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 space-y-1">
                        <p className="text-xs text-slate-500">Sources:</p>
                        {message.sources.map((source, index) => (
                          <p key={`${source.documentTitle}-${index}`} className="text-xs text-blue-600">
                            • {source.documentTitle} (chunk {source.chunkIndex})
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4">
                    <Loader2 className="size-5 animate-spin text-blue-600" />
                  </div>
                </div>
              )}

              {examples.length > 0 && (
                <ExampleCards examples={examples} categoryLabel={exampleCategoryLabel} />
              )}
            </>
          )}
        </div>

        <div className="px-6 pb-3">
          <div className="flex flex-wrap gap-2">
            {(tutor?.starterPrompts ?? []).slice(0, 4).map((chip) => (
              <button
                key={chip}
                onClick={() => setInput(chip)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm transition-colors border border-slate-300"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border-t border-slate-200 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleSendMessage()}
              placeholder="Ask a question or request help..."
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
            <button
              onClick={() => void handleSendMessage()}
              disabled={!input.trim() || isSending || !sessionId}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="size-5" />
            </button>
          </div>
        </div>
      </div>

      <RightPanel onToolClick={handleToolClick} mode={mode} sources={latestSources} />
    </div>
  );
}
