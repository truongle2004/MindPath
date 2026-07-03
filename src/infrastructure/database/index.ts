import { createRepositories } from '@/infrastructure/database/repositories';
import { db } from '@/libs/DB';

export const repositories = createRepositories(db);
