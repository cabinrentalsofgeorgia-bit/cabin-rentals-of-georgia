import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      typography: {
        DEFAULT: {
          css: {
            iframe: {
              width: '100%',
              aspectRatio: '16 / 9',
              borderRadius: '0.5rem',
              maxWidth: '100%',
            },
            video: {
              width: '100%',
              aspectRatio: '16 / 9',
              borderRadius: '0.5rem',
              maxWidth: '100%',
            },
            'object, embed': {
              width: '100%',
              maxWidth: '100%',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
export default config

