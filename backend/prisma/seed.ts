/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tutor = await prisma.tutor.upsert({
    where: { slug: 'confirmation-bias-tutor' },
    update: {},
    create: {
      slug: 'confirmation-bias-tutor',
      name: 'Confirmation Bias Tutor',
      description:
        'Learn about confirmation bias through guided lessons, real-life examples, and interactive questions. Choose between Document-Grounded Mode for source-based answers or Hybrid Mode for broader discussion.',
      subject: 'Confirmation Bias',
      starterPrompts: JSON.stringify([
        'What is confirmation bias?',
        'Give me examples of confirmation bias.',
        'How does confirmation bias affect teenagers?',
        'How does confirmation bias affect AI chatbots?',
        'How can I avoid confirmation bias?',
      ]),
      suggestedLessons: JSON.stringify([
        'What is confirmation bias?',
        'Why does confirmation bias happen?',
        'Everyday examples',
        'Confirmation bias in teen life',
        'Confirmation bias in groups and society',
        'Confirmation bias in AI systems',
        'How to reduce confirmation bias',
      ]),
    },
  });

  console.log(`Seeded tutor: ${tutor.name} (id: ${tutor.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
