API Contract & Specification - Ohtani's Way

Version: 1.0.0
Base URL: /api/v1
Content-Type: application/json

1. Authentication

Uses JWT (JSON Web Tokens). Tokens must be passed in the Authorization header.

Header Format: Authorization: Bearer <token>

1.1 Register

Create a new user account.

Endpoint: POST /auth/register

Public

Request Body:

{
  "email": "shohei@angels.com",
  "password": "securePassword123",
  "name": "Shohei Ohtani"
}


Response (201 Created):

{
  "accessToken": "ey... (jwt token)",
  "user": {
    "id": "uuid-string",
    "email": "shohei@angels.com",
    "name": "Shohei Ohtani"
  }
}


1.2 Login

Authenticate existing user.

Endpoint: POST /auth/login

Public

Request Body:

{
  "email": "shohei@angels.com",
  "password": "securePassword123"
}


Response (200 OK):

{
  "accessToken": "ey... (jwt token)"
}


2. Grid Management (Mandala Charts)

2.1 Create Grid

Initialize a new empty 64-window grid.

Endpoint: POST /grids

Auth Required

Request Body:

{
  "title": "Road to MVP",
  "mainGoal": "World's Best Player" // Optional initial goal
}


Response (201 Created):

{
  "id": "postgres-uuid",
  "mongoId": "mongo-object-id",
  "title": "Road to MVP",
  "status": "DRAFT",
  "updatedAt": "2023-10-27T10:00:00Z"
}


2.2 List Grids

Get metadata for all grids owned by the user.

Endpoint: GET /grids

Auth Required

Response (200 OK):

[
  {
    "id": "postgres-uuid",
    "title": "Road to MVP",
    "status": "DRAFT",
    "updatedAt": "..."
  },
  // ...
]


2.3 Get Full Grid

Fetch the deep nested structure of a specific grid from MongoDB.

Endpoint: GET /grids/:id

Auth Required

Response (200 OK):

{
  "_id": "mongo-object-id",
  "mainGoal": "World's Best Player",
  "centralBlock": {
    "center": "World's Best Player",
    "items": ["Body", "Control", "Mental", "Speed", "Humanity", "Luck", "Change", "Skill"]
  },
  "outerBlocks": {
    "top": {
      "center": "Body", // Synced from centralBlock.items[0]
      "items": ["Eat well", "Sleep 8h", ...]
    },
    // ... (remaining 7 blocks)
  }
}


2.4 Update Grid (Patch)

Used for the auto-save mechanism. Supports partial updates to minimize payload size.

Endpoint: PATCH /grids/:id

Auth Required

Request Body:

{
  "path": "outerBlocks.top.items.3",
  "value": "Increase protein intake"
}


Note: The backend handles the logic: if the user updates centralBlock.items[n], the backend automatically updates outerBlocks[n].center.

Response (200 OK):

{ "success": true, "synced": true }


2.5 Delete Grid

Endpoint: DELETE /grids/:id

Auth Required

Response (204 No Content)

3. AI Coach

3.1 Optimize Goal

Ask the AI to refine a goal or suggest sub-goals.

Endpoint: POST /ai/optimize

Auth Required

Request Body:

{
  "goal": "I want to pitch better",
  "context": "Professional baseball level" // Optional
}


Response (200 OK):

{
  "refinedGoal": "Achieve a 2.50 ERA and 200 Strikeouts",
  "suggestions": [
    "Increase velocity",
    "Develop new slider",
    "Core strength",
    "Video analysis"
  ]
}


4. Error Handling

Standard HTTP status codes are used.

400 Bad Request: Validation failure (e.g., missing fields).

401 Unauthorized: Invalid or missing JWT.

403 Forbidden: Accessing a grid not owned by the user.

404 Not Found: Grid or User not found.

500 Internal Server Error: Database or AI service failure.

Error Body Format:

{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
