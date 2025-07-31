/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@uploadthing/react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "robust-rhinoceros-753.convex.cloud",
      },
      {
        protocol: "https",
        hostname: "enduring-minnow-757.convex.cloud", // Your current Convex URL
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  // Increase body size limit for file uploads
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
