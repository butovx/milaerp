import { NextConfig } from "next";
import fs from "fs";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 31536000, // 1 год - максимально длительное кеширование
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizeCss: true,
    serverMinification: true,
    optimisticClientCache: true,
  },
  serverExternalPackages: ["sharp"],
  webpack: (config, { dev, isServer }) => {
    if (dev && isServer && process.env.NODE_ENV === "development") {
      const keyPath = path.resolve(__dirname, "certificates/localhost-key.pem");
      const certPath = path.resolve(__dirname, "certificates/localhost.pem");

      if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        config.devServer = {
          ...config.devServer,
          server: {
            type: "https",
            options: {
              key: fs.readFileSync(keyPath),
              cert: fs.readFileSync(certPath),
            },
          },
        };
      } else {
        console.warn(
          "SSL certificates not found. HTTPS will not be enabled in development."
        );
      }
    }

    // Оптимизация для сборки
    if (!dev) {
      // Настройки оптимизации для продакшн
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
