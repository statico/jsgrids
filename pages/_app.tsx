import "../styles/index.css"
import "react-tippy/dist/tippy.css"

// This file exists so we can import CSS above.

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
