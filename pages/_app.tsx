import { ChakraProvider } from "@chakra-ui/react";
import theme from "lib/theme";
import { AppProps } from "next/app";
import Script from "next/script";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />

      {process.env.NODE_ENV === "production" && (
        // https://github.com/statico/femtostats
        <Script
          id="femtostats"
          src="https://s.langworth.com/data.js"
          data-token="575bca33"
          defer
        />
      )}
    </ChakraProvider>
  );
}

export default MyApp;
