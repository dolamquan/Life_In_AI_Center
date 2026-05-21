import prisma from '../config/prisma';

export type StudyGoalType =
  | 'THEORETICAL_UNDERSTANDING'
  | 'REAL_LIFE_APPLICATION'
  | 'EXAM_PREP'
  | 'QUICK_REVIEW'
  | 'DEEP_STUDY';

export async function createStudyGoal(
  tutorId: number,
  goalText: string,
  goalType: StudyGoalType
) {
  const tutor = await prisma.tutor.findUnique({ where: { id: tutorId } });
  if (!tutor) return null;

  return prisma.studyGoal.create({
    data: { tutorId, goalText, goalType },
  });
}
