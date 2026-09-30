/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // The team tools (login, hub, gantt, …) live in a separate Vercel project
    // (github.com/talgurevich/masa-gantt) built with basePath "/tools".
    // "/gantt" is its old home; that project redirects it to /tools/gantt.
    const tools = "https://masa-gantt-2rfb.vercel.app";
    return [
      { source: "/tools", destination: `${tools}/tools` },
      { source: "/tools/:path*", destination: `${tools}/tools/:path*` },
      { source: "/gantt", destination: `${tools}/gantt` },
      { source: "/gantt/:path*", destination: `${tools}/gantt/:path*` },
    ];
  },
};

export default nextConfig;
