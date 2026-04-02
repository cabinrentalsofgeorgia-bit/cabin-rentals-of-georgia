import type { Config } from 'tailwindcss'

/**
 * Legacy Design Tokens — extracted via Playwright + getComputedStyle()
 * from the live Drupal site (cabin-rentals-of-georgia.com).
 *
 * Source:  backend/scripts/extract_computed_css.py
 * Output:  design_tokens.json
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  DO NOT replace these with generic Tailwind defaults.       │
 * │  These are the exact computed pixel values from the legacy  │
 * │  site.  See .cursorrules for enforcement.                   │
 * └─────────────────────────────────────────────────────────────┘
 */

const legacyTokens = {
  font: '"Fanwood Text", serif',

  colors: {
    body:      '#533e27',   // rgb(83, 62, 39)
    heading:   '#7c2c00',   // rgb(124, 44, 0)
    link:      '#7c2c00',   // rgb(124, 44, 0)
    linkHover: '#b7714b',
    accent:    '#faf6ef',   // warm cream backgrounds
    border:    '#e8dcc8',   // warm tan borders
  },

  h1: { size: '35.2px', weight: '400', lineHeight: '35.2px', style: 'italic', marginTop: '15px', marginBottom: '10px' },
  h2: { size: '27.2px', weight: '400', lineHeight: '27.2px', style: 'italic', marginTop: '22.576px', marginBottom: '22.576px' },
  h3: { size: '20.8px', weight: '400', lineHeight: '20.8px', style: 'normal', marginTop: '15px', marginBottom: '15px' },
  h4: { size: '16px',   weight: '700', lineHeight: '20.8px', style: 'normal', marginTop: '15px', marginBottom: '15px' },
  p:  { size: '16px',   weight: '400', lineHeight: '20.8px',                  marginTop: '16px', marginBottom: '16px' },
  a:  { weight: '400',  decoration: 'underline' },
  strong: { weight: '700', color: '#7c2c00' },
  li: { marginBottom: '8px' },
} as const

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        legacy: ['"Fanwood Text"', 'serif'],
      },
      fontSize: {
        'legacy-h1':  [legacyTokens.h1.size, { lineHeight: legacyTokens.h1.lineHeight, fontWeight: legacyTokens.h1.weight }],
        'legacy-h2':  [legacyTokens.h2.size, { lineHeight: legacyTokens.h2.lineHeight, fontWeight: legacyTokens.h2.weight }],
        'legacy-h3':  [legacyTokens.h3.size, { lineHeight: legacyTokens.h3.lineHeight, fontWeight: legacyTokens.h3.weight }],
        'legacy-h4':  [legacyTokens.h4.size, { lineHeight: legacyTokens.h4.lineHeight, fontWeight: legacyTokens.h4.weight }],
        'legacy-body': [legacyTokens.p.size,  { lineHeight: legacyTokens.p.lineHeight,  fontWeight: legacyTokens.p.weight }],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        legacy: {
          body:    legacyTokens.colors.body,
          heading: legacyTokens.colors.heading,
          link:    legacyTokens.colors.link,
          hover:   legacyTokens.colors.linkHover,
          accent:  legacyTokens.colors.accent,
          border:  legacyTokens.colors.border,
        },
      },
      typography: {
        /**
         * Override @tailwindcss/typography defaults with exact legacy values.
         * Every paragraph, heading, list, and link inside .prose now matches
         * the 20-year-old Drupal site pixel-for-pixel.
         */
        legacy: {
          css: {
            '--tw-prose-body':       legacyTokens.colors.body,
            '--tw-prose-headings':   legacyTokens.colors.heading,
            '--tw-prose-links':      legacyTokens.colors.link,
            '--tw-prose-bold':       legacyTokens.colors.heading,
            '--tw-prose-counters':   legacyTokens.colors.body,
            '--tw-prose-bullets':    legacyTokens.colors.body,
            '--tw-prose-quotes':     legacyTokens.colors.body,
            '--tw-prose-quote-borders': legacyTokens.colors.border,
            '--tw-prose-captions':   legacyTokens.colors.body,

            fontFamily: legacyTokens.font,
            fontSize: legacyTokens.p.size,
            lineHeight: legacyTokens.p.lineHeight,
            color: legacyTokens.colors.body,

            p: {
              fontSize: legacyTokens.p.size,
              lineHeight: legacyTokens.p.lineHeight,
              marginTop: legacyTokens.p.marginTop,
              marginBottom: legacyTokens.p.marginBottom,
            },

            h1: {
              fontFamily: legacyTokens.font,
              fontSize: legacyTokens.h1.size,
              fontWeight: legacyTokens.h1.weight,
              fontStyle: legacyTokens.h1.style,
              lineHeight: legacyTokens.h1.lineHeight,
              color: legacyTokens.colors.heading,
              marginTop: legacyTokens.h1.marginTop,
              marginBottom: legacyTokens.h1.marginBottom,
            },

            h2: {
              fontFamily: legacyTokens.font,
              fontSize: legacyTokens.h2.size,
              fontWeight: legacyTokens.h2.weight,
              fontStyle: legacyTokens.h2.style,
              lineHeight: legacyTokens.h2.lineHeight,
              color: legacyTokens.colors.heading,
              marginTop: legacyTokens.h2.marginTop,
              marginBottom: legacyTokens.h2.marginBottom,
            },

            h3: {
              fontFamily: legacyTokens.font,
              fontSize: legacyTokens.h3.size,
              fontWeight: legacyTokens.h3.weight,
              fontStyle: legacyTokens.h3.style,
              lineHeight: legacyTokens.h3.lineHeight,
              color: legacyTokens.colors.body,
              marginTop: legacyTokens.h3.marginTop,
              marginBottom: legacyTokens.h3.marginBottom,
            },

            h4: {
              fontFamily: legacyTokens.font,
              fontSize: legacyTokens.h4.size,
              fontWeight: legacyTokens.h4.weight,
              fontStyle: legacyTokens.h4.style,
              lineHeight: legacyTokens.h4.lineHeight,
              color: legacyTokens.colors.body,
              marginTop: legacyTokens.h4.marginTop,
              marginBottom: legacyTokens.h4.marginBottom,
            },

            a: {
              color: legacyTokens.colors.link,
              fontWeight: legacyTokens.a.weight,
              textDecoration: legacyTokens.a.decoration,
              '&:hover': {
                color: legacyTokens.colors.linkHover,
              },
            },

            strong: {
              fontWeight: legacyTokens.strong.weight,
              color: legacyTokens.strong.color,
            },

            'ul > li': {
              marginBottom: legacyTokens.li.marginBottom,
              paddingLeft: '0',
              '&::marker': {
                color: legacyTokens.colors.body,
              },
            },

            'ol > li': {
              marginBottom: legacyTokens.li.marginBottom,
              paddingLeft: '0',
              '&::marker': {
                color: legacyTokens.colors.body,
              },
            },

            blockquote: {
              fontStyle: 'italic',
              color: legacyTokens.colors.body,
              borderLeftColor: legacyTokens.colors.border,
            },

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
