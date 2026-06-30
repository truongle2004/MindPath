'use client';

import { useUser, ClerkLoading, ClerkLoaded, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function Header() {
  const { isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          Acme
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/dashboard" className="transition-colors hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link href="/docs" className="transition-colors hover:text-foreground">
            Docs
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ClerkLoading>
            <Skeleton className="h-8 w-8 rounded-full" />
          </ClerkLoading>

          <ClerkLoaded>
            {!isSignedIn && (
              <SignInButton mode="modal">
                <Button size="sm">Sign in</Button>
              </SignInButton>
            )}

            {isSignedIn && (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'h-8 w-8',
                  },
                }}
              />
            )}
          </ClerkLoaded>
        </div>
      </div>
    </header>
  );
}
