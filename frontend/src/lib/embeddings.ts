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
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
        // Always use relative URL for internal API calls
        // This works in both browser and server contexts
        const url = '/api/embeddings';

        console.log('[Embeddings] Calling internal API:', url);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

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
        clearTimeout(timeoutId);

        // Handle timeout specifically
        if (error instanceof Error && error.name === 'AbortError') {
            console.error('[Embeddings] Request timeout after 5 seconds');
            throw new Error('Embedding service timeout - please try again');
        }

        console.error('[Embeddings] Error generating embedding:', error);
        throw error;
    }
}
