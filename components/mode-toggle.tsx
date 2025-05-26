"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { FaMoon, FaSun } from "react-icons/fa";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by using consistent values during SSR
  const currentTheme = mounted ? theme : "light";
  const nextTheme = currentTheme === "light" ? "dark" : "light";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-white hover:bg-white/20"
      onClick={() => setTheme(nextTheme)}
      title={`Set color mode to ${nextTheme}`}
      aria-label={`Set color mode to ${nextTheme}`}
    >
      <FaMoon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <FaSun className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
