export type BackendTutorMode = "DOCUMENT_GROUNDED" | "HYBRID";
export type FrontendTutorMode = "document" | "hybrid";

export type Tutor = {
  id: number;
  slug: string;
  name: string;
  description: string;
  subject: string;
  starterPrompts: string[];
  suggestedLessons: string[];
};

export type StudyGoalType =
  | "THEORETICAL_UNDERSTANDING"
  | "REAL_LIFE_APPLICATION"
  | "EXAM_PREP"
  | "QUICK_REVIEW"
  | "DEEP_STUDY";

export type StudyGoal = {
  id: number;
  tutorId: number;
  goalText: string;
  goalType: StudyGoalType;
  createdAt: string;
};

export type StudyPlanItem = {
  id: number;
  studyPlanId: number;
  order: number;
  title: string;
  objective: string;
  estimatedMinutes: number;
  completed: boolean;
};

export type StudyPlan = {
  id: number;
  studyGoalId: number;
  estimatedTime: string;
  createdAt: string;
  items: StudyPlanItem[];
  studyGoal?: StudyGoal;
};

export type ChatSource = {
  documentTitle: string;
  chunkIndex: number;
};

export type ChatMessage = {
  id: number;
  sessionId: number;
  role: "user" | "assistant";
  content: string;
  sources: ChatSource[];
  createdAt: string;
};

export type ChatSession = {
  id: number;
  tutorId: number;
  mode: BackendTutorMode;
  createdAt: string;
  updatedAt: string;
};

export type Question = {
  id: number;
  sessionId: number;
  questionText: string;
  questionType: "KNOWLEDGE" | "REFLECTION";
  createdAt: string;
};

export type Evaluation = {
  id: number;
  questionId: number;
  studentAnswer: string;
  score: number;
  strength: string;
  improvement: string;
  betterAnswer: string;
  followUpQuestion: string;
  createdAt: string;
};

export type Example = {
  title: string;
  description: string;
};

export type SessionSummary = {
  id: number;
  sessionId: number;
  summaryText: string;
  completedLessons: string[];
  keyConcepts: string[];
  strengths: string[];
  improvementAreas: string[];
  recommendedNextStep: string;
  completedLessonCount: number;
  totalLessonCount: number;
  totalStudyMinutes: number;
  averageScore: number | null;
  createdAt: string;
  updatedAt: string;
};

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) {
        message = body.error;
      }
    } catch {
      // Ignore JSON parsing errors and keep the default message.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function toBackendMode(mode: FrontendTutorMode): BackendTutorMode {
  return mode === "hybrid" ? "HYBRID" : "DOCUMENT_GROUNDED";
}

export function toFrontendMode(mode: BackendTutorMode): FrontendTutorMode {
  return mode === "HYBRID" ? "hybrid" : "document";
}

export async function getTutors() {
  return request<Tutor[]>("/api/tutors");
}

export async function createStudyGoal(tutorId: number, goalText: string, goalType: StudyGoalType) {
  return request<StudyGoal>(`/api/tutors/${tutorId}/study-goals`, {
    method: "POST",
    body: JSON.stringify({ goalText, goalType }),
  });
}

export async function generateStudyPlan(tutorId: number, studyGoalId: number) {
  return request<StudyPlan>(`/api/tutors/${tutorId}/study-plans/generate`, {
    method: "POST",
    body: JSON.stringify({ studyGoalId }),
  });
}

export async function getStudyPlan(studyPlanId: number) {
  return request<StudyPlan>(`/api/study-plans/${studyPlanId}`);
}

export async function completeStudyPlanItem(itemId: number) {
  return request<StudyPlanItem>(`/api/study-plans/items/${itemId}/complete`, {
    method: "PATCH",
  });
}

export async function createChatSession(tutorId: number, mode: FrontendTutorMode) {
  return request<ChatSession>("/api/chat/sessions", {
    method: "POST",
    body: JSON.stringify({ tutorId, mode: toBackendMode(mode) }),
  });
}

export async function getChatMessages(sessionId: number) {
  return request<ChatMessage[]>(`/api/chat/sessions/${sessionId}/messages`);
}

export async function sendChatMessage(
  sessionId: number,
  message: string,
  mode: FrontendTutorMode,
  studyPlanItemId?: number
) {
  return request<ChatMessage & { mode: BackendTutorMode }>(
    `/api/chat/sessions/${sessionId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({
        message,
        mode: toBackendMode(mode),
        studyPlanItemId,
      }),
    }
  );
}

export async function generateQuestion(sessionId: number, questionType: "KNOWLEDGE" | "REFLECTION") {
  return request<Question>(`/api/chat/sessions/${sessionId}/questions`, {
    method: "POST",
    body: JSON.stringify({ questionType }),
  });
}

export async function evaluateAnswer(
  questionId: number,
  answer: string,
  mode: FrontendTutorMode
) {
  return request<Evaluation>(`/api/questions/${questionId}/evaluate`, {
    method: "POST",
    body: JSON.stringify({ answer, mode: toBackendMode(mode) }),
  });
}

export async function generateExamples(tutorId: number, category: string, mode: FrontendTutorMode) {
  return request<{ examples: Example[] }>(`/api/tutors/${tutorId}/examples`, {
    method: "POST",
    body: JSON.stringify({ category, mode: toBackendMode(mode) }),
  });
}

export async function generateSessionSummary(sessionId: number) {
  return request<SessionSummary>(`/api/chat/sessions/${sessionId}/summary`, {
    method: "POST",
  });
}
