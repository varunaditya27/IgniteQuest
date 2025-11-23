# ✨ IgniteQuest — The Ultimate Live Quiz Orchestration Platform

IgniteQuest is a premium, stage-ready quiz management system purpose-built for live school outreach events where the audience has **no devices**. Entirely controlled by the quizmaster from a single laptop, IgniteQuest transforms a simple quiz into a cinematic, high-energy experience with dynamic visuals, real-time scoring, and a polished finale reveal.

This platform replaces traditional PPTs, manual score sheets, and basic displays with a modern, animated, and professional interface that runs fully on **Next.js + PostgreSQL (Dockerised)** on **localhost**.

---

## 🚀 Features at a Glance

* 🎛 **Landing Screen** — A stunning welcome page acting as a pre-event placeholder.
* 🧠 **Question Display System** — Beautifully crafted quiz cards with options.
* 🎯 **Answer Reveal Button** — Highlights the correct option instantly.
* 🧍‍♂️🧍‍♀️ **Participant Manager** — Search participants and apply +4 / -2 scoring.
* 📊 **Real-Time Leaderboard** — Always visible, animated, and auto-sorting.
* 🥇 **Winners Finale Screen** — Displays top 3 with celebration animations.
* 🎨 **Royal Black-Gold Theme** — Aesthetic, sleek, and stage-ready.
* ⚡ **Local Offline Operation** — No internet dependency.
* 🗃 **Postgres-Powered** — Fast, reliable score syncing.

---

## 🎯 Purpose of IgniteQuest

IgniteQuest is designed for **live school quiz events** run by the RVCE Coding Club (or any similar organisation). These events happen in auditoriums where:

* Students have **no phones or laptops**.
* Only the host controls the quiz.
* Projectors display content to the audience.

IgniteQuest provides:

* A modern replacement for PowerPoint,
* A built-in scoring system,
* A show-like leaderboard,
* And a clean, reliable interface for live hosting.

---

## 🖥️ Screens & Architecture Overview

### **1. Landing Page**

A polished greeting screen with a CTA to begin the quiz. Perfect for stage introductions.

### **2. Quiz Screen**

The central hub containing:

* Large question card
* MCQ option layout
* Reveal Answer control
* Left-side participant scoring controls
* Right-side animated leaderboard

### **3. Finale Screen**

Celebrates the top 3 participants with:

* Gold aurora animations
* Spotlight effects
* Clean ranking layout

---

## 🎨 Design Philosophy

IgniteQuest has a bold and royal theme:

* **Primary Colors:** Royal Black `#0A0A0A`, Prestige Gold `#F5C542`
* **Fonts:** Playfair Display, Montserrat, Source Sans Pro
* **Animations:** Cinematic, smooth, gold-accented motions
* **UI Personality:** Futuristic, royal, premium

The visuals are crafted to impress teenage audiences and elevate the event's energy.

---

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router)
* **Database:** PostgreSQL (Dockerised for local use)
* **ORM / Querying:** Prisma (recommended)
* **Frontend Styling:** Tailwind CSS / Framer Motion (for animations)
* **Runtime:** Localhost only

---

## 🧱 Folder Structure (Recommended)

```
/ignitequest
├── app
│   ├── page.tsx                 # Landing screen
│   ├── quiz
│   │   ├── page.tsx             # Main quiz screen
│   └── finale
│       ├── page.tsx             # Winners screen
│
├── components
│   ├── QuizCard.tsx
│   ├── Leaderboard.tsx
│   ├── ScoreManager.tsx
│   ├── Layouts
│   └── Animations
│
├── lib
│   ├── db.ts                    # DB connection
│   └── utils.ts
│
├── prisma
│   └── schema.prisma            # Participant + Scores
│
├── public                       # Static assets, logos, textures
│
└── docker
    └── docker-compose.yml       # Postgres container
```

---

## 🗄️ Database Schema (Conceptual)

```
Participant {
  id            Int      @id @default(autoincrement())
  name          String
  score         Int      @default(0)
  createdAt     DateTime @default(now())
}
```

Future extensions may include:

* Team mode
* Rounds
* Question banks

---

## ⚙️ Running Locally

### **1. Start Postgres via Docker**

```sh
docker compose up -d
```

### **2. Apply Prisma Migrations**

```sh
npx prisma migrate dev
```

### **3. Run Next.js Dev Server**

```sh
npm run dev
```

### **4. Visit IgniteQuest**

* Landing Page → `http://localhost:3000`
* Quiz Screen → `/quiz`
* Finale Screen → `/finale`

Everything runs locally—no internet required.

---

## 🧪 Why This Platform Stands Out

* Created specifically for **live, offline, school-friendly quizzes**.
* Designed with **visual prestige** and **event energy** in mind.
* Incredibly smooth to operate while speaking on stage.
* Perfect blend of aesthetics + functionality.
* Has the cinematic punch teenagers love.

---

## 🏁 Project Status & Future Ideas

IgniteQuest is actively evolving. Planned enhancements:

* Multi-round quizzes
* Sound effects for reveals and leaderboard jumps
* Animated transitions between questions
* Team mode support
* Host-side mobile remote (future possibility)

---

## 🤝 Contributions

This project is designed to be extendable. PRs, suggestions, and improvements are welcome.

---

## 📜 License

MIT License.

---

## ⭐ Final Note

IgniteQuest is more than a quiz tool—it’s a **show**. A crafted experience. A premium highlight of any coding club outreach event.

If you’re using this for an offline quiz in a school or college, prepare for impressed students, teachers, and a very smooth hosting experience.
