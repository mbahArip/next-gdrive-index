/* eslint-disable */
const path = require("path");

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["tsx", "ts"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "~": path.resolve(__dirname, "./"),
    };
    return config;
  },
};

module.exports = nextConfig;
