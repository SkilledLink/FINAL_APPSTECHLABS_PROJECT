# SkilledLink

SkilledLink is a professional network and local-services marketplace. Individuals can discover professionals, services, and jobs; professionals can publish portfolios and manage their professional presence. The platform also includes messaging, verification, subscriptions, AI-assisted features, and administrative moderation.

## Technology Stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript 6, Vite 8, React Router 7 |
| UI and visualization | Tailwind CSS 4, Lucide React, React Icons, Recharts |
| Frontend data and realtime | Axios, Fetch API, Socket.IO client |
| Backend API | Python, FastAPI, Pydantic 2, SQLModel, SQLAlchemy 2 |
| Database and migrations | PostgreSQL, pgvector, GeoAlchemy2, Alembic |
| Authentication and security | JWT (PyJWT), Argon2 password hashing, cryptography |
| Media and storage integrations | Cloudinary, Supabase |
| AI integrations | OpenAI, Google Gemini, Groq; embeddings, search, moderation, and tier-based features |
| Other integrations | Didit identity verification, Resend email, MTN Mobile Money payment integration |

The concrete provider and feature configuration is controlled by environment settings. Integrations may require credentials and may have sandbox or mock modes.

## Repository Layout

```text
.
├── backend/
│   ├── app/
│   │   ├── ai/             # AI gateway, search, intent, tools, and safeguards
│   │   ├── api/v1/         # Versioned API routers and admin/moderator routers
│   │   ├── core/           # Settings, security, constants, and cloud storage setup
│   │   ├── database/       # SQLModel engine and session management
│   │   ├── dependencies/  # Authentication and permission dependencies
│   │   ├── enums/          # Domain and capability enums
│   │   ├── models/        # Database models
│   │   ├── repositories/  # Persistence access
│   │   ├── schemas/       # Request and response schemas
│   │   ├── services/      # Business logic and integrations
│   │   ├── sockets/       # Realtime socket support
│   │   ├── websockets/    # WebSocket support
│   │   ├── main.py        # FastAPI application and router registration
│   │   └── webhooks.py    # External provider webhooks
│   ├── alembic/           # Database migration configuration and revisions
│   ├── scripts/           # Data and maintenance scripts
│   └── requirements.txt
└── frontend/
    ├── public/            # Static public assets
    └── src/
        ├── api/           # API helpers
        ├── components/    # Shared UI and application layout
        ├── contexts/      # Shared app contexts, including sockets
        ├── features/      # Feature-oriented pages, components, and services
        ├── hooks/         # Shared React hooks
        ├── providers/     # Authentication and theme providers
        ├── routes/        # Route-related helpers
        ├── services/      # Shared service integrations
        ├── styles/        # Stylesheets and design tokens
        ├── types/         # Shared TypeScript types
        ├── App.tsx        # Browser route declarations
        └── main.tsx       # Frontend entry point
```

## Roles and Access

- **Individual / Client**: discovers and hires professionals, explores services, browses or posts jobs, and uses community and messaging features.
- **Professional**: maintains a professional profile and portfolio, offers services, applies for jobs, and can complete identity verification. Professional subscriptions gate selected AI features.
- **Moderator**: handles delegated moderation and operational tasks. Backend capabilities include viewing and suspending users and professionals, managing posts, comments, jobs, moderation, and viewing audit logs.
- **Administrator**: has the full backend capability set, including moderator and administrator management.

Backend authorization is implemented through authenticated-user and capability dependencies. Frontend route presence alone should not be treated as authorization; protected operations are enforced by the API.

## Frontend Pages and Navigation

The route declarations are in `frontend/src/App.tsx`. The main authenticated workspace uses the shared `AppLayout` under `/home`.

| Browser path | Page or purpose | Access |
| --- | --- | --- |
| `/` | Public landing page | Public |
| `/login`, `/register` | Sign in and account registration | Public-only; signed-in users are redirected to `/home` |
| `/verify-email` | Email verification | Public-only |
| `/forgot-password`, `/reset-password` | Password recovery | Public-only |
| `/onboarding` | Choose an account type and start onboarding | Authenticated |
| `/onboarding/professional` | Professional setup wizard | Authenticated |
| `/home` | Home dashboard | Authenticated |
| `/home/feeds` | Feeds | Authenticated |
| `/home/jobs` | Browse jobs | Authenticated |
| `/home/jobs/create` | Create a job | Authenticated |
| `/home/jobs/:id` | Job details | Authenticated |
| `/home/discover` | Nearby professionals | Authenticated |
| `/home/marketplace` | Service marketplace | Authenticated |
| `/home/professionals`, `/home/users` | Browse professionals or users | Authenticated |
| `/home/portfolio`, `/home/portfolio/:userId` | Portfolio dashboard or public profile | Authenticated under `/home` |
| `/portfolio/:userId` | Standalone public portfolio | Public |
| `/home/profile`, `/home/profile/:id` | Current or selected user profile | Authenticated |
| `/home/messages`, `/home/messages/:conversationId` | Conversations and messages | Authenticated |
| `/home/notifications` | Notifications | Authenticated |
| `/home/verification` | Professional verification status | Authenticated |
| `/verify/complete` | Return from the identity verification provider | Authenticated redirect route |
| `/admin_dashboard` | Admin dashboard | Admin interface; API operations are capability-protected |
| `/moderator_dashboard` | Moderator dashboard | Moderator interface; API operations are capability-protected |

The `/jobs`, `/jobs/create`, and `/jobs/:id` paths redirect to their `/home/jobs...` equivalents. Unknown paths render the not-found page. The app also initializes authentication, theme, socket, call, toast, and AI assistant providers/widgets around its routes.

## Backend API Areas

FastAPI router registration is centralized in `backend/app/main.py`. The API includes these areas:

- Authentication, users, professionals, professional locations, portfolios, and KYC.
- Jobs, feeds, search, chat, conversations, messages, uploads, and reviews.
- Notifications, reports, contact messages, and external webhooks.
- Professional tiers, subscriptions, payments, AI usage, and tier-gated AI features.
- Admin and moderator dashboards, user/professional management, moderation, and audit logs.

Some routers define their own prefixes, while search and chat are explicitly mounted with `/api/v1`. For the complete live method/path list and request schemas, run the backend and use FastAPI's interactive API documentation at `/docs` (or `/redoc`). The database health endpoint is `/health/database`.

## Run Locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite development server normally prints its local URL (commonly `http://localhost:5173`). Set `VITE_API_URL` when the backend is not available at the frontend's default `http://localhost:8000` API origin.

Useful frontend commands:

```bash
npm run build
npm run lint
```

### Backend

Create and activate a Python virtual environment, install dependencies, configure the required settings in `backend/.env`, then run:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend requires a reachable PostgreSQL database and environment configuration. Settings include database and JWT secrets, email, storage, and any enabled verification, AI, or payment integrations. Do not commit credentials. Database migrations are managed with Alembic; review the project's migration state before applying migrations to a database.

## Configuration Notes

- Backend settings are defined in `backend/app/core/config.py` and loaded from `backend/.env`.
- Frontend API origin is read from `VITE_API_URL`; the auth service falls back to `http://localhost:8000`.
- CORS development origins are configured in `backend/app/main.py`.
- AI providers, KYC, payments, email, and media services need the corresponding provider settings to be configured before their integrations can work.
