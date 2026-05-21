import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/LandingPage";
import GoalSetupPage from "./pages/GoalSetupPage";
import StudyPlanPage from "./pages/StudyPlanPage";
import TutorChatPage from "./pages/TutorChatPage";
import ReflectionPage from "./pages/ReflectionPage";
import PracticeTestPage from "./pages/PracticeTestPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/setup",
    Component: GoalSetupPage,
  },
  {
    path: "/plan",
    Component: StudyPlanPage,
  },
  {
    path: "/tutor",
    Component: TutorChatPage,
  },
  {
    path: "/practice-test",
    Component: PracticeTestPage,
  },
  {
    path: "/reflection",
    Component: ReflectionPage,
  },
]);
