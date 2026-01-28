# DeadLock Platform

A locally-hosted coding competition platform for 30 users (10 teams of 3), featuring two exciting games:

- **DeadLock**: Tug-of-war style coding battle between two teams
- **Crack the Code**: Reverse engineering challenges where teams compete to discover hidden functions

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Socket.io Client |
| Backend | Node.js, Express, Socket.io, Prisma |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Shared | TypeScript types and utilities |

## 📁 Project Structure

```
deadlock-platform/
├── apps/
│   ├── web/                 # React frontend
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── pages/       # Page components
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── services/    # API/Socket services
│   │   │   └── stores/      # State management
│   │   └── ...
│   └── server/              # Express backend
│       ├── src/
│       │   ├── routes/      # API routes
│       │   ├── middleware/  # Express middleware
│       │   ├── services/    # Business logic
│       │   ├── socket/      # Socket.io handlers
│       │   └── lib/         # Utilities
│       └── prisma/          # Database schema
├── packages/
│   └── shared/              # Shared types & utilities
├── docker/                  # Docker configurations
└── docker-compose.yml
```

## 🛠️ Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Docker** (optional, for containerized development)

## ⚡ Quick Start

### 1. Clone and Install

```bash
cd DEAD\ LOCK
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 4. Start Development

```bash
npm run dev
```

This starts both the frontend (http://localhost:5173) and backend (http://localhost:3000) concurrently.

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend in dev mode |
| `npm run dev:web` | Start only the frontend |
| `npm run dev:server` | Start only the backend |
| `npm run build` | Build all packages for production |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:studio` | Open Prisma Studio GUI |

## 🐳 Docker Development

```bash
# Start all services
docker-compose up

# Stop all services
docker-compose down
```

## 🎮 Game Modes

### DeadLock (Tug-of-War)

- Two teams compete head-to-head
- Solving problems pulls the "rope" toward your side
- First team to pull completely wins
- 5 rounds, 5 minutes each

### Crack the Code (Reverse Engineering)

- Up to 10 teams compete simultaneously
- Discover the hidden function by testing inputs
- Submit your implementation to verify
- 30-minute time limit, 50 test attempts

## 🔧 Configuration

Key environment variables (see `.env.example` for full list):

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | 3000 |
| `DATABASE_URL` | Database connection string | SQLite file |
| `JWT_SECRET` | JWT signing secret | (required) |
| `CODE_EXECUTION_TIMEOUT` | Max code execution time (ms) | 10000 |

## 📝 API Overview

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user

### Teams
- `GET /api/teams` - List all teams
- `GET /api/teams/:id` - Get team details
- `GET /api/teams/leaderboard/all` - Leaderboard

### Games
- `GET /api/games/matches` - List matches
- `POST /api/games/matches` - Create match
- `POST /api/games/matches/:id/start` - Start match

### Problems
- `GET /api/problems` - List problems
- `GET /api/problems/:id` - Get problem details

### Submissions
- `POST /api/submissions` - Submit code
- `GET /api/submissions/:id` - Get submission result

## 🔌 Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join:game` | Client → Server | Join a match room |
| `submit:code` | Client → Server | Notify of submission |
| `game:progress` | Bidirectional | Tug-of-war position update |
| `round:started` | Server → Client | New round begins |
| `match:ended` | Server → Client | Match completed |

## 🛡️ Security Notes

- Code execution is sandboxed (consider Docker containers for production)
- JWT tokens expire after 7 days by default
- Rate limiting enabled on API endpoints
- CORS configured for frontend origin only

## 📄 License

MIT
