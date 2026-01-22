import { NextRequest } from 'next/server';
import { z } from 'zod';
import { executeRAGStreaming, validateQuery } from '@/lib/rag';

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
            return new Response(
                JSON.stringify({ error: validation.error }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        console.log(`[Chat API] [${requestId}] Starting streaming RAG pipeline | lang=${language} | msgLen=${message.length}`);

        // Create streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // Execute streaming RAG pipeline
                    const ragStream = executeRAGStreaming(message, language, conversationHistory);

                    for await (const chunk of ragStream) {
                        if (chunk.type === 'text') {
                            // Send text chunk
                            const data = JSON.stringify({ text: chunk.content });
                            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                        } else if (chunk.type === 'sources') {
                            // Send sources with completion signal
                            const data = JSON.stringify({
                                done: true,
                                sources: chunk.sources
                            });
                            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                        }
                    }

                    const duration = Math.round(performance.now() - startTime);
                    console.log(`[Chat API] [${requestId}] ✅ Streaming completed in ${duration}ms`);

                    controller.close();
                } catch (error) {
                    console.error(`[Chat API] [${requestId}] ❌ Streaming error:`, error);

                    // Send error and fallback to demo mode
                    const demoResponse = getDemoResponse(language);

                    // Stream demo response character by character for consistency
                    for (let i = 0; i < demoResponse.length; i += 10) {
                        const chunk = demoResponse.slice(i, i + 10);
                        const data = JSON.stringify({ text: chunk });
                        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                        // Small delay for natural feel
                        await new Promise(resolve => setTimeout(resolve, 20));
                    }

                    // Send completion without sources (demo mode)
                    const doneData = JSON.stringify({ done: true, sources: [], isDemo: true });
                    controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        console.error('Chat API error:', error);

        // Handle Zod validation errors
        if (error instanceof z.ZodError) {
            return new Response(
                JSON.stringify({
                    error: 'Invalid request format',
                    details: error.errors
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Generic error fallback
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

function getDemoResponse(language: 'en' | 'es'): string {
    return language === 'en'
        ? `Thank you for your question! This is a demo version of HarliBot. The City of Harlingen offers many services including:\n\n• Utilities (water, electric, trash)\n• Building permits and licenses\n• Parks and recreation programs\n• Public safety services\n• Infrastructure maintenance\n\nFor real-time assistance, please call City Hall at (956) 427-8080 or visit harlingentx.gov.\n\n*Note: Full RAG functionality requires backend services to be running.*`
        : `¡Gracias por tu pregunta! Esta es una versión demo de HarliBot. La Ciudad de Harlingen ofrece muchos servicios incluyendo:\n\n• Servicios públicos (agua, electricidad, basura)\n• Permisos de construcción y licencias\n• Programas de parques y recreación\n• Servicios de seguridad pública\n• Mantenimiento de infraestructura\n\nPara asistencia en tiempo real, llame al Ayuntamiento al (956) 427-8080 o visite harlingentx.gov.\n\n*Nota: La funcionalidad RAG completa requiere que los servicios backend estén ejecutándose.*`;
}
