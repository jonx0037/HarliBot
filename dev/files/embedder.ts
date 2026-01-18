import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { pipeline } from '@xenova/transformers'

interface Chunk {
  id: string
  content: string
  [key: string]: any
}

interface ChunkWithEmbedding extends Chunk {
  embedding: number[]
  embeddingModel: string
}

async function generateEmbeddings() {
  console.log('Loading processed chunks...')
  
  // Load chunks
  const inputPath = join(process.cwd(), 'data', 'processed', 'chunks.json')
  const chunks: Chunk[] = JSON.parse(readFileSync(inputPath, 'utf-8'))
  
  console.log(`Loaded ${chunks.length} chunks`)
  console.log('Loading embedding model...')

  // Load embedding model
  const embedder = await pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2'
  )

  console.log('Model loaded! Generating embeddings...')
  console.log('This may take a while depending on the number of chunks...')

  const chunksWithEmbeddings: ChunkWithEmbedding[] = []
  const batchSize = 32
  let processed = 0

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize)
    
    try {
      // Generate embeddings for batch
      const embeddings = await Promise.all(
        batch.map(chunk => generateEmbedding(embedder, chunk.content))
      )

      // Attach embeddings to chunks
      batch.forEach((chunk, idx) => {
        chunksWithEmbeddings.push({
          ...chunk,
          embedding: embeddings[idx],
          embeddingModel: 'all-MiniLM-L6-v2',
        })
      })

      processed += batch.length
      const progress = ((processed / chunks.length) * 100).toFixed(1)
      const eta = estimateETA(processed, chunks.length, Date.now() - startTime)
      
      console.log(`Progress: ${processed}/${chunks.length} (${progress}%) - ETA: ${eta}`)

    } catch (error) {
      console.error(`Error processing batch ${i}-${i + batchSize}:`, error)
    }
  }

  console.log('\nEmbedding generation complete!')
  console.log(`Total embeddings: ${chunksWithEmbeddings.length}`)

  // Save embeddings
  const outputDir = join(process.cwd(), 'data', 'embeddings')
  mkdirSync(outputDir, { recursive: true })
  
  const outputPath = join(outputDir, 'vectors.json')
  writeFileSync(outputPath, JSON.stringify(chunksWithEmbeddings, null, 2))
  console.log(`Saved to: ${outputPath}`)

  // Verify embeddings
  verifyEmbeddings(chunksWithEmbeddings)
}

const startTime = Date.now()

async function generateEmbedding(embedder: any, text: string): Promise<number[]> {
  // Truncate if needed (512 chars ≈ 256 words)
  const truncated = text.slice(0, 512)
  
  // Generate embedding
  const output = await embedder(truncated, {
    pooling: 'mean',
    normalize: true,
  })
  
  // Extract and return vector
  return Array.from(output.data)
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
  
  // Check dimensions
  const dimensions = chunks[0].embedding.length
  console.log(`Embedding dimensions: ${dimensions}`)
  
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
  const sample1 = chunks.find(c => c.content.toLowerCase().includes('water'))
  const sample2 = chunks.find(c => c.content.toLowerCase().includes('water'))
  const sample3 = chunks.find(c => c.content.toLowerCase().includes('police'))

  if (sample1 && sample2 && sample3) {
    const sim12 = cosineSimilarity(sample1.embedding, sample2.embedding)
    const sim13 = cosineSimilarity(sample1.embedding, sample3.embedding)
    
    console.log('\nSimilarity test:')
    console.log(`  Water + Water: ${sim12.toFixed(3)} (should be high)`)
    console.log(`  Water + Police: ${sim13.toFixed(3)} (should be lower)`)
    
    if (sim12 > sim13) {
      console.log('✓ Similarity test passed')
    } else {
      console.warn('⚠️  Similarity test failed - embeddings may not be working correctly')
    }
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dotProduct / (magnitudeA * magnitudeB)
}

generateEmbeddings().catch(console.error)
