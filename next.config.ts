import type { NextConfig } from "next";

const isProductionBuild = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: isProductionBuild ? "export" : undefined,
  trailingSlash: isProductionBuild,
  images: {
    qualities: [75, 90, 100],
    unoptimized: isProductionBuild,
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
