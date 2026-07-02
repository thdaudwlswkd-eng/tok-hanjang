/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { hostname: 'localhost' },
      { hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  experimental: {
  