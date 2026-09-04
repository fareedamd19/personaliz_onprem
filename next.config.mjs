/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a folder of plain files instead of a server.
  //
  // This is what makes the hand-over possible: `next build` produces ./out,
  // which is HTML, JS, CSS and assets and nothing else. The host serves it
  // from any ordinary web server - nginx, IIS, Apache - with no Node process,
  // no install and no runtime dependency on Personaliz.
  output: "export",

  // Next's image optimiser runs on a server, which by definition is not
  // present here. Unoptimised means <Image> emits a plain <img> and the files
  // are served as they ship.
  images: {
    unoptimized: true,
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
