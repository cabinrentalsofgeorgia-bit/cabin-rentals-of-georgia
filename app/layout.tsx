import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Blue Ridge, GA Cabin Rentals | Cabin Rentals of Georgia',
  description: 'Family owned and family operated ~ Discover the perfect escape in our luxury Georgia cabins offering riverfront, mountain views, lake views ~ pet friendly, game rooms, hot tubs, fire pits, and more.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/icons/favicon.ico" type="image/x-icon" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
