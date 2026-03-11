/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    // ONLY apply rewrites in development. 
    // In production, Vercel handles routing via vercel.json
    if (process.env.NODE_ENV === 'production') return [];
    
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
