/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["dashing-warbler-169.convex.cloud"], // ✅ Allows images from this domain
  },
};

export default nextConfig;


/** @type {import('next').NextConfig} 
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dashing-warbler-169.convex.cloud",
      },
    ],
  },
};*/