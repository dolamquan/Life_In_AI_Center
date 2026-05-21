import prisma from '../config/prisma';

function parseTutor(tutor: {
  id: number;
  slug: string;
  name: string;
  description: string;
  subject: string;
  starterPrompts: string;
  suggestedLessons: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...tutor,
    starterPrompts: JSON.parse(tutor.starterPrompts) as string[],
    suggestedLessons: JSON.parse(tutor.suggestedLessons) as string[],
  };
}

export async function getAllTutors() {
  const tutors = await prisma.tutor.findMany({
    orderBy: { createdAt: 'asc' },
  });
  return tutors.map(parseTutor);
}

export async function getTutorById(id: number) {
  const tutor = await prisma.tutor.findUnique({ where: { id } });
  if (!tutor) return null;
  return parseTutor(tutor);
}
