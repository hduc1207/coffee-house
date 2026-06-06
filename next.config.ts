import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    allowedDevOrigins: ['192.168.85.1'],
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "images.unsplash.com" },
            { protocol: "https", hostname: "lh3.googleusercontent.com" },
            { protocol: "http", hostname: "localhost" }
        ],
    },
};

export default nextConfig;
