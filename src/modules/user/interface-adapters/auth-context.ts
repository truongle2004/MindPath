/** Authenticated Clerk session context passed to controllers. */
export type AuthContext = {
  clerkId: string;
  email: string;
  username: string | null;
};
