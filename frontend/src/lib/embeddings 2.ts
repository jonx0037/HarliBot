// Embedding service client
// Calls the Python FastAPI service to generate embeddings

const EMBEDDING_SERVICE_URL = process.env.EMBEDDING_SERVICE_URL || 'http://localhost:8000';

export interface EmbeddingResponse {
    embedding: number[];
    model: string;
    dimension: number;
}

export interface BatchEmbeddingResponse {
    embeddings: number[][];
    model: string;
    dimension: number;
    count: number;
}

/**
 * Generate a single embedding for text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        // Use the batch endpoint with a single text
        const response = await fetch(`${EMBEDDING_SERVICE_URL}/embed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ texts: [text], normalize: true }),
        });

        if (!response.ok) {
            throw new Error(`Embedding service error: ${response.statusText}`);
        }

        const data: BatchEmbeddingResponse = await response.json();
        return data.embeddings[0];
    } catch (error) {
        console.error('Failed to generate embedding:', error);
        throw new Error('Embedding service unavailable');
    }
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    try {
        const response = await fetch(`${EMBEDDING_SERVICE_URL}/embed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ texts, normalize: true }),
        });

        if (!response.ok) {
            throw new Error(`Embedding service error: ${response.statusText}`);
        }

        const data: BatchEmbeddingResponse = await response.json();
        return data.embeddings;
    } catch (error) {
        console.error('Failed to generate batch embeddings:', error);
        throw new Error('Embedding service unavailable');
    }
}

/**
 * Check if embedding service is healthy
 */
export async function checkEmbeddingServiceHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${EMBEDDING_SERVICE_URL}/health`);
        const data = await response.json();
        return data.status === 'healthy' && data.model_loaded === true;
    } catch (error) {
        console.error('Embedding service health check failed:', error);
        return false;
    }
}
