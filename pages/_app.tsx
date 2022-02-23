import { ChakraProvider } from "@chakra-ui/react"
import theme from "lib/theme"
import { DefaultSeo } from "next-seo"
import { AppProps } from "next/app"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <DefaultSeo
        titleTemplate="%s | jsgrids"
        defaultTitle="jsgrids - Spreadsheets and data grid libraries for JavaScript"
        description="A searchable list of popular spreadsheets and data grid libraries for JavaScript with framework (React, Vue, Angular, Ember, jQuery, Vanilla JS), popularity, and feature information."
        twitter={{
          cardType: "summary_large_image",
          handle: "@statico",
        }}
        openGraph={{
          url: "https://jsgrids.statico.io",
          type: "website",
          site_name: "jsgrids",
          images: [
            {
              url: "https://jsgrids.statico.io/jsgrids.png",
              width: 1200,
              height: 630,
              alt: "Screenshot of jsgrids",
              type: "image/png",
            },
          ],
        }}
      />
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp
