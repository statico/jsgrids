import {
  Container,
  Heading,
  Link,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { GetStaticProps, NextPage } from "next"
import { NextSeo } from "next-seo"
import React from "react"
import { getLibraries, LibraryInfo } from "../lib/libraries"

interface Props {
  items: LibraryInfo[]
}

const LinkTo = ({ href }: { href?: string | null }) =>
  href ? <Link href={href}>Link</Link> : <span />

const Page: NextPage<Props> = ({ items }) => (
  <Container maxW="full">
    <NextSeo title="All Libraries" />
    <Heading>All Libraries</Heading>
    <Table size="sm">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>ID</Th>
          <Th>Source</Th>
          <Th>Home</Th>
          <Th>Demo</Th>
          <Th>NPM</Th>
          <Th>Bundlephobia</Th>
        </Tr>
      </Thead>
      <Tbody>
        {items.map((item) => (
          <Tr key={item.id}>
            <Td>{item.title}</Td>
            <Td>{item.id}</Td>
            <Td>
              <LinkTo href={item.github?.url} />
            </Td>
            <Td>
              <LinkTo href={item.homeUrl} />
            </Td>
            <Td>
              <LinkTo href={item.demoUrl} />
            </Td>
            <Td>
              <LinkTo href={item.npm?.url} />
            </Td>
            <Td>
              <LinkTo href={item.bundlephobia?.url} />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  </Container>
)

export default Page

export const getStaticProps: GetStaticProps = async () => {
  return { props: { items: await getLibraries() } }
}
