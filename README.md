# Learnxpw — Online Study Platform

A modern, responsive React learning platform ported from the original Dynamic application. It organizes video classes, daily schedules, batches, and study notes into one clean, high-performance study space with zero login required.

## Key Features

- **Home & Landing Space**: Preserves the complete original visual identity, sparkles badge, benefit guarantees, and interactive "Continue learning" space preview card.
- **Batch Catalog**: Browse JEE (Lakshya, Arjuna, Prayas), NEET (Yakeen Dropper), and Foundation courses with categories, search, faculty information, and one-click bookmarking/enrollment.
- **Batch Syllabus & Chapters**: Detailed subject tabs (Physics, Chemistry, Mathematics, Biology, Science), chapter breakdowns, lecture count, and completion tracking.
- **Interactive Video Player Classroom**:
  - Custom video controls (Play/Pause, scrub bar, forward/rewind 10s, volume).
  - Multi-speed playback (1x, 1.25x, 1.5x, 2x) & resolution options (360p to 1080p).
  - Lecture Notes PDF viewer and simulator.
  - Interactive Daily Practice Problems (DPP) with instant solution verification.
  - Student doubts & community discussion forum.
- **Daily Timetable & Schedule**: Real-time class slots with Live and Upcoming status badges.
- **Study Resources & DPPs Library**: Search and download handwritten faculty notes and revision guides.
- **Community & Support**: Official Telegram channel integration and Telegram Bot handle (`@bookverse_probot`).

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **State Management**: React Context with LocalStorage persistence

## Development

```bash
npm install
npm run dev
```

App runs on `http://0.0.0.0:3000`.
