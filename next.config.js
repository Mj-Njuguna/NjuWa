/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removing output: 'export' to allow middleware to work
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
