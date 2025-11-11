import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
 images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**',
    },
  ],
},

  // ✅ Remove eslint / appDir flags — they were deprecated in Next.js 13+
};

export default nextConfig;
