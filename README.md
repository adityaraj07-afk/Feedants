# Feedants — Full-Stack Competition Details Feature

A production-grade, dynamic, database-driven **Competition Details** platform feature built for **Feedants** (a creator competition and hackathon ecosystem).

---

## 🌟 Overview & Architectural Highlights

This project implements an end-to-end full-stack feature with:
1. **Dynamic Database Foundation**: No hardcoded mock values. All competition parameters, prize pools, eligibility criteria, real-time spot counts, judge profiles, and historical podiums are loaded from MongoDB.
2. **Server-Computed Lifecycle State Machine**: Lifecycle phases (`upcoming`, `registration_open`, `registration_full`, `registration_closed`, `submission_open`, `submission_closed`, `results_declared`) are computed dynamically on the server relative to UTC server time.
3. **Atomic Concurrency Protection**: High-traffic flash registrations are handled race-condition-safely using MongoDB atomic operators (`findOneAndUpdate` with `$inc` and `$lt` capacity filters) combined with a compound unique index `(competitionId, userId)` to prevent overbooking and double registrations.
4. **Timezone-Safe Synchronization**: Live ticking countdown timer computes device clock skew against server timestamp, eliminating client clock manipulation.
5. **Interactive Reviewer Demo Bar**: Top-bar switcher enabling instant switching between test users (Alex [unregistered], Priya [registered], Marcus [submitted]) and competitions in any lifecycle stage.

---

## 🛠️ Technology Stack

- **Frontend**: React Native with Expo (Web + iOS/Android ready)
  - Modular component architecture (`HeaderHero`, `PrizeAndSpotsCard`, `JudgeCard`, `CountdownTimer`, `ImportantDates`, `PreviousWinners`, `TabbedContent`, `RewardsTable`, `ReferralBlock`, `SubmissionModal`, `BottomCTA`)
  - Dark mode aesthetic tailored for creative competitions (`#0B0F19` deep space background, `#131B2E` cards, `#6366F1` indigo accents, `#10B981` emerald status, `#F59E0B` prize gold).
- **Backend**: Node.js + Express.js + TypeScript
  - Mongoose ODM with strong typings and indexing
  - Zero-config auto-fallback to embedded MongoDB (`mongodb-memory-server`) if no external MongoDB instance is provided
  - Automatic seed script populating competitions across all 7 lifecycle phases
- **Database**: MongoDB
  - Indexed collections: `User`, `Competition`, `Registration`, `Submission`, `Winner`

---

## 🚀 Setup & Execution Guide

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# (Optional) Configure environment variables
# Copy .env.example to .env if not already created
# If MONGODB_URI is left blank, the server will seamlessly boot an embedded in-memory MongoDB!

# Start development server (auto-seeds on first run)
npm run dev

# Or run tests:
npm run test:concurrency
```

Backend endpoints:
- `GET http://localhost:5000/api/health` — Health check & server timestamp
- `GET http://localhost:5000/api/competitions` — All competitions with computed phases
- `GET http://localhost:5000/api/competitions/:id` — Competition details (accepts `x-user-id` header)
- `POST http://localhost:5000/api/competitions/:id/register` — Atomic spot booking
- `POST http://localhost:5000/api/competitions/:id/submit` — Project routine upload
- `GET http://localhost:5000/api/competitions/:id/winners` — Podium champions
- `GET http://localhost:5000/api/competitions/:id/referral` — Unique user referral code & link
- `GET http://localhost:5000/api/users` — Test seed users

---

### 2. Frontend Setup (React Native / Expo)

```bash
cd frontend

# Install dependencies (already installed)
npm install --legacy-peer-deps

# Start Expo Web
npm run web

# Or start Expo CLI for iOS / Android / QR code:
npm run start
```

Once running:
- Open `http://localhost:8081` in your browser.
- Use the **Interactive Demo Bar** at the top to toggle between demo users and competition lifecycle phases.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port for the Express server |
| `MONGODB_URI` | *(empty)* | MongoDB connection URI (e.g. `mongodb://localhost:27017/feedants`). If omitted, launches `mongodb-memory-server` automatically. |
| `NODE_ENV` | `development` | Runtime environment (`development` / `production`) |

---

## 🔒 Concurrency & Anti-Overbooking Mechanism

To prevent overbooking when hundreds of users click "Register Now" simultaneously:

### 1. Atomic Conditional Increment
Rather than performing a separate `findOne` and subsequent `save` (which creates a race condition window), registration spots are booked in a single atomic database operation:
```typescript
const updated = await Competition.findOneAndUpdate(
  {
    _id: competitionId,
    'capacity.filledSpots': { $lt: competition.capacity.maxSpots },
    'timeline.registrationStartDate': { $lte: now },
    'timeline.registrationEndDate': { $gte: now },
    statusOverride: 'active',
  },
  { $inc: { 'capacity.filledSpots': 1 } },
  { new: true }
);
```

### 2. Database-Enforced Unique Constraint
Duplicate registrations by the same user are rejected via a compound unique index:
```typescript
RegistrationSchema.index({ competitionId: 1, userId: 1 }, { unique: true });
```

### 3. Compensation Rollback
If the registration document creation fails (e.g. unexpected validation or connection drop), a compensation operation immediately decrements the counter:
```typescript
await Competition.findByIdAndUpdate(competitionId, { $inc: { 'capacity.filledSpots': -1 } });
```

---

## 🧠 Key Assumptions & Technical Decisions

1. **Server-Authoritative Clock**: Participant devices may have inaccurate clocks or altered system times. All phase transitions and countdown targets are calculated relative to the server's UTC timestamp.
2. **Embedded Mongo Fallback**: To ensure any reviewer can test the platform with `npm run dev` without needing to install or configure MongoDB or Docker, `mongodb-memory-server` is integrated with graceful fallback.
3. **Expo with React Native Web**: Chosen to provide genuine React Native mobile primitives (`View`, `Text`, `ScrollView`, `Modal`, `TouchableOpacity`) while offering instant interactive browser testing.
4. **Header-Based Demo Auth**: The user switcher passes `x-user-id` in request headers, allowing seamless one-click role switching in the UI without needing mock login flows.

---

## ⚖️ Trade-offs Considered

| Decision | Chosen Solution | Trade-off / Alternative Considered |
| :--- | :--- | :--- |
| **Atomic Counter vs Count Query** | Maintained `capacity.filledSpots` with atomic `$inc`. | Querying `Registration.countDocuments()` on every request avoids counter sync risks, but introduces severe index contention and query latency under thousands of concurrent reads. Atomic `$inc` provides O(1) spot checking. |
| **Embedded DB Fallback** | `mongodb-memory-server` auto-boot. | Requiring external MongoDB or Docker container ensures persistent storage across restarts, but creates installation friction for local evaluation. Auto-memory fallback guarantees immediate zero-dependency execution. |
| **Clock Synchronization** | Device offset calculated once from server timestamp, updated via local interval. | Polling the server every second for server time guarantees absolute accuracy, but floods server with unnecessary traffic. The single offset calculation achieves sub-second accuracy with zero network overhead. |

---

## 🔮 Production Improvements

If preparing this feature for enterprise-scale global deployment:
1. **Redis Caching for Read Peaks**: Cache competition metadata in Redis with TTLs or event-driven invalidation to serve millions of reads without hitting MongoDB.
2. **Distributed Queue for Submissions**: Decouple submission video processing (transcoding, moderation, thumbnail extraction) using BullMQ / AWS SQS and S3 pre-signed URLs.
3. **WebSockets / Server-Sent Events (SSE)**: Push real-time spot updates and live winner declarations to active clients without needing manual screen refreshes.
4. **Rate Limiting & Bot Protection**: Protect registration and submission endpoints with Cloudflare Turnstile / token bucket rate limiters to prevent bot scraping and automated spot hoarders.
5. **Multi-Region Replica Sets**: Deploy MongoDB Atlas multi-region clusters with write concern `majority` for high-availability transactions.
