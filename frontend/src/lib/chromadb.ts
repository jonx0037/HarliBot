// ChromaDB Cloud client for vector similarity search
// Using official chromadb npm package for proper Cloud authentication

import { ChromaClient } from 'chromadb';

const CHROMADB_API_KEY = process.env.CHROMADB_API_KEY;
const CHROMADB_COLLECTION = process.env.CHROMADB_COLLECTION || 'harlingen_city_content';

// Cache the client and collection
let clientCache: ChromaClient | null = null;
let collectionCache: any | null = null;

/**
 * Get or create ChromaDB Cloud client
 */
async function getClient(): Promise<ChromaClient> {
    if (clientCache) {
        return clientCache;
    }

    if (!CHROMADB_API_KEY) {
        throw new Error('CHROMADB_API_KEY environment variable is required');
    }

    try {
        // Use CloudClient for ChromaDB Cloud authentication
        const { CloudClient } = await import('chromadb');
        clientCache = new CloudClient({
            apiKey: CHROMADB_API_KEY,
        });

        return clientCache;
    } catch (error) {
        console.error('Failed to create ChromaDB client:', error);
        throw new Error('Failed to initialize ChromaDB client');
    }
}

/**
 * Get collection (cached)
 */
async function getCollection() {
    if (collectionCache) {
        return collectionCache;
    }

    try {
        const client = await getClient();
        collectionCache = await client.getCollection({
            name: CHROMADB_COLLECTION,
        });

        return collectionCache;
    } catch (error) {
        console.error('Failed to get collection:', error);
        throw new Error(`Failed to get collection ${CHROMADB_COLLECTION}`);
    }
}

export interface SearchResult {
    id: string;
    content: string;
    metadata: {
        sourceUrl: string;
        sourceTitle?: string;
        category?: string;
        language: string;
        hasContactInfo?: boolean;
    };
    score: number;
}

/**
 * Search for similar content chunks using embedding
 * Uses official ChromaDB CloudClient for proper authentication
 */
export async function searchSimilarChunks(
    embedding: number[],
    language: 'en' | 'es',
    topK: number = 5
): Promise<SearchResult[]> {
    try {
        const collection = await getCollection();

        // Query the collection
        const results = await collection.query({
            queryEmbeddings: [embedding],
            nResults: topK,
            where: { language },
        });

        // Transform results to SearchResult format
        const searchResults: SearchResult[] = [];

        if (results.ids && results.ids[0] && results.ids[0].length > 0) {
            for (let i = 0; i < results.ids[0].length; i++) {
                const id = results.ids[0][i];
                const document = results.documents?.[0]?.[i];
                const metadata = results.metadatas?.[0]?.[i];
                const distance = results.distances?.[0]?.[i];

                if (document && metadata) {
                    searchResults.push({
                        id,
                        content: document as string,
                        metadata: {
                            sourceUrl: metadata.sourceUrl as string,
                            sourceTitle: metadata.sourceTitle as string | undefined,
                            category: metadata.category as string | undefined,
                            language: metadata.language as string,
                            hasContactInfo: metadata.hasContactInfo as boolean | undefined,
                        },
                        score: distance !== undefined ? 1 - distance : 0,
                    });
                }
            }
        }

        return searchResults;
    } catch (error) {
        console.error('ChromaDB search failed:', error);
        throw new Error('Vector search failed');
    }
}

/**
 * Get collection stats
 */
export async function getCollectionStats() {
    try {
        const collection = await getCollection();
        const count = await collection.count();

        return {
            name: CHROMADB_COLLECTION,
            count,
        };
    } catch (error) {
        console.error('Failed to get collection stats:', error);
        return null;
    }
}
