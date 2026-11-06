import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // L'ancienne adresse Vercel renvoie vers le domaine officiel (sauf les API : webhooks SasPay, etc.).
  async redirects() {
    return [
      {
        source: "/:path((?!api/).*)",
        has: [{ type: "host", value: "yombal-immo-with-claude.vercel.app" }],
        destination: "https://yombal-immo.pro/:path",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
