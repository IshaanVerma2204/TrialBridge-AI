<div align="center">

<h1>🧬 TrialBridge AI</h1>

<p><em>An intelligent, full-stack clinical trial matching engine that connects patients to life-changing research through the power of semantic vector search and NLP.</em></p>

[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python_3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Qdrant](https://img.shields.io/badge/Qdrant-DC143C?style=for-the-badge&logo=qdrant&logoColor=white)](https://qdrant.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)

</div>

---

## 📖 Overview

Clinical trial recruitment is one of the most expensive and time-consuming bottlenecks in modern medicine. The traditional process — patients manually browsing ClinicalTrials.gov, researchers cold-calling candidates — is slow, imprecise, and fails to account for complex genomic and phenotypic profiles.

**TrialBridge AI** solves this by treating patient-trial matching as a **semantic similarity problem**. A patient's entire medical profile (conditions, genomic markers, medical history, age) is embedded into a 384-dimensional vector and compared against a live index of clinical trials sourced directly from **ClinicalTrials.gov**, returning results ranked by cosine similarity in milliseconds.

> 📊 **Capable of processing 5,000+ clinical records with sub-50ms vector search latency using BAAI/bge-small-en-v1.5 embeddings and a locally-hosted Qdrant engine.**

---

## 🏗️ System Architecture

The application follows a clean **monorepo** structure with a fully decoupled frontend and backend communicating exclusively over a typed REST API.

```
trialbridge-ai/
├── apps/
│   ├── api/               # FastAPI backend (Python)
│   │   ├── src/
│   │   │   ├── auth/          # JWT authentication (login, register, token)
│   │   │   ├── models.py      # SQLAlchemy ORM models (User, Patient, Trial, Invitation)
│   │   │   ├── routers/       # API route handlers (patients, researchers, admin, trials)
│   │   │   ├── schemas/       # Pydantic request/response schemas
│   │   │   ├── services/
│   │   │   │   ├── ai_matcher.py      # Core: Qdrant vector search engine
│   │   │   │   └── clinical_trials.py # ClinicalTrials.gov API integration
│   │   │   └── database.py    # SQLAlchemy session management
│   │   └── alembic/           # Database migration scripts
│   └── web/               # Next.js 15 frontend (TypeScript)
│       └── src/
│           ├── app/
│           │   ├── dashboard/[role]/   # Dynamic role-based dashboard
│           │   ├── login/              # Authentication pages
│           │   └── register/
│           ├── components/    # Reusable UI components (shadcn/ui)
│           ├── contexts/      # Auth context / global state
│           └── lib/
│               └── api-client.ts  # Typed fetch wrapper with auto JWT injection
└── start.bat              # One-command launcher for all services
```

---

## 🔄 High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT (Browser)                                     │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                    Next.js 15 Frontend (Port 3000)                       │    │
│  │                                                                          │    │
│  │  ┌──────────────┐  ┌──────────────────┐  ┌───────────────────────────┐  │    │
│  │  │ Patient      │  │ Researcher       │  │ Admin Dashboard           │  │    │
│  │  │ Dashboard    │  │ Dashboard        │  │ (Analytics & Controls)    │  │    │
│  │  │              │  │                  │  │                           │  │    │
│  │  │ - AI Matches │  │ - Trial List     │  │ - Platform Stats          │  │    │
│  │  │ - Invitations│  │ - Matched Cands. │  │ - Global Sync Trigger     │  │    │
│  │  │ - Profile    │  │ - Invite System  │  │                           │  │    │
│  │  └──────────────┘  └──────────────────┘  └───────────────────────────┘  │    │
│  │                                                                          │    │
│  │              Auth Context (JWT stored in localStorage)                   │    │
│  └───────────────────────────┬─────────────────────────────────────────────┘    │
│                              │ HTTPS REST + JWT Bearer Token                     │
└──────────────────────────────┼───────────────────────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────────────────────┐
│                   SERVER     │                                                    │
│                              ▼                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                    FastAPI Backend (Port 8000)                            │    │
│  │                                                                          │    │
│  │  ┌──────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐            │    │
│  │  │  /auth   │  │ /patients  │  │/researchers│  │  /trials │            │    │
│  │  │ register │  │ /me        │  │ /trials    │  │  /sync   │            │    │
│  │  │ login    │  │ /matches   │  │ /patients  │  │          │            │    │
│  │  │ token    │  │ /invitations│ │ /invite    │  │          │            │    │
│  │  └──────────┘  └────────────┘  └────────────┘  └──────────┘            │    │
│  │                         │                              │                │    │
│  │                         │                              │                │    │
│  │              ┌──────────┴──────────┐     ┌────────────┴──────────┐     │    │
│  │              │   SQLAlchemy ORM    │     │    AI Matcher Service  │     │    │
│  │              │   (Database Layer)  │     │                       │     │    │
│  │              └──────────┬──────────┘     └────────────┬──────────┘     │    │
│  │                         │                              │                │    │
│  │                         ▼                              ▼                │    │
│  │              ┌──────────────────┐        ┌────────────────────────┐    │    │
│  │              │  SQLite Database │        │   Qdrant Vector DB     │    │    │
│  │              │                  │        │  (384-dim COSINE)      │    │    │
│  │              │  - users         │        │                        │    │    │
│  │              │  - patients      │        │  BAAI/bge-small-en     │    │    │
│  │              │  - clinical_     │        │  Embedding Model       │    │    │
│  │              │    trials        │        │                        │    │    │
│  │              │  - trial_        │        │  clinical_trials       │    │    │
│  │              │    invitations   │        │  collection            │    │    │
│  │              └──────────────────┘        └────────────────────────┘    │    │
│  │                                                          │              │    │
│  └──────────────────────────────────────────────────────────┼─────────────┘    │
│                                                             │                   │
│                                                             ▼                   │
│                                                 ┌───────────────────────┐       │
│                                                 │  ClinicalTrials.gov   │       │
│                                                 │  REST API             │       │
│                                                 │  (Live trial data)    │       │
│                                                 └───────────────────────┘       │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧠 AI Matching Engine (Deep Dive)

The core intelligence of TrialBridge is a **two-phase embedding pipeline** implemented in `ai_matcher.py`.

### Phase 1: Trial Indexing (Write Path)

When a researcher triggers a sync, the system fetches live trials from **ClinicalTrials.gov** and indexes them into Qdrant.

```
ClinicalTrials.gov API
        │
        │  (Condition-specific query, e.g., "ALS", "BRCA1", etc.)
        ▼
clinical_trials.py service (fetch & parse)
        │
        │  Structured trial objects { nct_id, title, inclusion_criteria, ... }
        ▼
SQLite Database ──────── also ──────────► Qdrant Upsert
(Persistent storage)                             │
                                     Text: "Title: [title].
                                     Inclusion Criteria: [criteria]"
                                                 │
                                                 ▼
                                  BAAI/bge-small-en-v1.5 Embedding
                                  (384-dimensional dense vector)
                                                 │
                                                 ▼
                                  PointStruct { id, vector, payload }
                                  stored in Qdrant collection
```

### Phase 2: Patient Matching (Read Path)

When a patient requests matches, their full medical profile is embedded and compared against all indexed trials.

```
Patient Profile
{ age: 62, conditions: "ALS", genes: "SOD1", history: "..." }
        │
        ▼
"Age: 62. Conditions: ALS. Genes: SOD1. History: ..."
        │
        ▼
BAAI/bge-small-en-v1.5 Embedding (384-dim vector)
        │
        ▼
qdrant.query_points(collection="clinical_trials", query=vector, limit=5)
        │
        │  Cosine Similarity scored against all indexed trial vectors
        ▼
Top-K Results [ { nct_id, title, status, location, score: 0.91 } ]
        │
        ▼
API Response: compatibility_score = round(score * 100, 2) = "91.0%"
```

**Embedding Model**: `BAAI/bge-small-en-v1.5` via [FastEmbed](https://github.com/qdrant/fastembed) — chosen for its optimal balance of performance and quality on biomedical text. It runs **fully locally** with no external API calls required.

**Vector Database**: [Qdrant](https://qdrant.tech/) running in local persistence mode (`--path .qdrant_data`). No Docker, no cloud account required — just clone and run.

---

## 🔄 Complete User Workflow

### Researcher Workflow

```
[Researcher Logs In]
        │
        ▼
[Views Clinical Trials List]  ◄──── GET /api/v1/researchers/trials
(Fetched from SQLite, ordered by created_at)
        │
        ▼ (clicks a trial)
[Views AI-Matched Patient Candidates]  ◄──── GET /api/v1/researchers/trials/{nct_id}/patients
(Anonymized candidates: PAT-XXXXXX, scored by vector similarity)
        │
        ▼ (clicks "Invite to Trial")
[POST /api/v1/researchers/trials/{nct_id}/invite]
(Writes TrialInvitation record to SQLite with status="pending")
        │
        ▼
[Button turns green: "Invited ✓"]
(Optimistic UI update with disabled state)
```

### Patient Workflow

```
[Patient Logs In]
        │
        ▼
[Completes Medical Profile]  ──► PUT /api/v1/patients/me
{ age, conditions, genes, medical_history }
        │
        ▼
[Views AI Trial Matches]  ◄──── GET /api/v1/patients/me/matches
(Qdrant vector search on their profile)
        │
        ▼
[Views Trial Invitations]  ◄──── GET /api/v1/patients/me/invitations
(All pending/accepted/declined invitations joined with trial details)
        │
        ├── [Accept]  ──► PUT /api/v1/patients/me/invitations/{id}  { status: "accepted" }
        │               Button replaced with "Accepted ✓" badge
        │
        └── [Decline] ──► PUT /api/v1/patients/me/invitations/{id}  { status: "declined" }
                        Button replaced with "Declined" badge
```

---

## 🗃️ Database Schema

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────────────┐
│    users    │     │    patients     │     │   clinical_trials    │
├─────────────┤     ├─────────────────┤     ├──────────────────────┤
│ id (PK)     │────►│ id (PK)         │     │ nct_id (PK)          │
│ email       │     │ user_id (FK)    │     │ title                │
│ hashed_pwd  │     │ age             │     │ inclusion_criteria   │
│ role        │     │ conditions      │     │ exclusion_criteria   │
│ is_active   │     │ genes           │     │ status               │
│ created_at  │     │ medical_history │     │ location             │
│ updated_at  │     │ created_at      │     │ created_at           │
└─────────────┘     └─────────────────┘     └──────────┬───────────┘
                                                        │
                    ┌──────────────────────────────────►│
                    │                                   │
                    │   ┌──────────────────────┐        │
                    │   │  trial_invitations   │        │
                    │   ├──────────────────────┤        │
                    │   │ id (PK)              │        │
                    └───┤ patient_id (FK)      │        │
                        │ trial_id (FK) ───────┘        │
                        │ status (pending/              │
                        │   accepted/declined)          │
                        │ created_at                    │
                        └──────────────────────────────┘
```

---

## 🔐 Authentication & Security

- **JWT Bearer Tokens**: All protected endpoints require `Authorization: Bearer <token>` headers, handled globally by the `fetchClient` wrapper.
- **Role-Based Access Control (RBAC)**: Every API endpoint validates the user's role before processing. A patient cannot hit researcher endpoints and vice versa — the backend returns `403 Forbidden`.
- **Route Protection**: The `ProtectedRoute` component on the frontend redirects users attempting to access dashboards for roles they don't have to their own correct dashboard.
- **Password Security**: Passwords are hashed server-side using `passlib` (bcrypt) before being stored.

---

## 📡 API Reference

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/auth/register` | Public | Register a new user |
| `POST` | `/api/v1/auth/login` | Public | Login and receive JWT |
| `GET` | `/api/v1/patients/me` | Patient | Get own profile |
| `PUT` | `/api/v1/patients/me` | Patient | Update own profile |
| `GET` | `/api/v1/patients/me/matches` | Patient | Get AI-matched trials |
| `GET` | `/api/v1/patients/me/invitations` | Patient | Get all invitations |
| `PUT` | `/api/v1/patients/me/invitations/{id}` | Patient | Accept or decline invite |
| `GET` | `/api/v1/researchers/trials` | Researcher | Get all clinical trials |
| `GET` | `/api/v1/researchers/trials/{nct_id}/patients` | Researcher | Get matched patients for a trial |
| `POST`| `/api/v1/researchers/trials/{nct_id}/invite` | Researcher | Send trial invitation to patient |
| `POST`| `/api/v1/trials/sync` | Any Auth | Sync trials from ClinicalTrials.gov |
| `GET` | `/api/v1/admin/stats` | Admin | Get platform-wide analytics |

Interactive API documentation (Swagger UI) is auto-generated by FastAPI at: `http://localhost:8000/docs`

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|------------|---------|
| Node.js | v18+ |
| Python | 3.10+ |
| Git | Any |

### Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/IshaanVerma2204/TrialBridge-AI.git
cd TrialBridge-AI

# 2. Install Python dependencies
cd apps/api
python -m venv .venv
.venv\Scripts\activate       # Windows
pip install -r requirements.txt

# 3. Run database migrations
alembic upgrade head
cd ../..

# 4. Install Node.js dependencies
cd apps/web
npm install
cd ../..
```

### Running the Application

A single `start.bat` script launches the entire stack concurrently:

```cmd
.\start.bat
```

| Service | URL |
|---------|-----|
| Frontend (Next.js) | http://localhost:3000 |
| Backend (FastAPI) | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

---

## ✨ Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| Frontend Framework | Next.js 15 (App Router) | SSR, routing, React server components |
| UI Language | TypeScript | Type-safe frontend development |
| Styling | Tailwind CSS + shadcn/ui | Premium component design system |
| Backend Framework | FastAPI | High-performance async REST API |
| Backend Language | Python 3.10+ | API logic & AI services |
| Relational DB | SQLite + SQLAlchemy | Persistent user & trial data storage |
| Vector DB | Qdrant (local mode) | High-speed semantic similarity search |
| Embedding Model | BAAI/bge-small-en-v1.5 | Dense text embeddings for matching |
| Embedding Library | FastEmbed | Zero-dependency local model inference |
| Auth | JWT (python-jose) + bcrypt | Stateless, secure authentication |
| DB Migrations | Alembic | Schema versioning and rollback |
| Trial Data Source | ClinicalTrials.gov REST API | Live, real-world clinical trial data |

---

## 🗺️ Roadmap

- [ ] **Google OAuth** — One-tap login with "Continue with Google"
- [ ] **Email Notifications** — Notify patients of new invitations via email
- [ ] **Advanced Filtering** — Filter trials by phase, location, and status
- [ ] **Admin User Management** — Approve/reject researcher accounts
- [ ] **Patient Anonymization Toggle** — Let patients control visibility
- [ ] **Cloud Deployment** — Deploy to Vercel + Railway

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/IshaanVerma2204">Ishaan Verma</a></p>
  <p><em>"Connecting patients to the research that could save their lives."</em></p>
</div>
