/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['images.clerk.dev'],
  },
  webpack: (config, { isServer }) => {
    // Handle fabric.js for canvas functionality
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
      // Handle dynamic imports for fabric.js
      config.externals = config.externals || [];
      config.externals.push({
        canvas: 'canvas',
      });
    }
    
    // Ignore fabric.js server-side
    config.resolve.alias = {
      ...config.resolve.alias,
      'fabric': isServer ? false : 'fabric',
    };
    
    return config;
  },
}

module.exports = nextConfig
