# MindPath — Database Schema

**Platform:** PostgreSQL on [Supabase](https://supabase.com) with Drizzle ORM
**Spaced repetition algorithm:** FSRS
**Features:** Pomodoro · Flashcards · Spaced repetition · Progress tracking · Gamification

---

## Table of Contents

1. [Core / Auth](#1-core--auth)
2. [Learning System](#2-learning-system)
3. [Gamification](#3-gamification)
4. [Relationships Overview](#4-relationships-overview)
5. [Design Notes](#5-design-notes)

---

## 1. Core / Auth

> **Clerk is used for authentication.** Clerk owns identity — email, password, OAuth, sessions, and MFA are all managed on their side. Your database only needs a thin `users` table to anchor foreign keys and store app-specific profile data. Sync it via Clerk's **webhook** (`user.created`, `user.updated`, `user.deleted`).

### `users`

| Column       | Type           | Constraints               | Meaning                                                                                                         |
| ------------ | -------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `id`         | `uuid`         | PK                        | Your internal user ID — used for all FK relationships in this schema                                            |
| `clerk_id`   | `varchar(64)`  | NOT NULL, UNIQUE          | The Clerk user ID (e.g. `user_2abc...`); used to look up your internal user from Clerk's JWT or webhook payload |
| `email`      | `varchar(255)` | NOT NULL, UNIQUE          | Mirrored from Clerk for display and querying; Clerk remains the source of truth                                 |
| `username`   | `varchar(50)`  | UNIQUE, nullable          | Mirrored from Clerk if set; used for public deck attribution and leaderboards                                   |
| `created_at` | `timestamptz`  | NOT NULL, default `now()` | Timestamp when the Clerk `user.created` webhook first synced this user                                          |
| `updated_at` | `timestamptz`  | NOT NULL, default `now()` | Timestamp of the last sync from a Clerk `user.updated` webhook                                                  |

---

## 2. Learning System

### `decks`

| Column        | Type           | Constraints                        | Meaning                                                              |
| ------------- | -------------- | ---------------------------------- | -------------------------------------------------------------------- |
| `id`          | `uuid`         | PK                                 | Unique identifier for the deck                                       |
| `user_id`     | `uuid`         | FK → `users.id`, ON DELETE CASCADE | The user who owns and created this deck                              |
| `title`       | `varchar(100)` | NOT NULL                           | Short name of the deck shown in listings (e.g. "Spanish Vocabulary") |
| `description` | `text`         | nullable                           | Optional longer explanation of what the deck covers                  |
| `color_hex`   | `char(7)`      | nullable                           | UI accent color for the deck card (e.g. `#7F77DD`)                   |
| `is_public`   | `boolean`      | NOT NULL, default `false`          | When true, other users can discover and clone this deck              |
| `created_at`  | `timestamptz`  | NOT NULL, default `now()`          | Timestamp when the deck was created                                  |

---

### `cards`

FSRS state fields are stored directly on the card row (mutable). Reviews are logged separately in `card_reviews`.

| Column              | Type          | Constraints                        | Meaning                                                                                                      |
| ------------------- | ------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `id`                | `uuid`        | PK                                 | Unique identifier for the card                                                                               |
| `deck_id`           | `uuid`        | FK → `decks.id`, ON DELETE CASCADE | The deck this card belongs to                                                                                |
| `front`             | `text`        | NOT NULL                           | The question or prompt shown to the user during review                                                       |
| `back`              | `text`        | NOT NULL                           | The answer or explanation revealed after the user responds                                                   |
| `card_type`         | `varchar(20)` | default `'basic'`                  | Layout type: `basic` (Q&A), `cloze` (fill-in-the-blank), or `image`                                          |
| `created_at`        | `timestamptz` | NOT NULL, default `now()`          | Timestamp when the card was created                                                                          |
| **— FSRS fields —** |               |                                    |                                                                                                              |
| `stability`         | `float`       | NOT NULL, default `0`              | FSRS memory stability: estimated number of days before the user forgets this card (higher = stronger memory) |
| `difficulty`        | `float`       | NOT NULL, default `0`              | FSRS intrinsic difficulty of the card on a 0–1 scale; increases when the user rates "Again" repeatedly       |
| `due`               | `timestamptz` | NOT NULL, default `now()`          | The next scheduled date/time for this card to appear in a review session                                     |
| `elapsed_days`      | `int`         | NOT NULL, default `0`              | Number of days that actually passed since the last review (used by FSRS to recalibrate stability)            |
| `scheduled_days`    | `int`         | NOT NULL, default `0`              | The interval (in days) that was assigned when the last review was recorded                                   |
| `reps`              | `int`         | NOT NULL, default `0`              | Total number of times the card has been reviewed with a passing rating (Good or Easy)                        |
| `lapses`            | `int`         | NOT NULL, default `0`              | Total number of times the card has been rated "Again" — indicates how often the user forgot it               |
| `state`             | `varchar(20)` | NOT NULL, default `'new'`          | Current learning state of the card: `new`, `learning`, `review`, or `relearning` (see Design Notes)          |
| `last_review`       | `timestamptz` | nullable                           | Timestamp of the most recent review; null for cards that have never been reviewed                            |

**Indexes:**

```sql
CREATE INDEX idx_cards_deck_id ON cards(deck_id);
CREATE INDEX idx_cards_due     ON cards(due) WHERE state != 'new';
```

---

### `card_reviews`

Immutable audit log — one row written per review event. Used for algorithm debugging, analytics, and future FSRS retraining.

| Column             | Type          | Constraints                        | Meaning                                                                           |
| ------------------ | ------------- | ---------------------------------- | --------------------------------------------------------------------------------- |
| `id`               | `uuid`        | PK                                 | Unique identifier for the review event                                            |
| `card_id`          | `uuid`        | FK → `cards.id`, ON DELETE CASCADE | The card that was reviewed                                                        |
| `user_id`          | `uuid`        | FK → `users.id`, ON DELETE CASCADE | The user who performed the review                                                 |
| `rating`           | `smallint`    | NOT NULL                           | User's self-assessed recall: `1` Again · `2` Hard · `3` Good · `4` Easy           |
| `stability_before` | `float`       | NOT NULL                           | FSRS stability value of the card immediately before this review                   |
| `stability_after`  | `float`       | NOT NULL                           | FSRS stability value recalculated after applying the rating                       |
| `difficulty_after` | `float`       | NOT NULL                           | FSRS difficulty value recalculated after applying the rating                      |
| `scheduled_days`   | `int`         | NOT NULL                           | The new interval (in days) assigned to the next review as a result of this rating |
| `reviewed_at`      | `timestamptz` | NOT NULL, default `now()`          | Exact timestamp when the review was submitted                                     |

**Indexes:**

```sql
CREATE INDEX idx_card_reviews_card_id    ON card_reviews(card_id);
CREATE INDEX idx_card_reviews_user_date  ON card_reviews(user_id, reviewed_at DESC);
```

---

### `pomodoro_sessions`

| Column             | Type           | Constraints                                   | Meaning                                                                      |
| ------------------ | -------------- | --------------------------------------------- | ---------------------------------------------------------------------------- |
| `id`               | `uuid`         | PK                                            | Unique identifier for the session                                            |
| `user_id`          | `uuid`         | FK → `users.id`, ON DELETE CASCADE            | The user who ran this session                                                |
| `deck_id`          | `uuid`         | FK → `decks.id`, ON DELETE SET NULL, nullable | Optional: the deck the user was studying during this session                 |
| `work_minutes`     | `smallint`     | NOT NULL, default `25`                        | Length of each focus (work) interval in minutes                              |
| `break_minutes`    | `smallint`     | NOT NULL, default `5`                         | Length of each short break in minutes                                        |
| `completed_cycles` | `smallint`     | NOT NULL, default `0`                         | Number of full work + break cycles the user actually completed               |
| `is_completed`     | `boolean`      | NOT NULL, default `false`                     | True if the user finished all planned cycles; false if they stopped early    |
| `focus_label`      | `varchar(100)` | nullable                                      | Free-text label the user assigned to this session (e.g. "Biology chapter 3") |
| `started_at`       | `timestamptz`  | NOT NULL                                      | Timestamp when the user started the timer                                    |
| `ended_at`         | `timestamptz`  | nullable                                      | Timestamp when the session ended; null while the session is still active     |

**Indexes:**

```sql
CREATE INDEX idx_pomodoro_user_id ON pomodoro_sessions(user_id, started_at DESC);
```

---

## 3. Gamification

### `user_stats`

One row per user. Updated after each session or review batch. Serves as the fast-read summary for profile and leaderboard screens.

| Column                 | Type          | Constraints                                | Meaning                                                                                       |
| ---------------------- | ------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `id`                   | `uuid`        | PK                                         | Unique identifier for the stats row                                                           |
| `user_id`              | `uuid`        | FK → `users.id`, ON DELETE CASCADE, UNIQUE | The user these stats belong to (one-to-one)                                                   |
| `xp_total`             | `int`         | NOT NULL, default `0`                      | Cumulative XP earned across all sessions since account creation                               |
| `level`                | `smallint`    | NOT NULL, default `1`                      | Current level, derived from `xp_total` via the leveling formula; recomputed on every XP write |
| `total_focus_minutes`  | `int`         | NOT NULL, default `0`                      | Lifetime total of Pomodoro work minutes completed                                             |
| `total_cards_reviewed` | `int`         | NOT NULL, default `0`                      | Lifetime total number of individual card reviews submitted                                    |
| `total_sessions`       | `int`         | NOT NULL, default `0`                      | Lifetime total number of Pomodoro sessions started                                            |
| `updated_at`           | `timestamptz` | NOT NULL, default `now()`                  | Timestamp of the last time any stat was incremented                                           |

---

### `streaks`

One row per user per calendar day. `current_streak` and `longest_streak` are pre-computed and stored so the dashboard never needs a recursive query.

| Column            | Type      | Constraints                        | Meaning                                                                                        |
| ----------------- | --------- | ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| `id`              | `uuid`    | PK                                 | Unique identifier for the streak record                                                        |
| `user_id`         | `uuid`    | FK → `users.id`, ON DELETE CASCADE | The user this streak record belongs to                                                         |
| `streak_date`     | `date`    | NOT NULL                           | The calendar day this record represents                                                        |
| `current_streak`  | `int`     | NOT NULL, default `0`              | Number of consecutive days the user has met their daily goal up to and including `streak_date` |
| `longest_streak`  | `int`     | NOT NULL, default `0`              | The user's all-time best streak count recorded at the moment this row was written              |
| `completed_today` | `boolean` | NOT NULL, default `false`          | Flips to `true` once the user meets their daily review or focus goal for `streak_date`         |

```sql
CREATE UNIQUE INDEX idx_streaks_user_date ON streaks(user_id, streak_date);
```

---

### `badges`

Static definition table seeded once at deployment. Not user-specific — defines what badges exist and what triggers them.

| Column          | Type          | Constraints      | Meaning                                                                                                     |
| --------------- | ------------- | ---------------- | ----------------------------------------------------------------------------------------------------------- |
| `id`            | `uuid`        | PK               | Unique identifier for the badge definition                                                                  |
| `name`          | `varchar(80)` | NOT NULL, UNIQUE | Short display name of the badge (e.g. "7-Day Streak")                                                       |
| `description`   | `text`        | NOT NULL         | Explanation shown to the user of how to earn this badge                                                     |
| `icon_key`      | `varchar(50)` | NOT NULL         | String key that maps to an icon asset in the client app (e.g. `"flame_7"`)                                  |
| `trigger_type`  | `varchar(40)` | NOT NULL         | Which metric to watch: `streak_days`, `cards_reviewed`, `focus_minutes`, `pomodoro_cycles`, `level_reached` |
| `trigger_value` | `int`         | NOT NULL         | The threshold value of `trigger_type` that must be reached to award the badge (e.g. `7` for a 7-day streak) |

---

### `user_badges`

Junction table recording which badges a user has earned and when.

| Column      | Type          | Constraints                         | Meaning                                                |
| ----------- | ------------- | ----------------------------------- | ------------------------------------------------------ |
| `id`        | `uuid`        | PK                                  | Unique identifier for the award record                 |
| `user_id`   | `uuid`        | FK → `users.id`, ON DELETE CASCADE  | The user who earned the badge                          |
| `badge_id`  | `uuid`        | FK → `badges.id`, ON DELETE CASCADE | The badge that was awarded                             |
| `earned_at` | `timestamptz` | NOT NULL, default `now()`           | Timestamp when the badge was first awarded to the user |

```sql
CREATE UNIQUE INDEX idx_user_badges_unique ON user_badges(user_id, badge_id);
```

---

### `daily_progress`

Denormalized daily summary upserted at the end of each session. The motivation dashboard and streak checker read from this table — never from raw logs.

| Column            | Type       | Constraints                        | Meaning                                                                              |
| ----------------- | ---------- | ---------------------------------- | ------------------------------------------------------------------------------------ |
| `id`              | `uuid`     | PK                                 | Unique identifier for the daily record                                               |
| `user_id`         | `uuid`     | FK → `users.id`, ON DELETE CASCADE | The user this day belongs to                                                         |
| `date`            | `date`     | NOT NULL                           | The calendar date this summary covers                                                |
| `xp_earned`       | `int`      | NOT NULL, default `0`              | Total XP the user earned across all activities on this date                          |
| `focus_minutes`   | `int`      | NOT NULL, default `0`              | Total Pomodoro work minutes completed on this date                                   |
| `cards_reviewed`  | `int`      | NOT NULL, default `0`              | Total number of card reviews submitted on this date                                  |
| `pomodoro_cycles` | `smallint` | NOT NULL, default `0`              | Number of complete Pomodoro work+break cycles finished on this date                  |
| `cards_new`       | `int`      | NOT NULL, default `0`              | Number of brand-new cards (state = `new`) introduced on this date                    |
| `cards_again`     | `int`      | NOT NULL, default `0`              | Number of reviews where the user rated "Again" on this date — a proxy for difficulty |
| `streak_day`      | `int`      | NOT NULL, default `0`              | The user's active streak count at the end of this date                               |

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

| Value        | Meaning                                                                      |
| ------------ | ---------------------------------------------------------------------------- |
| `new`        | Card has never been reviewed                                                 |
| `learning`   | Card is in the initial learning phase (short intervals, minutes to hours)    |
| `review`     | Card is in long-term review rotation (intervals measured in days or weeks)   |
| `relearning` | Card was forgotten (rated "Again" while in `review`) and is being re-learned |

### `rating` values in `card_reviews`

| Value | Label | Meaning                                                        |
| ----- | ----- | -------------------------------------------------------------- |
| `1`   | Again | Forgot completely — card moves to `relearning`                 |
| `2`   | Hard  | Recalled with significant difficulty — short interval increase |
| `3`   | Good  | Recalled correctly with normal effort — standard interval      |
| `4`   | Easy  | Recalled effortlessly — larger interval boost                  |

### XP and leveling

Store `xp_total` in `user_stats`. Derive `level` from a formula — suggested: `level = floor(sqrt(xp_total / 100)) + 1`. Recompute on every XP write.

### Badge award logic

A background job (or Postgres trigger) reads `daily_progress` and `user_stats` after each session and checks `badges.trigger_type` + `trigger_value` against the corresponding column. If the threshold is met and no `user_badges` row exists yet, insert one.

### `daily_progress` is denormalized by design

Aggregating XP, focus minutes, and reviews from raw tables on every dashboard load is expensive. Upsert `daily_progress` at the end of each session instead — fast reads, cheap motivation UI.
