import { and, eq, sql } from 'drizzle-orm';
import type { DbClient } from '@/lib/DBConnection';
import { DatabaseOperationError } from '@/lib/errors/database-operation-error';
import type {
  ICompletePomodoroSessionResult,
  IPomodoroSessionRepository,
} from '@/modules/flashcard/application/repositories/pomodoro-session.repository.interface';
import type { PomodoroSession } from '@/modules/flashcard/entities/models/pomodoro-session';
import { pomodoroSessionsSchema } from '@/modules/flashcard/infrastructure/schema/pomodoro-sessions';
import {
  dailyProgressSchema,
  userStatsSchema,
} from '@/modules/gamification/infrastructure/schema/gamification';

function mapPomodoroSession(row: typeof pomodoroSessionsSchema.$inferSelect): PomodoroSession {
  return {
    id: row.id,
    userId: row.userId,
    deckId: row.deckId,
    workMinutes: row.workMinutes,
    breakMinutes: row.breakMinutes,
    completedCycles: row.completedCycles,
    isCompleted: row.isCompleted,
    focusLabel: row.focusLabel,
    startedAt: row.startedAt.toISOString(),
    endedAt: row.endedAt?.toISOString() ?? null,
  };
}

type FocusProgressDb = Pick<DbClient, 'insert'>;

async function recordFocusProgress(
  db: FocusProgressDb,
  userId: string,
  focusMinutes: number,
  cycles: number,
) {
  const today = new Date().toISOString().slice(0, 10);

  await db
    .insert(userStatsSchema)
    .values({
      userId,
      totalFocusMinutes: focusMinutes,
      totalSessions: 1,
    })
    .onConflictDoUpdate({
      target: userStatsSchema.userId,
      set: {
        totalFocusMinutes: sql`${userStatsSchema.totalFocusMinutes} + ${focusMinutes}`,
        totalSessions: sql`${userStatsSchema.totalSessions} + 1`,
        updatedAt: new Date(),
      },
    });

  await db
    .insert(dailyProgressSchema)
    .values({
      userId,
      date: today,
      focusMinutes,
      pomodoroCycles: cycles,
    })
    .onConflictDoUpdate({
      target: [dailyProgressSchema.userId, dailyProgressSchema.date],
      set: {
        focusMinutes: sql`${dailyProgressSchema.focusMinutes} + ${focusMinutes}`,
        pomodoroCycles: sql`${dailyProgressSchema.pomodoroCycles} + ${cycles}`,
      },
    });
}

/**
 * Creates a Drizzle-backed Pomodoro session repository.
 * @param db The database client.
 * @returns A Pomodoro session repository instance.
 */
export const createDrizzlePomodoroSessionRepository = (
  db: DbClient,
): IPomodoroSessionRepository => ({
  create: async (userId, input) => {
    try {
      const rows = await db
        .insert(pomodoroSessionsSchema)
        .values({
          userId,
          deckId: input.deckId ?? null,
          workMinutes: input.workMinutes,
          breakMinutes: input.breakMinutes,
          focusLabel: input.focusLabel ?? null,
          startedAt: new Date(),
        })
        .returning();

      const [row] = rows;

      if (!row) {
        throw new DatabaseOperationError('Failed to create Pomodoro session');
      }

      return mapPomodoroSession(row);
    } catch {
      throw new DatabaseOperationError('Failed to create Pomodoro session');
    }
  },

  complete: async (sessionId, userId, input): Promise<ICompletePomodoroSessionResult | null> => {
    const existingRows = await db
      .select()
      .from(pomodoroSessionsSchema)
      .where(eq(pomodoroSessionsSchema.id, sessionId))
      .limit(1);
    const [existing] = existingRows;

    if (!existing || existing.userId !== userId) {
      return null;
    }

    if (existing.isCompleted) {
      return {
        session: mapPomodoroSession(existing),
        focusMinutes: existing.workMinutes * existing.completedCycles,
      };
    }

    const focusMinutes = existing.workMinutes * input.completedCycles;

    try {
      const row = await db.transaction(async (tx) => {
        const rows = await tx
          .update(pomodoroSessionsSchema)
          .set({
            completedCycles: input.completedCycles,
            isCompleted: true,
            endedAt: new Date(),
          })
          .where(
            and(
              eq(pomodoroSessionsSchema.id, sessionId),
              eq(pomodoroSessionsSchema.isCompleted, false),
            ),
          )
          .returning();

        const [updatedRow] = rows;

        if (!updatedRow) {
          return null;
        }

        await recordFocusProgress(tx, userId, focusMinutes, input.completedCycles);

        return updatedRow;
      });

      if (!row) {
        const rows = await db
          .select()
          .from(pomodoroSessionsSchema)
          .where(eq(pomodoroSessionsSchema.id, sessionId))
          .limit(1);
        const [completedRow] = rows;

        if (!completedRow || completedRow.userId !== userId) {
          return null;
        }

        return {
          session: mapPomodoroSession(completedRow),
          focusMinutes: completedRow.workMinutes * completedRow.completedCycles,
        };
      }

      return { session: mapPomodoroSession(row), focusMinutes };
    } catch {
      throw new DatabaseOperationError('Failed to complete Pomodoro session');
    }
  },
});
