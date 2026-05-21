import type { FrontendTutorMode, Tutor } from "./api";

export type AppSessionState = {
  tutorId?: number;
  tutor?: Tutor;
  studyGoalId?: number;
  studyPlanId?: number;
  sessionId?: number;
  currentMode?: FrontendTutorMode;
  activeStudyPlanItemId?: number;
};

const STORAGE_KEY = "liac-app-session";

export function getAppSession(): AppSessionState {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as AppSessionState;
  } catch {
    return {};
  }
}

export function patchAppSession(patch: Partial<AppSessionState>) {
  const next = { ...getAppSession(), ...patch };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearAppSession() {
  window.localStorage.removeItem(STORAGE_KEY);
}
