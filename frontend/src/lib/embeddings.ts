/**
 * Embedding generation using AWS Lambda service
 * 
 * This module calls the Lambda function that generates embeddings
 * using the text-embedding-004 model.
 */

const LAMBDA_ENDPOINT = process.env.EMBEDDING_SERVICE_URL;

if (!LAMBDA_ENDPOINT) {
    console.error('EMBEDDING_SERVICE_URL is not configured');
}

export interface EmbeddingResponse {
    embedding: number[];
    model: string;
    dimensions: number;
}

/**
 * Generate embedding for a text query using Lambda service
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    if (!LAMBDA_ENDPOINT) {
        throw new Error('Lambda endpoint not configured. Please set EMBEDDING_SERVICE_URL environment variable.');
    }

    try {
        console.log('[Embeddings] Calling Lambda service...');

        const response = await fetch(LAMBDA_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Lambda service error (${response.status}): ${errorText}`);
        }

        const data: EmbeddingResponse = await response.json();

        if (!data.embedding || !Array.isArray(data.embedding)) {
            throw new Error('Invalid embedding response from Lambda service');
        }

        console.log(`[Embeddings] Generated ${data.dimensions}-dimensional embedding`);
        return data.embedding;

    } catch (error) {
        console.error('[Embeddings] Error generating embedding:', error);
        throw error;
    }
}
