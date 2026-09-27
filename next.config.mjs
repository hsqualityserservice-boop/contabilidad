/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel is the primary runtime: keep dynamic routes and API handlers enabled.
  // Capacitor consumes the separately generated `out` directory when needed.
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
