/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["api.dicebear.com"],
      },
      eslint: {
        ignoreDuringBuilds: true,
      },
      experimental: {
        missingSuspenseWithCSRBailout: false,
      },
};

export default nextConfig;
