# IgniteQuest — Python Arena

> A host-controlled, KBC-inspired live quiz platform for the RVCE Coding Club × RVITM Python bootcamp session.

---

## 1. Product Vision

IgniteQuest is not a conventional online quiz application.

It is a **live game-show platform** designed for a seminar-hall environment where:

* Students participate in teams.
* Only the team leader uses a mobile phone for registration and, later, the final round.
* During the main quiz, phones are kept aside.
* The **host controls the complete flow** from a laptop.
* The projector acts as the public stage.
* A public leaderboard creates continuous competition and excitement.
* The experience takes inspiration from the nostalgia, suspense, progression, lifelines, and presentation style of KBC, without attempting to reproduce its branding or content.

The Python session itself is designed for beginners. The official bootcamp plan covers Python fundamentals, syntax, data types, control flow, functions, lists, dictionaries, file handling, debugging, problem solving, and a final mini-build.

The quiz should therefore reinforce those concepts while making the learning session feel like an event.

---

# 2. Core Game Structure

IgniteQuest has **two distinct phases**.

```text
Team Registration
       │
       ▼
    PHONES AWAY
       │
       ▼
┌──────────────────────────────┐
│          PHASE 1             │
│                              │
│       MAIN ARENA             │
│                              │
│  All teams participate       │
│  KBC-inspired gameplay       │
│  Lifelines                   │
│  Round-robin format          │
│  Live public leaderboard     │
└──────────────┬───────────────┘
               │
          TOP 3–4 TEAMS
               │
               ▼
          PHONES BACK
               │
               ▼
┌──────────────────────────────┐
│          PHASE 2             │
│                              │
│     FASTEST FINGERS          │
│                              │
│  Finalists only              │
│  Team leaders log in        │
│  Everyone starts together    │
│  Same questions              │
│  Answer time recorded        │
│  NO live leaderboard         │
└──────────────┬───────────────┘
               │
               ▼
        FINAL RESULTS
               │
               ▼
       🥉  🥈  🥇
```

---

# 3. Phase 1 — Main Arena

## 3.1 Participants

All registered teams participate.

Registration happens before the quiz begins:

* Team leader registers the team.
* Team name is recorded.
* Team members can be recorded as basic metadata if required.
* A team leader receives the credentials/token required for Phase 2.
* Once registration closes, students put their phones away.

After this point, the mobile device is **not part of Phase 1 gameplay**.

---

## 3.2 Gameplay

Phase 1 is a **host-controlled, round-robin game-show experience**.

The host determines:

* Current round
* Current question
* Team currently answering
* When a question begins
* When an answer is locked
* When the answer is revealed
* Whether the team receives points
* When the next team/question begins

The audience sees only the presentation interface.

The host sees the control interface.

---

## 3.3 Round-Robin Concept

Questions rotate across the participating teams.

The exact number of questions and rotation sequence can be configured later.

Conceptually:

```text
Question 1 → Team A
Question 2 → Team B
Question 3 → Team C
Question 4 → Team D
Question 5 → Team A
...
```

The active team and current question must be explicitly represented in the game state.

The system must never rely solely on frontend state to determine who is currently answering what.

---

# 4. Phase 1 Lifelines

Each team receives a limited set of four lifelines.

## 4.1 50:50

Two incorrect options are removed from the displayed question.

## 4.2 Ask the Audience

The team can request audience assistance.

The host can trigger an audience interaction/poll-style presentation and then return to the question.

## 4.3 Ask the Expert

The team may request assistance from an instructor/mentor.

The system records that the lifeline was consumed.

## 4.4 Switch Question

The current question is discarded and replaced with another eligible question.

The system records:

* Original question
* Replacement question
* Team
* Lifeline used
* Time of usage

---

# 5. Lifeline Rules

Lifelines are **game events**, not merely UI booleans.

Every lifeline use should create a persistent record.

Example:

```text
Team Phoenix
    │
    ├── 50:50           USED
    ├── Ask Audience    USED
    ├── Ask Expert      AVAILABLE
    └── Switch Question USED
```

A team cannot use the same lifeline twice.

This rule should be enforced by the backend/database rather than relying only on disabled frontend buttons.

---

# 6. Phase 1 Leaderboard

A **live public leaderboard** is visible during Phase 1.

It should:

* Remain visible during normal gameplay where appropriate.
* Update immediately after score changes.
* Re-rank teams automatically.
* Animate rank changes.
* Make score progression visually exciting.

Example:

```text
🏆 LIVE LEADERBOARD

1. Team Syntax        80,000
2. ByteForce          60,000
3. PyPioneers         40,000
4. CodeBlooded        20,000
```

The leaderboard is an important part of the game-show experience rather than merely a reporting screen.

The current repository already has an animated leaderboard implementation using Framer Motion, making this a natural evolution of the existing UI rather than a completely new concept.

---

# 7. Phase 1 Qualification

At the end of Phase 1:

1. Final scores are locked.
2. Teams are ranked.
3. The top **3 or 4 teams** qualify.
4. All other teams are eliminated from competitive play.
5. The finalists are announced.

The exact finalist count should be configurable.

---

# 8. Phase 2 — Fastest Fingers

Phase 2 is intentionally different from Phase 1.

It is a **KBC-inspired Fastest Fingers First finale** for the finalists.

## 8.1 Setup

Phones return.

Only the team leaders need to log in.

The finalists enter the dedicated final interface.

All finalist teams receive:

* The same questions
* In the same sequence
* At the same time

---

# 9. Phase 2 Gameplay

The host starts the round.

All finalist teams begin simultaneously.

Conceptually:

```text
                 FINAL SPRINT

                    QUESTION 1

              [Python question]

                 A     B
                 C     D

                  00:15
```

Each team submits its answer through the platform.

The platform records:

* Team
* Question
* Selected answer
* Correctness
* Exact submission time
* Question/session context

---

# 10. No Live Leaderboard in Phase 2

This is a deliberate rule.

During Phase 2:

> **The finalists must not know who is currently winning.**

There is no public live leaderboard.

The system may internally calculate results, but the audience and contestants do not see the ranking.

This preserves suspense.

---

# 11. Fastest Fingers Scoring

The strongest default model is:

### Primary criterion

**Number of correct answers**

### Secondary criterion

**Total response time**

Therefore:

```text
Correctness first
      ↓
Speed as tiebreaker
```

Example:

| Team   | Correct | Total Time | Rank |
| ------ | ------: | ---------: | ---: |
| Team A |       9 |      48.2s |    1 |
| Team B |       9 |      61.4s |    2 |
| Team C |       8 |      35.1s |    3 |
| Team D |       7 |      29.7s |    4 |

Speed should reward fast accurate thinking, not careless guessing.

Response time should be stored in **milliseconds**, not floating-point seconds.

Example:

```text
1820 ms
2340 ms
1570 ms
```

---

# 12. Phase 2 Question Design

Phase 2 should emphasize **reasoning under pressure** rather than obscure Python trivia.

Preferred formats:

### Code tracing

```python
x = 3

for i in range(4):
    x += i

print(x)
```

### Debugging

```python
numbers = [1, 2, 3]

for n in numbers
    print(n)
```

### Logic

Which code correctly counts even numbers?

### Multi-concept questions

Questions combining:

* Lists
* Dictionaries
* Loops
* Conditions
* Functions
* Basic built-ins
* File handling

The difficulty should come from **combining concepts**, not from introducing Python features outside the workshop curriculum.

---

# 13. Question Design Philosophy

Questions should follow the progression of the Python session.

The bootcamp itself progresses from fundamentals into applied problem solving, with lists, dictionaries, file handling, debugging, exercises, and a mini-build.

Recommended progression:

```text
Python Basics
     ↓
Syntax & Data Types
     ↓
Operators
     ↓
Conditions
     ↓
Loops
     ↓
Functions
     ↓
Output Prediction
     ↓
Debugging
     ↓
Lists
     ↓
Dictionaries
     ↓
File Handling
     ↓
Problem Solving
     ↓
Multi-concept Boss Questions
```

---

# 14. Recommended Question Formats

## A. Classic MCQ

Simple introductory questions.

## B. Predict the Output

A core IgniteQuest question type.

```python
x = 10
y = 3

print(x // y)
```

## C. Debug the Code

Identify what is wrong.

## D. Which Code Works?

Choose the correct implementation from several snippets.

## E. What Would You Change?

Modify one operator/statement to make the program behave correctly.

## F. Scenario-Based

Ask what Python construct should be used to solve a realistic problem.

## G. Multi-Concept

Combine several beginner concepts into a single reasoning challenge.

---

# 15. Game-Show Presentation

IgniteQuest should feel like an event, not a worksheet.

The visual identity already established in the repository is:

* Royal black
* Prestige gold
* Ivory
* Emerald correctness signal
* Cinematic motion
* Premium typography

The existing project already uses this black/gold visual direction and Framer Motion for presentation animations.

Use that language consistently.

---

# 16. Host Screen vs Projector Screen

These should be treated as **two separate interfaces**.

## Host Console

The host sees:

```text
Current Round
Current Question
Active Team
Question Controls

[Reveal Question]
[Reveal Answer]
[Lock]
[Correct]
[Wrong]
[NEXT]

Lifelines
[50:50]
[Ask Audience]
[Ask Expert]
[Switch Question]

Score Controls
```

## Projector

Students see:

```text
IGNITEQUEST

PYTHON ARENA

Current prize/question

Question
Options
Timer
Lifeline visuals
Leaderboard
Animations
```

Administrative controls should never be exposed on the projector.

---

# 17. Game State

The platform needs an explicit persistent representation of the live game state.

At minimum:

```text
Current Phase
Current Question
Active Team
Question Start Time
```

During Phase 1:

```text
Phase 1
Question 17
Team Syntax
```

During Phase 2:

```text
Phase 2
Question 4
No single active team
```

This distinction is critical.

---

# 18. Database Architecture

The minimal robust domain model is:

```text
Event
 ├── Team
 ├── Question
 └── GameState

Team
 ├── TeamAnswer
 └── LifelineUsage

Question
 ├── TeamAnswer
 ├── LifelineUsage
 └── GameState
```

Recommended models:

1. `Event`
2. `GameState`
3. `Team`
4. `Question`
5. `TeamAnswer`
6. `LifelineUsage`

---

# 19. Data Model Responsibilities

## Event

Represents a particular IgniteQuest event.

Example:

```text
IgniteQuest — Python Arena 2026
```

Stores overall event status and owns teams/questions.

---

## Team

Represents a competing team.

Core information:

```text
id
name
leaderName
leaderToken
score
eventId
createdAt
```

A separate `User` model is unnecessary for the current requirements.

---

## Question

Represents a question in the event.

Core information:

```text
id
phase
order
text
type
options
correctOption
points
timeLimit
eventId
```

Questions belong to a phase but do not require separate Phase 1 and Phase 2 tables.

---

## GameState

Represents **what is happening right now**.

Core information:

```text
eventId
phase
currentQuestionId
activeTeamId
questionStartedAt
updatedAt
```

The `activeTeamId` is used primarily during Phase 1.

During Phase 2, there is no single active team because finalists answer simultaneously.

---

## TeamAnswer

Represents an actual answer submission.

Core information:

```text
teamId
questionId
answer
isCorrect
points
submittedAt
responseTime
```

This is particularly important for Phase 2.

Example:

```text
Team A
Q7
B
Correct
1820 ms
```

Phase 1 also uses the same model to preserve an auditable history of answers.

---

## LifelineUsage

Represents one consumed lifeline.

Core information:

```text
teamId
questionId
type
usedAt
replacementQuestionId
```

The supported lifelines are:

```text
FIFTY_FIFTY
ASK_AUDIENCE
ASK_EXPERT
SWITCH_QUESTION
```

---

# 20. Critical Relationships

The platform must preserve these relationships explicitly.

### Current Question ↔ Active Team

```text
GameState.currentQuestionId
        +
GameState.activeTeamId
```

This answers:

> "Which team is currently answering the question being displayed?"

---

### Team ↔ Question ↔ Answer

```text
TeamAnswer
    ├── Team
    └── Question
```

This answers:

> "What did this team answer for this question?"

---

### Team ↔ Lifeline ↔ Question

```text
LifelineUsage
    ├── Team
    ├── Question
    └── LifelineType
```

This answers:

> "Which team used which lifeline on which question?"

---

### Switch Question

```text
Original Question
       │
       ▼
SWITCH_QUESTION
       │
       ▼
Replacement Question
```

The replacement question should therefore be explicitly linked rather than merely implied.

---

# 21. Important Database Rules

The database should enforce game rules wherever practical.

### A team cannot use the same lifeline twice

Enforce through:

```text
@@unique([teamId, type])
```

### A team should answer a given question at most once

Enforce through:

```text
@@unique([teamId, questionId])
```

### Team names should be unique within an event

```text
@@unique([eventId, name])
```

### Phase and question order should uniquely identify a question within an event

```text
@@unique([eventId, phase, order])
```

---

# 22. Phase 1 Data Flow

```text
Host selects team
       ↓
Host selects question
       ↓
GameState updated
       ↓
Projector shows question
       ↓
Team discusses
       ↓
Host records answer
       ↓
TeamAnswer created
       ↓
Correctness determined
       ↓
Team score updated
       ↓
Leaderboard updates
       ↓
Next team/question
```

---

# 23. Phase 1 Lifeline Flow

```text
Host selects lifeline
       ↓
Backend verifies team has not used it
       ↓
LifelineUsage created
       ↓
Game-specific action occurs
       ↓
Question/game state updated if necessary
```

For `SWITCH_QUESTION`:

```text
Current Question
       ↓
LifelineUsage created
       ↓
Replacement Question selected
       ↓
GameState.currentQuestionId updated
```

---

# 24. Phase 2 Data Flow

```text
Finalists identified
       ↓
Phones return
       ↓
Team leaders log in
       ↓
Host starts Final Sprint
       ↓
All teams receive Question 1
       ↓
Teams submit answers
       ↓
Submission time recorded
       ↓
Question 2
       ↓
...
       ↓
Final question
       ↓
Results locked
       ↓
Ranking calculated
       ↓
Finale
```

---

# 25. Phase 2 Deliberate Constraint

The leaderboard must **not** be exposed during the final sprint.

The system can internally calculate:

* Correct answers
* Response times
* Current standings

but those standings should remain hidden until the final reveal.

---

# 26. Finale

The final screen is the climax of the event.

The current repository already has a dedicated `/finale` screen with animated top-three podium presentation, which can evolve directly into the final IgniteQuest championship reveal.

Suggested flow:

```text
FINAL ANSWERS LOCKED
        ↓
Results Processing
        ↓
"The Final Results Are In"
        ↓
3rd Place
        ↓
2nd Place
        ↓
1st Place
        ↓
IGNITEQUEST CHAMPIONS
```

The Phase 1 leaderboard should not simply continue into the finale.

Phase 2 determines the final champion.

Finalists enter Phase 2 on equal footing.

---

# 27. Architectural Principle

IgniteQuest should be thought of as:

> **A local event control system with a quiz engine and a game-show presentation layer.**

Not simply:

> "A quiz website."

The platform has three distinct concerns:

```text
GAME ENGINE
    │
    ├── phases
    ├── questions
    ├── teams
    ├── scoring
    ├── lifelines
    └── answers

HOST CONTROL
    │
    ├── select team
    ├── select question
    ├── start/stop
    ├── reveal
    ├── score
    └── advance

PRESENTATION
    │
    ├── projector
    ├── animations
    ├── leaderboard
    ├── timers
    ├── suspense
    └── finale
```

---

# 28. Recommended Minimal Prisma Domain

```text
Event
 ├── Team
 │    ├── TeamAnswer
 │    └── LifelineUsage
 │
 ├── Question
 │    ├── TeamAnswer
 │    ├── LifelineUsage
 │    └── GameState
 │
 └── GameState
```

Six models are enough.

Do **not** add:

* User/Role systems
* TeamMember entities
* Separate Phase 1/Phase 2 tables
* Separate lifeline tables for each lifeline
* Round entities unless actual gameplay rules require them
* Historical leaderboard snapshots unless analytics later justify them

Keep the domain small.

---

# 29. Current Repository → New Direction

The current repository already provides a useful foundation:

```text
Next.js
React
Framer Motion
Prisma
PostgreSQL
Docker
```

and currently contains:

```text
Landing page
Quiz page
Leaderboard
Question Card
Score Controls
Finale
Prisma Participant model
Prisma Question model
Server Actions
```

The main conceptual evolution is:

```text
CURRENT

Participant
   ↓
Score
   ↓
Quiz
   ↓
Leaderboard
   ↓
Finale


TARGET

Event
   │
   ├── Teams
   ├── Questions
   └── GameState
          │
          ├── Phase 1
          │     ├── Round Robin
          │     ├── Lifelines
          │     ├── Scoring
          │     └── Live Leaderboard
          │
          └── Phase 2
                ├── Finalists
                ├── Simultaneous Questions
                ├── Accuracy
                ├── Response Time
                └── Hidden Leaderboard
                          │
                          ▼
                       Finale
```

---

# 30. Final Product Definition

**IgniteQuest is a two-phase, host-controlled Python game-show platform.**

### Phase 1

All teams compete in a KBC-inspired round-robin arena featuring four lifelines, team strategy, escalating questions, scoring, animations, and a live public leaderboard.

### Phase 2

The top 3–4 teams advance to a Fastest
