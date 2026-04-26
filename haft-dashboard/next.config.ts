import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Workaround: rename _next to next after build to avoid LiteSpeed blocking underscore directories
  // See package.json postbuild script
};

export default nextConfig;
