/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dashing-warbler-169.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
