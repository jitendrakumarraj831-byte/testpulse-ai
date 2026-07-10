import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  async redirects() {
    return [
      // /product carried the enterprise marketing pitch before it was
      // folded into the public "/" homepage (see ROADMAP.md 2.5) — this
      // keeps old links/bookmarks/search results working instead of 404ing.
      {
        source: "/product",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
