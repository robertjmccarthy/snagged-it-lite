/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'snagged-it.co.uk'],
  },
  // Disable static generation to avoid useSearchParams errors
  output: 'standalone',
  // Enable ISR with a short revalidation period
  experimental: {
    // This setting helps with deployment issues related to client components
    serverComponentsExternalPackages: ['@supabase/auth-helpers-nextjs']
  }
};

module.exports = nextConfig;
