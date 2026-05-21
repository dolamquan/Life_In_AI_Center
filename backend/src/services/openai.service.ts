import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function getChatCompletion(messages: Message[]): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
  });
  return response.choices[0]?.message?.content ?? '';
}

export async function getJsonCompletion<T>(messages: Message[]): Promise<T> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages,
  });
  const content = response.choices[0]?.message?.content ?? '{}';
  return JSON.parse(content) as T;
}
