import { getJsonCompletion } from './openai.service';
import { retrieveRelevantChunks } from './retrieval.service';
import { type TutorMode } from './prompt.service';

type ExamplesResponse = {
  examples: { title: string; description: string }[];
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  school: 'academic settings, studying, and classroom behavior',
  'teen-life': 'everyday teenage experiences and decision-making',
  'social-media': 'social media platforms like TikTok, Instagram, and YouTube',
  'friend-groups': 'peer pressure, friend groups, and social dynamics',
  news: 'news consumption, media bias, and political beliefs',
  'ai-chatbots': 'AI tools, chatbots, and how algorithms reinforce beliefs',
  'decision-making': 'everyday choices, risk assessment, and problem solving',
};

export async function generateExamples(
  tutorId: number,
  category: string,
  mode: TutorMode
) {
  const categoryDesc = CATEGORY_DESCRIPTIONS[category] ?? category;
  const query = `confirmation bias examples ${categoryDesc}`;

  const topK = mode === 'DOCUMENT_GROUNDED' ? 4 : 2;
  const chunks = await retrieveRelevantChunks(query, topK);
  const context = chunks.map((c) => c.text).join('\n\n');

  const systemContent =
    mode === 'DOCUMENT_GROUNDED'
      ? `You are an AI tutor. Generate 2-3 clear examples of confirmation bias in the context of "${categoryDesc}" strictly based on the source material provided. Do not add examples not supported by the sources.
${context ? `\nSource material:\n${context}` : '\nNo source material available — say you cannot provide grounded examples for this category.'}`
      : `You are an AI tutor. Generate 2-3 engaging, age-appropriate examples of confirmation bias in the context of "${categoryDesc}". Use the source material as a foundation, then extend with additional real-life examples.
${context ? `\nSource material:\n${context}` : ''}`;

  return getJsonCompletion<ExamplesResponse>([
    { role: 'system', content: systemContent },
    {
      role: 'user',
      content: `Give me 2-3 examples of confirmation bias related to ${categoryDesc}. Return JSON: { "examples": [{ "title": "...", "description": "..." }] }`,
    },
  ]);
}
