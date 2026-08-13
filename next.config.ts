import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // In development Next only serves /_next/* to the host it was started with
  // (localhost), so opening the dev server from a LAN address returns the HTML
  // but 403s every script and stylesheet — a blank page. These are the origins
  // allowed to load those dev assets; it has no effect on a production build.
  allowedDevOrigins: ["192.168.12.13", "*.local"],
};

export default nextConfig;
