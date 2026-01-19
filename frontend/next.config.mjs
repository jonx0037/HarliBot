/** @type {import('next').NextConfig} */
const nextConfig = {
    // Exclude chromadb from Next.js bundling (server-side only package)
    serverComponentsExternalPackages: ['chromadb'],

    webpack: (config, { isServer }) => {
        // Exclude ChromaDB from client-side bundle (server-side only)
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                crypto: false,
            };
        }

        // Mark chromadb as external to prevent bundling Node.js-only dependencies
        config.externals = config.externals || [];
        config.externals.push({
            'chromadb': 'commonjs chromadb',
            '@chroma-core/default-embed': 'commonjs @chroma-core/default-embed',
        });

        return config;
    },
};

export default nextConfig;
