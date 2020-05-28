import { NextPage } from 'next'
import { getData } from '../lib/data'

interface Props {
  data: any
}

const Page: NextPage<Props> = ({ data }) => (
  <pre>{JSON.stringify(data, null, '  ')}</pre>
)

export default Page

export const getStaticProps = async () => {
  return { props: { data: await getData() } }
}
