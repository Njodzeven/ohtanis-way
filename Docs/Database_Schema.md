Database Schema - Ohtani's Way

1. Philosophy: Polyglot Persistence

This application uses a hybrid database approach to solve the specific data modeling challenges of the Harada Method.

PostgreSQL (Relational): Best for strict schemas, user accounts, authentication relationships, and subscriptions. It ensures data integrity for critical user info.

MongoDB (Document): Best for the Harada Grid. A grid is a recursive, nested JSON structure (Center -> 8 Nodes -> 64 Leaves). Storing this in SQL would require complex join tables (Grids -> Blocks -> Cells). MongoDB stores it as a single natural document.

2. PostgreSQL Schema (Prisma)

File: schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  name          String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relationships
  grids         GridMetadata[]
}

// Stores the "Link" between SQL User and Mongo Document
model GridMetadata {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  
  mongoId   String   @unique // The _id of the document in MongoDB
  
  title     String
  status    GridStatus @default(DRAFT)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}

enum GridStatus {
  DRAFT
  ACTIVE
  COMPLETED
  ARCHIVED
}


3. MongoDB Schema (Mongoose)

File: schemas/grid.schema.ts

The structure represents the visual grid.

import * as mongoose from 'mongoose';

// 1. The Block Schema (Represents a 3x3 grid)
// Used for both the "Central" block and the 8 "Outer" blocks
const BlockSchema = new mongoose.Schema({
  center: { 
    type: String, 
    default: "" 
    // For Outer blocks, this syncs with Central block items
  },
  // The 8 items surrounding the center
  // Order: Top, TopRight, Right, BottomRight, Bottom, BottomLeft, Left, TopLeft
  items: {
    type: [String],
    validate: [arrayLimit, '{PATH} exceeds the limit of 8']
  }
}, { _id: false });

function arrayLimit(val) {
  return val.length <= 8;
}

// 2. The Master Grid Document
export const GoalGridSchema = new mongoose.Schema({
  // Main Goal (The very center of the universe)
  mainGoal: { type: String, required: true },
  
  // The Middle 3x3 Grid
  centralBlock: { type: BlockSchema, required: true },
  
  // The 8 Surrounding 3x3 Grids
  outerBlocks: {
    top:        { type: BlockSchema, default: () => ({ items: Array(8).fill("") }) },
    topRight:   { type: BlockSchema, default: () => ({ items: Array(8).fill("") }) },
    right:      { type: BlockSchema, default: () => ({ items: Array(8).fill("") }) },
    bottomRight:{ type: BlockSchema, default: () => ({ items: Array(8).fill("") }) },
    bottom:     { type: BlockSchema, default: () => ({ items: Array(8).fill("") }) },
    bottomLeft: { type: BlockSchema, default: () => ({ items: Array(8).fill("") }) },
    left:       { type: BlockSchema, default: () => ({ items: Array(8).fill("") }) },
    topLeft:    { type: BlockSchema, default: () => ({ items: Array(8).fill("") }) },
  },

  // AI Context History
  aiConversationId: { type: String },
  
}, { timestamps: true });


4. Data Integrity & Sync

Since we split data, we need consistency.

Creation: When a user creates a grid:

Backend creates MongoDB document first -> gets _id.

Backend creates PostgreSQL GridMetadata record with that mongoId.

Deletion: When deleting a grid:

Delete PostgreSQL record first.

Then delete MongoDB document.