import React from "react";
import Script from "next/script";
import type { Metadata } from "next";
import "./globals.css";

const name = "jsgrids";
const title = "jsgrids - Spreadsheet and data grid libraries for JavaScript";
const description =
  "A searchable list of popular spreadsheets and data grid libraries for JavaScript and TypeScript with framework (React, Vue, Angular, Svelte, Ember, jQuery, Vanilla JS), popularity, and feature information.";
const url = "https://jsgrids.statico.io";
const image = {
  url: url + "/jsgrids.png",
  width: "1200",
  height: "630",
  alt: "Screenshot of jsgrids",
};

export const metadata: Metadata = {
  title,
  description,
  robots: "index,follow",
  openGraph: {
    siteName: name,
    title,
    url,
    type: "website",
    description,
    images: [
      {
        url: image.url,
        alt: image.alt,
        width: parseInt(image.width),
        height: parseInt(image.height),
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@statico",
    title,
    description,
    site: name,
    images: [image.url],
  },
  other: {
    "twitter:url": url,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        {children}

        {process.env.NODE_ENV === "production" && (
          // https://github.com/statico/femtostats
          <Script
            id="femtostats"
            src="https://s.langworth.com/data.js"
            data-token="575bca33"
            defer
          />
        )}
      </body>
    </html>
  );
}
