/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // The team tools (login, hub, gantt, …) live in a separate Vercel project
    // (github.com/talgurevich/masa-tools) built with basePath "/tools".
    // "/gantt" is its old home; that project redirects it to /tools/gantt.
    // "/meitar-questions" is the graduates' public questionnaire (no login), whose
    // answers land in the /tools/meitar tool.
    const tools = "https://masa-gantt-2rfb.vercel.app";
    return [
      { source: "/tools", destination: `${tools}/tools` },
      { source: "/tools/:path*", destination: `${tools}/tools/:path*` },
      { source: "/gantt", destination: `${tools}/gantt` },
      { source: "/gantt/:path*", destination: `${tools}/gantt/:path*` },
      { source: "/meitar-questions", destination: `${tools}/tools/meitar-questions` },
    ];
  },
};

export default nextConfig;
