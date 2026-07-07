import type * as z from 'zod';
import type { userSchema } from '@/modules/user/entities/models/user.schema';

export type User = z.infer<typeof userSchema>;
