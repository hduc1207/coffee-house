import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    allowedDevOrigins: ['192.168.85.1'],
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "images.unsplash.com" },
            { protocol: "https", hostname: "lh3.googleusercontent.com" },
            { protocol: "http", hostname: "localhost" },
            { protocol: "https", hostname: "*.supabase.co" },
            { protocol: "https", hostname: "freeimage.host" }
        ],
    },
};

export default nextConfig;
