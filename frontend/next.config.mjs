/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["api.dicebear.com"],
      },
      eslint: {
        ignoreDuringBuilds: true,
      },
};

export default nextConfig;
