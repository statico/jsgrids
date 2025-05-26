"use client";

import Card from "@/components/Card";
import FilterBar from "@/components/FilterBar";
import { LibraryInfo } from "@/lib/libraries";
import { format } from "date-fns";
import GithubCorner from "react-github-corner";
import { FaExternalLinkAlt } from "react-icons/fa";
import { ModeToggle } from "@/components/mode-toggle";
import { HERO_PATTERN_GRID_BACKGROUND } from "@/lib/ui-constants";

type IndexPageProps = {
  items: LibraryInfo[];
  ts: string;
};

export default function IndexPage({ items, ts }: IndexPageProps) {
  return (
    <div>
      <header
        className="text-white p-8 text-center relative bg-slate-600 dark:bg-slate-800 transition-colors duration-200"
        style={{
          backgroundImage: HERO_PATTERN_GRID_BACKGROUND,
        }}
      >
        <div className="absolute top-2 left-2">
          <ModeToggle />
        </div>
        <GithubCorner
          href="https://github.com/statico/jsgrids"
          bannerColor="#fff"
          octoColor="#475569"
          className="[&>svg]:fill-slate-600 dark:[&>svg]:fill-slate-800"
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
              className="hover:underline inline-flex flex-row gap-2 items-center"
            >
              Contributions welcome!
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
