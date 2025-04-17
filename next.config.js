// This is a simplified version of the Next.js configuration
// Optimized for Netlify deployment
module.exports = {
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  // This ensures we can use the static export for Netlify
  output: 'export',
  // Disable server components for static export
  experimental: {
    appDir: true,
  },
}
