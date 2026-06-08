/** @type {import('next').NextConfig} */

// Practical Content-Security-Policy for a Next.js + Supabase + Vercel app.
// Notes:
// - 'unsafe-inline'/'unsafe-eval' are required by Next.js runtime, Tailwind, and
//   Framer Motion (inline styles). Tightening to nonces is future work.
// - connect-src allows https: so client-side Supabase auth and the atlas geo
//   data (cdn.jsdelivr.net) keep working without hardcoding env-specific hosts.
// - img-src allows https:/data:/blob: for next/image, mascots, and remote logos.
// - OpenRouter/Groq calls are server-side only, so they are unaffected by CSP.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  "frame-src 'self'",
  "worker-src 'self' blob:",
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
]
  .join("; ")
  // Collapse to a single header line.
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    // Disable features the app doesn't use. Microphone stays self-enabled for
    // the Mock Interview voice answer input (Web Speech API).
    key: "Permissions-Policy",
    value: "camera=(), microphone=(self), geolocation=(), payment=(), browsing-topics=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        "pdf-parse",
      ];
    }
    return config;
  },
};

module.exports = nextConfig;
