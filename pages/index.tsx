import { NextPage } from 'next'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { AugmentedInfo, getLibraries } from '../lib/data'
import Card from '../components/Card'

interface Props {
  items: AugmentedInfo[]
}

const Page: NextPage<Props> = ({ items }) => (
  <>
    <Header />
    <div className="container mx-auto py-10 text-xs">
      {items.map((item) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <Card info={item} />
        </div>
      ))}
    </div>
    <Footer />
  </>
)

export default Page

export const getStaticProps = async () => {
  return { props: { items: await getLibraries() } }
}
