/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { bodySizeLimit: '2mb' }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'olnlkvoldpdlkowlejos.supabase.co',
        pathname: '/storage/v1/object/public/**'
      }
    ]
  }
};

module.exports = nextConfig;
