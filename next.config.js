/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_BASE_URL: 'https://api.tagwell.co/api',
    NEXT_PUBLIC_AI_AGENT_URL: 'https://dev-ai-agent-api.golinka.com',
  },
};

export default nextConfig;