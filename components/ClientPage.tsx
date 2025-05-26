"use client";

import Card from "@/components/Card";
import FilterBar from "@/components/FilterBar";
import { LibraryInfo } from "@/lib/libraries";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import GithubCorner from "react-github-corner";
import { FaExternalLinkAlt, FaMoon, FaSun } from "react-icons/fa";
import { Button } from "@/components/ui/button";

type IndexPageProps = {
  items: LibraryInfo[];
  ts: string;
};

export default function IndexPage({ items, ts }: IndexPageProps) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleColorMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const blue = darkMode ? "#1c4a75" : "#3182ce";

  return (
    <div className={darkMode ? "dark" : ""}>
      <header
        className="text-white p-8 text-center relative"
        style={{
          backgroundColor: blue,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%2363B3ED' fill-opacity='0.4'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 left-2 text-white hover:bg-white/20"
          onClick={toggleColorMode}
          title={`Set color mode to ${darkMode ? "light" : "dark"}`}
          aria-label={`Set color mode to ${darkMode ? "light" : "dark"}`}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </Button>
        <GithubCorner
          href="https://github.com/statico/jsgrids"
          bannerColor="#fff"
          octoColor={blue}
        />
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">jsgrids.statico.io</h1>
          <h2 className="text-2xl font-normal">
            A List of JavaScript Spreadsheet and Data Grid Libraries
          </h2>
          <p className="text-base font-normal" suppressHydrationWarning>
            Last Update: {format(new Date(ts), "MMM d, yyyy")} -{" "}
            <a
              href="https://github.com/statico/jsgrids#contributing"
              className="hover:underline"
            >
              Contributions welcome!{" "}
              <FaExternalLinkAlt className="inline w-3 h-3" />
            </a>
          </p>
        </div>
      </header>

      <FilterBar items={items}>
        {(filteredItems, filterBar) => (
          <div className="px-6">
            <div>{filterBar}</div>
            <main className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <Card key={item.id} info={item} />
              ))}
            </main>
          </div>
        )}
      </FilterBar>

      <footer className="p-10 text-gray-600 text-center space-y-2">
        <div>
          <a
            href="https://github.com/statico/jsgrids"
            className="hover:underline"
          >
            Help improve this list on GitHub
          </a>
        </div>
        <div>
          <a href="https://nextjs.org/" className="hover:underline">
            Built with Next.js
          </a>
        </div>
        <div>
          <a href="https://vercel.com" className="hover:underline">
            Hosted on Vercel
          </a>
        </div>
        <div>
          <a href="http://www.heropatterns.com" className="hover:underline">
            Background from Hero Patterns
          </a>
        </div>
        <div>
          <a href="https://bundlephobia.com/" className="hover:underline">
            Package sizes from Bundlephobia
          </a>
        </div>
        <div>
          <a href="/list" className="hover:underline">
            View data as table
          </a>
        </div>
      </footer>
    </div>
  );
}
