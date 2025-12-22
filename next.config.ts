import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/prometheus/:path*',
        destination: 'http://10005480di8ni.vicp.fun/api/v1/:path*', // 代理到组长的穿透地址
      },
    ];
  },
};

export default nextConfig;