
```markdown
# Aura Quest Grind 🎯  
_An AI-powered productivity platform that turns your goals into structured, gamified quests._

---

## 🚀 Overview

Aura Quest Grind is a smart productivity tool that leverages AI to help users convert their personal or academic goals into well-structured tasks, using **gamification**, **Pomodoro techniques**, and **dynamic task guidance**. The system personalizes each user's experience via an intelligent onboarding flow, enabling focused work through AI-generated subtasks, time estimation, and integrated resource suggestions.

---

## 📌 Key Features

- **AI Onboarding Flow** – Captures user preferences/goals within 5 tailored prompts and stores them in the backend.
- **Quest Generator** – Uses AI to break goals into structured subtasks with estimated times.
- **Pomodoro Sync** – Redirects to a pomodoro page with accurate cycles based on AI time breakdown.
- **Follow-up Assistant** – One-click AI resource fetcher for each subtask (if users want more help).
- **Backend Integration** – MongoDB Atlas handles all user data, preferences, quests, and progress.

---

## 🛠 Tech Stack

| Tech         | Purpose                        |
|--------------|--------------------------------|
| **React + Vite** | Frontend framework             |
| **Tailwind CSS** | UI design and utility classes  |
| **Lovable.dev + Gemini AI** | Onboarding + task generation |
| **MongoDB Atlas** | Cloud database                |
| **Node.js + Express** | Backend API server         |

---

## 📁 Project Structure

```

/client/           → Frontend (Vite + React)
/server/           → Backend API (Node.js + Express)
/config.env        → MongoDB connection URI
/public/           → Static assets

````

---

## 🧩 Setup Instructions

### 🔐 Prerequisites

- Node.js 18+
- MongoDB Atlas URI
- `.env` file with credentials

### ⚙️ Backend

```bash
cd server
npm install

# Add MongoDB URI in config.env
echo "ATLAS_URI=<your-mongo-uri>" > config.env

node connect.cjs   # For testing connection
node server.js     # Or nodemon
````

### 🖼 Frontend

```bash
cd client
npm install
npm run dev
```

---

## 📡 API Overview

| Route                 | Description                      |
| --------------------- | -------------------------------- |
| `POST /api/users`     | Create new user with preferences |
| `POST /api/quests`    | Generate and store AI quest      |
| `GET /api/quests/:id` | Retrieve user's quests           |

---

## 🧠 How Onboarding Works

1. After signup, user answers 5 tailored AI prompts.
2. Responses are stored in MongoDB.
3. AI generates a full quest with subtasks and time estimates.
4. User is redirected to their quest dashboard.
5. Each subtask has an optional “Follow-up with AI” feature for more help.

---

## ✅ Current Status

* [x] Functional AI onboarding (5-prompt max)
* [x] Quest generation and MongoDB storage
* [x] Pomodoro time breakdown from subtasks
* [x] Follow-up AI suggestions for subtasks
* [x] User XP & gamification system
* [x] UI polishing and animations
* [x] Deployment (Render / Vercel)

---

## 👤 Author

**Srikanth Karthikeyan**
B.Tech CSE | Full-Stack Developer | AI + Web3 Enthusiast
[LinkedIn](https://www.linkedin.com/in/srikanth-karthikeyan/) | [Portfolio](https://drive.google.com/file/d/1FmTKUQT1sN7zHuYpTlpIzmoD3-8arYUP/view?usp=sharing)

---


