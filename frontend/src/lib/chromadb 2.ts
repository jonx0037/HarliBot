// ChromaDB HTTP client for vector similarity search
// Using direct HTTP calls instead of the chromadb npm package for Next.js compatibility

const CHROMADB_URL = process.env.CHROMADB_URL || 'http://localhost:8001';
const CHROMADB_COLLECTION = process.env.CHROMADB_COLLECTION || 'harlingen_city_content';

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
 * Uses ChromaDB HTTP API directly for Next.js compatibility
 */
export async function searchSimilarChunks(
    embedding: number[],
    language: 'en' | 'es',
    topK: number = 5
): Promise<SearchResult[]> {
    try {
        const url = `${CHROMADB_URL}/api/v1/collections/${CHROMADB_COLLECTION}/query`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query_embeddings: [embedding],
                n_results: topK,
                where: { language }, // Filter by language
            }),
        });

        if (!response.ok) {
            throw new Error(`ChromaDB query failed: ${response.statusText}`);
        }

        const data = await response.json();

        // Transform ChromaDB HTTP API results to SearchResult format
        const searchResults: SearchResult[] = [];

        if (data.ids && data.ids[0]) {
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
 * Get collection stats via HTTP API
 */
export async function getCollectionStats() {
    try {
        const url = `${CHROMADB_URL}/api/v1/collections/${CHROMADB_COLLECTION}`;

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
