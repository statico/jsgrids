import React from "react";
import { getLibraries } from "@/lib/libraries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Libraries - jsgrids",
  description:
    "Complete list of JavaScript spreadsheet and data grid libraries",
};

const LinkTo = ({ href }: { href?: string | null }) =>
  href ? (
    <a href={href} className="text-blue-600 hover:underline">
      Link
    </a>
  ) : (
    <span />
  );

export default async function ListPage() {
  const items = await getLibraries();

  return (
    <div className="max-w-full mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">All Libraries</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-300 dark:border-gray-600">
                Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-300 dark:border-gray-600">
                ID
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-300 dark:border-gray-600">
                Source
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-300 dark:border-gray-600">
                Home
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-300 dark:border-gray-600">
                Demo
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-300 dark:border-gray-600">
                NPM
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-300 dark:border-gray-600">
                Bundlephobia
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
            {items.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                  {item.title}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                  {item.id}
                </td>
                <td className="px-4 py-2 text-sm">
                  <LinkTo href={item.github?.url} />
                </td>
                <td className="px-4 py-2 text-sm">
                  <LinkTo href={item.homeUrl} />
                </td>
                <td className="px-4 py-2 text-sm">
                  <LinkTo href={item.demoUrl} />
                </td>
                <td className="px-4 py-2 text-sm">
                  <LinkTo href={item.npm?.url} />
                </td>
                <td className="px-4 py-2 text-sm">
                  <LinkTo href={item.bundlephobia?.url} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
