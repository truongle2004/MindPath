"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenu } from "./ui/dropdown-menu";

export function Header() {
  const { setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          Mind Path
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link
            href="/dashboard"
            className="transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/pricing"
            className="transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href="/docs"
            className="transition-colors hover:text-foreground"
          >
            Docs
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setTheme("light");
                }}
              >
                Light
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setTheme("dark");
                }}
              >
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setTheme("system");
                }}
              >
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* <ClerkLoading> */}
          {/*   <Skeleton className="h-8 w-8 rounded-full" /> */}
          {/* </ClerkLoading> */}

          {/* <ClerkLoaded> */}
          {/*   {!isSignedIn && ( */}
          {/*     <SignInButton mode="modal"> */}
          {/*       <Button size="sm">Sign in</Button> */}
          {/*     </SignInButton> */}
          {/*   )} */}
          {/**/}
          {/*   {isSignedIn && ( */}
          {/*     <UserButton */}
          {/*       appearance={{ */}
          {/*         elements: { */}
          {/*           avatarBox: 'h-8 w-8', */}
          {/*         }, */}
          {/*       }} */}
          {/*     /> */}
          {/*   )} */}
          {/* </ClerkLoaded> */}
        </div>
      </div>
    </header>
  );
}
