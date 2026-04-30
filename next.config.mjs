/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow wagmi/viem to work properly in Next.js
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      // React-native polyfill not needed in browser
      '@react-native-async-storage/async-storage': false,
      // pino-pretty is an optional dev dependency of WalletConnect — not needed in browser
      'pino-pretty': false,
    };
    return config;
  },
};

export default nextConfig;
