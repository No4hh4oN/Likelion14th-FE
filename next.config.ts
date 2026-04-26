import type { NextConfig } from "next";

const isProductionBuild = process.env.NODE_ENV === "production";
const COMMON_SPACE_IMAGE_CDN_HOSTNAME = "cdn.syu-likelion.org";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    qualities: [75, 90, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: COMMON_SPACE_IMAGE_CDN_HOSTNAME,
      },
    ],
  },
};

if (!isProductionBuild) {
  nextConfig.rewrites = async () => {
    const backendBaseUrl = process.env.BACKEND_API_BASE_URL;

    if (!backendBaseUrl) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${backendBaseUrl}/api/:path*`,
      },
    ];
  };
}

export default nextConfig;
