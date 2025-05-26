import React from "react";
import Document, { Head, Html, Main, NextScript } from "next/document";

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

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en-US">
        <Head>
          <meta name="robots" content="index,follow" />
          <meta name="description" content={description} />
          <meta property="og:site_name" content={name} />
          <meta property="og:title" content={title} />
          <meta property="og:url" content={url} />
          <meta property="og:type" content="website" />
          <meta
            property="og:description"
            content={description}
            key="og:description"
          />
          <meta property="og:image" content={image.url} />
          <meta property="og:image:alt" content={image.alt} />
          <meta property="og:image:width" content={image.width} />
          <meta property="og:image:height" content={image.height} />
          <meta itemProp="name" content={title} />
          <meta itemProp="description" content={description} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:creator" content="@statico" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:url" content={url} />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:site" content={name} />
          <meta name="twitter:image" content={image.url} />
          <script src="https://cdn.tailwindcss.com"></script>
        </Head>
        <body className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
