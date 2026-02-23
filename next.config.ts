import type { NextConfig } from "next";

const isStaticExport = process.env.NEXT_STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
  trailingSlash: isStaticExport,
  images: {
    qualities: [75, 90, 100],
    unoptimized: isStaticExport,
  },
};

if (!isStaticExport) {
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
