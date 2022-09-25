import { Box, Heading, Link, SimpleGrid, Stack } from "@chakra-ui/react"
import Card from "components/Card"
import FilterBar from "components/FilterBar"
import { getLibraries, LibraryInfo } from "lib/libraries"
import { GetStaticProps, NextPage } from "next"
import Head from "next/head"
import GithubCorner from "react-github-corner"

interface Props {
  items: LibraryInfo[]
}

const Page: NextPage<Props> = ({ items }) => (
  <>
    <Head>
      <title>
        jsgrids - Spreadsheets and data grid libraries for JavaScript
      </title>
      <script
        src="https://s.langworth.com/script.js"
        data-token="575bca33"
        defer
      ></script>
    </Head>

    <Box
      as="header"
      color="white"
      p={8}
      textAlign="center"
      // Generated with https://www.heropatterns.com/
      style={{
        backgroundColor: "#3182ce",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%2363B3ED' fill-opacity='0.4'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      <GithubCorner
        href="https://github.com/statico/jsgrids"
        bannerColor="#fff"
        octoColor="#3182ce"
      />
      <Heading as="h1" size="2xl" mb={2}>
        jsgrids.statico.io
      </Heading>
      <Heading as="h2" size="lg" fontWeight="normal">
        A List of JavaScript Spreadsheets and Data Grid Libraries
      </Heading>
    </Box>

    <FilterBar items={items}>
      {(filteredItems, filterBar) => (
        <Box px={6}>
          <Box>{filterBar}</Box>
          <SimpleGrid columns={[1, null, null, 2, 3]} as="main" spacing={8}>
            {filteredItems.map((item) => (
              <Card key={item.id} info={item} />
            ))}
          </SimpleGrid>
        </Box>
      )}
    </FilterBar>

    <Stack as="footer" p={10} color="gray.600" textAlign="center">
      <Link href="https://github.com/statico/jsgrids">
        Help improve this list on GitHub
      </Link>
      <Link href="https://nextjs.org/">Built with Next.js</Link>
      <Link href="https://vercel.com">Hosted on Vercel</Link>
      <Link href="http://www.heropatterns.com">
        Background from Hero Patterns
      </Link>
      <Link href="https://bundlephobia.com/">
        Package sizes from Bundlephobia
      </Link>
      <Link href="/list">View data as table</Link>
    </Stack>
  </>
)

export default Page

export const getStaticProps: GetStaticProps = async () => {
  return { props: { items: await getLibraries() } }
}
