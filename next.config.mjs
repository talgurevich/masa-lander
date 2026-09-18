/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // The shared activity calendar lives in a separate Vercel project
    // (github.com/talgurevich/masa-gantt) built with basePath "/gantt".
    const gantt = "https://masa-gantt-2rfb.vercel.app";
    return [
      { source: "/gantt", destination: `${gantt}/gantt` },
      { source: "/gantt/:path*", destination: `${gantt}/gantt/:path*` },
    ];
  },
};

export default nextConfig;
