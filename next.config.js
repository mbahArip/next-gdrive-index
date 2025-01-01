/* eslint-disable */

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias.canvas = false;

    return config;
  },
};

module.exports = nextConfig;
