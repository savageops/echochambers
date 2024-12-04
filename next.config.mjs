/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use webpack config to disable HMR in production
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.hot = false;
    }
    return config;
  },
  
  // API rewrites
  async rewrites() {
    const roomsPort = process.env.ROOMS_PORT || 3333;
    const pluginsPort = process.env.PLUGINS_PORT || 4444;

    return process.env.NODE_ENV === 'development' 
      ? [
          {
            source: '/api/rooms/:path*',
            destination: `http://127.0.0.1:${roomsPort}/api/rooms/:path*`
          },
          {
            source: '/api/plugins/:path*',
            destination: `http://127.0.0.1:${pluginsPort}/api/plugins/:path*`
          }
        ]
      : [];
  }
}

export default nextConfig;
