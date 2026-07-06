# MindPath — Use Cases & Priority

> **P0** — MVP: app doesn't work without it
> **P1** — Core value: users won't retain without it
> **P2** — Engagement layer: motivates continued use

---

## P0 — Must Ship First

### Auth

- [ ] Sign up / sign in via Clerk
- [ ] Sync Clerk user to `users` table on first login

### Flashcards

- [ ] Create a deck
- [ ] Add / edit / delete cards in a deck
- [ ] View all decks

### Spaced Repetition

- [ ] Start a review session for a deck
- [ ] Show due cards (front → reveal back)
- [ ] Submit a rating (Again / Hard / Good / Easy)
- [ ] Update FSRS fields on the card after each rating
- [ ] Log review to `card_reviews`

### Pomodoro

- [ ] Start a focus timer (configurable work/break minutes)
- [ ] Track completed cycles
- [ ] Mark session as complete or abandoned

---

## P1 — Ship Before Public Launch

### Progress

- [ ] Write / upsert `daily_progress` at end of each session
- [ ] Show daily summary (cards reviewed, focus minutes, XP earned)
- [ ] Show review history chart (last 7 / 30 days)

### Streaks

- [ ] Detect when daily goal is met → flip `completed_today`
- [ ] Calculate and store `current_streak` and `longest_streak`
- [ ] Show streak counter on dashboard

### Deck Management

- [ ] Link a Pomodoro session to a deck
- [ ] Show per-deck stats (total cards, due today, retention rate)
- [ ] Duplicate a deck

### User Stats

- [ ] Increment `xp_total`, `total_focus_minutes`, `total_cards_reviewed` after each session
- [ ] Compute and update `level` from XP

---

## P2 — Post-Launch / Engagement

### Badges

- [ ] Seed badge definitions into `badges` table
- [ ] Award badge when `trigger_value` threshold is crossed
- [ ] Show badge collection on profile

### Gamification UI

- [ ] XP progress bar toward next level
- [ ] Streak calendar (GitHub-style heatmap)
- [ ] "Cards due today" home screen widget

### Social / Sharing

- [ ] Make a deck public (`is_public = true`)
- [ ] Browse and clone public decks

### Card Improvements

- [ ] Cloze deletion card type
- [ ] Image card type
- [ ] Bulk import cards (CSV)
