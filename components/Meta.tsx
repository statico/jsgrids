import Head from 'next/head'

const title = 'jsgrids | Spreadsheets and Data Grid Libraries for JavaScript'
const description = 'A List of JavaScript Spreadsheets and Data Grid Libraries'

export default () => (
  <Head>
    <title>{title}</title>
    <meta name="title" content={title} />
    <meta name="description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://jsgrids.io/" />
    <meta property="og:title" content="jsgrids" />
    <meta property="og:image" content="/jsgrids.jpg" />
    <meta property="og:image:width" content="512" />
    <meta property="og:image:height" content="512" />
    <meta property="og:description" content={description} />
    <link rel="shortcut icon" href="/favicon.jpg" />
  </Head>
)
