/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Ensure strict mode is enabled for better debugging
  reactStrictMode: true,
};

export default nextConfig;
