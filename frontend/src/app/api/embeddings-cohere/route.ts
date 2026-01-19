import { NextRequest, NextResponse } from 'next/server';

/**
 * Direct Cohere API embedding endpoint
 * Bypasses Lambda to use Cohere API directly
 */
export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Invalid request: text field required' },
                { status: 400 }
            );
        }

        const COHERE_API_KEY = process.env.COHERE_API_KEY;
        if (!COHERE_API_KEY) {
            console.error('[Embeddings-Cohere] COHERE_API_KEY not configured');
            return NextResponse.json(
                { error: 'Embedding service not configured' },
                { status: 503 }
            );
        }

        console.log('[Embeddings-Cohere] Calling Cohere API directly...');

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
            console.error(`[Embeddings-Cohere] Cohere API error (${response.status}):`, errorText);
            return NextResponse.json(
                { error: 'Embedding generation failed' },
                { status: response.status }
            );
        }

        const data = await response.json();

        if (!data.embeddings || !Array.isArray(data.embeddings) || data.embeddings.length === 0) {
            console.error('[Embeddings-Cohere] Invalid response from Cohere');
            return NextResponse.json(
                { error: 'Invalid embedding response' },
                { status: 500 }
            );
        }

        const embedding = data.embeddings[0];
        console.log(`[Embeddings-Cohere] Generated ${embedding.length}-dimensional embedding`);

        return NextResponse.json({
            embedding: embedding,
            model: 'embed-multilingual-v3.0',
            dimensions: embedding.length,
        });

    } catch (error) {
        console.error('[Embeddings-Cohere] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
