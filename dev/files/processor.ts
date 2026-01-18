import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { v4 as uuidv4 } from 'uuid'

interface Document {
  url: string
  urlHash: string
  title: string
  content: string
  metadata: {
    department?: string
    category: string
    tags: string[]
    language: 'en' | 'es'
    scrapedAt: string
  }
  links: string[]
}

interface Chunk {
  id: string
  documentId: string
  content: string
  chunkIndex: number
  totalChunks: number
  breadcrumb: string
  entities: string[]
  keywords: string[]
  metadata: {
    sourceUrl: string
    sourceTitle: string
    category: string
    language: 'en' | 'es'
    chunkPosition: 'start' | 'middle' | 'end'
    wordCount: number
    hasContactInfo: boolean
    hasAddress: boolean
  }
}

// Initialize text splitter
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 128,
  separators: ['\n\n', '\n', '. ', '! ', '? ', '; ', ', ', ' '],
  keepSeparator: true,
})

async function processDocuments() {
  console.log('Loading scraped documents...')
  
  // Load raw documents
  const inputPath = join(process.cwd(), 'data', 'raw', 'documents.json')
  const documents: Document[] = JSON.parse(readFileSync(inputPath, 'utf-8'))
  
  console.log(`Loaded ${documents.length} documents`)
  console.log('Processing and chunking...')

  const allChunks: Chunk[] = []
  let processedCount = 0

  for (const doc of documents) {
    try {
      // Split document into chunks
      const textChunks = await textSplitter.splitText(doc.content)
      
      const chunks: Chunk[] = textChunks.map((text, index) => {
        const chunkId = `${doc.urlHash}-chunk-${index}`
        
        return {
          id: chunkId,
          documentId: doc.urlHash,
          content: text,
          chunkIndex: index,
          totalChunks: textChunks.length,
          breadcrumb: generateBreadcrumb(doc.url),
          entities: extractEntities(text),
          keywords: extractKeywords(text, doc.metadata.category),
          metadata: {
            sourceUrl: doc.url,
            sourceTitle: doc.title,
            category: doc.metadata.category,
            language: doc.metadata.language,
            chunkPosition: index === 0 
              ? 'start' 
              : index === textChunks.length - 1 
                ? 'end' 
                : 'middle',
            wordCount: text.split(/\s+/).length,
            hasContactInfo: hasPhoneOrEmail(text),
            hasAddress: hasAddress(text),
          },
        }
      })

      allChunks.push(...chunks)
      processedCount++

      if (processedCount % 10 === 0) {
        console.log(`Processed ${processedCount}/${documents.length} documents...`)
      }

    } catch (error) {
      console.error(`Error processing ${doc.url}:`, error)
    }
  }

  console.log(`\nProcessing complete!`)
  console.log(`Total chunks created: ${allChunks.length}`)
  console.log(`Average chunks per document: ${(allChunks.length / documents.length).toFixed(1)}`)

  // Save processed chunks
  const outputDir = join(process.cwd(), 'data', 'processed')
  mkdirSync(outputDir, { recursive: true })
  
  const outputPath = join(outputDir, 'chunks.json')
  writeFileSync(outputPath, JSON.stringify(allChunks, null, 2))
  console.log(`Saved to: ${outputPath}`)

  // Print summary
  printSummary(allChunks)
}

function generateBreadcrumb(url: string): string {
  const path = new URL(url).pathname
    .split('/')
    .filter(Boolean)
    .map(segment => segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    )
  
  return ['Home', ...path].join(' > ')
}

function extractEntities(text: string): string[] {
  const entities = new Set<string>()

  // Phone numbers
  const phoneMatches = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g)
  phoneMatches?.forEach(p => entities.add(p))

  // Email addresses
  const emailMatches = text.match(/[\w.+-]+@[\w.-]+\.\w+/g)
  emailMatches?.forEach(e => entities.add(e))

  // Department mentions
  const deptPattern = /(Department of|Office of) [\w\s]+/g
  const deptMatches = text.match(deptPattern)
  deptMatches?.forEach(d => entities.add(d))

  return Array.from(entities)
}

function extractKeywords(text: string, category: string): string[] {
  const keywords = new Set<string>([category])

  // Common city service keywords
  const serviceKeywords = [
    'water', 'trash', 'utility', 'permit', 'license', 'council',
    'police', 'fire', 'park', 'recreation', 'library', 'health',
  ]

  const lowerText = text.toLowerCase()
  serviceKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      keywords.add(keyword)
    }
  })

  return Array.from(keywords)
}

function hasPhoneOrEmail(text: string): boolean {
  return /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text) ||
         /[\w.+-]+@[\w.-]+\.\w+/.test(text)
}

function hasAddress(text: string): boolean {
  return /\d+\s+[\w\s]+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln)/i.test(text)
}

function printSummary(chunks: Chunk[]) {
  console.log('\nChunk Statistics:')
  
  // Language distribution
  const byLanguage = chunks.reduce((acc, chunk) => {
    acc[chunk.metadata.language] = (acc[chunk.metadata.language] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  console.log('By language:', byLanguage)

  // Category distribution
  const byCategory = chunks.reduce((acc, chunk) => {
    acc[chunk.metadata.category] = (acc[chunk.metadata.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  console.log('\nTop 5 categories:')
  Object.entries(byCategory)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`)
    })

  // Contact info stats
  const withContact = chunks.filter(c => c.metadata.hasContactInfo).length
  console.log(`\nChunks with contact info: ${withContact} (${((withContact / chunks.length) * 100).toFixed(1)}%)`)

  // Average word count
  const avgWords = chunks.reduce((sum, c) => sum + c.metadata.wordCount, 0) / chunks.length
  console.log(`Average words per chunk: ${avgWords.toFixed(1)}`)
}

processDocuments().catch(console.error)
