import { extendTheme } from "@chakra-ui/react";
import { theme as baseTheme } from '@saas-ui/react';
const breakpoints = {
  base: '0em', // 0px
  "xs-sm": "21.3em",
  sm: '30em', // ~480px. em is a relative unit and is dependant on the font size.
  md: '48em', // ~768px
  lg: '62em', // ~992px
  xl: '80em', // ~1280px
  '2xl': '96em', // ~1536px
}
const colors = {
  black: "#000000",
  gray: {
    50: "#f9fafa",
    100: "#f0f2f3",
    200: "#e5e8ea",
    300: "#d0d4d9",
    400: "#a5aeb6",
    500: "#72818d",
    600: "#435768",
    700: "#2c3e4d",
    800: "#1a2935",
    900: "#0d1620",
  },
  blue: {
    50: "#e3f2fd",
    100: "#bbdefb",
    200: "#90caf9",
    300: "#64b5f6",
    400: "#42a5f5",
    500: "#2196f3",
    600: "#1e88e5",
    700: "#1976d2",
    800: "#1565c0",
    900: "#0d47a1",
  },
  primary: {
    50: "#e1f0fa",
    100: "#b3d9f2",
    200: "#80bfea",
    300: "#4da5e2",
    400: "#268fdc",
    500: "#0065BD",
    600: "#005ba9",
    700: "#004f92",
    800: "#00437b",
    900: "#00315b",
  },
};

export const theme = extendTheme(
  {
    breakpoints,
    fonts: {
      heading: 'var(--font-inter)',
      body: 'var(--font-inter)',
    },
    config: {
      initialColorMode: 'dark',
      useSystemColorMode: false,
    },
    colors,
    semanticTokens: {
      colors: {
        bodyBg: {
          default: 'white',
          _dark: 'black',
        },
        surface: {
          default: 'white',
          _dark: 'black',
        },
        border: {
          default: 'gray.200',
          _dark: 'gray.900',
        },
      },
    },
    styles: {
      global: {
        body: {
          bg: 'bodyBg',
        },
      },
    },
    components: {
      Modal: {
        baseStyle: {
          dialog: {
            bg: 'surface',
            borderColor: 'border',
            borderWidth: '1px',
            borderStyle: 'solid',
          },
        },
      },
      Card: {
        // Základní styl pro všechny varianty (např. nastavení pozadí)
        baseStyle: {
          container: {
            bg: 'surface',
          },
        },
        // Definice variant - zde přidáme border pouze pro variantu "outline"
        variants: {
          outline: {
            container: {
              borderColor: 'border',
              borderWidth: '1px',
              borderStyle: 'solid',
            },
          },
        },
      },
    },
  },
  baseTheme
);
