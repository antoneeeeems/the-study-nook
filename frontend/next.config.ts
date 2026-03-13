import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/compare",
        destination: "/insights",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
