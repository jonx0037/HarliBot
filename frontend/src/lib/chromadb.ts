// ChromaDB HTTP client for vector similarity search
// Using direct HTTP calls instead of the chromadb npm package for Next.js compatibility

const CHROMADB_URL = process.env.CHROMADB_URL || 'http://localhost:8001';
const CHROMADB_COLLECTION = process.env.CHROMADB_COLLECTION || 'harlingen_city_content';
const CHROMADB_TENANT = process.env.CHROMADB_TENANT || 'default_tenant';
const CHROMADB_DATABASE = process.env.CHROMADB_DATABASE || 'default_database';

// Cache the collection ID
let collectionIdCache: string | null = null;

/**
 * Get collection ID from collection name
 */
async function getCollectionId(): Promise<string> {
    if (collectionIdCache) {
        return collectionIdCache;
    }

    try {
        const url = `${CHROMADB_URL}/api/v2/tenants/${CHROMADB_TENANT}/databases/${CHROMADB_DATABASE}/collections`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to list collections: ${response.statusText}`);
        }

        const collections = await response.json();
        const collection = collections.find((c: any) => c.name === CHROMADB_COLLECTION);

        if (!collection) {
            throw new Error(`Collection ${CHROMADB_COLLECTION} not found`);
        }

        collectionIdCache = collection.id;
        return collection.id;
    } catch (error) {
        console.error('Failed to get collection ID:', error);
        throw new Error('Failed to get collection ID');
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
 * Uses ChromaDB v2 HTTP API directly for Next.js compatibility
 */
export async function searchSimilarChunks(
    embedding: number[],
    language: 'en' | 'es',
    topK: number = 5
): Promise<SearchResult[]> {
    try {
        // Get collection ID (cached after first call)
        const collectionId = await getCollectionId();

        // ChromaDB v2 API uses /query endpoint (not /search)
        const url = `${CHROMADB_URL}/api/v2/tenants/${CHROMADB_TENANT}/databases/${CHROMADB_DATABASE}/collections/${collectionId}/query`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query_embeddings: [embedding], // v2 API expects array of embeddings
                n_results: topK,
                where: { language }, // Filter by language
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ChromaDB query failed:', response.status, errorText);
            throw new Error(`ChromaDB query failed: ${response.statusText}`);
        }

        const data = await response.json();

        // Transform ChromaDB v2 API results to SearchResult format
        const searchResults: SearchResult[] = [];

        // v2 API returns arrays: ids[0], documents[0], metadatas[0], distances[0]
        if (data.ids && data.ids[0] && data.ids[0].length > 0) {
            for (let i = 0; i < data.ids[0].length; i++) {
                const id = data.ids[0][i];
                const document = data.documents?.[0]?.[i];
                const metadata = data.metadatas?.[0]?.[i];
                const distance = data.distances?.[0]?.[i];

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
                        score: distance !== undefined ? 1 - distance : 0, // Convert distance to similarity score
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
 * Get collection stats via v2 HTTP API
 */
export async function getCollectionStats() {
    try {
        const collectionId = await getCollectionId();
        const url = `${CHROMADB_URL}/api/v2/tenants/${CHROMADB_TENANT}/databases/${CHROMADB_DATABASE}/collections/${collectionId}/count`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to get collection stats: ${response.statusText}`);
        }

        const data = await response.json();

        return {
            name: CHROMADB_COLLECTION,
            count: data.count || 0,
        };
    } catch (error) {
        console.error('Failed to get collection stats:', error);
        return null;
    }
}
