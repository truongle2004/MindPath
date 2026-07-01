# MindPath — Database Schema

**Platform:** PostgreSQL (recommended: Supabase or Railway)
**Spaced repetition algorithm:** FSRS
**Features:** Pomodoro · Flashcards · Spaced repetition · Progress tracking · Gamification

---

## Table of Contents

1. [Core / Auth](#clerk-already)
2. [Learning System](#2-learning-system)
3. [Gamification](#3-gamification)
4. [Relationships Overview](#4-relationships-overview)
5. [Design Notes](#5-design-notes)

---

## 1. Core / Auth

### `users`

| Column          | Type           | Constraints                     | Notes           |
| --------------- | -------------- | ------------------------------- | --------------- |
| `id`            | `uuid`         | PK, default `gen_random_uuid()` |                 |
| `email`         | `varchar(255)` | NOT NULL, UNIQUE                |                 |
| `username`      | `varchar(50)`  | NOT NULL, UNIQUE                |                 |
| `password_hash` | `text`         | NOT NULL                        | bcrypt / argon2 |
| `created_at`    | `timestamptz`  | NOT NULL, default `now()`       |                 |
| `updated_at`    | `timestamptz`  | NOT NULL, default `now()`       |                 |

---

## 2. Learning System

### `decks`

| Column        | Type           | Constraints                        | Notes          |
| ------------- | -------------- | ---------------------------------- | -------------- |
| `id`          | `uuid`         | PK                                 |                |
| `user_id`     | `uuid`         | FK → `users.id`, ON DELETE CASCADE |                |
| `title`       | `varchar(100)` | NOT NULL                           |                |
| `description` | `text`         |                                    |                |
| `color_hex`   | `char(7)`      |                                    | e.g. `#7F77DD` |
| `is_public`   | `boolean`      | NOT NULL, default `false`          |                |
| `created_at`  | `timestamptz`  | NOT NULL, default `now()`          |                |

---

### `cards`

FSRS state fields are stored directly on the card row (mutable). Reviews are logged separately in `card_reviews`.

| Column           | Type          | Constraints                        | Notes                                     |
| ---------------- | ------------- | ---------------------------------- | ----------------------------------------- |
| `id`             | `uuid`        | PK                                 |                                           |
| `deck_id`        | `uuid`        | FK → `decks.id`, ON DELETE CASCADE |                                           |
| `front`          | `text`        | NOT NULL                           | Question / prompt                         |
| `back`           | `text`        | NOT NULL                           | Answer                                    |
| `card_type`      | `varchar(20)` | default `'basic'`                  | `basic`, `cloze`, `image`                 |
| `created_at`     | `timestamptz` | NOT NULL, default `now()`          |                                           |
| **FSRS fields**  |               |                                    |                                           |
| `stability`      | `float`       | NOT NULL, default `0`              | Memory stability (days)                   |
| `difficulty`     | `float`       | NOT NULL, default `0`              | Card difficulty (0–1 scale)               |
| `due`            | `timestamptz` | NOT NULL, default `now()`          | Next scheduled review date                |
| `elapsed_days`   | `int`         | NOT NULL, default `0`              | Days since last review                    |
| `scheduled_days` | `int`         | NOT NULL, default `0`              | Interval set on last review               |
| `reps`           | `int`         | NOT NULL, default `0`              | Total successful reviews                  |
| `lapses`         | `int`         | NOT NULL, default `0`              | Times rated "Again"                       |
| `state`          | `varchar(20)` | NOT NULL, default `'new'`          | `new`, `learning`, `review`, `relearning` |
| `last_review`    | `timestamptz` |                                    | Null until first review                   |

**Indexes:**

```sql
CREATE INDEX idx_cards_deck_id ON cards(deck_id);
CREATE INDEX idx_cards_due     ON cards(due) WHERE state != 'new';
```

---

### `card_reviews`

Immutable audit log. One row per review event. Used for algorithm debugging and future retraining.

| Column             | Type          | Constraints                        | Notes                                      |
| ------------------ | ------------- | ---------------------------------- | ------------------------------------------ |
| `id`               | `uuid`        | PK                                 |                                            |
| `card_id`          | `uuid`        | FK → `cards.id`, ON DELETE CASCADE |                                            |
| `user_id`          | `uuid`        | FK → `users.id`, ON DELETE CASCADE |                                            |
| `rating`           | `smallint`    | NOT NULL                           | `1` Again · `2` Hard · `3` Good · `4` Easy |
| `stability_before` | `float`       | NOT NULL                           | FSRS stability before review               |
| `stability_after`  | `float`       | NOT NULL                           | FSRS stability after review                |
| `difficulty_after` | `float`       | NOT NULL                           | FSRS difficulty after review               |
| `scheduled_days`   | `int`         | NOT NULL                           | Interval assigned to next review           |
| `reviewed_at`      | `timestamptz` | NOT NULL, default `now()`          |                                            |

**Indexes:**

```sql
CREATE INDEX idx_card_reviews_card_id    ON card_reviews(card_id);
CREATE INDEX idx_card_reviews_user_date  ON card_reviews(user_id, reviewed_at DESC);
```

---

### `pomodoro_sessions`

| Column             | Type           | Constraints                                   | Notes                                        |
| ------------------ | -------------- | --------------------------------------------- | -------------------------------------------- |
| `id`               | `uuid`         | PK                                            |                                              |
| `user_id`          | `uuid`         | FK → `users.id`, ON DELETE CASCADE            |                                              |
| `deck_id`          | `uuid`         | FK → `decks.id`, ON DELETE SET NULL, nullable | Optional link to a deck                      |
| `work_minutes`     | `smallint`     | NOT NULL, default `25`                        |                                              |
| `break_minutes`    | `smallint`     | NOT NULL, default `5`                         |                                              |
| `completed_cycles` | `smallint`     | NOT NULL, default `0`                         |                                              |
| `is_completed`     | `boolean`      | NOT NULL, default `false`                     |                                              |
| `focus_label`      | `varchar(100)` |                                               | User-entered label, e.g. "Biology chapter 3" |
| `started_at`       | `timestamptz`  | NOT NULL                                      |                                              |
| `ended_at`         | `timestamptz`  |                                               | Null if session is still active              |

**Indexes:**

```sql
CREATE INDEX idx_pomodoro_user_id ON pomodoro_sessions(user_id, started_at DESC);
```

---

## 3. Gamification

### `user_stats`

One row per user. Updated after each session or review batch.

| Column                 | Type          | Constraints                                | Notes                      |
| ---------------------- | ------------- | ------------------------------------------ | -------------------------- |
| `id`                   | `uuid`        | PK                                         |                            |
| `user_id`              | `uuid`        | FK → `users.id`, ON DELETE CASCADE, UNIQUE |                            |
| `xp_total`             | `int`         | NOT NULL, default `0`                      | Lifetime XP                |
| `level`                | `smallint`    | NOT NULL, default `1`                      | Derived from `xp_total`    |
| `total_focus_minutes`  | `int`         | NOT NULL, default `0`                      | Lifetime Pomodoro minutes  |
| `total_cards_reviewed` | `int`         | NOT NULL, default `0`                      | Lifetime review count      |
| `total_sessions`       | `int`         | NOT NULL, default `0`                      | Lifetime Pomodoro sessions |
| `updated_at`           | `timestamptz` | NOT NULL, default `now()`                  |                            |

---

### `streaks`

One row per user per calendar day. `current_streak` and `longest_streak` are updated when `completed_today` flips to `true` — no recursive queries needed on read.

| Column            | Type      | Constraints                        | Notes                                  |
| ----------------- | --------- | ---------------------------------- | -------------------------------------- |
| `id`              | `uuid`    | PK                                 |                                        |
| `user_id`         | `uuid`    | FK → `users.id`, ON DELETE CASCADE |                                        |
| `streak_date`     | `date`    | NOT NULL                           | The calendar day                       |
| `current_streak`  | `int`     | NOT NULL, default `0`              | Consecutive days at time of record     |
| `longest_streak`  | `int`     | NOT NULL, default `0`              | All-time best streak at time of record |
| `completed_today` | `boolean` | NOT NULL, default `false`          | Flips true when daily goal is met      |

```sql
CREATE UNIQUE INDEX idx_streaks_user_date ON streaks(user_id, streak_date);
```

---

### `badges`

Static definition table. Seeded once; not user-specific.

| Column          | Type          | Constraints      | Notes                                                                                |
| --------------- | ------------- | ---------------- | ------------------------------------------------------------------------------------ |
| `id`            | `uuid`        | PK               |                                                                                      |
| `name`          | `varchar(80)` | NOT NULL, UNIQUE | e.g. "7-Day Streak"                                                                  |
| `description`   | `text`        | NOT NULL         | Shown to users                                                                       |
| `icon_key`      | `varchar(50)` | NOT NULL         | Maps to icon in the client                                                           |
| `trigger_type`  | `varchar(40)` | NOT NULL         | `streak_days`, `cards_reviewed`, `focus_minutes`, `pomodoro_cycles`, `level_reached` |
| `trigger_value` | `int`         | NOT NULL         | Threshold to unlock (e.g. `7` for 7-day streak)                                      |

---

### `user_badges`

| Column      | Type          | Constraints                         | Notes |
| ----------- | ------------- | ----------------------------------- | ----- |
| `id`        | `uuid`        | PK                                  |       |
| `user_id`   | `uuid`        | FK → `users.id`, ON DELETE CASCADE  |       |
| `badge_id`  | `uuid`        | FK → `badges.id`, ON DELETE CASCADE |       |
| `earned_at` | `timestamptz` | NOT NULL, default `now()`           |       |

```sql
CREATE UNIQUE INDEX idx_user_badges_unique ON user_badges(user_id, badge_id);
```

---

### `daily_progress`

Denormalized daily summary. Written at end of day (or upserted during session). The motivation dashboard reads from this table — never from raw logs.

| Column            | Type       | Constraints                        | Notes                        |
| ----------------- | ---------- | ---------------------------------- | ---------------------------- |
| `id`              | `uuid`     | PK                                 |                              |
| `user_id`         | `uuid`     | FK → `users.id`, ON DELETE CASCADE |                              |
| `date`            | `date`     | NOT NULL                           |                              |
| `xp_earned`       | `int`      | NOT NULL, default `0`              | XP gained this day           |
| `focus_minutes`   | `int`      | NOT NULL, default `0`              | Pomodoro minutes this day    |
| `cards_reviewed`  | `int`      | NOT NULL, default `0`              | Total reviews this day       |
| `pomodoro_cycles` | `smallint` | NOT NULL, default `0`              | Completed Pomodoro cycles    |
| `cards_new`       | `int`      | NOT NULL, default `0`              | New cards seen this day      |
| `cards_again`     | `int`      | NOT NULL, default `0`              | Cards rated "Again" this day |
| `streak_day`      | `int`      | NOT NULL, default `0`              | Streak value at end of day   |

```sql
CREATE UNIQUE INDEX idx_daily_progress_user_date ON daily_progress(user_id, date);
```

---

## 4. Relationships Overview

```
users
├── decks (1:N)
│   ├── cards (1:N)
│   │   └── card_reviews (1:N)
│   └── pomodoro_sessions (1:N, nullable)
├── pomodoro_sessions (1:N)
├── user_stats (1:1)
├── streaks (1:N, one per day)
├── user_badges (1:N)
│   └── badges (N:1)
└── daily_progress (1:N, one per day)
```

---

## 5. Design Notes

### FSRS fields on `cards`

The 8 FSRS state fields are mutable and update on every review. Storing them directly on `cards` keeps the "what's due today?" query simple:

```sql
SELECT * FROM cards WHERE due <= now() AND state != 'new' AND deck_id = $1;
```

`card_reviews` is the append-only event log — useful for debugging, analytics, or retraining the algorithm later.

### `state` enum values

| Value        | Meaning                                    |
| ------------ | ------------------------------------------ |
| `new`        | Card has never been reviewed               |
| `learning`   | Card is in initial learning phase          |
| `review`     | Card is in long-term review rotation       |
| `relearning` | Card was forgotten and is being re-learned |

### `rating` values in `card_reviews`

| Value | Label | Meaning                  |
| ----- | ----- | ------------------------ |
| `1`   | Again | Forgot completely        |
| `2`   | Hard  | Recalled with difficulty |
| `3`   | Good  | Recalled correctly       |
| `4`   | Easy  | Recalled effortlessly    |

### XP and leveling

Store `xp_total` in `user_stats`. Derive `level` from a formula — suggested: `level = floor(sqrt(xp_total / 100)) + 1`. Recompute on every XP write.

### Badge award logic

A background job (or Postgres trigger) reads `daily_progress` and `user_stats` after each session and checks `badges.trigger_type` + `trigger_value` against the corresponding column. If threshold is met and no `user_badges` row exists, insert one.

### `daily_progress` is denormalized by design

Aggregating XP, focus minutes, and reviews from raw tables on every dashboard load is expensive. Upsert `daily_progress` at the end of each session instead — fast reads, cheap motivation UI.
