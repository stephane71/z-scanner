import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Enable Turbopack config to silence the warning
  // Serwist uses webpack only in production builds
  turbopack: {},
};

export default withSerwist(nextConfig);
