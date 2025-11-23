PROJECT: Ohtani's Way - Master Documentation

Version: 1.0.0
Status: Approved
Authored By: Lead Architect (Gemini)

1. Executive Summary

Ohtani's Way is a Progressive Web Application (PWA) that digitizes the Harada Method (Open Window 64). It leverages AI to assist users in articulating goals, breaking them down into 8 sub-goals, and further into 64 actionable tasks. The system emphasizes focus, aesthetics ("Zen Athletic"), and mobile usability.

2. User Experience (UX) & Design System

Theme: "Zen Athletic"

Philosophy: The interface should feel like a physical artifact—clean paper, sharp ink, intentional spacing. No digital clutter.

Color Palette:

bg-paper: #F9F7F2 (Warm off-white, textured)

text-ink: #1A1A1A (Soft black, high contrast)

accent-red: #B91C1C (Baseball stitching red - use sparingly for "Save" or "Action")

accent-clay: #9A7B4F (Infield dirt - for borders/subtle highlights)

Typography:

Headings: Playfair Display (Serif, elegant, authoritative).

Body/Inputs: Inter (Sans-serif, legible at small sizes).

2.1 The "Drill-Down" Interaction (Mobile First)

A 9x9 grid is unusable on mobile. We will use a Fractal Zoom UI:

Level 1 (The Mound): User sees only the Central 3x3 Grid.

Interaction: User Taps the center of an outer cell.

Animation: Using Framer Motion, the camera "zooms" into that cell, which expands to become a full 3x3 grid of its own.

Context: A sticky header shows the "Parent Goal" so the user never loses context.

3. System Architecture

3.1 Tech Stack (Strict)

Frontend: React (Vite), TypeScript, TailwindCSS, shadcn/ui (Components), zustand (State), tanstack-query (Data Fetching), framer-motion (Animations).

Backend: NestJS (Node.js framework).

Database 1 (Relational): PostgreSQL + Prisma (Users, Auth, Subscriptions).

Database 2 (Document): MongoDB + Mongoose (Grid Data, Goal Logs).

AI: Hugging Face Inference API (Mistral-7B-Instruct).

Infrastructure: Docker Compose (Local dev), Render/Railway (Production).

3.2 Logic Flow: The "Mandala" Sync

The Harada method has strict data dependencies.

Let Center Grid be $C$.

Let $C_{middle}$ be the Main Goal.

Let $C_{1..8}$ be the 8 sub-goals surrounding the middle.

Let Outer Grids be $O_{1..8}$.

Constraint: The center text of $O_1$ MUST ALWAYS equal $C_1$.

Solution: The Frontend state manager (Zustand) monitors $C_{1..8}$. On change, it automatically updates the corresponding $O_{n}$ center. The Backend validates this integrity on save.

4. Database Schema

4.1 PostgreSQL (Prisma Schema)

Used for rigid structural data.

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // Hashed
  name      String?
  createdAt DateTime @default(now())
  
  // Relations
  grids     GridMetadata[] // References MongoDB IDs
}

model GridMetadata {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  mongoId   String   // Reference to the actual document in MongoDB
  title     String
  status    String   // "DRAFT", "COMPLETED", "ARCHIVED"
  updatedAt DateTime @updatedAt
}


4.2 MongoDB (Mongoose Schema)

Used for the flexible, nested grid data.

// The schema for a single 3x3 block
const BlockSchema = new Schema({
  center: { type: String, required: true }, // The core goal of this block
  items:  [{ type: String }]                // The 8 surrounding items
});

// The Master Document
const GoalGridSchema = new Schema({
  _id: String, // Matches Postgres GridMetadata.mongoId
  mainGoal: String,
  centralBlock: BlockSchema, // The center 3x3
  outerBlocks: {             // The 8 surrounding 3x3s
     top: BlockSchema,
     topRight: BlockSchema,
     right: BlockSchema,
     bottomRight: BlockSchema,
     bottom: BlockSchema,
     bottomLeft: BlockSchema,
     left: BlockSchema,
     topLeft: BlockSchema,
  },
  aiSuggestions: [String] // History of AI chat context
});


5. API Contract (REST)

5.1 Auth

POST /auth/register -> { access_token }

POST /auth/login -> { access_token }

5.2 Grid Operations

POST /grids -> Creates a new blank 64-grid.

GET /grids -> List user's grids (Metadata only).

GET /grids/:id -> Full JSON tree of the grid.

PATCH /grids/:id -> Updates specific cells.

Payload: { "path": "outerBlocks.top.items.0", "value": "Run 5km" }

Note: Using PATCH reduces payload size compared to sending the whole object.

5.3 AI Coach

POST /ai/optimize

Input: { "goal": "I want to be a better baseball player" }

Output: { "refined": "Become the #1 Draft Pick by 8 Teams", "subGoals": ["Control", "Speed", "Mental", ...] }

Logic: Prompt Engineering to enforce Harada methodology constraints.

6. Feature Specifications

6.1 The "Smart Save" System

To handle the "every 1.5s save" requirement efficiently:

Frontend: User types in a cell.

Local State: Update Zustand store immediately (UI updates).

Debounce: Start a timer. If user types again within 1.5s, reset timer.

Trigger: Timer hits 1.5s.

Network: Send PATCH request to backend.

Indicator: UI shows a subtle spinning baseball icon -> turns into a green checkmark.

6.2 PDF Export (jsPDF)

We cannot rely on browser print. We must render a vector PDF.

Layout: Landscape A4.

Styling: Draw the grid lines using thick strokes (Lines) and thin strokes (Cells).

Typography: Embed a standard font.

Footer: "Generated by Ohtani's Way."

6.3 PWA Capabilities

Service Worker: Cache the App Shell (UI assets).

Offline Mode: If network fails, save changes to indexedDB. Sync with server when connection returns.

Manifest: display: "standalone", theme_color: "#F9F7F2".

7. Implementation Roadmap

Phase 1: The Skeleton

Initialize Monorepo.

Docker Compose (PG + Mongo).

NestJS basic setup.

Phase 2: The Grid Engine (Frontend)

Build the Fractal Grid Component.

Implement "Zoom" animations.

Implement Central <-> Outer sync logic in Zustand.

Phase 3: The Brain (AI)

Connect Hugging Face.

Build the Chat Interface for goal refinement.

Phase 4: Persistence

Connect Frontend to Backend.

Implement Debounced Save.

Phase 5: Polish

PWA installation.

PDF Generation.

"Zen" Styling fixes.