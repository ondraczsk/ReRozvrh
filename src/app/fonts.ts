// app/fonts.ts
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: "swap",
  weight: "variable",
})

export const fonts = {
  inter,
}
