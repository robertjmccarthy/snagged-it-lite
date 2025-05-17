/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'snagged-it.co.uk'],
  },
  // Completely disable static generation
  output: 'standalone',
  experimental: {
    // This setting helps with deployment issues related to client components
    serverComponentsExternalPackages: ['@supabase/auth-helpers-nextjs']
  },
  // Force dynamic rendering for all pages
  staticPageGenerationTimeout: 1
};

module.exports = nextConfig;
