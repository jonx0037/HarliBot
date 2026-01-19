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
 * Get the base URL for API calls
 * Works in both browser and server contexts
 */
function getBaseUrl(): string {
    // Browser context
    if (typeof window !== 'undefined') {
        return '';
    }

    // Server context - use environment variable or default
    return process.env.NEXT_PUBLIC_BASE_URL || 'https://harli-bot.vercel.app';
}

/**
 * Generate embedding for a text query using internal API
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const baseUrl = getBaseUrl();
        const url = `${baseUrl}/api/embeddings`;

        console.log('[Embeddings] Calling internal API:', url);

        const response = await fetch(url, {
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
