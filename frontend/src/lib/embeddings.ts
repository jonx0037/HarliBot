/**
 * Embedding generation using internal API route or direct Lambda call
 * 
 * This module intelligently routes embedding requests:
 * - Client-side: calls /api/embeddings proxy
 * - Server-side: calls Lambda directly (avoids relative URL issues on Vercel)
 */

export interface EmbeddingResponse {
    embedding: number[];
    model: string;
    dimensions: number;
}

/**
 * Check if we're running on the server
 */
function isServer(): boolean {
    return typeof window === 'undefined';
}

/**
 * Generate embedding by calling Lambda directly (server-side only)
 */
async function generateEmbeddingDirect(text: string): Promise<number[]> {
    const LAMBDA_ENDPOINT = process.env.EMBEDDING_SERVICE_URL;

    if (!LAMBDA_ENDPOINT) {
        throw new Error('EMBEDDING_SERVICE_URL not configured');
    }

    console.log('[Embeddings] Calling Lambda directly...');

    const response = await fetch(`${LAMBDA_ENDPOINT}/embed`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ texts: [text] }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Embeddings] Lambda error (${response.status}):`, errorText);
        throw new Error(`Embedding service error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.embeddings || !Array.isArray(data.embeddings) || data.embeddings.length === 0) {
        throw new Error('Invalid embedding response from Lambda');
    }

    console.log(`[Embeddings] Generated ${data.dimension}-dimensional embedding`);
    return data.embeddings[0];
}

/**
 * Generate embedding for a text query
 * Uses Cohere API directly via internal API route
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
        // Use Cohere API endpoint (works on both client and server)
        const url = '/api/embeddings-cohere';
        console.log('[Embeddings] Calling Cohere API via internal route:', url);

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
            console.error('[Embeddings] Request timeout after 10 seconds');
            throw new Error('Embedding service timeout - please try again');
        }

        console.error('[Embeddings] Error generating embedding:', error);
        throw error;
    }
}
