# CLAUDE.md

## Project Overview

This is a Node.js + Express + TypeScript + Prisma + SQLite API project.

The goal is to develop a full stack application within 2 hours and ready for deployment. 

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- pgvector
- OpenAI API

## Coding Rules

- Follow the existing folder structure.
- Do not rewrite unrelated files.
- Keep route, controller, and service logic separated.
- Routes should only define endpoints and call controllers.
- Controllers should handle request/response and status codes.
- Services should contain business logic and Prisma queries.
- Use async/await.
- Use clear error handling.
- Keep code simple and interview-friendly.

## Prisma Rules

- Use Prisma Client from the existing config file if one exists.
- Use `findUnique` only with unique fields or IDs.
- Use `findFirst` or `findMany` for non-unique filters.
- Use `create`, `update`, `delete`, `findMany`, `findUnique`, and `upsert` appropriately.
- If schema.prisma changes, mention that migration is needed.
- Do not manually edit migration files unless explicitly asked.

## Validation Rules

- Validate required request body fields.
- Convert route params to numbers when needed.
- Return 400 for invalid input.
- Return 404 for missing records.
- Return 201 for successful creation.
- Return 200 for successful reads/updates/deletes unless existing style differs.

## Files To Avoid

Do not modify:
- package-lock.json unless dependencies change
- migration files unless explicitly required
- unrelated routes/controllers/services
- README.md unless asked

## After Every Implementation

Always provide:
- files changed
- summary of implementation
- commands to run
- curl commands to test
- assumptions made