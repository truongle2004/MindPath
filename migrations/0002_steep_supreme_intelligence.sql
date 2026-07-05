CREATE TABLE "todos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "todos" ("name") VALUES
	('Learn spaced repetition'),
	('Review flashcards'),
	('Complete a Pomodoro session');
