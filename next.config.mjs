/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  eslint: {
    // Lint chạy riêng qua `npm run lint`; không chặn build production.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
