import { ChakraProvider } from "@chakra-ui/react";
import theme from "lib/theme";
import { AppProps } from "next/app";
import { RecoilEnv, RecoilRoot } from "recoil";

// Ignore these errors because we're using Next.js with hot module reloading.
RecoilEnv.RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED =
  process.env.NODE_ENV !== "production";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </RecoilRoot>
  );
}

export default MyApp;
