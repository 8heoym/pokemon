# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Pokemon-themed educational math game for Korean elementary school 2nd graders focused on multiplication and times tables. The application uses AI-driven personalized problem generation with gamification elements like Pokemon collection and trainer progression.

## Architecture

### Monorepo Structure
- `backend/` - Node.js + Express + TypeScript API server
- `frontend/` - Next.js 14 + React + TypeScript web application  
- `shared/` - Common TypeScript type definitions used by both frontend and backend

### Database Architecture
The project uses **Supabase** (PostgreSQL) as the primary database with the following key tables:
- `pokemon` - Pokemon data with multiplication table mappings and rarity
- `users` - User profiles, progress tracking, and caught Pokemon
- `math_problems` - AI-generated math problems with Pokemon context
- `user_answers` - Answer tracking for learning analytics

MongoDB integration exists but is currently disabled (demo mode).

### AI Integration
Uses Anthropic Claude API for:
- Personalized math problem generation based on user performance
- CRA (Concrete-Representational-Abstract) educational methodology
- Dynamic hint system based on learning patterns

## Development Commands

### Backend (port 3001)
```bash
cd backend
npm install
npm run dev          # Development server with hot reload
npm run build        # TypeScript compilation
npm run start        # Production server
npm run crawl-pokemon # Pokemon data crawler utility
```

### Frontend (port 3000)
```bash
cd frontend
npm install
npm run dev          # Next.js development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint validation
```

### Database Management
```bash
# Initialize Pokemon database
curl -X POST http://localhost:3001/api/pokemon/initialize
```

## Key Services and Architecture Patterns

### Backend Service Layer
- **SupabasePokemonService**: Pokemon data management, rarity-based random selection
- **AIProblemGenerator**: Claude API integration for personalized problem creation
- **LearningAnalysisService**: User performance analytics and mistake pattern analysis
- **SupabaseGameService**: User progression, Pokemon catching mechanics

### Controller Architecture
- **SimpleProblemController**: Problem generation and answer submission
- **SimpleGameController**: User management and game state
- Controllers use dependency injection pattern for service access

### Frontend Component Architecture
- **State Management**: React useState/useEffect with localStorage persistence
- **API Layer**: Centralized axios client with interceptors (`utils/api.ts`)
- **Component Structure**: 
  - `GameDashboard`: Main game interface with multiplication table selection
  - `ProblemCard`: Individual problem presentation with Pokemon theming
  - `WelcomeScreen`: User onboarding and authentication
  - Modal components for Pokedex, Leaderboard, etc.

### Data Flow
1. User selects multiplication table → Frontend requests problem generation
2. Backend calls Claude API with user history and difficulty adjustment
3. Problem includes Pokemon story context, visual hints, and equation
4. Answer submission triggers learning analysis and Pokemon reward system
5. User progress updates unlock new regions and Pokemon rarities

## Environment Configuration

### Backend (.env)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=your-claude-api-key
PORT=3001
NODE_ENV=development
```

### Frontend
Uses `NEXT_PUBLIC_BACKEND_URL` for API base URL (defaults to localhost:3001)

## Pokemon Data Management

The system uses a hybrid approach:
- **Web Scraping**: Puppeteer-based crawler for Pokemon Korea website
- **Cache System**: JSON cache in `backend/cache/pokemon_cache.json`
- **Database Seeding**: Automated initialization via `/api/pokemon/initialize`
- **Multiplication Table Mapping**: Pokemon assigned to specific times tables (2-9)

## Educational Framework Integration

The codebase implements CRA methodology:
- **Concrete**: Pokemon story problems ("Pikachu has 3 groups of 4 berries")
- **Representational**: Visual hints and grouping illustrations  
- **Abstract**: Mathematical equations (3 × 4 = ?)

Learning analytics track conceptual vs. memory errors to provide targeted interventions.

## API Endpoints Summary

### Core Game API
- `POST /api/users` - Create new user
- `GET /api/users/:userId` - Get user profile and progress
- `POST /api/problems/generate` - Generate personalized math problem
- `POST /api/problems/submit` - Submit answer and get feedback
- `POST /api/users/:userId/catch` - Pokemon catching mechanics

### Pokemon Data API
- `GET /api/pokemon/stats` - Database statistics
- `GET /api/pokemon/table/:table` - Pokemon by multiplication table
- `GET /api/pokemon/random/:table` - Random Pokemon for rewards

## Testing and Debugging

The backend runs in demo mode by default (MongoDB disabled). All data persists in Supabase.

For development debugging:
- Backend API documentation available at `http://localhost:3001/`
- Frontend development tools include React DevTools support
- API error logging configured in axios interceptors

## Claude Code Rules and Guidelines

### Core Principles
- Do what has been asked; nothing more, nothing less.
- NEVER create files unless they're absolutely necessary for achieving your goal.
- ALWAYS prefer editing an existing file to creating a new one.
- NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

### Code Standards
- NEVER assume that a given library is available, even if it is well known. Always check that this codebase already uses the given library.
- When creating a new component, first look at existing components to see how they're written; consider framework choice, naming conventions, typing, and other conventions.
- When editing code, first look at the code's surrounding context (especially its imports) to understand the code's choice of frameworks and libraries.
- Always follow security best practices. Never introduce code that exposes or logs secrets and keys. Never commit secrets or keys to the repository.
- DO NOT ADD ***ANY*** COMMENTS unless asked.

### Task Management
- Use TodoWrite tools frequently to ensure tracking tasks and giving visibility into progress.
- Mark todos as completed as soon as you are done with a task. Do not batch up multiple tasks before marking them as completed.
- Break down larger complex tasks into smaller steps.

### Development Best Practices
- Run lint and typecheck commands (npm run lint, npm run typecheck, ruff, etc.) after completing tasks to ensure code is correct.
- NEVER commit changes unless the user explicitly asks you to.
- Never change the deployment environment.
- Don't deploy via GitHub Actions.


## TheGoldenRule
- When unsure about implementation details, ALWAYS ask the developer.
- 불필요한 리포트, 피드백 시스템을 만드는 것을 지양합니다.
