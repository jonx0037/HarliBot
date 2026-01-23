import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import 'dotenv/config'

interface Chunk {
  id: string
  content: string
  [key: string]: any
}

interface ChunkWithEmbedding extends Chunk {
  embedding: number[]
  embeddingModel: string
}

interface EmbeddingServiceResponse {
  embeddings: number[][]
  model: string
  dimension: number
  count: number
}

const EMBEDDING_SERVICE_URL = process.env.EMBEDDING_SERVICE_URL || 'http://localhost:8000'
const BATCH_SIZE = 50 // Process 50 texts per request

async function generateEmbeddings() {
  console.log('Loading processed chunks...')

  // Load chunks - running from scripts/ so go up one level to find data/
  const inputPath = join(process.cwd(), '..', 'data', 'processed', 'chunks.json')

  if (!existsSync(inputPath)) {
    console.error(`❌ File not found: ${inputPath}`)
    console.log('Please run the processor first: npm run process')
    process.exit(1)
  }

  const chunks: Chunk[] = JSON.parse(readFileSync(inputPath, 'utf-8'))

  console.log(`Loaded ${chunks.length} chunks`)

  // Check if embedding service is available
  console.log(`Checking embedding service at ${EMBEDDING_SERVICE_URL}...`)
  try {
    const healthCheck = await fetch(`${EMBEDDING_SERVICE_URL}/health`)
    if (!healthCheck.ok) {
      throw new Error('Service unhealthy')
    }
    const health = await healthCheck.json()
    console.log(`✓ Embedding service is ready (dimension: ${health.embedding_dimension})`)
  } catch (error) {
    console.error('❌ Cannot connect to embedding service!')
    console.log('\nPlease start the embedding service first:')
    console.log('  cd ../backend')
    console.log('  python embedding-service.py')
    console.log('')
    process.exit(1)
  }

  console.log('Generating embeddings...')
  console.log('This may take a while depending on the number of chunks...')

  const chunksWithEmbeddings: ChunkWithEmbedding[] = []
  let processed = 0
  const startTime = Date.now()

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE)

    try {
      // Prepare texts
      const texts = batch.map(chunk => chunk.content)

      // Call embedding service
      const response = await fetch(`${EMBEDDING_SERVICE_URL}/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts, normalize: true }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Embedding service error: ${response.statusText} - ${errorText}`)
      }

      const result: EmbeddingServiceResponse = await response.json()

      // Attach embeddings to chunks
      batch.forEach((chunk, idx) => {
        chunksWithEmbeddings.push({
          ...chunk,
          embedding: result.embeddings[idx],
          embeddingModel: result.model,
        })
      })

      processed += batch.length
      const progress = ((processed / chunks.length) * 100).toFixed(1)
      const eta = estimateETA(processed, chunks.length, Date.now() - startTime)

      console.log(`Progress: ${processed}/${chunks.length} (${progress}%) - ETA: ${eta}`)

      // Small delay to avoid overwhelming the service
      await new Promise(resolve => setTimeout(resolve, 100))

    } catch (error) {
      console.error(`Error processing batch ${i}-${i + BATCH_SIZE}:`, error)
      // Continue with next batch instead of failing completely
    }
  }

  console.log('\nEmbedding generation complete!')
  console.log(`Total embeddings: ${chunksWithEmbeddings.length}`)

  // Save embeddings - running from scripts/ so go up one level to find data/
  const outputDir = join(process.cwd(), '..', 'data', 'embeddings')
  mkdirSync(outputDir, { recursive: true })

  const outputPath = join(outputDir, 'vectors.json')
  writeFileSync(outputPath, JSON.stringify(chunksWithEmbeddings, null, 2))
  console.log(`Saved to: ${outputPath}`)

  // Verify embeddings
  verifyEmbeddings(chunksWithEmbeddings)
}

function estimateETA(processed: number, total: number, elapsedMs: number): string {
  if (processed === 0) return 'calculating...'

  const rate = processed / (elapsedMs / 1000) // items per second
  const remaining = total - processed
  const secondsLeft = remaining / rate

  if (secondsLeft < 60) {
    return `${Math.round(secondsLeft)}s`
  } else if (secondsLeft < 3600) {
    return `${Math.round(secondsLeft / 60)}m`
  } else {
    return `${Math.round(secondsLeft / 3600)}h ${Math.round((secondsLeft % 3600) / 60)}m`
  }
}

function verifyEmbeddings(chunks: ChunkWithEmbedding[]) {
  console.log('\nVerifying embeddings...')

  if (chunks.length === 0) {
    console.warn('⚠️  No embeddings to verify')
    return
  }

  // Check dimensions
  const dimensions = chunks[0].embedding.length
  console.log(`Embedding dimensions: ${dimensions}`)
  console.log(`Embedding model: ${chunks[0].embeddingModel}`)

  // Check for NaN or Inf
  const hasInvalidValues = chunks.some(chunk =>
    chunk.embedding.some(val => !Number.isFinite(val))
  )

  if (hasInvalidValues) {
    console.warn('⚠️  Warning: Some embeddings contain invalid values (NaN or Inf)')
  } else {
    console.log('✓ All embeddings are valid')
  }

  // Test similarity (simple smoke test)
  const sample1 = chunks.find(c => c.content.toLowerCase().includes('water') || c.content.toLowerCase().includes('agua'))
  const sample2 = chunks.findLast(c => c.content.toLowerCase().includes('water') || c.content.toLowerCase().includes('agua'))
  const sample3 = chunks.find(c => c.content.toLowerCase().includes('police') || c.content.toLowerCase().includes('policía'))

  if (sample1 && sample2 && sample3 && sample1.id !== sample2.id) {
    const sim12 = cosineSimilarity(sample1.embedding, sample2.embedding)
    const sim13 = cosineSimilarity(sample1.embedding, sample3.embedding)

    console.log('\nSimilarity test:')
    console.log(`  Water + Water: ${sim12.toFixed(3)} (should be high)`)
    console.log(`  Water + Police: ${sim13.toFixed(3)} (should be lower)`)

    if (sim12 > sim13) {
      console.log('✓ Similarity test passed')
    } else {
      console.warn('⚠️  Similarity test inconclusive')
    }
  }

  console.log('\n✓ Embeddings are ready for indexing!')
  console.log('Next step: npm run index')
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dotProduct / (magnitudeA * magnitudeB)
}

generateEmbeddings().catch(console.error)

