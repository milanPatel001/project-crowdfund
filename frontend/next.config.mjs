/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["api.dicebear.com"],
        remotePatterns: [
          {
            protocol: 'https',
            hostname: '**.amazonaws.com',
          },
        ],
      },
      eslint: {
        ignoreDuringBuilds: true,
      },
      experimental: {
        missingSuspenseWithCSRBailout: false,
      },
};

export default nextConfig;
