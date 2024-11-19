/** @type {import('next').NextConfig} */
const nextConfig = {
  // images: {
  //     domains: ['personaliz.s3.ap-south-1.amazonaws.com','personaliz-uploads.s3.ap-south-1.amazonaws.com','dyolkjkaata8s.cloudfront.net','d34um3r0i45esv.cloudfront.net','d311yj556j5ydo.cloudfront.net'],
  //   },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // This allows any hostname
        pathname: "**", // This allows any path
      },
      {
        protocol: "https",
        hostname: "personaliz.s3.ap-south-1.amazonaws.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "personaliz-uploads.s3.ap-south-1.amazonaws.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "dyolkjkaata8s.cloudfront.net",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "d34um3r0i45esv.cloudfront.net",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "d311yj556j5ydo.cloudfront.net",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "cdn.kcak11.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "me-central-personaliz-uploads.s3.me-central-1.amazonaws.com",
        pathname: "**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
