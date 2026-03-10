import type { NextConfig } from "next";

const isProductionBuild = process.env.NODE_ENV === "production";
const isStaticExportBuild = isProductionBuild && process.env.NEXT_EXPORT === "true";

const nextConfig: NextConfig = {
  output: isStaticExportBuild ? "export" : undefined,
  trailingSlash: isStaticExportBuild,
  images: {
    qualities: [75, 90, 100],
    unoptimized: isStaticExportBuild,
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
