import type { NextConfig } from "next";

const videoBaseUrl = process.env.NEXT_PUBLIC_VIDEO_BASE_URL?.trim();

// `frontend/.vercelignore` exclui public/videos/module-01 (~127 MB) do deploy.
// Na Vercel os vídeos vêm do Supabase Storage, então a env é obrigatória para
// não publicar aulas sem mídia; localmente ela é opcional (assets em public).
if (process.env.VERCEL === "1" && !videoBaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_VIDEO_BASE_URL deve estar definida no deploy da Vercel: " +
      ".vercelignore exclui public/videos/module-01 e os vídeos vêm do Storage.",
  );
}

/**
 * O frontend conversa com /api no próprio domínio (rewrite), então o cookie
 * de refresh é first-party e SameSite=Strict funciona. Em produção, defina
 * API_PROXY_TARGET com a URL pública do backend no Render.
 */
const nextConfig: NextConfig = {
  async rewrites() {
    const target = process.env.API_PROXY_TARGET ?? "http://localhost:8081";
    return [
      {
        source: "/api/:path*",
        destination: `${target}/api/:path*`,
      },
    ];
  },
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    const dev = process.env.NODE_ENV === "development";
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      // Poster e vídeo podem vir do Supabase Storage (URL pública) quando
      // NEXT_PUBLIC_VIDEO_BASE_URL está definida; por isso HTTPS é permitido.
      "img-src 'self' data: blob: https:",
      "media-src 'self' https: blob:",
      `connect-src 'self'${dev ? " ws://localhost:3000 http://localhost:3000" : ""}`,
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
