# TaskFlow — Collaborative Task Manager

A full-stack web application built with **React + Tailwind CSS** (frontend) and **Node.js + Express + MongoDB** (backend), featuring JWT authentication, role-based access control, real-time updates via WebSockets, drag-and-drop task boards, and paginated activity logs.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))

---

### 1. Clone / Extract the project

```bash
cd taskmanager
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env          # Edit .env with your MongoDB URI and a JWT secret
npm install
npm start                     # or: npm run dev (requires nodemon)
```

The API will run on **http://localhost:5000**

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will run on **http://localhost:3000**

---

## ⚙️ Environment Variables (backend/.env)

| Variable    | Description                                 | Default                                     |
|-------------|---------------------------------------------|---------------------------------------------|
| PORT        | Server port                                 | 5000                                        |
| MONGO_URI   | MongoDB connection string                   | mongodb://localhost:27017/taskmanager       |
| JWT_SECRET  | Secret key for JWT signing                  | (required — change before production)       |
| JWT_EXPIRE  | Token expiry                                | 7d                                          |

---

## ✅ Features Implemented

### Authentication
- JWT-based signup/login
- Persistent sessions via localStorage (Zustand persist)
- Auto-logout on token expiry

### Role-Based Access Control (RBAC)
- **Manager**: Create, edit, delete tasks; assign to users; view activity logs
- **User**: View assigned tasks; update task status

### Task Management
- Kanban board with **drag-and-drop** (dnd-kit) across To Do / In Progress / Completed
- Create, edit, delete tasks (managers)
- Priority levels (low / medium / high)
- Due dates with overdue highlighting
- Assign tasks to specific users
- Filter tasks by status
- **Paginated** task lists

### Dashboard
- Summary stats (total, by status)
- Recent task list

### Real-Time Updates
- **Socket.io** WebSockets: task create/update/delete events broadcast to all connected clients instantly

### Activity Logs
- Every task change (create, update, delete) stored in MongoDB
- Managers can view paginated logs with user + task context

### UI/UX
- **Dark mode toggle** (persisted across sessions)
- Responsive sidebar layout
- Toast notifications (react-hot-toast)
- Loading states + empty states

### Security
- Rate limiting: 100 requests / 15 min per IP
- JWT middleware protecting all routes
- Role checks on sensitive endpoints (managers only for create/delete/logs)

---

## 📁 Project Structure

```
taskmanager/
├── backend/
│   ├── config/db.js
│   ├── middleware/auth.js       # JWT + role guards
│   ├── models/
│   │   ├── User.js
│   │   ├── Task.js
│   │   └── Log.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   ├── users.js
│   │   └── logs.js
│   ├── server.js
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   ├── TaskModal.jsx    # Create/edit task form
    │   │   └── StatusModal.jsx  # User status update
    │   ├── pages/
    │   │   ├── AuthPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── TasksPage.jsx    # Kanban board
    │   │   └── LogsPage.jsx
    │   ├── api.js               # Axios instance + interceptors
    │   ├── socket.js            # Socket.io client singleton
    │   ├── store.js             # Zustand stores (auth + theme)
    │   └── App.jsx
    └── vite.config.js           # Proxies /api → localhost:5000
```

---

## 🤖 AI Usage

This project was scaffolded with the assistance of Claude (Anthropic). Claude generated the initial boilerplate for routes, models, and component structure, which was then reviewed and integrated. No AI is embedded in the runtime application itself.

---

## 🎥 Demo Notes

For the 5-minute walkthrough, demonstrate:
1. Signup as Manager → create tasks, assign to users
2. Signup as User → view assigned tasks, update status
3. Drag a card across columns on the board
4. Toggle dark mode
5. View activity logs (as manager)
6. Open DevTools → Network to show real-time socket events
---

## Deployment: Render Backend + Vercel Frontend

### 1. Deploy the backend on Render

Create a new Render Web Service from this repository.

Recommended settings:

```text
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

Add these environment variables in Render:

```text
NODE_ENV=production
MONGO_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<long random secret>
JWT_EXPIRE=7d
DNS_SERVERS=8.8.8.8,1.1.1.1
MONGO_TIMEOUT_MS=10000
CLIENT_ORIGIN=<your Vercel frontend URL>
```

After deploy, your backend URL will look like:

```text
https://taskmanager-backend.onrender.com
```

Open that URL in the browser. You should see:

```json
{ "status": "Task Manager API running" }
```

### 2. Deploy the frontend on Vercel

Import the same repository into Vercel.

Recommended settings:

```text
Root Directory: frontend
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Add this environment variable in Vercel:

```text
VITE_API_URL=<your Render backend URL>
```

Example:

```text
VITE_API_URL=https://taskmanager-backend.onrender.com
```

Redeploy the Vercel project after changing environment variables.

### 3. Final connection step

Copy your final Vercel frontend URL, then update Render:

```text
CLIENT_ORIGIN=https://your-vercel-app.vercel.app
```

Redeploy the Render backend after changing `CLIENT_ORIGIN`.
