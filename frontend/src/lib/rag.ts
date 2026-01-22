// Core RAG (Retrieval-Augmented Generation) orchestration
import { generateEmbedding } from './embeddings';
import { searchSimilarChunks, SearchResult } from './chromadb';
import { generateResponse, generateStreamingResponse } from './gemini';

// Streaming chunk types
export type StreamChunk =
    | { type: 'text'; content: string }
    | { type: 'sources'; sources: Source[] };

export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export interface Source {
    title: string;
    url: string;
}

export interface RAGResponse {
    response: string;
    sources: Source[];
}

/**
 * Bilingual system prompts
 */
const SYSTEM_PROMPTS = {
    en: `You are HarliBot, the official AI assistant for the City of Harlingen, Texas.
Your role is to help residents find accurate information about city services.

IMPORTANT RULES:
- Only answer based on the provided context
- If the answer isn't in the context, say so politely
- Always cite your sources using the [Source N] references provided
- Be helpful, professional, and concise
- Provide answers in English`,

    es: `Eres HarliBot, el asistente de IA oficial de la Ciudad de Harlingen, Texas.
Tu función es ayudar a los residentes a encontrar información precisa sobre los servicios de la ciudad.

REGLAS IMPORTANTES:
- Solo responde basándote en el contexto proporcionado
- Si la respuesta no está en el contexto, dilo cortésmente
- Siempre cita tus fuentes usando las referencias [Fuente N] proporcionadas
- Sé útil, profesional y conciso
- Proporciona respuestas en español`,
};

/**
 * Execute the complete RAG pipeline
 */
export async function executeRAG(
    query: string,
    language: 'en' | 'es',
    history: Message[] = []
): Promise<RAGResponse> {
    try {
        // Step 1: Generate embedding for the query
        console.log('[RAG] Generating query embedding...');
        const queryEmbedding = await generateEmbedding(query);

        // Step 2: Search ChromaDB for relevant chunks
        console.log('[RAG] Searching vector database...');
        const topK = parseInt(process.env.SIMILARITY_SEARCH_TOP_K || '5');
        const relevantChunks = await searchSimilarChunks(queryEmbedding, language, topK);

        if (relevantChunks.length === 0) {
            // No relevant content found
            const noResultsMessage = language === 'en'
                ? "I apologize, but I couldn't find relevant information in the city's website to answer your question. Please try rephrasing or contact the city directly at (956) 216-5000."
                : "Lo siento, pero no pude encontrar información relevante en el sitio web de la ciudad para responder tu pregunta. Por favor intenta reformularla o contacta a la ciudad directamente al (956) 216-5000.";

            return {
                response: noResultsMessage,
                sources: [],
            };
        }

        // Step 3: Build context from retrieved chunks
        console.log(`[RAG] Building context from ${relevantChunks.length} chunks...`);
        const context = relevantChunks
            .map((chunk, i) => {
                const sourceLabel = language === 'en' ? 'Source' : 'Fuente';
                return `[${sourceLabel} ${i + 1}]: ${chunk.content}`;
            })
            .join('\n\n');

        // Step 4: Build prompt with context and conversation history
        const recentHistory = history.slice(-6); // Last 3 exchanges
        const historyContext = recentHistory.length > 0
            ? `\n${language === 'en' ? 'Recent conversation' : 'Conversación reciente'}:\n${recentHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\n`
            : '';

        const userPrompt = `${language === 'en' ? 'Context from City of Harlingen website' : 'Contexto del sitio web de la Ciudad de Harlingen'}:
${context}
${historyContext}
${language === 'en' ? 'User question' : 'Pregunta del usuario'}: ${query}

${language === 'en' ? 'Please provide a helpful answer based on the context above.' : 'Por favor proporciona una respuesta útil basada en el contexto anterior.'}`;

        // Step 5: Generate response using Gemini
        console.log('[RAG] Generating response with Gemini...');
        const systemPrompt = SYSTEM_PROMPTS[language];
        const llmResponse = await generateResponse(systemPrompt, userPrompt);

        // Step 6: Extract and format sources
        const sources: Source[] = relevantChunks
            .slice(0, 3) // Top 3 sources
            .map(chunk => ({
                title: chunk.metadata.sourceTitle || 'City of Harlingen',
                url: chunk.metadata.sourceUrl,
            }));

        console.log('[RAG] Successfully completed pipeline');
        return {
            response: llmResponse,
            sources,
        };

    } catch (error) {
        console.error('[RAG] Pipeline error:', error);

        const errorMessage = language === 'en'
            ? "I apologize, but I'm having trouble processing your request right now. Please try again in a moment."
            : "Lo siento, pero estoy teniendo problemas para procesar tu solicitud en este momento. Por favor intenta de nuevo en un momento.";

        throw new Error(errorMessage);
    }
}

/**
 * Execute the RAG pipeline with streaming response
 * Yields text chunks during LLM generation, then sources at the end
 */
export async function* executeRAGStreaming(
    query: string,
    language: 'en' | 'es',
    history: Message[] = []
): AsyncGenerator<StreamChunk, void, unknown> {
    // Step 1: Generate embedding for the query
    console.log('[RAG Streaming] Generating query embedding...');
    const queryEmbedding = await generateEmbedding(query);

    // Step 2: Search ChromaDB for relevant chunks
    console.log('[RAG Streaming] Searching vector database...');
    const topK = parseInt(process.env.SIMILARITY_SEARCH_TOP_K || '5');
    const relevantChunks = await searchSimilarChunks(queryEmbedding, language, topK);

    if (relevantChunks.length === 0) {
        // No relevant content found - yield message and empty sources
        const noResultsMessage = language === 'en'
            ? "I apologize, but I couldn't find relevant information in the city's website to answer your question. Please try rephrasing or contact the city directly at (956) 216-5000."
            : "Lo siento, pero no pude encontrar información relevante en el sitio web de la ciudad para responder tu pregunta. Por favor intenta reformularla o contacta a la ciudad directamente al (956) 216-5000.";

        yield { type: 'text', content: noResultsMessage };
        yield { type: 'sources', sources: [] };
        return;
    }

    // Step 3: Build context from retrieved chunks
    console.log(`[RAG Streaming] Building context from ${relevantChunks.length} chunks...`);
    const context = relevantChunks
        .map((chunk, i) => {
            const sourceLabel = language === 'en' ? 'Source' : 'Fuente';
            return `[${sourceLabel} ${i + 1}]: ${chunk.content}`;
        })
        .join('\n\n');

    // Step 4: Build prompt with context and conversation history
    const recentHistory = history.slice(-6);
    const historyContext = recentHistory.length > 0
        ? `\n${language === 'en' ? 'Recent conversation' : 'Conversación reciente'}:\n${recentHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\n`
        : '';

    const userPrompt = `${language === 'en' ? 'Context from City of Harlingen website' : 'Contexto del sitio web de la Ciudad de Harlingen'}:
${context}
${historyContext}
${language === 'en' ? 'User question' : 'Pregunta del usuario'}: ${query}

${language === 'en' ? 'Please provide a helpful answer based on the context above.' : 'Por favor proporciona una respuesta útil basada en el contexto anterior.'}`;

    // Step 5: Stream response using Gemini
    console.log('[RAG Streaming] Streaming response with Gemini...');
    const systemPrompt = SYSTEM_PROMPTS[language];

    for await (const textChunk of generateStreamingResponse(systemPrompt, userPrompt)) {
        yield { type: 'text', content: textChunk };
    }

    // Step 6: Extract and format sources
    const sources: Source[] = relevantChunks
        .slice(0, 3)
        .map(chunk => ({
            title: chunk.metadata.sourceTitle || 'City of Harlingen',
            url: chunk.metadata.sourceUrl,
        }));

    console.log('[RAG Streaming] Successfully completed streaming pipeline');
    yield { type: 'sources', sources };
}

/**
 * Validate query before processing
 */
export function validateQuery(query: string): { valid: boolean; error?: string } {
    const maxLength = parseInt(process.env.MAX_QUERY_LENGTH || '500');

    if (!query || query.trim().length === 0) {
        return { valid: false, error: 'Query cannot be empty' };
    }

    if (query.length > maxLength) {
        return { valid: false, error: `Query too long (max ${maxLength} characters)` };
    }

    return { valid: true };
}
