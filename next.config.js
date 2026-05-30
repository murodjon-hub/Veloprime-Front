/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  transpilePackages: [
    '@toast-ui/react-editor',
    '@toast-ui/editor',
  ],

  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3009';
    return [
      {
        source: '/uploads/:path*',
        destination: `${apiUrl}/uploads/:path*`,
      },
    ];
  },

  env: {
    NEXT_PUBLIC_API_URL:         process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_API_GRAPHQL_URL: process.env.NEXT_PUBLIC_API_GRAPHQL_URL,
    NEXT_PUBLIC_API_WS:          process.env.NEXT_PUBLIC_API_WS,
  },
};

const { i18n } = require('./next-i18next.config');
nextConfig.i18n = i18n;

module.exports = nextConfig;
