// Google Gemini API client for response generation
import { GoogleGenerativeAI } from '@google/generative-ai';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

if (!GOOGLE_API_KEY) {
    console.warn('GOOGLE_API_KEY not configured');
}

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

export interface GenerateOptions {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
}

/**
 * Generate a response using Google Gemini
 */
export async function generateResponse(
    systemPrompt: string,
    userPrompt: string,
    options: GenerateOptions = {}
): Promise<string> {
    try {
        const {
            temperature = parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
            maxTokens = parseInt(process.env.LLM_MAX_TOKENS || '512'),
            topP = 0.9,
        } = options;

        const model = genAI.getGenerativeModel({
            model: GEMINI_MODEL,
        });

        // Combine system prompt with user prompt
        const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            generationConfig: {
                temperature,
                maxOutputTokens: maxTokens,
                topP,
            },
        });

        const response = result.response;
        return response.text();
    } catch (error: any) {
        // Log error details safely (avoid circular reference issues)
        console.error('Gemini API call failed');
        if (error?.message) console.error('Message:', error.message);
        if (error?.statusCode) console.error('Status Code:', error.statusCode);
        throw new Error('Failed to generate response from LLM');
    }
}

/**
 * Generate a streaming response (for future use)
 */
export async function* generateStreamingResponse(
    systemPrompt: string,
    userPrompt: string,
    options: GenerateOptions = {}
): AsyncGenerator<string, void, unknown> {
    try {
        const {
            temperature = parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
            maxTokens = parseInt(process.env.LLM_MAX_TOKENS || '512'),
            topP = 0.9,
        } = options;

        const model = genAI.getGenerativeModel({
            model: GEMINI_MODEL,
        });

        // Combine system prompt with user prompt
        const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

        const result = await model.generateContentStream({
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            generationConfig: {
                temperature,
                maxOutputTokens: maxTokens,
                topP,
            },
        });

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            yield chunkText;
        }
    } catch (error) {
        console.error('Gemini streaming error:', error);
        throw new Error('Failed to generate streaming response');
    }
}
