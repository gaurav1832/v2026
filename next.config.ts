/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  basePath: "/v2026",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
