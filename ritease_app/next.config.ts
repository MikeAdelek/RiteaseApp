import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["react-pdf", "pdfjs-dist"],
  webpack: (config, { isServer }) => {
    // Prevent server-side canvas loading
    if (isServer) {
      config.resolve.alias.canvas = false;
    }

    // Configure module rules
    config.module.rules.push(
      // Handle PDF files
      {
        test: /\.(pdf)$/,
        type: "asset/resource"
      },
      // Handle PDF.js worker
      {
        test: /pdf\.worker\.(min\.)?js/,
        type: "asset/resource",
        generator: {
          filename: "static/worker/[hash][ext][query]"
        }
      },
      // Handle CSS
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    );

    return config;
  },
  reactStrictMode: true
};

export default nextConfig;
