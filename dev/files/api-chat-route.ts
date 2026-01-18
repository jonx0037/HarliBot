import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(500),
  language: z.enum(['en', 'es']),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json()
    const { message, language, conversationHistory } = ChatRequestSchema.parse(body)

    // TODO: Implement RAG pipeline
    // 1. Generate query embedding
    // 2. Search vector database (ChromaDB)
    // 3. Retrieve relevant context
    // 4. Build prompt with context
    // 5. Call Ollama for generation
    // 6. Format response

    // Placeholder response for initial testing
    const response = await generateResponse(message, language, conversationHistory)

    return NextResponse.json({
      response: response.content,
      sources: response.sources,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateResponse(
  message: string,
  language: 'en' | 'es',
  history?: Array<{ role: string; content: string }>
) {
  // Step 1: Generate embedding for the query
  const queryEmbedding = await generateEmbedding(message)

  // Step 2: Search vector database
  const relevantChunks = await searchKnowledgeBase(queryEmbedding, language)

  // Step 3: Build context from retrieved chunks
  const context = relevantChunks
    .map((chunk, i) => `[Source ${i + 1}]: ${chunk.content}`)
    .join('\n\n')

  // Step 4: Build prompt for LLM
  const systemPrompt = language === 'en'
    ? `You are HarliBot, the official AI assistant for the City of Harlingen, Texas.
Your role is to help residents find accurate information about city services.

IMPORTANT RULES:
- Only answer based on the provided context
- If the answer isn't in the context, say so politely
- Always cite your sources
- Be helpful, professional, and concise
- Provide answers in English`
    : `Eres HarliBot, el asistente de IA oficial de la Ciudad de Harlingen, Texas.
Tu función es ayudar a los residentes a encontrar información precisa sobre los servicios de la ciudad.

REGLAS IMPORTANTES:
- Solo responde basándote en el contexto proporcionado
- Si la respuesta no está en el contexto, dilo cortésmente
- Siempre cita tus fuentes
- Sé útil, profesional y conciso
- Proporciona respuestas en español`

  const userPrompt = `Context from City of Harlingen website:
${context}

${history && history.length > 0 ? `
Recent conversation:
${history.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')}
` : ''}

User question: ${message}

Please provide a helpful answer based on the context above.`

  // Step 5: Call Ollama for generation
  const llmResponse = await callOllama(systemPrompt, userPrompt)

  // Step 6: Format response with sources
  return {
    content: llmResponse,
    sources: relevantChunks.map(chunk => ({
      title: chunk.metadata.sourceTitle || 'City of Harlingen',
      url: chunk.metadata.sourceUrl,
    })).slice(0, 3), // Top 3 sources
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  // TODO: Implement with @xenova/transformers
  // For now, return placeholder
  return new Array(384).fill(0).map(() => Math.random())
}

async function searchKnowledgeBase(
  embedding: number[],
  language: 'en' | 'es'
): Promise<Array<{
  content: string
  metadata: {
    sourceTitle?: string
    sourceUrl: string
    language: string
  }
  score: number
}>> {
  // TODO: Implement ChromaDB search
  // For now, return placeholder data
  return [
    {
      content: language === 'en'
        ? 'You can pay your water bill online at harlingentx.gov/utilities or by calling 956-555-1234.'
        : 'Puede pagar su factura de agua en línea en harlingentx.gov/utilities o llamando al 956-555-1234.',
      metadata: {
        sourceTitle: 'Water Service',
        sourceUrl: 'https://www.harlingentx.gov/services/utilities/water',
        language,
      },
      score: 0.89,
    },
  ]
}

async function callOllama(systemPrompt: string, userPrompt: string): Promise<string> {
  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'

  try {
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'harlibot:prototype',
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 512,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.response

  } catch (error) {
    console.error('Ollama API call failed:', error)
    // Fallback response
    return 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.'
  }
}
