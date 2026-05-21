from pathlib import Path

feature_md = """# feature.md

# AI Tutor Platform — Feature Specification

## 1. Project Overview

Build a full-stack AI tutor platform starting with a **Confirmation Bias Tutor**. The tutor helps students understand confirmation bias using uploaded learning materials, then guides them through explanations, examples, questions, feedback, reflection, and exploratory chat.

The application must support two tutor modes:

1. **Document-Grounded Tutor**
   - Answers primarily from the uploaded knowledge base.
   - Prioritizes accuracy, source grounding, and faithful explanation.
   - Avoids unsupported claims.

2. **Hybrid AI Tutor**
   - Uses the uploaded knowledge base first.
   - Can extend beyond the documents using general LLM knowledge.
   - Supports richer examples, personalization, social media/current-life connections, and broader discussion.

The system should be designed so future tutors can be added for other subjects without rebuilding the whole application.

---

## 2. Target Users

### Primary User

Students learning about confirmation bias.

### Secondary User

Instructor, evaluator, or interviewer reviewing the prototype during a live demo.

---

## 3. Core User Stories

### Student Learning

- As a student, I want the tutor to explain confirmation bias in simple language so I can understand the concept quickly.
- As a student, I want to see real-life examples so I can connect the concept to everyday life.
- As a student, I want to ask my own questions so I can explore the topic more deeply.
- As a student, I want the tutor to ask me questions so I can test my understanding.
- As a student, I want feedback on my answers so I know what I got right and what I need to improve.
- As a student, I want a reflection summary so I can remember what I learned.

### Tutor Mode Control

- As a student, I want to switch between Document-Grounded Mode and Hybrid Mode so I can choose between source-based learning and broader discussion.
- As a student, I want to know when the answer is based on the uploaded materials versus when the AI is expanding beyond them.

### Future Scalability

- As a developer, I want each tutor to have its own subject, documents, lessons, prompts, and metadata so the platform can support many AI tutors in the future.
- As a developer, I want reusable frontend and backend components so new tutors can be added without duplicating the whole app.

---

## 4. Feature List

## 4.1 Tutor Landing Page

### Description

The landing page introduces the Confirmation Bias Tutor and lets the student start a learning session.

### Requirements

- Show tutor title.
- Show short tutor description.
- Show available tutor modes:
  - Document-Grounded Tutor
  - Hybrid AI Tutor
- Show suggested starter prompts.
- Show “Start Learning” button.

### Suggested Starter Prompts

- What is confirmation bias?
- Give me examples of confirmation bias.
- How does confirmation bias affect teenagers?
- How does confirmation bias affect AI chatbots?
- How can I avoid confirmation bias?

### Priority

High

---

## 4.2 Tutor Mode Toggle

### Description

Students can switch between Document-Grounded Mode and Hybrid Mode.

### Requirements

- Add a visible toggle or segmented control.
- Default mode should be Document-Grounded.
- Changing mode should affect backend prompt behavior.
- UI should briefly explain the difference between both modes.

### Mode Rules

#### Document-Grounded Mode

The AI should:

- Use retrieved knowledge base chunks first.
- Avoid adding unsupported examples.
- Say when the uploaded documents do not contain enough information.
- Keep explanations faithful to the source materials.

#### Hybrid Mode

The AI should:

- Use retrieved knowledge base chunks first.
- Add general LLM knowledge when useful.
- Create extra examples.
- Connect the topic to social media, school, group behavior, AI tools, and current-life scenarios.
- Make the conversation more adaptive and engaging.

### Priority

High

---

## 4.3 Chat Interface

### Description

A chatbot-style interface where students can ask questions and receive AI tutor responses.

### Requirements

- User message input.
- Assistant response display.
- Loading state while the tutor is thinking.
- Message history within the current session.
- Suggested follow-up prompts after tutor responses.
- Clear visual distinction between user and tutor messages.

### Priority

High

---

## 4.4 Document-Grounded Question Answering

### Description

The tutor retrieves relevant information from the knowledge base before answering.

### Requirements

- Store extracted knowledge base content as chunks.
- Retrieve top relevant chunks based on the student’s question.
- Send retrieved context to the LLM.
- Generate a source-based answer.
- In Document-Grounded Mode, the AI should avoid unsupported claims.
- Display source cards or source labels when possible.

### Knowledge Base Materials

Initial tutor materials:

- `Confirmation bias YouTube - TDL.pdf`
- `Confirmation_Bias_ChatGPT_MiddleSchool.png`
- `Confirmation_Bias_Hybrid_Academic_Study_Guide_MindBrainAI.pdf`

### Priority

High

---

## 4.5 Hybrid AI Question Answering

### Description

The tutor still retrieves source material first, but can expand using general LLM knowledge.

### Requirements

- Retrieve relevant chunks from the confirmation bias knowledge base.
- Generate an answer that starts from the uploaded materials.
- Add broader examples only when useful.
- Clearly avoid contradicting the source materials.
- Use a friendly, student-centered tone.

### Example Use Cases

- “How does TikTok make confirmation bias worse?”
- “How can confirmation bias affect friendships?”
- “Can AI chatbots reinforce what I already believe?”
- “How do I challenge my own bias?”

### Priority

High

---

## 4.6 Guided Lesson Sidebar

### Description

The app includes a structured learning path so the tutor feels like an actual learning product, not just a generic chatbot that is generated based on the student's goal at the beginning of the lesson.

### Suggested Lessons

1. What is confirmation bias?
2. Why does confirmation bias happen?
3. Everyday examples
4. Confirmation bias in teen life
5. Confirmation bias in groups and society
6. Confirmation bias in AI systems
7. How to reduce confirmation bias

### Requirements

- Show lesson list in sidebar.
- Clicking a lesson sends a lesson-specific prompt to the tutor.
- Highlight current lesson.
- Track completed lessons locally during the session.

### Priority

Medium

---

## 4.7 Real-Life Examples Generator

### Description

The tutor gives 2–3 real-life examples of confirmation bias.

### Requirements

- Examples should be age-appropriate and easy to understand.
- In Document-Grounded Mode, examples should come from or closely follow the source materials.
- In Hybrid Mode, examples can include additional contexts like social media, school, friend groups, sports, and AI chatbots.

### Example Categories

- Teen life
- School
- Social media
- Friend groups
- News and media
- AI chatbot use
- Decision-making

### Priority

High

---

## 4.8 Tutor Question Generator

### Description

The AI asks students either a knowledge-check question or a reflection question.

### Requirements

- Provide a button: “Ask me a question.”
- Generate one question at a time.
- Support two question types:
  - Knowledge question
  - Reflection question
- Store the current question so the student’s answer can be evaluated.

### Example Questions

Knowledge question:

> What does confirmation bias mean?

Reflection question:

> Can you think of a time when you only listened to information that matched what you already believed?

### Priority

High

---

## 4.9 Student Answer Evaluation

### Description

The AI evaluates the student’s answer and gives feedback.

### Requirements

- Student submits an answer to the tutor’s question.
- Backend sends the question, student answer, mode, and relevant context to the LLM.
- AI returns:
  - Score from 1 to 5
  - What the student got right
  - What is missing
  - Improved version of the answer
  - Follow-up question

### Example Response Format

```json
{
  "score": 4,
  "strength": "You correctly explained that confirmation bias involves supporting an existing belief.",
  "improvement": "You should also mention that people may ignore contradictory evidence.",
  "betterAnswer": "Confirmation bias is when people focus on information that supports what they already believe and ignore information that challenges it.",
  "followUpQuestion": "Can you give one example from social media?"
}