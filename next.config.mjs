/** @type {import('next').NextConfig} */
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  reloadOnOnline: true,
  swcMinify: true,
  //scope: "/rozvrh",
  register: true,
  // Optionally include fallbacks or other PWA options here
});

const config = {
  transpilePackages: ["@saas-ui/date-picker"],
  //basePath: "/rozvrh",
  //assetPrefix: "/rozvrh/",
  compress: true,
};

export default withPWA({
  ...config,
});
