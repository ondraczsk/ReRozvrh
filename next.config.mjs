/** @type {import('next').NextConfig} */
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  reloadOnOnline: true,
  swcMinify: true,
  register: true,
});

const config = {
  transpilePackages: ["@saas-ui/date-picker"],
  compress: true,
};

export default withPWA({
  ...config,
});
