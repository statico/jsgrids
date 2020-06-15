import { NextPage, GetStaticProps } from 'next'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { LibraryInfo, getLibraries } from '../lib/libraries'
import Card from '../components/Card'
import { FilteredItems } from '../components/Filters'

interface Props {
  items: LibraryInfo[]
}

const Page: NextPage<Props> = ({ items }) => (
  <>
    <Header />
    <FilteredItems items={items}>
      {(filteredItems, filterBar) => (
        <>
          <div className="container mx-auto my-4 lg:my-6 flex flex-row justify-center">
            {filterBar}
          </div>
          <div className="container mx-auto px-4">
            <main className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <Card key={item.id} info={item} />
              ))}
            </main>
          </div>
        </>
      )}
    </FilteredItems>
    <Footer />
  </>
)

export default Page

export const getStaticProps: GetStaticProps = async () => {
  return { props: { items: await getLibraries() } }
}
