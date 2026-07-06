import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { counterSchema } from '@/infrastructure/database/counter';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { CounterValidation } from '@/validations/CounterValidation';

export const PUT = async (request: Request) => {
  const json = await request.json();
  const parse = CounterValidation.safeParse(json);

  if (!parse.success) {
    return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
  }

  const count = await db
    .insert(counterSchema)
    .values({ id: 0, count: parse.data.increment })
    .onConflictDoUpdate({
      target: counterSchema.id,
      set: { count: sql`${counterSchema.count} + ${parse.data.increment}` },
    })
    .returning();

  logger.info('Counter has been incremented');

  return NextResponse.json({
    count: count[0]?.count,
  });
};
