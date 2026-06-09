/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@monorepo/tsconfig', '@monorepo/eslint-config'],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;