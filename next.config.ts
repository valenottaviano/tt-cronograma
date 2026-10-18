import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  turbopack: {},
  experimental: {
    // Volver a una pestaña ya visitada es instantáneo durante 30 s, sin pedirle
    // todo de nuevo al panel. AutoRefresh y router.refresh() siguen trayendo lo nuevo.
    staleTimes: { dynamic: 30 },
  },
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
