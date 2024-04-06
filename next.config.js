const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias.canvas = false;

    return config;
  },
  // async headers() {
  //   return [
  //     {
  //       source: "/:path*",
  //       headers: [
  //         {
  //           key: "Cache-Control",
  //           value: "max-age=300, s-maxage=300, stale-while-revalidate, public",
  //         },
  //       ],
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
