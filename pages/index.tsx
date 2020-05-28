import { NextPage } from 'next'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { getData } from '../lib/data'

interface Props {
  data: any
}

const Page: NextPage<Props> = ({ data }) => (
  <>
    <Header />
    <pre className="container mx-auto text-xs">
      {JSON.stringify(data, null, '  ')}
    </pre>
    <Footer />
  </>
)

export default Page

export const getStaticProps = async () => {
  return { props: { data: await getData() } }
}
