// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/api/chunk-transcript',
          destination: '/api/chunk-transcript',
        },
      ];
    },
  };
  
  export default nextConfig;