/** @type {import('next').NextConfig} */
const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ''
console.log(r2PublicUrl)
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '**.railway.app',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'cabin-rentals-of-georgia.com',
      },
      {
        protocol: 'https',
        hostname: 'media.cabin-rentals-of-georgia.com',
      },
      {
        protocol: 'https',
        hostname: 'www.cabin-rentals-of-georgia.com',
      },
      {
        protocol: 'https',
        hostname: 'secure.streamlinevrs.com',
      },
      {
        protocol: 'https',
        hostname: 'api.cabin-rentals-of-georgia.com',
      },
      {
        protocol: 'https',
        hostname: 'gallery.streamlinevrs.com',
      },
      // Add custom R2 domain if provided
      ...(r2PublicUrl ? [{
        protocol: 'https',
        hostname: new URL(r2PublicUrl).hostname.replace(/^www\./, ''),
      }] : []),
    ],
  },
  async redirects() {
    return [
      {
        source: '/cabins/above-it-all-lodge',
        destination: '/availability',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    if (!r2PublicUrl) {
      return []
    }

    return [
      {
        source: '/images/:path*',
        destination: `${r2PublicUrl}/images/:path*`,
      },
      {
        source: '/sites/default/files/:path*',
        destination: 'https://cabin-rentals-of-georgia.com/sites/default/files/:path*',
      },
    ]
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_R2_PUBLIC_URL: r2PublicUrl,
  },
}

module.exports = nextConfig
