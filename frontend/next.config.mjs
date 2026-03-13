/** @type {import('next').NextConfig} */
const nextConfig = {
    // Exclude chromadb from Next.js bundling (server-side only package)
    // Renamed from serverComponentsExternalPackages in Next.js 15+
    serverExternalPackages: ['chromadb', '@chroma-core/default-embed'],
};

export default nextConfig;
