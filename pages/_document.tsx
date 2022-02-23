import { ColorModeScript, ChakraProvider } from "@chakra-ui/react"
import Document, { Head, Html, Main, NextScript } from "next/document"
import * as React from "react"
import theme from "lib/theme"

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en-US">
        <Head />
        <body>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
