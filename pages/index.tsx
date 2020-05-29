import { NextPage, GetStaticProps } from 'next'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { AugmentedInfo, getLibraries } from '../lib/libraries'
import Card from '../components/Card'

interface Props {
  items: AugmentedInfo[]
}

const Page: NextPage<Props> = ({ items }) => (
  <>
    <Header />
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} info={item} />
        ))}
      </div>
    </div>
    <Footer />
  </>
)

export default Page

export const getStaticProps: GetStaticProps = async () => {
  return { props: { items: await getLibraries() } }
}
