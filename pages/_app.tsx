import React from "react";
import { AppProps } from "next/app";
import Script from "next/script";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
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
    </>
  );
}

export default MyApp;
