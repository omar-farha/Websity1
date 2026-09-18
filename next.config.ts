import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server Actions default to a 1MB request body, which a real portfolio
  // photo easily exceeds (the upload form posts the file straight through
  // a server action). Raised to just under Vercel's own ~4.5MB serverless
  // function payload ceiling, which this can't override.
  experimental: {
    serverActions: {
      bodySizeLimit: "4.5mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
