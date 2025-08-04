/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

// Only add PWA and bundle analyzer in production or when explicitly enabled
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_PWA === 'true') {
  const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
          }
        }
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-static',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
          }
        }
      },
      {
        urlPattern: /\.(?:js|css|woff2?|png|jpg|jpeg|gif|svg|ico)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-resources',
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
          }
        }
      },
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-api',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 5 * 60 // 5 minutes
          },
          networkTimeoutSeconds: 10
        }
      },
      {
        urlPattern: /^\/api\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 5 * 60 // 5 minutes
          },
          networkTimeoutSeconds: 10
        }
      }
    ]
  });

  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  });

  // Add production optimizations
  nextConfig.webpack = (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: 'supabase',
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }
    return config;
  };

  module.exports = withBundleAnalyzer(withPWA(nextConfig));
} else {
  // Simple config for development
  module.exports = nextConfig;
}