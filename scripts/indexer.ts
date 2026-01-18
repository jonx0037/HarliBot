import { readFileSync } from 'fs'
import { join } from 'path'
import { ChromaClient } from 'chromadb'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') })

interface ChunkWithEmbedding {
  id: string
  content: string
  embedding: number[]
  embeddingModel: string
  metadata: Record<string, any>
  [key: string]: any
}

async function indexEmbeddings() {
  console.log('Loading embeddings...')

  // Load chunks with embeddings
  const inputPath = join(process.cwd(), 'data', 'embeddings', 'vectors.json')
  const chunks: ChunkWithEmbedding[] = JSON.parse(readFileSync(inputPath, 'utf-8'))

  console.log(`Loaded ${chunks.length} chunks with embeddings`)
  console.log('Initializing ChromaDB...')

  // Initialize ChromaDB client
  const CHROMADB_URL = process.env.CHROMADB_URL || 'http://localhost:8001'
  const CHROMADB_API_KEY = process.env.CHROMADB_API_KEY

  let client: ChromaClient

  // Use Cloud if API key is set, otherwise use local
  if (CHROMADB_API_KEY && CHROMADB_API_KEY !== 'your_chroma_api_key_here') {
    console.log(`Connecting to ChromaDB Cloud at ${CHROMADB_URL}...`)
    client = new ChromaClient({
      path: CHROMADB_URL,
      auth: {
        provider: 'token',
        credentials: CHROMADB_API_KEY,
        tokenHeaderType: 'X_CHROMA_TOKEN'
      },
    })
  } else {
    console.log(`Connecting to local ChromaDB at ${CHROMADB_URL}...`)
    client = new ChromaClient({
      path: CHROMADB_URL,
    })
  }

  const collectionName = process.env.CHROMADB_COLLECTION || 'harlingen_city_content'


  // Delete existing collection if it exists (for fresh start)
  try {
    await client.deleteCollection({ name: 'harlingen_city_content' })
    console.log('Deleted existing collection')
  } catch (error) {
    // Collection doesn't exist, that's fine
  }

  // Create collection
  const collection = await client.createCollection({
    name: 'harlingen_city_content',
    metadata: {
      'hnsw:space': 'cosine',
      'hnsw:construction_ef': 200,
      'hnsw:M': 16,
    },
  })

  console.log('Collection created. Indexing chunks...')

  // Add chunks in batches
  const batchSize = 100
  let indexed = 0

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize)

    try {
      await collection.add({
        ids: batch.map(c => c.id),
        embeddings: batch.map(c => c.embedding),
        documents: batch.map(c => c.content),
        metadatas: batch.map(c => ({
          sourceUrl: c.metadata.sourceUrl,
          sourceTitle: c.metadata.sourceTitle,
          category: c.metadata.category,
          language: c.metadata.language,
          chunkPosition: c.metadata.chunkPosition,
          wordCount: c.metadata.wordCount,
          hasContactInfo: c.metadata.hasContactInfo,
          hasAddress: c.metadata.hasAddress,
        })),
      })

      indexed += batch.length
      const progress = ((indexed / chunks.length) * 100).toFixed(1)
      console.log(`Indexed: ${indexed}/${chunks.length} (${progress}%)`)

    } catch (error) {
      console.error(`Error indexing batch ${i}-${i + batchSize}:`, error)
    }
  }

  console.log('\nIndexing complete!')
  console.log(`Total chunks indexed: ${indexed}`)

  // Test the index
  await testIndex(collection)
}

async function testIndex(collection: any) {
  console.log('\nTesting index with sample queries...')

  const testQueries = [
    'How do I pay my water bill?',
    '¿Cómo pago mi factura de agua?',
    'What is the phone number for the police department?',
    'Trash collection schedule',
  ]

  for (const query of testQueries) {
    console.log(`\nQuery: "${query}"`)

    try {
      const results = await collection.query({
        queryTexts: [query],
        nResults: 3,
      })

      if (results.documents[0].length > 0) {
        console.log('Top result:')
        console.log(`  ${results.documents[0][0].substring(0, 150)}...`)
        console.log(`  Distance: ${results.distances[0][0].toFixed(3)}`)
        console.log(`  Source: ${results.metadatas[0][0].sourceUrl}`)
      } else {
        console.log('  No results found')
      }
    } catch (error) {
      console.error('  Query failed:', error)
    }
  }

  console.log('\n✓ Index is ready to use!')
  console.log('\nNext steps:')
  console.log('1. Start your Next.js development server: npm run dev')
  console.log('2. Make sure Ollama is running: ollama serve')
  console.log('3. Test the chatbot at http://localhost:3000')
}

indexEmbeddings().catch(console.error)
