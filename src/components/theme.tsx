"use client";

import { ThemeProvider as NextThemes, useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemes
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemes>
  );
}

/**
 * Both icons are always rendered and cross-faded with CSS keyed off the
 * `.dark` class on <html>. That keeps the markup identical on server and
 * client — no mount guard, no hydration mismatch, no flash.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle colour theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-line bg-elev/60 text-muted transition-colors hover:text-fg"
    >
      <Sun
        size={15}
        className="absolute transition-all duration-300 dark:-translate-y-4 dark:rotate-45 dark:opacity-0"
      />
      <Moon
        size={15}
        className="absolute translate-y-4 -rotate-45 opacity-0 transition-all duration-300 dark:translate-y-0 dark:rotate-0 dark:opacity-100"
      />
    </button>
  );
}
