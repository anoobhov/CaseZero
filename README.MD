# CaseZero

> **An AI-powered detective investigation platform where every case is generated, investigated, and solved by the player.**

CaseZero is an AI-powered detective game built with **Next.js, TypeScript, MongoDB, Mongoose, Google Gemini, and Zod**.

The platform dynamically generates fictional murder/mystery cases using AI. Players investigate suspects, locations, evidence, timelines, and relationships before eventually making an accusation and attempting to identify the true culprit.

Unlike a traditional fixed-story detective game, CaseZero is designed around **procedurally generated investigations**, allowing the platform to create new cases instead of relying entirely on manually written stories.

---

## Table of Contents

* [Overview](#overview)
* [Core Idea](#core-idea)
* [Current Features](#current-features)
* [How the Game Works](#how-the-game-works)
* [Technology Stack](#technology-stack)
* [System Architecture](#system-architecture)
* [AI Case Generation](#ai-case-generation)
* [Case Structure](#case-structure)
* [Database Design](#database-design)
* [API Architecture](#api-architecture)
* [Game Session](#game-session)
* [Validation System](#validation-system)
* [Security and Information Hiding](#security-and-information-hiding)
* [Current Project Status](#current-project-status)
* [Known Limitations](#known-limitations)
* [Future Roadmap](#future-roadmap)
* [Planned AI Improvements](#planned-ai-improvements)
* [Planned Gameplay Improvements](#planned-gameplay-improvements)
* [Planned Technical Improvements](#planned-technical-improvements)
* [Long-Term Vision](#long-term-vision)
* [Project Structure](#project-structure)
* [Running Locally](#running-locally)
* [Environment Variables](#environment-variables)
* [Future Architecture](#future-architecture)
* [Conclusion](#conclusion)

---

# Overview

CaseZero is a web-based detective investigation game.

The player is presented with a generated mystery involving:

* A victim
* Multiple suspects
* Different locations
* Evidence
* A timeline of events
* Relationships between characters
* Hidden information
* A final solution

The player must investigate the available information, connect clues, interrogate suspects, examine evidence, and eventually make an accusation.

The central idea is:

```text
AI generates a case
        ↓
Case is validated
        ↓
Case is stored in MongoDB
        ↓
Player starts an investigation
        ↓
Player investigates suspects/evidence/locations
        ↓
Player forms a theory
        ↓
Player makes an accusation
        ↓
System evaluates the conclusion
```

The long-term goal is to make CaseZero feel less like a traditional quiz and more like an actual **interactive detective investigation**.

---

# Core Idea

Traditional detective games generally have a predefined story:

```text
Case A
 ├── Suspect 1
 ├── Suspect 2
 ├── Suspect 3
 ├── Evidence
 └── Fixed Solution
```

CaseZero instead attempts to create:

```text
AI
 │
 ├── Case A
 ├── Case B
 ├── Case C
 ├── Case D
 └── ...
```

Every generated case can contain a different:

* Story
* Murder method
* Motive
* Suspect set
* Evidence set
* Timeline
* Relationships
* Solution

This gives the platform the potential for a virtually unlimited number of investigations.

---

# Current Features

The current version of CaseZero already contains the foundation of the complete investigation system.

## 1. AI Case Generation

Cases are generated dynamically using Google's Gemini API.

The AI generates structured case information rather than simply returning a paragraph of text.

A generated case can contain:

* Title
* Description
* Difficulty
* Suspects
* Locations
* Evidence
* Timeline
* Relationships
* Solution
* Hidden truth

The generated result is then validated before being stored.

---

## 2. Structured AI Output

Instead of allowing the AI to return arbitrary text, the generation process uses a predefined schema.

Conceptually:

```text
Gemini
   ↓
Structured JSON
   ↓
Zod Validation
   ↓
Application Validation
   ↓
MongoDB
```

This significantly reduces the possibility of malformed AI-generated cases entering the database.

---

## 3. Case Validation

AI-generated content is not blindly trusted.

CaseZero contains validation logic to check whether the generated case is internally consistent.

For example:

```text
Evidence
   ↓
Does referenced suspect exist?
   ↓
Does referenced location exist?
   ↓
Does relationship reference valid characters?
   ↓
Is the generated structure valid?
```

This became particularly important because AI generation can sometimes produce references to entities that do not exist.

---

## 4. MongoDB Persistence

Generated cases are saved to MongoDB using Mongoose.

This means that once a case is successfully generated, it can be reused without requiring Gemini to regenerate it.

The architecture is approximately:

```text
Next.js
   ↓
API Route
   ↓
Mongoose
   ↓
MongoDB Atlas
```

MongoDB stores both generated cases and game sessions.

---

# How the Game Works

The intended gameplay loop is:

### Step 1 — Generate Case

The backend requests a new case from Gemini.

```text
POST /api/cases/generate
```

Gemini produces the structured case.

---

### Step 2 — Validate Case

The generated case passes through:

```text
Zod validation
        +
custom case validation
```

If validation fails, the case is rejected instead of being saved.

---

### Step 3 — Save Case

A valid case is stored in MongoDB.

The database becomes the source of truth for the investigation.

---

### Step 4 — Start Game Session

A player starts investigating a case.

A `GameSession` is created to keep track of the player's progress.

The session begins with a state similar to:

```text
in_progress
```

---

### Step 5 — Investigate

The player can investigate different parts of the case.

Examples include:

```text
Suspects
Evidence
Locations
Timeline
Relationships
Interrogations
```

The frontend provides an interactive investigation interface rather than displaying the entire solution immediately.

---

### Step 6 — Form a Theory

The player uses the available information to determine:

```text
Who committed the crime?
Why?
How?
What evidence proves it?
```

---

### Step 7 — Make an Accusation

The player eventually submits an accusation.

The backend compares the player's conclusion against the actual case solution.

The current implementation is intentionally simple and can be significantly improved in future versions.

---

# Technology Stack

## Frontend

* Next.js
* TypeScript
* React
* Tailwind CSS
* Responsive UI

---

## Backend

Next.js API Routes / Route Handlers.

The backend currently handles:

* Case generation
* Case retrieval
* Game sessions
* Investigation data
* Accusation processing

---

## Database

### MongoDB Atlas

MongoDB is used for persistent storage.

### Mongoose

Mongoose provides:

* Schema definitions
* Validation
* Database models
* Query abstraction

---

## Artificial Intelligence

### Google Gemini

Gemini is currently responsible primarily for:

* Case generation
* Structured mystery creation

Future versions can use AI for additional gameplay systems.

---

## Validation

### Zod

Zod is used to validate AI-generated structured data before it enters the database.

---

# System Architecture

The current architecture can be represented as:

```text
                    ┌─────────────────┐
                    │     Player      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    Next.js UI   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   API Routes    │
                    └────────┬────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
                 ▼                       ▼
        ┌─────────────────┐     ┌─────────────────┐
        │    MongoDB      │     │     Gemini      │
        │     Atlas       │     │      API        │
        └─────────────────┘     └─────────────────┘
                 ▲                       │
                 │                       │
                 └───────────┬───────────┘
                             │
                             ▼
                     ┌──────────────┐
                     │ Zod + Custom │
                     │  Validation  │
                     └──────────────┘
```

---

# AI Case Generation

One of the most important components of CaseZero is the case-generation pipeline.

The AI is instructed to generate a complete structured investigation.

The generated information is not treated as plain text.

Instead:

```text
Prompt
   ↓
Gemini
   ↓
Structured JSON
   ↓
Zod Schema
   ↓
Custom Validation
   ↓
MongoDB
```

This separation is important because LLM output is probabilistic.

The application cannot assume:

> "If Gemini returned JSON, the case must be valid."

Instead, CaseZero verifies the generated data before accepting it.

---

# Case Structure

A case consists of multiple interconnected entities.

Conceptually:

```text
Case
│
├── Basic Information
│   ├── title
│   ├── description
│   └── difficulty
│
├── Suspects
│   ├── identity
│   ├── description
│   ├── alibi
│   └── information
│
├── Locations
│   ├── name
│   └── description
│
├── Evidence
│   ├── name
│   ├── description
│   └── relationships
│
├── Timeline
│   └── events
│
├── Relationships
│   └── suspect connections
│
└── Solution
    ├── culprit
    ├── motive
    └── hidden truth
```

The exact schema can evolve as the gameplay system becomes more sophisticated.

---

# Database Design

## Case Model

The `Case` model stores the generated investigation.

It contains structured data for the mystery.

Important categories include:

```text
Case
 ├── title
 ├── description
 ├── difficulty
 ├── suspects
 ├── locations
 ├── evidence
 ├── timeline
 ├── relationships
 ├── solution
 └── hiddenTruth
```

---

# GameSession Model

A game session represents a particular player's investigation of a case.

Conceptually:

```text
GameSession
│
├── caseId
├── player information
├── investigation state
├── discovered evidence
├── investigated suspects
├── investigation progress
├── accusation
└── status
```

The session allows the application to distinguish between:

```text
The Case
```

and

```text
A Player's Attempt at Solving the Case
```

This separation becomes especially important when multiplayer, leaderboards, statistics, or multiple attempts are introduced later.

---

# API Architecture

The application uses Next.js API routes.

One of the currently implemented endpoints is:

```text
POST /api/cases/generate
```

Its responsibility is approximately:

```text
Request
   ↓
Generate case with Gemini
   ↓
Validate generated case
   ↓
Save case
   ↓
Return safe case data
```

A case retrieval endpoint is also part of the gameplay architecture:

```text
GET /api/cases/[id]
```

The API layer is intentionally kept separate from the frontend so that the game logic is not dependent on UI components.

---

# Information Hiding

One important security/gameplay consideration is that the complete solution must never be sent to the browser during normal gameplay.

For example:

```text
Database

Case
├── suspects
├── evidence
├── timeline
├── solution       ← SECRET
└── hiddenTruth    ← SECRET
```

The public API response should instead look more like:

```text
Case
├── suspects
├── evidence
├── timeline
└── relationships
```

The solution remains server-side.

This prevents a player from simply inspecting the browser's network response and finding:

```text
solution.culprit
solution.motive
hiddenTruth
```

---

# Current Validation Architecture

CaseZero currently uses two layers of validation.

## Layer 1 — Schema Validation

Zod verifies that the generated structure follows the expected format.

For example:

```text
difficulty → valid enum
title      → string
suspects   → array
evidence   → array
```

---

## Layer 2 — Semantic Validation

The custom validation layer checks relationships inside the generated case.

For example:

```text
Evidence says:
"John was seen leaving Sarah's house."

Does Sarah exist?

Does John exist?

Does the referenced location exist?
```

This is different from normal schema validation.

A JSON document can be syntactically valid while still being logically invalid.

---

# Current Accusation System

The current accusation system represents the first version of the solution-checking mechanism.

At the moment, the system can compare the player's submitted answer with the generated solution.

This is intentionally simple, but it is also one of the major areas for future improvement.

The long-term goal should not be:

```text
Player answer == AI answer
```

Instead, the system should determine whether:

```text
Player's reasoning
        ↓
Uses important clues
        ↓
Identifies correct culprit
        ↓
Provides logically consistent explanation
```

This is discussed further in the roadmap.

---

# Current Project Status

The project has progressed beyond the initial prototype stage.

### Completed

* [x] Next.js project setup
* [x] TypeScript integration
* [x] MongoDB Atlas connection
* [x] Mongoose models
* [x] Case model
* [x] GameSession model
* [x] Gemini integration
* [x] AI case generation
* [x] Structured AI output
* [x] Zod validation
* [x] Custom semantic validation
* [x] Case persistence
* [x] Case retrieval architecture
* [x] Game session creation
* [x] Investigation UI
* [x] Suspect investigation
* [x] Evidence investigation
* [x] Investigation interactions
* [x] Interrogation interface
* [x] Accusation system
* [x] Hiding solution/hidden truth from public case responses
* [x] Basic end-to-end gameplay
* [x] Deployment

The current version therefore represents a functional **minimum viable product** of the CaseZero concept.

---

# Known Limitations

Although the core system works, several areas are currently primitive.

## 1. Accusation Evaluation

The biggest limitation is answer evaluation.

A simple comparison can fail when the player gives a semantically correct answer in different words.

For example, the actual solution might be:

```text
"The culprit is John because he poisoned the victim
using the medicine in the laboratory."
```

The player might write:

```text
"John did it. He used the medicine to poison the victim
while he was in the lab."
```

These answers are conceptually equivalent but are not identical strings.

A future semantic evaluation system is therefore required.

---

## 2. AI Dependency During Gameplay

Calling Gemini every time the player performs an action can create problems:

* Latency
* API costs
* Rate limits
* Temporary model failures
* Server load
* Unpredictable responses

AI should therefore not be used for every simple interaction.

---

## 3. Case Quality

AI-generated cases can still contain:

* Contradictions
* Weak clues
* Redundant evidence
* Unclear motives
* Ambiguous timelines
* Impossible deductions

The validation system needs to evolve from structural validation toward **logical solvability validation**.

---

## 4. Investigation Depth

The current investigation system provides the foundation, but the long-term goal is to make investigations much more dynamic.

Players should eventually have to decide:

```text
What should I investigate?

Who should I interrogate?

Which evidence should I connect?

Which statement should I challenge?

What theory should I test?
```


---

# Phase 1 — Improve the Core Game

### Planned Features

* Better accusation evaluation
* Better investigation state tracking
* Evidence discovery system
* Suspect interrogation improvements
* Timeline interaction
* Evidence-to-suspect connections

---

# Phase 2 — Semantic Accusation Evaluation

Instead of exact string matching, the system should evaluate the player's reasoning.

A possible architecture:

```text
Player Answer
      ↓
Extract Claims
      ↓
Identify Suspect
      ↓
Identify Motive
      ↓
Identify Method
      ↓
Identify Supporting Evidence
      ↓
Compare Against Case Facts
      ↓
Calculate Result
```

For example:

```text
Player:
"John killed Sarah by poisoning her drink."

System extracts:

culprit = John
victim = Sarah
method = poisoning
```

The backend can then compare these claims against structured case facts.

This is preferable to sending the entire answer to an LLM every time.

---

# Phase 3 — Deterministic + AI Hybrid Evaluation

A strong future architecture would combine deterministic logic with AI.

Instead of:

```text
Player Answer
      ↓
Gemini
      ↓
Correct / Incorrect
```

use:

```text
                Player Answer
                      │
                      ▼
              Claim Extraction
                      │
             ┌────────┴────────┐
             ▼                 ▼
      Deterministic       AI Semantic
        Checks             Analysis
             │                 │
             └────────┬────────┘
                      ▼
                Final Evaluation
```

For example:

### Deterministic checks

```text
Is the accused person actually a suspect?
Is the victim correct?
Is the proposed method consistent?
Are referenced clues real?
```

### Semantic analysis

```text
Does the explanation correctly connect the clues?
Does the player's reasoning contradict the case?
```

This significantly reduces unnecessary AI calls.

---

# Phase 4 — Advanced Interrogation System

The interrogation system can become one of CaseZero's major features.

Instead of selecting predefined questions only:

```text
[Ask about the victim]
[Ask about the weapon]
[Ask about the timeline]
```

the player could type:

```text
"Where were you at 9:30 PM?"
```

The system would interpret the question and respond according to the suspect's knowledge.

The architecture could be:

```text
Player Question
       ↓
Question Classification
       ↓
Retrieve Suspect Knowledge
       ↓
Generate Response
       ↓
Check Against Case Facts
       ↓
Return Answer
```

The critical requirement is that the AI should **not invent facts outside the case**.

---

# Phase 5 — Evidence Graph

A major gameplay improvement would be representing the investigation as a graph.

For example:

```text
              ┌─────────────┐
              │   Suspect   │
              │    John     │
              └──────┬──────┘
                     │
                owns weapon
                     │
                     ▼
              ┌─────────────┐
              │   Evidence  │
              │   Knife     │
              └──────┬──────┘
                     │
               found at
                     │
                     ▼
              ┌─────────────┐
              │  Location   │
              │   Office    │
              └─────────────┘
```

Players could visually connect clues.

This would make the investigation feel more like actual detective work.

---


# Phase 7 — Case Solvability Engine

One of the most important long-term improvements.

Before a case becomes playable, the backend should verify:

> Can the culprit actually be logically deduced from the available evidence?

A possible system:

```text
Generate Case
      ↓
Generate Solution
      ↓
Analyze Evidence
      ↓
Can Evidence Support Solution?
      │
   ┌──┴──┐
   │     │
  YES    NO
   │     │
   ▼     ▼
 Save   Regenerate
```

An even stronger system could verify:

```text
Correct culprit
        ↓
At least N supporting clues
        ↓
At least one decisive clue
        ↓
No impossible timeline
        ↓
No contradictory evidence
        ↓
Alternative suspects can be eliminated
```

This would dramatically improve generated-case quality.

---

# Phase 11 — Procedural Case Templates

Instead of asking Gemini to invent absolutely everything from scratch, CaseZero could eventually use a controlled generation system.

For example:

```text
Case Template
     +
Crime Type
     +
Location
     +
Suspect Archetypes
     +
Evidence Rules
     +
Timeline Rules
     +
AI-generated narrative
```

This provides much stronger control over consistency.

---

# Phase 12 — Advanced AI Architecture

A future version could divide AI responsibilities.

Instead of one large prompt:

```text
Gemini
  ↓
Everything
```

use specialized components:

```text
Case Generator
      │
      ├── Narrative Generator
      │
      ├── Evidence Generator
      │
      ├── Timeline Generator
      │
      ├── Suspect Generator
      │
      └── Consistency Checker
```

This would make the system easier to debug and improve.

---



## API Security

Future improvements should include:

* Input sanitization
* Rate limiting
* Authentication
* Authorization
* Request validation
* Error normalization
* API key protection
* Abuse prevention

---

# Observability

As CaseZero grows, debugging AI-generated cases will become increasingly important.

Future versions should track:

```text
Case generation time
AI response time
Validation failures
Database failures
API failures
Gemini errors
Game completion rate
Accusation accuracy
```

Tools such as logging and monitoring can later be integrated.

---

# Testing Strategy

The project should eventually have multiple levels of testing.

## Unit Tests

Test:

```text
Case validation
Solution validation
Timeline validation
Evidence relationships
Accusation evaluation
```

---

## End-to-End Tests

Test the complete player journey:

```text
Open CaseZero
      ↓
Start Case
      ↓
Investigate
      ↓
Interrogate
      ↓
Collect Evidence
      ↓
Accuse
      ↓
Receive Result
```

---

# Running Locally

## 1. Clone the Repository

```bash
git clone <repository-url>
cd casezero
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create:

```text
.env.local
```

Add the required credentials.

Example:

```env
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

Do not commit `.env.local` to Git.

---

## 4. Start Development Server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

---

# Environment Variables

| Variable         | Purpose                          |
| ---------------- | -------------------------------- |
| `MONGODB_URI`    | MongoDB Atlas connection         |
| `GEMINI_API_KEY` | Google Gemini API authentication |

Additional variables will be added as authentication, caching, monitoring, and other services are introduced.



```text
                    CASEZERO
                       │
                       ▼
              ┌─────────────────┐
              │ Generate Mystery│
              └────────┬────────┘
                       │
                       ▼
                ┌─────────────┐
                │ Investigation│
                └──────┬──────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
     Suspects       Evidence       Locations
        │              │              │
        └──────────────┼──────────────┘
                       │
                       ▼
                 Interrogation
                       │
                       ▼
                  Deduction
                       │
                       ▼
                  Accusation
                       │
                       ▼
                    Result
                       │
                       ▼
                Player Statistics
```

The most important objective is not simply generating interesting stories.

It is generating **fair, logically solvable investigations** where the player can reach the correct conclusion from the available information.


---

# What Makes CaseZero Interesting

CaseZero combines several areas of software engineering:

```text
Frontend Development
        +
Backend Development
        +
Database Design
        +
Artificial Intelligence
        +
Natural Language Processing
        +
Game Design
        +
Data Validation
        +
System Architecture
```

The interesting engineering challenge is not simply:

> "Can AI generate a detective story?"

It is:

> **Can an application reliably generate a mystery that is internally consistent, logically solvable, interactive, and fair to the player?**

That is the core problem CaseZero is attempting to solve.

---

# Current Status

CaseZero currently has a functioning foundation:

```text
AI Case Generation       ✓
Case Validation          ✓
MongoDB Persistence      ✓
Game Sessions            ✓
Investigation UI         ✓
Suspect Investigation    ✓
Evidence Investigation   ✓
Interrogation UI         ✓
Accusation System        ✓
Solution Hiding          ✓
Deployment               ✓
```

The next major milestone is to move from a **working AI-generated detective prototype** toward a **robust investigation engine**.

The biggest improvements should focus on:

1. **Logical case generation**
2. **Semantic accusation evaluation**
3. **More sophisticated investigations**
4. **AI-powered but controlled interrogation**
5. **Evidence relationships**
6. **Case solvability verification**
7. **Authentication and player progression**
8. **Performance and production reliability**

---

Built as an exploration of:

* Artificial Intelligence
* Full-stack development
* Generative AI
* Game systems
* Natural language processing
* Interactive storytelling
* Software architecture
