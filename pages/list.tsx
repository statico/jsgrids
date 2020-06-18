import { GetStaticProps, NextPage } from 'next'
import React from 'react'
import Head from 'next/head'
import { getLibraries, LibraryInfo } from '../lib/libraries'

interface Props {
  items: LibraryInfo[]
}

const Link: React.FC<{ name: string; url?: string }> = ({ url, name }) =>
  url ? (
    <a className="text-blue-700 dark:text-blue-400" href={url}>
      {name}
    </a>
  ) : null

const TH: React.FC = ({ children }) => (
  <th className="px-4 py-2 text-left">{children}</th>
)
const TD: React.FC = ({ children }) => (
  <td className="border px-4 py-2">{children}</td>
)

const Page: NextPage<Props> = ({ items }) => (
  <div className="container mx-auto py-4">
    <Head>
      <title>Library List</title>
      <meta name="robots" content="noindex, nofollow" />
    </Head>
    <table>
      <thead>
        <tr>
          <TH>Name</TH>
          <TH>ID</TH>
          <TH>Source</TH>
          <TH>Home</TH>
          <TH>Demo</TH>
          <TH>NPM</TH>
          <TH>Bundlephobia</TH>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <TD>{item.title}</TD>
            <TD>{item.id}</TD>
            <TD>
              <Link name="Source" url={item.github?.url} />
            </TD>
            <TD>
              <Link name="Home" url={item.homeUrl} />
            </TD>
            <TD>
              <Link name="Demo" url={item.demoUrl} />
            </TD>
            <TD>
              <Link name="NPM" url={item.npm?.url} />
            </TD>
            <TD>
              <Link name="Bundlephobia" url={item.bundlephobia?.url} />
            </TD>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default Page

export const getStaticProps: GetStaticProps = async () => {
  return { props: { items: await getLibraries() } }
}
