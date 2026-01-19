/**
 * Server-side API route for generating embeddings
 * 
 * This route acts as a proxy to the AWS Lambda embedding service,
 * keeping the Lambda URL secure and not exposed to the client.
 */

import { NextRequest, NextResponse } from 'next/server';

const LAMBDA_ENDPOINT = process.env.EMBEDDING_SERVICE_URL;

export interface EmbeddingResponse {
    embedding: number[];
    model: string;
    dimensions: number;
}

export async function POST(request: NextRequest) {
    // Validate Lambda endpoint is configured
    if (!LAMBDA_ENDPOINT) {
        console.error('[API/Embeddings] EMBEDDING_SERVICE_URL not configured');
        return NextResponse.json(
            { error: 'Embedding service not configured' },
            { status: 500 }
        );
    }

    try {
        // Parse request body
        const { text } = await request.json();

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Invalid request: text field is required' },
                { status: 400 }
            );
        }

        console.log('[API/Embeddings] Calling Lambda service...');

        // Call Lambda embedding service (expects 'texts' array)
        const response = await fetch(`${LAMBDA_ENDPOINT}/embed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ texts: [text] }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[API/Embeddings] Lambda error (${response.status}):`, errorText);
            return NextResponse.json(
                { error: `Embedding service error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Lambda returns { embeddings: [[...]], model, dimension, count }
        if (!data.embeddings || !Array.isArray(data.embeddings) || data.embeddings.length === 0) {
            console.error('[API/Embeddings] Invalid response from Lambda');
            return NextResponse.json(
                { error: 'Invalid embedding response' },
                { status: 500 }
            );
        }

        // Return the first embedding (we only sent one text)
        const embedding = data.embeddings[0];
        console.log(`[API/Embeddings] Generated ${data.dimension}-dimensional embedding`);

        return NextResponse.json({
            embedding,
            model: data.model,
            dimensions: data.dimension
        });

    } catch (error) {
        console.error('[API/Embeddings] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
