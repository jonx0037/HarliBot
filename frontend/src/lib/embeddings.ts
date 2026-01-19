/**
 * Embedding generation using internal API route
 * 
 * This module calls the server-side /api/embeddings route,
 * which securely proxies requests to the AWS Lambda service.
 */

export interface EmbeddingResponse {
    embedding: number[];
    model: string;
    dimensions: number;
}

/**
 * Generate embedding for a text query using internal API
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        console.log('[Embeddings] Calling internal API...');

        const response = await fetch('/api/embeddings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(`Embedding API error (${response.status}): ${errorData.error || 'Unknown error'}`);
        }

        const data: EmbeddingResponse = await response.json();

        if (!data.embedding || !Array.isArray(data.embedding)) {
            throw new Error('Invalid embedding response from API');
        }

        console.log(`[Embeddings] Generated ${data.dimensions}-dimensional embedding`);
        return data.embedding;

    } catch (error) {
        console.error('[Embeddings] Error generating embedding:', error);
        throw error;
    }
}
