import Document, { Head, Html, Main, NextScript } from 'next/document'
import * as React from 'react'

const title = 'jsgrids | Spreadsheets and Data Grid Libraries for JavaScript'
const description = 'A List of JavaScript Spreadsheets and Data Grid Libraries'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en-US">
        <Head>
          <meta name="title" content={title} />
          <meta name="description" content={description} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://jsgrids.statico.io/" />
          <meta property="og:title" content="jsgrids" />
          <meta property="og:image" content="/jsgrids.jpg" />
          <meta property="og:image:width" content="512" />
          <meta property="og:image:height" content="512" />
          <meta property="og:description" content={description} />
          <link rel="shortcut icon" href="/favicon.jpg" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
