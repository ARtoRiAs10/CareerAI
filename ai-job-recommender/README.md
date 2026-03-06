# CareerAI — AI-Enabled Job Recommendation & Cover Letter App

Full-stack application that uses AI (via **OpenRouter**) to recommend jobs and generate tailored cover letters.

## Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Frontend   | Next.js 14 (App Router), Tailwind CSS       |
| Backend    | Spring Boot 3.2, Java 17                    |
| Database   | H2 in-memory (swap PostgreSQL in prod)      |
| Auth       | JWT (JSON Web Tokens) + BCrypt              |
| AI         | **OpenRouter** — unified API for Claude, GPT-4, Gemini, Llama & more |

---

## Project Structure

```
ai-job-recommender/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── resources/
│       │   ├── application.properties          ← DB, JWT, OpenRouter config
│       │   └── data.sql                        ← 20 seed job listings
│       └── java/com/aijob/
│           ├── AiJobApplication.java
│           ├── config/
│           │   ├── SecurityConfig.java         ← Spring Security + CORS
│           │   ├── JwtUtil.java                ← Token gen/validation
│           │   └── JwtAuthFilter.java          ← Per-request auth
│           ├── model/
│           │   ├── User.java
│           │   ├── UserProfile.java
│           │   ├── Job.java
│           │   └── CoverLetter.java
│           ├── repository/                     ← Spring Data JPA
│           ├── dto/                            ← Request/Response DTOs
│           ├── service/
│           │   ├── AuthService.java
│           │   ├── ProfileService.java
│           │   ├── JobService.java             ← Search & filter
│           │   ├── RecommendationService.java  ← NLP scoring engine
│           │   └── AiService.java              ← OpenRouter API calls
│           └── controller/
│               ├── AuthController.java         ← /api/auth/**
│               ├── ProfileController.java      ← /api/profile
│               ├── JobController.java          ← /api/jobs/**
│               └── AiController.java          ← /api/ai/**
│
└── frontend/
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    ├── .env.local.example
    ├── app/
    │   ├── layout.jsx
    │   ├── globals.css
    │   ├── page.jsx                            ← Login / Register
    │   ├── dashboard/page.jsx                  ← AI Recommendations
    │   ├── profile/page.jsx                    ← Profile Management
    │   ├── jobs/page.jsx                       ← Job Search & Filter
    │   └── cover-letter/page.jsx               ← Cover Letter Generator
    ├── components/
    │   ├── Navbar.jsx
    │   ├── JobCard.jsx
    │   ├── RecommendedJobCard.jsx
    │   └── CoverLetterModal.jsx
    ├── context/
    │   └── AuthContext.jsx                     ← JWT auth state (React)
    └── lib/
        └── api.js                              ← All fetch calls
```

---

## Getting Started

### Prerequisites
- **Java 17+**
- **Node.js 18+**
- **OpenRouter API key** — free at [openrouter.ai/keys](https://openrouter.ai/keys)

---

### 1 — Backend

```bash
cd ai-job-recommender/backend

# Required: set your OpenRouter key
export OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxx

# Start Spring Boot (downloads deps on first run)
./mvnw spring-boot:run
```

API starts at **http://localhost:8080**

H2 console → http://localhost:8080/h2-console
JDBC URL: `jdbc:h2:mem:aijobdb` | user: `sa` | password: *(blank)*

---

### 2 — Frontend

```bash
cd ai-job-recommender/frontend

npm install

cp .env.local.example .env.local   # Edit if backend port differs

npm run dev
```

App starts at **http://localhost:3000**

---

## OpenRouter Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
openrouter.api.key=${OPENROUTER_API_KEY:your-key-here}
openrouter.model=anthropic/claude-3.5-sonnet   # ← change this freely
```

### Model options (examples)

| Model slug | Notes |
|------------|-------|
| `anthropic/claude-3.5-sonnet` | Best quality (default) |
| `anthropic/claude-3-haiku` | Fast & cheap |
| `openai/gpt-4o` | OpenAI flagship |
| `openai/gpt-4o-mini` | Cheap GPT-4 class |
| `google/gemini-flash-1.5` | Very fast |
| `meta-llama/llama-3.1-70b-instruct` | Free tier available |
| `mistralai/mistral-7b-instruct` | Free tier available |

Full list: https://openrouter.ai/models

---

## REST API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register + get JWT |
| POST | `/api/auth/login` | — | Login + get JWT |
| GET | `/api/profile` | JWT | Get profile |
| PUT | `/api/profile` | JWT | Update profile |
| GET | `/api/jobs` | JWT | List / search / filter jobs |
| GET | `/api/jobs/{id}` | JWT | Single job |
| GET | `/api/jobs/recommended?limit=8` | JWT | AI recommendations |
| POST | `/api/ai/cover-letter` | JWT | Generate cover letter |
| POST | `/api/ai/insights` | JWT | Job match insights |
| GET | `/api/ai/cover-letters` | JWT | Saved cover letters |

---

## AI Architecture

### Recommendation Engine (backend, no API cost)
```
User profile → score every job:
  Skills keyword overlap  × 50%
  Job-title word match    × 30%
  Work-type preference    × 20%
→ Sort descending → return top N
```

### Cover Letter Generation (OpenRouter)
```
system: "expert cover letter writer"
user:   candidate profile + resume + job description + notes
→ OpenRouter → chosen model → 350-400 word letter
→ saved to DB + returned to frontend
```

---

## Production Checklist

- [ ] Swap H2 for PostgreSQL in `application.properties`
- [ ] Move secrets to env vars / secrets manager
- [ ] Set `cors.allowed.origins` to your production domain
- [ ] Enable HTTPS
- [ ] Set `OPENROUTER_API_KEY` in your deployment environment
