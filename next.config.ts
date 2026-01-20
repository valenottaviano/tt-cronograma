import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/respuestas",
        destination: "https://docs.google.com/forms/d/1m_VGKwlS6M2ZwplZ0slV8r86Hy5k_KntTQAgYuxUAC4/edit#responses",
        permanent: true,
      },
    ];
  },
};

export default withSerwist(nextConfig);
