/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Disable minification for server-side code to preserve class names for MikroORM
      config.optimization.minimize = false;
    }
    return config;
  },
};

export default nextConfig;
