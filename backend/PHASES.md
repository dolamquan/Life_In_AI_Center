# phases.md

# AI Tutor Platform — Phased Implementation Plan

## Purpose

This document breaks the AI Tutor project into clear implementation phases so the project can be built step by step instead of all at once.

The goal is to start with a working minimum version, then gradually add document grounding, hybrid AI behavior, goal-based study plans, guided lessons, student evaluation, progress tracking, and deployment polish.

---

## Phase 0 — Project Setup and Baseline Structure

### Goal

Set up the backend project structure and make sure the application can run before adding AI features.

### Backend Tasks

- Initialize the Node.js, Express, and TypeScript backend.
- Configure `src/app.ts` and `src/server.ts`.
- Set up environment variables.
- Set up Prisma.
- Connect Prisma to PostgreSQL.
- Enable pgvector support for future embedding storage.
- Create base folders:
  - `routes/`
  - `controllers/`
  - `services/`
  - `config/`
- Add a health check route.

### Suggested Files

```txt
src/app.ts
src/server.ts
src/config/prisma.ts
src/routes/health.routes.ts
src/controllers/health.controller.ts
```

### API Endpoint

```txt
GET /api/health
```

### Done When

- Backend starts successfully.
- Health route returns a success response.
- Prisma can connect to the database.

---

## Phase 1 — Core Database Models

### Goal

Create the database foundation needed for tutors, documents, chunks, chat sessions, messages, study goals, and study plans.

### Backend Tasks

Create Prisma models for:

- `Tutor`
- `Document`
- `DocumentChunk`
- `ChatSession`
- `ChatMessage`
- `StudyGoal`
- `StudyPlan`
- `StudyPlanItem`
- `TutorQuestion`
- `StudentAnswerEvaluation`

### Important Notes

- Keep the schema simple at first.
- Store embeddings in `DocumentChunk` using pgvector.
- Store tutor mode as an enum or string:
  - `DOCUMENT_GROUNDED`
  - `HYBRID`
- Store study goal type, such as:
  - `THEORETICAL_UNDERSTANDING`
  - `REAL_LIFE_APPLICATION`
  - `EXAM_PREP`
  - `QUICK_REVIEW`
  - `DEEP_STUDY`

### Suggested Files

```txt
prisma/schema.prisma
prisma/seed.ts
```

### Done When

- Prisma schema is created.
- Migration runs successfully.
- Seed file creates the initial Confirmation Bias Tutor.

---

## Phase 2 — Tutor Metadata API

### Goal

Build the first real backend feature: retrieving tutor information for the frontend landing page.

### Backend Tasks

- Create tutor route.
- Create tutor controller.
- Create tutor service.
- Return tutor title, description, available modes, starter prompts, and suggested lessons.

### Suggested Files

```txt
src/routes/tutor.routes.ts
src/controllers/tutor.controller.ts
src/services/tutor.service.ts
```

### API Endpoints

```txt
GET /api/tutors
GET /api/tutors/:id
```

### Frontend Tasks

- Build the tutor landing page.
- Display tutor title and description.
- Display mode options.
- Display starter prompts.
- Add a “Start Learning” button.

### Done When

- Frontend can fetch and display tutor information from the backend.
- The app no longer depends on hardcoded frontend tutor data.

---

## Phase 3 — Basic Chat Without RAG

### Goal

Create a working chatbot experience before adding document retrieval.

### Backend Tasks

- Create chat session route.
- Create message route.
- Accept a student message.
- Send the message to the OpenAI API.
- Return a tutor response.
- Save user and assistant messages to the database.

### Suggested Files

```txt
src/routes/chat.routes.ts
src/controllers/chat.controller.ts
src/services/chat.service.ts
src/services/openai.service.ts
```

### API Endpoints

```txt
POST /api/chat/sessions
POST /api/chat/sessions/:sessionId/messages
GET /api/chat/sessions/:sessionId/messages
```

### Frontend Tasks

- Build chat UI.
- Add message input.
- Show user messages and tutor messages.
- Add loading state.
- Preserve message history in the current session.

### Done When

- Student can send a message.
- AI tutor responds.
- Messages are saved and can be retrieved.

---

## Phase 4 — Tutor Mode Toggle

### Goal

Add support for Document-Grounded Mode and Hybrid Mode at the API and frontend level.

### Backend Tasks

- Add `mode` to chat requests.
- Create a mode router service.
- Add separate prompt behavior for each mode.
- Document-Grounded Mode should stay strict and avoid unsupported claims.
- Hybrid Mode should allow broader examples and explanations.

### Suggested Files

```txt
src/services/modeRouter.service.ts
src/services/prompt.service.ts
```

### API Behavior

Request body example:

```json
{
  "message": "How does confirmation bias affect social media?",
  "mode": "HYBRID"
}
```

### Frontend Tasks

- Add segmented control or toggle.
- Default to Document-Grounded Mode.
- Show a short explanation of each mode.
- Send selected mode to backend with every message.

### Done When

- Switching mode changes the tutor response style.
- Document-Grounded answers are stricter.
- Hybrid answers are broader and more adaptive.

---

## Phase 5 — Document Upload and Text Extraction

### Goal

For now don't allow users to upload documents, but rather use the documents currently being put inside the Asset folder

### Backend Tasks

- Add document upload endpoint.
- Support PDF, DOCX, TXT, MD, and image-based material if possible.
- Extract text from uploaded files.
- Save document metadata.
- Save extracted raw text temporarily or directly chunk it.

### Suggested Files

```txt
src/routes/document.routes.ts
src/controllers/document.controller.ts
src/services/document.service.ts
src/services/textExtraction.service.ts
```

### API Endpoints

```txt
POST /api/tutors/:tutorId/documents/upload
GET /api/tutors/:tutorId/documents
```

### Done When

- User can upload a document.
- Backend extracts text.
- Document record is saved in the database.

---

## Phase 6 — Chunking, Embeddings, and Vector Storage

### Goal

Convert uploaded document text into searchable chunks.

### Backend Tasks

- Split extracted text into smaller chunks.
- Generate embeddings for each chunk using the OpenAI embeddings API.
- Store chunks and embeddings in PostgreSQL with pgvector.
- Keep metadata such as document ID, chunk index, and source name.

### Suggested Files

```txt
src/services/chunking.service.ts
src/services/embedding.service.ts
src/services/vector.service.ts
```

### Database Updates

- Add vector field to `DocumentChunk`.
- Add indexes if needed for vector search.

### Done When

- Uploaded document content is split into chunks.
- Each chunk has an embedding.
- Chunks can be searched later using semantic similarity.

---

## Phase 7 — Document-Grounded RAG Answering

### Goal

Make the tutor retrieve relevant document chunks before generating an answer.

### Backend Tasks

- Embed the student question.
- Retrieve the most relevant document chunks from pgvector.
- Send retrieved context to the LLM.
- Generate a source-based answer.
- Return source labels or source cards to the frontend.
- If context is weak, tell the student the uploaded materials may not contain enough information.

### Suggested Files

```txt
src/services/retrieval.service.ts
src/services/rag.service.ts
src/services/source.service.ts
```

### API Behavior

Response example:

```json
{
  "answer": "Confirmation bias means people tend to focus on information that supports what they already believe...",
  "mode": "DOCUMENT_GROUNDED",
  "sources": [
    {
      "documentTitle": "Confirmation Bias Study Guide",
      "chunkIndex": 3
    }
  ]
}
```

### Frontend Tasks

- Display source cards below tutor responses.
- Visually show when the answer is document-grounded.

### Done When

- Tutor answers using retrieved chunks.
- Sources are returned and displayed.
- Document-Grounded Mode avoids unsupported expansion.

---

## Phase 8 — Hybrid AI Answering

### Goal

Make Hybrid Mode more flexible while still using uploaded materials first.

### Backend Tasks

- Retrieve document chunks first.
- Generate an answer that starts from source content.
- Allow additional LLM examples when useful.
- Clearly separate source-based explanation from broader AI explanation if needed.
- Prevent the AI from contradicting the retrieved source content.

### Frontend Tasks

- Add small labels such as:
  - “Based on your materials”
  - “AI-added example”
- Keep the answer readable and student-friendly.

### Done When

- Hybrid Mode can answer broader student questions.
- The tutor can connect confirmation bias to school, social media, friendships, AI tools, and decision-making.

---

## Phase 9 — Student Goal Input and Study Plan Generator

### Goal

Let students specify their learning goal and generate a personalized study plan based on that goal.

### Backend Tasks

- Add endpoint for creating a study goal.
- Add endpoint for generating a study plan.
- Retrieve relevant chunks from the knowledge base.
- Use the LLM to create a study plan based on:
  - Student goal
  - Available documents
  - Tutor subject
  - Preferred learning depth
- Save generated study plan and study plan items.

### Example Goals

- “I only want a theoretical understanding.”
- “I need real-life examples.”
- “I want to prepare for a quiz.”
- “I want to understand how confirmation bias appears in AI chatbots.”
- “I want a quick 15-minute review.”

### Suggested Files

```txt
src/routes/studyPlan.routes.ts
src/controllers/studyPlan.controller.ts
src/services/studyGoal.service.ts
src/services/studyPlan.service.ts
```

### API Endpoints

```txt
POST /api/tutors/:tutorId/study-goals
POST /api/tutors/:tutorId/study-plans/generate
GET /api/study-plans/:studyPlanId
```

### Response Example

```json
{
  "goal": "Theoretical understanding",
  "estimatedTime": "30 minutes",
  "items": [
    {
      "order": 1,
      "title": "Define confirmation bias",
      "objective": "Understand the core meaning of confirmation bias",
      "estimatedMinutes": 5
    },
    {
      "order": 2,
      "title": "Why confirmation bias happens",
      "objective": "Learn the mental shortcuts behind biased thinking",
      "estimatedMinutes": 10
    }
  ]
}
```

### Frontend Tasks

- Add student goal input before the main lesson starts.
- Add goal presets.
- Show generated study plan.
- Let student start from any study plan item.

### Done When

- Student can enter a learning goal.
- AI generates a structured study plan.
- Study plan appears in the frontend.

---

## Phase 10 — Guided Lesson Sidebar

### Goal

Turn the study plan into a guided learning path.

### Backend Tasks

- Support lesson-specific prompts.
- Allow chat messages to include `studyPlanItemId` or `lessonId`.
- Track lesson completion.

### Frontend Tasks

- Add sidebar with study plan items or default lessons.
- Highlight the current lesson.
- Mark completed lessons.
- Clicking a lesson sends a lesson-specific tutor prompt.

### Done When

- Student can move through lessons one by one.
- The tutor feels like a structured learning product, not only a generic chatbot.

---

## Phase 11 — Real-Life Examples Generator

### Goal

Add a focused feature for generating age-appropriate real-life examples of confirmation bias.

### Backend Tasks

- Create examples endpoint.
- Accept category and mode.
- Retrieve relevant chunks if in Document-Grounded Mode.
- Generate 2–3 examples.

### Suggested Categories

- School
- Teen life
- Social media
- Friend groups
- News and media
- AI chatbot use
- Decision-making

### API Endpoint

```txt
POST /api/tutors/:tutorId/examples
```

### Frontend Tasks

- Add “Show me examples” button.
- Let student choose an example category.
- Display examples as cards.

### Done When

- Student can request real-life examples.
- Examples follow the selected tutor mode.

---

## Phase 12 — Tutor Question Generator

### Goal

Allow the tutor to test the student’s understanding.

### Backend Tasks

- Create question generation endpoint.
- Support question types:
  - Knowledge question
  - Reflection question
- Save the generated question to the database.
- Connect the question to the session and tutor.

### Suggested Files

```txt
src/routes/question.routes.ts
src/controllers/question.controller.ts
src/services/question.service.ts
```

### API Endpoint

```txt
POST /api/chat/sessions/:sessionId/questions
```

### Frontend Tasks

- Add “Ask me a question” button.
- Display the generated question.
- Provide answer input field.

### Done When

- Tutor can generate a question.
- Student can write an answer to that question.

---

## Phase 13 — Student Answer Evaluation

### Goal

Give students feedback on their answers.

### Backend Tasks

- Create answer evaluation endpoint.
- Send the original question, student answer, tutor mode, and retrieved context to the LLM.
- Return structured feedback:
  - Score from 1 to 5
  - Strength
  - Improvement
  - Better answer
  - Follow-up question
- Save evaluation result.

### Suggested Files

```txt
src/services/evaluation.service.ts
```

### API Endpoint

```txt
POST /api/questions/:questionId/evaluate
```

### Response Example

```json
{
  "score": 4,
  "strength": "You correctly explained that confirmation bias supports existing beliefs.",
  "improvement": "You should also mention that people may ignore contradictory evidence.",
  "betterAnswer": "Confirmation bias is when people focus on information that supports what they already believe and ignore information that challenges it.",
  "followUpQuestion": "Can you give one example from social media?"
}
```

### Frontend Tasks

- Display score clearly.
- Display feedback in sections.
- Add button to answer the follow-up question.

### Done When

- Student receives useful feedback.
- Evaluation is saved and connected to the question.

---

## Phase 14 — Reflection Summary and Learning Progress

### Goal

Help the student review what they learned during the session.

### Backend Tasks

- Generate a session summary.
- Include completed lessons, key concepts, student strengths, and improvement areas.
- Save summary to database.

### API Endpoint

```txt
POST /api/chat/sessions/:sessionId/summary
```

### Frontend Tasks

- Add “Summarize what I learned” button.
- Show reflection summary.
- Show completed lesson count.

### Done When

- Student can end a session with a useful learning summary.

---

## Phase 15 — Frontend Polish and Demo Experience

### Goal

Make the app feel clean, understandable, and interview-ready.

### Frontend Tasks

- Improve landing page layout.
- Improve chat message design.
- Add source cards.
- Add loading states.
- Add empty states.
- Add error states.
- Add mode explanation.
- Add study goal form.
- Add guided lesson sidebar.
- Make the app responsive.

### Demo Flow

1. Student opens Confirmation Bias Tutor.
2. Student chooses a learning goal.
3. App generates a study plan.
4. Student starts Lesson 1.
5. Student asks a question in Document-Grounded Mode.
6. Tutor answers with sources.
7. Student switches to Hybrid Mode.
8. Tutor gives broader real-life examples.
9. Student clicks “Ask me a question.”
10. Student submits an answer.
11. Tutor gives feedback.
12. Student generates a reflection summary.

### Done When

- The project is easy to demo in 2–3 minutes.
- The UI clearly communicates the product idea.

---

## Phase 16 — Deployment

### Goal

Prepare the project for deployment.

### Backend Tasks

- Add production environment variables.
- Configure CORS.
- Make sure database URL works in production.
- Run Prisma migration on production database.
- Add deployment scripts.

### Frontend Tasks

- Add production API URL.
- Build frontend.
- Deploy frontend separately from backend.

### Suggested Deployment

- Frontend: Vercel or Netlify
- Backend: Render, Railway, Fly.io, or a similar Node.js hosting platform
- Database: Supabase PostgreSQL, Neon, Railway PostgreSQL, or Render PostgreSQL

### Done When

- Frontend is deployed.
- Backend is deployed.
- Frontend can call backend successfully.
- Database works in production.

---

# Recommended Build Order for a 2-Hour Interview Version

If time is limited, implement only the most impressive minimum version first:

## Must-Have Version

1. Phase 0 — Project setup
2. Phase 1 — Basic database models
3. Phase 2 — Tutor metadata API
4. Phase 3 — Basic chat
5. Phase 4 — Mode toggle
6. Phase 9 — Student goal and study plan generator
7. Phase 15 — Frontend demo polish

## Strong Version

Add:

8. Phase 5 — Document upload
9. Phase 6 — Chunking and embeddings
10. Phase 7 — Document-grounded RAG

## Excellent Version

Add:

11. Phase 12 — Tutor question generator
12. Phase 13 — Student answer evaluation
13. Phase 14 — Reflection summary

---

# Implementation Rule

For each phase, implement only the files related to that phase. Keep routes, controllers, and services separated:

- Routes define endpoints only.
- Controllers handle request and response.
- Services contain business logic, Prisma queries, OpenAI calls, retrieval logic, and data processing.

After each phase, document:

- Files changed
- What was implemented
- Commands to run
- Curl commands to test
- Assumptions made

---

# Final Product Vision

By the end of all phases, the application should work like this:

1. Student uploads learning materials.
2. Student selects or writes a learning goal.
3. AI generates a personalized study plan.
4. Student studies through guided lessons.
5. Tutor answers questions using either Document-Grounded Mode or Hybrid Mode.
6. Tutor generates examples, asks questions, evaluates student answers, and gives feedback.
7. Student receives a final reflection summary.

The result is not just a chatbot. It is a structured AI tutor that guides students through learning, practice, reflection, and improvement.
