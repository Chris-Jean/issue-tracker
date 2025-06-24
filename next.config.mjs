/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dashing-warbler-169.convex.cloud",
      },
      {
        protocol: "https",
        hostname: "tidy-peccary-331.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
