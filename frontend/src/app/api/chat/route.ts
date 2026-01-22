import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { executeRAG, validateQuery } from '@/lib/rag';

// Request validation schema
const ChatRequestSchema = z.object({
    message: z.string().min(1).max(500),
    language: z.enum(['en', 'es']),
    conversationHistory: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
    })).optional().default([]),
});

export async function POST(request: NextRequest) {
    // Generate request ID for tracing
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const startTime = performance.now();

    try {
        // Parse and validate request
        const body = await request.json();
        const { message, language, conversationHistory } = ChatRequestSchema.parse(body);

        // Additional validation
        const validation = validateQuery(message);
        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        // Try to execute RAG pipeline
        try {
            console.log(`[Chat API] [${requestId}] Starting RAG pipeline | lang=${language} | msgLen=${message.length}`);
            const result = await executeRAG(message, language, conversationHistory);

            const duration = Math.round(performance.now() - startTime);
            console.log(`[Chat API] [${requestId}] ✅ RAG completed in ${duration}ms | sources=${result.sources.length}`);

            return NextResponse.json({
                response: result.response,
                sources: result.sources,
                timestamp: new Date().toISOString(),
            });
        } catch (ragError) {
            // Enhanced error logging to identify specific failure points
            const errorMessage = ragError instanceof Error ? ragError.message : String(ragError);

            // Classify error type for better debugging
            let errorType = 'UNKNOWN';
            if (errorMessage.includes('Embedding') || errorMessage.includes('embedding')) {
                errorType = 'EMBEDDING_SERVICE';
                console.error(`[Chat API] [${requestId}] ❌ Embedding service failure:`, errorMessage);
            } else if (errorMessage.includes('ChromaDB') || errorMessage.includes('Vector') || errorMessage.includes('collection')) {
                errorType = 'VECTOR_DATABASE';
                console.error(`[Chat API] [${requestId}] ❌ ChromaDB/Vector search failure:`, errorMessage);
            } else if (errorMessage.includes('Gemini') || errorMessage.includes('LLM') || errorMessage.includes('generateResponse')) {
                errorType = 'LLM_SERVICE';
                console.error(`[Chat API] [${requestId}] ❌ Gemini LLM failure:`, errorMessage);
            } else {
                console.error(`[Chat API] [${requestId}] ❌ RAG pipeline failure (unknown type):`, errorMessage);
            }

            // Log full error in development
            if (process.env.NODE_ENV === 'development') {
                console.error('[Chat API] Full error details:', ragError);
            }

            // Fall back to demo mode with error type logged
            console.warn(`[Chat API] ⚠️ Falling back to demo mode due to ${errorType} error`);

            const demoResponse = language === 'en'
                ? `Thank you for your question! This is a demo version of HarliBot. The City of Harlingen offers many services including:\n\n• Utilities (water, electric, trash)\n• Building permits and licenses\n• Parks and recreation programs\n• Public safety services\n• Infrastructure maintenance\n\nFor real-time assistance, please call City Hall at (956) 427-8080 or visit harlingentx.gov.\n\n*Note: Full RAG functionality requires backend services to be running.*`
                : `¡Gracias por tu pregunta! Esta es una versión demo de HarliBot. La Ciudad de Harlingen ofrece muchos servicios incluyendo:\n\n• Servicios públicos (agua, electricidad, basura)\n• Permisos de construcción y licencias\n• Programas de parques y recreación\n• Servicios de seguridad pública\n• Mantenimiento de infraestructura\n\nPara asistencia en tiempo real, llame al Ayuntamiento al (956) 427-8080 o visite harlingentx.gov.\n\n*Nota: La funcionalidad RAG completa requiere que los servicios backend estén ejecutándose.*`;

            return NextResponse.json({
                response: demoResponse,
                sources: [],
                timestamp: new Date().toISOString(),
                // Include error type in development mode
                ...(process.env.NODE_ENV === 'development' && {
                    debug: { errorType, errorMessage }
                }),
            });
        }

    } catch (error) {
        console.error('Chat API error:', error);

        // Handle Zod validation errors
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Invalid request format',
                    details: error.errors
                },
                { status: 400 }
            );
        }

        // Handle RAG pipeline errors (already localized)
        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        // Generic error fallback
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
