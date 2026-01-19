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
/**
 * Generate embedding by calling Cohere directly (server-side only)
 */
async function generateEmbeddingDirect(text: string): Promise<number[]> {
    const COHERE_API_KEY = process.env.COHERE_API_KEY;

    if (!COHERE_API_KEY) {
        throw new Error('COHERE_API_KEY not configured on server');
    }

    console.log('[Embeddings] Calling Cohere API directly from server...');

    const response = await fetch('https://api.cohere.ai/v1/embed', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${COHERE_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            texts: [text],
            model: 'embed-multilingual-v3.0',
            input_type: 'search_query',
            truncate: 'END'
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Embeddings] Cohere API error (${response.status}):`, errorText);
        throw new Error(`Embedding service error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.embeddings || !Array.isArray(data.embeddings) || data.embeddings.length === 0) {
        throw new Error('Invalid embedding response from Cohere');
    }

    const embedding = data.embeddings[0];
    console.log(`[Embeddings] Generated ${embedding.length}-dimensional embedding`);
    return embedding;
}

/**
 * Generate embedding for a text query
 * Uses Cohere API directly if on server, or internal API route if on client
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    // If running on server, call directly to avoid relative URL issues
    if (isServer()) {
        return generateEmbeddingDirect(text);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
        // Use internal API proxy (works only on client/browser)
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
