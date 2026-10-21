import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  output: process.env.VERCEL === "1" ? undefined : "standalone",
};

export default nextConfig;
