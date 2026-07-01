/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'localhost' },
      { hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'formidable'],
  },
}

module.exports = nextConfig
