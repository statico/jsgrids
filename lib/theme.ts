import { extendTheme } from "@chakra-ui/react"
import { mode } from "@chakra-ui/theme-tools"

const theme = extendTheme({
  config: {
    initialColorMode: "system",
    useSystemColorMode: false,
  },
  styles: {
    global: (props) => ({
      body: {
        bg: mode("gray.100", "gray.800")(props),
        color: mode("gray.900", "gray.100")(props),
      },
    }),
  },
})

export default theme
