import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'
const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL 
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')


console.log('SERVER_URL:', NEXT_PUBLIC_SERVER_URL)

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Server URL
      {
        protocol: 'https',
        hostname: new URL(NEXT_PUBLIC_SERVER_URL).hostname,
      },
      // Cloudflare R2
      {
        protocol: 'https',
        hostname: process.env.R2_DOMAIN || 'pub-617933b153804484919b6cd0b425966c.r2.dev',
      },

      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  reactStrictMode: true,
  redirects,
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig)
