/** App user mirrored from Clerk; anchors user-scoped foreign keys. */
export type User = {
  id: string;
  clerkId: string;
  email: string;
  username: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserInput = {
  clerkId: string;
  email: string;
  username?: string | null;
};

export type UpdateUserInput = {
  email?: string;
  username?: string | null;
};
