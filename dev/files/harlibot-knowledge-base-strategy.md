# HarliBot Knowledge Base Strategy Document
## Content Acquisition, Processing & RAG Implementation

**Project**: HarliBot - City of Harlingen AI Chatbot  
**Version**: 1.0  
**Date**: January 17, 2025  
**Author**: Jonathan Rocha

---

## Table of Contents

1. [Knowledge Base Overview](#knowledge-base-overview)
2. [Content Sources](#content-sources)
3. [Web Scraping Strategy](#web-scraping-strategy)
4. [Content Processing Pipeline](#content-processing-pipeline)
5. [Data Schema & Structure](#data-schema--structure)
6. [Embedding Strategy](#embedding-strategy)
7. [Vector Database Implementation](#vector-database-implementation)
8. [RAG (Retrieval-Augmented Generation) Architecture](#rag-architecture)
9. [Bilingual Content Handling](#bilingual-content-handling)
10. [Update & Maintenance Strategy](#update--maintenance-strategy)
11. [Quality Assurance](#quality-assurance)

---

## Knowledge Base Overview

### Purpose

The HarliBot knowledge base is the foundation of the chatbot's ability to provide accurate, contextual information about City of Harlingen services, departments, and resources. It transforms the entire harlingentx.gov website into a searchable, AI-accessible knowledge repository.

### Goals

1. **Comprehensive Coverage**: Index all public-facing city information
2. **High Accuracy**: Ensure retrieved content is relevant and correct
3. **Bilingual Support**: Handle both English and Spanish content
4. **Maintainability**: Easy updates when city website changes
5. **Performance**: Fast retrieval (<100ms) for real-time chat experience

### Success Metrics

- **Coverage**: >90% of harlingentx.gov pages indexed
- **Retrieval Accuracy**: Top-5 results include correct answer >85% of time
- **Freshness**: Content updated within 7 days of website changes
- **Response Time**: Vector search <50ms at 95th percentile

---

## Content Sources

### Primary Source: harlingentx.gov

**Website Structure** (As of January 2025):
```
https://www.harlingentx.gov/
├── /government/
│   ├── /city-council/
│   ├── /city-manager/
│   ├── /departments/
│   └── /boards-commissions/
├── /services/
│   ├── /utilities/
│   ├── /public-works/
│   ├── /parks-recreation/
│   └── /police-fire/
├── /residents/
│   ├── /permits-licenses/
│   ├── /trash-recycling/
│   ├── /library/
│   └── /health-services/
├── /business/
│   ├── /economic-development/
│   ├── /business-licenses/
│   └── /incentives/
├── /visitors/
└── /news-events/
```

**Content Types to Index**:
- ✅ Service descriptions and instructions
- ✅ Department information and contacts
- ✅ FAQs
- ✅ Forms and applications (metadata only, not PDFs)
- ✅ News and announcements
- ✅ Event information
- ✅ City council agendas/minutes (summaries)
- ✅ Ordinances and policies (summaries)

**Content Types to Exclude**:
- ❌ Login/authentication pages
- ❌ Admin pages
- ❌ Duplicate content (print versions, etc.)
- ❌ Large PDFs (link only, don't embed full text for prototype)
- ❌ Media galleries (images/videos)
- ❌ Job applications (link only)

### Secondary Sources (Phase 2 Enhancement)

- City social media (Twitter, Facebook) for timely updates
- 311 call center FAQs (if available)
- Department-specific documentation (Google Docs, etc.)
- Public records portal

---

## Web Scraping Strategy

### Technology Stack

**Primary Tool**: Crawlee (Node.js web scraping framework)  
**HTML Parser**: Cheerio (jQuery-like API)  
**HTTP Client**: Got (with retry and rate limiting)  
**Storage**: JSON files → PostgreSQL (production)

### Crawlee Configuration

```typescript
// scraper/crawler.ts
import { PlaywrightCrawler, ProxyConfiguration } from 'crawlee';
import { router } from './routes.js';

const crawler = new PlaywrightCrawler({
    // Respect robots.txt
    respectRobotsTxt: true,
    
    // Rate limiting (be kind to city servers)
    maxRequestsPerMinute: 30,
    maxConcurrency: 3,
    
    // Request queue
    requestHandler: router,
    
    // Browser options
    launchContext: {
        launchOptions: {
            headless: true,
        },
    },
    
    // Max crawl depth
    maxRequestsPerCrawl: 500,  // Prototype limit
    
    // Timeout settings
    requestHandlerTimeoutSecs: 60,
    
    // Retry failed requests
    maxRequestRetries: 3,
});

// Start crawling
await crawler.run(['https://www.harlingentx.gov/']);
```

### Crawling Rules

**URL Filtering**:
```typescript
// Include patterns
const includePatterns = [
  /harlingentx\.gov\/government\/.*/,
  /harlingentx\.gov\/services\/.*/,
  /harlingentx\.gov\/residents\/.*/,
  /harlingentx\.gov\/business\/.*/,
  /harlingentx\.gov\/news-events\/.*/,
];

// Exclude patterns
const excludePatterns = [
  /\/login/,
  /\/admin/,
  /\/wp-admin/,
  /\/print\//,
  /\.(pdf|doc|docx|xls|xlsx|zip)$/i,  // Link but don't crawl
  /calendar\//,  // Skip calendar pages (too many)
];

function shouldCrawl(url: string): boolean {
  if (excludePatterns.some(pattern => pattern.test(url))) {
    return false;
  }
  return includePatterns.some(pattern => pattern.test(url));
}
```

**Depth Control**:
- Max depth: 4 levels from homepage
- Prioritize high-value sections (/services, /residents)
- Breadth-first search to get broad coverage quickly

**Politeness Policy**:
- 2-second delay between requests to same domain
- User-Agent: "HarliBot/1.0 (City of Harlingen; +https://github.com/jrocha/harlibot)"
- Respect robots.txt and meta robots tags
- Scrape during off-peak hours (2-6 AM) for production updates

### Content Extraction

**HTML Parsing Strategy**:
```typescript
import * as cheerio from 'cheerio';

async function extractContent(html: string, url: string) {
  const $ = cheerio.load(html);
  
  // Remove non-content elements
  $('nav, header, footer, script, style, iframe, .advertisement').remove();
  
  // Extract main content
  const mainContent = 
    $('main').text() ||
    $('article').text() ||
    $('#content').text() ||
    $('.main-content').text() ||
    $('body').text();  // Fallback
  
  // Extract metadata
  const title = $('h1').first().text() || $('title').text();
  const description = $('meta[name="description"]').attr('content') || '';
  const keywords = $('meta[name="keywords"]').attr('content') || '';
  
  // Extract structured data (JSON-LD)
  const jsonLd = $('script[type="application/ld+json"]').html();
  
  // Extract links for citation
  const links = $('a[href^="http"]')
    .map((i, el) => $(el).attr('href'))
    .get()
    .filter(href => href?.includes('harlingentx.gov'));
  
  return {
    url,
    title: cleanText(title),
    content: cleanText(mainContent),
    description: cleanText(description),
    keywords: keywords.split(',').map(k => k.trim()),
    links,
    jsonLd: jsonLd ? JSON.parse(jsonLd) : null,
    scrapedAt: new Date().toISOString(),
  };
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .replace(/\n+/g, '\n')  // Remove excessive newlines
    .trim();
}
```

**Metadata Extraction**:
```typescript
interface PageMetadata {
  department?: string;        // e.g., "Public Works"
  service?: string;           // e.g., "Trash Collection"
  lastUpdated?: string;       // From page or HTTP headers
  language: 'en' | 'es';      // Auto-detected
  category: string;           // Derived from URL path
  tags: string[];             // Extracted from keywords/content
}

function extractMetadata(url: string, $: cheerio.CheerioAPI): PageMetadata {
  // Derive category from URL
  const pathParts = new URL(url).pathname.split('/').filter(Boolean);
  const category = pathParts[0] || 'general';  // e.g., "services"
  const subcategory = pathParts[1] || '';      // e.g., "utilities"
  
  // Detect language (simple heuristic)
  const content = $('body').text();
  const language = detectLanguage(content);
  
  // Extract department (if present in breadcrumb or page)
  const department = 
    $('.breadcrumb a').last().text() ||
    $('[itemprop="department"]').text() ||
    '';
  
  return {
    department,
    lastUpdated: $('meta[property="article:modified_time"]').attr('content'),
    language,
    category,
    tags: [category, subcategory].filter(Boolean),
  };
}

function detectLanguage(text: string): 'en' | 'es' {
  // Simple keyword-based detection
  const spanishIndicators = ['el', 'la', 'los', 'las', 'de', 'del', 'y', 'o', 'en'];
  const words = text.toLowerCase().split(/\s+/).slice(0, 100);
  
  const spanishScore = words.filter(w => spanishIndicators.includes(w)).length;
  return spanishScore > 10 ? 'es' : 'en';
}
```

---

## Content Processing Pipeline

### Pipeline Overview

```
Raw HTML → Clean & Extract → Normalize → Detect Language → 
Chunk → Deduplicate → Enrich → Generate Embeddings → Store
```

### Step 1: Cleaning & Extraction

**Purpose**: Remove boilerplate, extract meaningful content  
**Implementation**: (See Web Scraping Strategy above)

### Step 2: Text Normalization

**Purpose**: Standardize text for better embedding quality  
**Operations**:
```typescript
function normalizeText(text: string): string {
  return text
    // Fix encoding issues
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    
    // Remove special characters (but keep punctuation)
    .replace(/[^\w\s.,!?;:()\-'"/]/g, '')
    
    // Normalize case for certain terms
    .replace(/city of harlingen/gi, 'City of Harlingen')
    
    .trim();
}
```

### Step 3: Language Detection & Handling

**Library**: `franc` (language detection)  
**Strategy**: Detect per-page, split if mixed  

```typescript
import { franc } from 'franc';

function processLanguage(content: string) {
  const detected = franc(content);
  
  if (detected === 'eng') return { language: 'en', chunks: [content] };
  if (detected === 'spa') return { language: 'es', chunks: [content] };
  
  // Mixed content - try to split
  const paragraphs = content.split('\n\n');
  const enChunks: string[] = [];
  const esChunks: string[] = [];
  
  paragraphs.forEach(para => {
    const lang = franc(para);
    if (lang === 'eng') enChunks.push(para);
    else if (lang === 'spa') esChunks.push(para);
  });
  
  return {
    language: 'mixed',
    enChunks: enChunks.length > 0 ? [enChunks.join('\n\n')] : [],
    esChunks: esChunks.length > 0 ? [esChunks.join('\n\n')] : [],
  };
}
```

### Step 4: Chunking Strategy

**Goal**: Split documents into semantically coherent units  
**Method**: Recursive character splitting with overlap  

```typescript
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,        // ~128 tokens (rough estimate)
  chunkOverlap: 128,     // 25% overlap for context continuity
  separators: ['\n\n', '\n', '. ', '! ', '? ', '; ', ', ', ' '],
  keepSeparator: true,
});

async function chunkDocument(content: string, metadata: PageMetadata) {
  const chunks = await textSplitter.createDocuments([content], [metadata]);
  
  // Post-process: add sequential IDs
  return chunks.map((chunk, index) => ({
    ...chunk,
    id: `${metadata.url}#chunk-${index}`,
    chunkIndex: index,
    totalChunks: chunks.length,
  }));
}
```

**Chunking Rationale**:
- 512 characters ≈ 100-130 tokens (most embedding models use 512 token context)
- Overlap ensures questions at chunk boundaries are handled
- Hierarchical separators respect document structure

**Example**:
```
Original Document:
"The City of Harlingen provides water service to all residents.

Water Service Information:
• Billing: Monthly billing cycle
• Payments: Online, phone, or in-person
• Customer Service: 956-555-1234

To set up new service, visit our office with ID and proof of residence."

Chunk 1:
"The City of Harlingen provides water service to all residents.

Water Service Information:
• Billing: Monthly billing cycle
• Payments: Online, phone, or in-person
• Customer Service: 956-555-1234"

Chunk 2:
"• Customer Service: 956-555-1234

To set up new service, visit our office with ID and proof of residence."

Note: "Customer Service: 956-555-1234" appears in both for context continuity
```

### Step 5: Deduplication

**Purpose**: Remove duplicate content across pages  
**Method**: MinHash + Locality-Sensitive Hashing (LSH)  

```typescript
import { MinHash, LSH } from 'minhash-lsh';

const lsh = new LSH({
  numberOfHashFunctions: 128,
  threshold: 0.8,  // 80% similarity = duplicate
});

async function deduplicateChunks(chunks: Chunk[]) {
  const unique: Chunk[] = [];
  const duplicates: Map<string, string[]> = new Map();
  
  for (const chunk of chunks) {
    const minhash = new MinHash();
    const tokens = chunk.content.split(/\s+/);
    tokens.forEach(token => minhash.update(token));
    
    const existingDuplicate = lsh.query(minhash);
    
    if (existingDuplicate.length === 0) {
      // New unique chunk
      lsh.insert(chunk.id, minhash);
      unique.push(chunk);
    } else {
      // Duplicate found - keep reference
      duplicates.set(chunk.id, existingDuplicate);
    }
  }
  
  return { unique, duplicates };
}
```

### Step 6: Content Enrichment

**Purpose**: Add contextual information for better retrieval  
**Operations**:

```typescript
function enrichChunk(chunk: Chunk, pageMetadata: PageMetadata): EnrichedChunk {
  return {
    ...chunk,
    
    // Add breadcrumb context
    breadcrumb: generateBreadcrumb(chunk.url),
    
    // Extract entities (departments, services, addresses)
    entities: extractEntities(chunk.content),
    
    // Add question variations (for better matching)
    syntheticQuestions: generateQuestions(chunk.content),
    
    // Add search keywords
    keywords: extractKeywords(chunk.content),
    
    // Enhance metadata
    metadata: {
      ...pageMetadata,
      wordCount: chunk.content.split(/\s+/).length,
      hasContactInfo: /\d{3}-\d{3}-\d{4}/.test(chunk.content),
      hasAddress: /\d+\s+\w+\s+(Street|Ave|Road|Blvd)/i.test(chunk.content),
    },
  };
}

function generateBreadcrumb(url: string): string {
  const path = new URL(url).pathname.split('/').filter(Boolean);
  return ['Home', ...path.map(capitalize)].join(' > ');
}

function extractEntities(content: string): string[] {
  // Simple regex-based extraction (can enhance with NLP in Phase 2)
  const entities = new Set<string>();
  
  // Departments
  const deptMatches = content.match(/\b(Department of|Office of) [\w\s]+/g);
  deptMatches?.forEach(m => entities.add(m));
  
  // Phone numbers
  const phoneMatches = content.match(/\d{3}-\d{3}-\d{4}/g);
  phoneMatches?.forEach(m => entities.add(m));
  
  // Email addresses
  const emailMatches = content.match(/[\w.+-]+@harlingentx\.gov/g);
  emailMatches?.forEach(m => entities.add(m));
  
  return Array.from(entities);
}

function generateQuestions(content: string): string[] {
  // Generate synthetic questions that this chunk might answer
  // This helps with retrieval when user questions don't match exact wording
  
  const questions: string[] = [];
  
  // Pattern 1: If content mentions a service, generate "how to" question
  if (/trash|garbage|waste/i.test(content)) {
    questions.push('How do I schedule trash pickup?');
  }
  
  if (/water|utility|bill/i.test(content)) {
    questions.push('How do I pay my water bill?');
  }
  
  // Pattern 2: If content has contact info, generate contact question
  if (/\d{3}-\d{3}-\d{4}/.test(content)) {
    questions.push('What is the contact number?');
  }
  
  // More patterns can be added based on common citizen questions
  
  return questions;
}
```

---

## Data Schema & Structure

### Document Schema

```typescript
interface Document {
  // Identifiers
  id: string;                    // UUID
  url: string;                   // Source URL
  urlHash: string;               // MD5 hash for quick lookup
  
  // Content
  title: string;
  content: string;               // Full page content
  chunks: Chunk[];               // Split chunks
  
  // Metadata
  metadata: PageMetadata;
  
  // Timestamps
  scrapedAt: Date;
  lastUpdated: Date;
  
  // Processing info
  processed: boolean;
  embeddingsGenerated: boolean;
}

interface Chunk {
  id: string;                    // document_id#chunk-0
  documentId: string;            // Parent document
  content: string;               // Chunk text
  chunkIndex: number;            // Position in document
  totalChunks: number;           // Total chunks in document
  
  // Enriched data
  breadcrumb: string;
  entities: string[];
  syntheticQuestions: string[];
  keywords: string[];
  
  // Vector representation
  embedding: number[];           // 384-dim vector (MiniLM)
  embeddingModel: string;        // "all-MiniLM-L6-v2"
  
  // Metadata (inherited + chunk-specific)
  metadata: ChunkMetadata;
}

interface PageMetadata {
  department?: string;
  service?: string;
  category: string;              // e.g., "services", "residents"
  tags: string[];
  language: 'en' | 'es';
  lastUpdated?: string;
  wordCount: number;
  hasContactInfo: boolean;
  hasAddress: boolean;
}

interface ChunkMetadata extends PageMetadata {
  sourceUrl: string;
  sourceTitle: string;
  chunkPosition: 'start' | 'middle' | 'end';
}
```

### Storage Format (JSON for Prototype)

**Directory Structure**:
```
data/
├── raw/
│   └── documents.json          # Scraped raw HTML
├── processed/
│   ├── documents.json          # Cleaned documents
│   └── chunks.json             # Chunked content
├── embeddings/
│   └── vectors.json            # Embeddings + metadata
└── index/
    └── chroma_db/              # ChromaDB files
```

**documents.json**:
```json
[
  {
    "id": "abc123",
    "url": "https://www.harlingentx.gov/services/utilities/water",
    "title": "Water Service",
    "content": "The City of Harlingen provides...",
    "metadata": {
      "department": "Utilities",
      "category": "services",
      "language": "en",
      "scrapedAt": "2025-01-17T10:30:00Z"
    }
  }
]
```

**chunks.json**:
```json
[
  {
    "id": "abc123#chunk-0",
    "documentId": "abc123",
    "content": "The City of Harlingen provides water service...",
    "chunkIndex": 0,
    "totalChunks": 3,
    "breadcrumb": "Home > Services > Utilities > Water",
    "entities": ["Water Department", "956-555-1234"],
    "keywords": ["water", "billing", "service"],
    "metadata": {
      "sourceUrl": "https://www.harlingentx.gov/services/utilities/water",
      "sourceTitle": "Water Service",
      "category": "services",
      "language": "en"
    }
  }
]
```

---

## Embedding Strategy

### Embedding Model Selection

**Chosen Model**: `all-MiniLM-L6-v2` (sentence-transformers)

**Specifications**:
- Dimensions: 384
- Max sequence length: 256 words (~512 characters)
- Performance: ~100 docs/sec on CPU
- Multilingual: Yes (English + Spanish)
- Model size: 80MB

**Why This Model?**
✅ Fast CPU inference (no GPU needed for prototype)  
✅ Good quality for semantic similarity  
✅ Handles Spanish well (trained on multilingual data)  
✅ Small size (easy deployment)  
✅ Widely used and proven

**Alternatives for Phase 2**:
- `multilingual-e5-large`: Better quality, slower (768 dims)
- `paraphrase-multilingual-mpnet-base-v2`: Good balance
- Custom fine-tuned model: Trained on city-specific data

### Embedding Generation Process

```typescript
import { pipeline } from '@xenova/transformers';

// Load embedding model (runs in Node.js)
const embedder = await pipeline(
  'feature-extraction',
  'Xenova/all-MiniLM-L6-v2'
);

async function generateEmbedding(text: string): Promise<number[]> {
  // Truncate if needed (512 chars ≈ 256 words)
  const truncated = text.slice(0, 512);
  
  // Generate embedding
  const output = await embedder(truncated, {
    pooling: 'mean',      // Mean pooling of token embeddings
    normalize: true,      // L2 normalization
  });
  
  // Extract and return vector
  return Array.from(output.data);
}

async function batchGenerateEmbeddings(chunks: Chunk[]): Promise<Chunk[]> {
  console.log(`Generating embeddings for ${chunks.length} chunks...`);
  
  const batchSize = 32;
  const enrichedChunks: Chunk[] = [];
  
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const texts = batch.map(c => c.content);
    
    // Batch processing for efficiency
    const embeddings = await Promise.all(
      texts.map(text => generateEmbedding(text))
    );
    
    // Attach embeddings to chunks
    batch.forEach((chunk, idx) => {
      enrichedChunks.push({
        ...chunk,
        embedding: embeddings[idx],
        embeddingModel: 'all-MiniLM-L6-v2',
      });
    });
    
    console.log(`Progress: ${i + batch.length}/${chunks.length}`);
  }
  
  return enrichedChunks;
}
```

### Embedding Quality Assurance

**Validation Tests**:
```typescript
async function validateEmbeddings() {
  // Test 1: Similar content should have high cosine similarity
  const text1 = "How do I pay my water bill?";
  const text2 = "What are the options for paying my utility bill?";
  
  const emb1 = await generateEmbedding(text1);
  const emb2 = await generateEmbedding(text2);
  
  const similarity = cosineSimilarity(emb1, emb2);
  console.assert(similarity > 0.7, "Similar questions should have >0.7 similarity");
  
  // Test 2: Unrelated content should have low similarity
  const text3 = "When is the city council meeting?";
  const emb3 = await generateEmbedding(text3);
  
  const dissimilarity = cosineSimilarity(emb1, emb3);
  console.assert(dissimilarity < 0.5, "Unrelated questions should have <0.5 similarity");
  
  // Test 3: Bilingual - semantically equivalent should be similar
  const textEn = "Trash collection is on Mondays";
  const textEs = "La recolección de basura es los lunes";
  
  const embEn = await generateEmbedding(textEn);
  const embEs = await generateEmbedding(textEs);
  
  const bilingualSimilarity = cosineSimilarity(embEn, embEs);
  console.assert(bilingualSimilarity > 0.6, "Bilingual equivalent should have >0.6 similarity");
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
```

---

## Vector Database Implementation

### Prototype: ChromaDB (Embedded Mode)

**Installation**:
```bash
npm install chromadb
```

**Setup**:
```typescript
import { ChromaClient } from 'chromadb';

// Initialize client (embedded mode)
const client = new ChromaClient();

// Create collection
const collection = await client.createCollection({
  name: 'harlingen_city_content',
  metadata: {
    'hnsw:space': 'cosine',           // Similarity metric
    'hnsw:construction_ef': 200,      // Index build quality
    'hnsw:M': 16,                     // Index connectivity
  },
});

// Add documents
await collection.add({
  ids: chunks.map(c => c.id),
  embeddings: chunks.map(c => c.embedding),
  documents: chunks.map(c => c.content),
  metadatas: chunks.map(c => c.metadata),
});
```

**Query Example**:
```typescript
async function searchKnowledgeBase(query: string, k: number = 5) {
  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query);
  
  // Search vector database
  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: k,
    where: {
      // Optional: Filter by metadata
      language: 'en',  // or 'es' based on user query
    },
  });
  
  return results.documents[0].map((doc, i) => ({
    content: doc,
    metadata: results.metadatas[0][i],
    distance: results.distances[0][i],
    similarity: 1 - results.distances[0][i],  // Convert distance to similarity
  }));
}
```

### Production: Qdrant

**Why Qdrant for Production?**
- ✅ Better performance at scale (>100k vectors)
- ✅ Advanced filtering capabilities
- ✅ Built-in clustering support
- ✅ REST API for flexibility
- ✅ Persistent storage with backups

**Migration Plan**:
```typescript
import { QdrantClient } from '@qdrant/js-client-rest';

const qdrant = new QdrantClient({
  url: 'http://localhost:6333',
});

// Create collection
await qdrant.createCollection('harlingen_city_content', {
  vectors: {
    size: 384,
    distance: 'Cosine',
  },
  optimizers_config: {
    indexing_threshold: 10000,
  },
});

// Upsert points
await qdrant.upsert('harlingen_city_content', {
  points: chunks.map(chunk => ({
    id: chunk.id,
    vector: chunk.embedding,
    payload: {
      content: chunk.content,
      metadata: chunk.metadata,
    },
  })),
});
```

---

## RAG Architecture

### Query Processing Pipeline

```typescript
async function processUserQuery(
  userQuery: string,
  language: 'en' | 'es',
  conversationHistory: Message[] = []
) {
  // Step 1: Query understanding
  const processedQuery = await preprocessQuery(userQuery, language);
  
  // Step 2: Retrieval
  const relevantChunks = await retrieveRelevantContext(processedQuery);
  
  // Step 3: Reranking (optional but recommended)
  const rerankedChunks = await rerankChunks(processedQuery, relevantChunks);
  
  // Step 4: Context assembly
  const context = assembleContext(rerankedChunks, conversationHistory);
  
  // Step 5: Prompt construction
  const prompt = buildPrompt(processedQuery, context, language);
  
  // Step 6: LLM generation
  const response = await generateResponse(prompt);
  
  // Step 7: Post-processing
  const finalResponse = await postprocessResponse(response, language, rerankedChunks);
  
  return finalResponse;
}
```

### Step-by-Step Implementation

**Step 1: Query Preprocessing**
```typescript
async function preprocessQuery(query: string, language: 'en' | 'es') {
  // Normalize
  let processed = query.trim().toLowerCase();
  
  // Expand abbreviations
  processed = processed
    .replace(/\btx\b/g, 'Texas')
    .replace(/\bpw\b/g, 'Public Works')
    .replace(/\bpd\b/g, 'Police Department');
  
  // Translate to English if Spanish (for consistent embedding)
  if (language === 'es') {
    processed = await translateToEnglish(processed);
  }
  
  // Extract intent
  const intent = detectIntent(processed);
  
  return { processed, originalQuery: query, language, intent };
}

function detectIntent(query: string): string {
  if (/how (do|can) i/i.test(query)) return 'instruction';
  if (/what is|what are|where is/i.test(query)) return 'information';
  if (/when is|what time/i.test(query)) return 'schedule';
  if (/who is|who can/i.test(query)) return 'contact';
  return 'general';
}
```

**Step 2: Retrieval**
```typescript
async function retrieveRelevantContext(query: ProcessedQuery) {
  const { processed, language, intent } = query;
  
  // Generate query embedding
  const queryEmbedding = await generateEmbedding(processed);
  
  // Retrieve top-k chunks (higher k for reranking)
  const k = 20;  // Retrieve more, rerank later
  
  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: k,
    where: {
      // Filter by language if strict matching needed
      // language: language,  // Comment out for multilingual flexibility
    },
  });
  
  // Convert to standardized format
  return results.documents[0].map((doc, i) => ({
    content: doc,
    metadata: results.metadatas[0][i],
    score: 1 - results.distances[0][i],
    rank: i + 1,
  }));
}
```

**Step 3: Reranking** (Optional but Recommended)
```typescript
async function rerankChunks(query: ProcessedQuery, chunks: RetrievedChunk[]) {
  // Apply additional relevance scoring
  
  const reranked = chunks.map(chunk => {
    let score = chunk.score;
    
    // Boost if query intent matches chunk type
    if (query.intent === 'contact' && chunk.metadata.hasContactInfo) {
      score += 0.1;
    }
    
    // Boost if exact keyword match
    const queryWords = query.processed.split(/\s+/);
    const matchCount = queryWords.filter(w => 
      chunk.content.toLowerCase().includes(w)
    ).length;
    score += (matchCount / queryWords.length) * 0.2;
    
    // Penalize very short chunks
    if (chunk.content.length < 100) {
      score -= 0.1;
    }
    
    return { ...chunk, score };
  });
  
  // Re-sort by adjusted score
  return reranked.sort((a, b) => b.score - a.score);
}
```

**Step 4: Context Assembly**
```typescript
function assembleContext(
  chunks: RetrievedChunk[],
  conversationHistory: Message[]
) {
  // Take top 5 after reranking
  const topChunks = chunks.slice(0, 5);
  
  // Format context
  const contextSections = topChunks.map((chunk, i) => 
    `[Source ${i+1}: ${chunk.metadata.sourceTitle}]\n${chunk.content}`
  );
  
  // Add conversation history if relevant
  const recentHistory = conversationHistory.slice(-3);  // Last 3 exchanges
  
  return {
    sources: contextSections.join('\n\n---\n\n'),
    history: recentHistory,
    citations: topChunks.map(c => ({
      title: c.metadata.sourceTitle,
      url: c.metadata.sourceUrl,
    })),
  };
}
```

**Step 5: Prompt Construction**
```typescript
function buildPrompt(
  query: ProcessedQuery,
  context: AssembledContext,
  language: 'en' | 'es'
) {
  const systemPrompt = language === 'en' 
    ? `You are HarliBot, the official AI assistant for the City of Harlingen, Texas.
       Your role is to help residents find accurate information about city services.
       
       IMPORTANT RULES:
       - Only answer based on the provided context
       - If the answer isn't in the context, say so politely
       - Always cite your sources
       - Be helpful, professional, and concise
       - If asked in Spanish, respond in Spanish`
    : `Eres HarliBot, el asistente de IA oficial de la Ciudad de Harlingen, Texas.
       Tu función es ayudar a los residentes a encontrar información precisa sobre los servicios de la ciudad.
       
       REGLAS IMPORTANTES:
       - Solo responde basándote en el contexto proporcionado
       - Si la respuesta no está en el contexto, dilo cortésmente
       - Siempre cita tus fuentes
       - Sé útil, profesional y conciso`;
  
  const userPrompt = `
Context from City of Harlingen website:
${context.sources}

${context.history.length > 0 ? `
Recent conversation:
${context.history.map(m => `${m.role}: ${m.content}`).join('\n')}
` : ''}

User question: ${query.originalQuery}

Please provide a helpful answer based on the context above. If the information isn't available in the context, let the user know politely.
`;

  return {
    system: systemPrompt,
    user: userPrompt,
    citations: context.citations,
  };
}
```

---

## Bilingual Content Handling

### Strategy

**Approach**: Language-agnostic embeddings + bilingual LLM

**Key Principles**:
1. **Single Index**: Both EN and ES content in same vector database
2. **Multilingual Embeddings**: Model handles both languages
3. **Flexible Retrieval**: Can match EN query → ES content and vice versa
4. **Language Preservation**: Return results in requested language

### Translation Layer (Optional)

For prototype, we rely on multilingual model. For production, consider:

```typescript
// Optional: Translation service for better quality
import { translate } from '@google-cloud/translate';

async function translateToEnglish(text: string): Promise<string> {
  // Only if Spanish detected and embeddings quality is poor
  const [translation] = await translate.translate(text, 'en');
  return translation;
}

async function translateToSpanish(text: string): Promise<string> {
  const [translation] = await translate.translate(text, 'es');
  return translation;
}
```

### Language Detection in Queries

```typescript
function detectQueryLanguage(query: string): 'en' | 'es' {
  // Simple heuristic (can use `franc` for better accuracy)
  const spanishWords = ['cómo', 'qué', 'cuándo', 'dónde', 'por qué', 'cuál'];
  const queryLower = query.toLowerCase();
  
  const hasSpanish = spanishWords.some(word => queryLower.includes(word));
  return hasSpanish ? 'es' : 'en';
}
```

---

## Update & Maintenance Strategy

### Scheduled Updates

**Frequency**: Weekly (Sundays at 2 AM)

**Automated Pipeline**:
```bash
#!/bin/bash
# update-knowledge-base.sh

# 1. Scrape website
echo "Starting web scrape..."
npm run scrape

# 2. Process new content
echo "Processing content..."
npm run process

# 3. Generate embeddings for new/updated pages
echo "Generating embeddings..."
npm run embed

# 4. Update vector database
echo "Updating index..."
npm run index

# 5. Validate updates
echo "Running validation..."
npm run validate

# 6. Send report
echo "Sending update report..."
npm run report

echo "Knowledge base update complete!"
```

**Cron Job**:
```cron
0 2 * * 0 /opt/harlibot/scripts/update-knowledge-base.sh >> /var/log/harlibot-update.log 2>&1
```

### Change Detection

```typescript
async function detectChanges() {
  // Fetch current page
  const currentContent = await scrape(url);
  
  // Load previous version
  const previousContent = await loadFromDB(url);
  
  // Compare
  const diff = computeDiff(previousContent, currentContent);
  
  if (diff.changed) {
    return {
      url,
      changeType: diff.changeType,  // 'minor' | 'major' | 'new' | 'deleted'
      needsReprocessing: diff.changeType !== 'minor',
    };
  }
  
  return { url, changed: false };
}

function computeDiff(old: string, current: string) {
  const similarity = calculateSimilarity(old, current);
  
  if (similarity > 0.95) return { changed: false };
  if (similarity > 0.8) return { changed: true, changeType: 'minor' };
  return { changed: true, changeType: 'major' };
}
```

### Manual Update Triggers

**Use Cases**:
- Emergency updates (e.g., hurricane closures)
- Major policy changes
- New department launches

**Implementation**:
```typescript
// API endpoint for manual trigger
// POST /api/admin/update-knowledge-base

export async function POST(req: Request) {
  const { urls, force } = await req.json();
  
  // Verify admin authentication
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) return new Response('Unauthorized', { status: 401 });
  
  // Trigger update for specific URLs
  const results = await updateSpecificPages(urls, force);
  
  return Response.json({ success: true, results });
}
```

---

## Quality Assurance

### Metrics to Track

**Coverage Metrics**:
- Total pages indexed
- Total chunks created
- Unique vs. duplicate content ratio

**Quality Metrics**:
- Average chunk size
- Embedding distribution (diversity check)
- Retrieval accuracy (manual spot checks)

**Performance Metrics**:
- Scraping time (pages/minute)
- Processing time (chunks/second)
- Embedding generation time
- Query latency

### Validation Tests

**Test Suite**:
```typescript
describe('Knowledge Base Quality', () => {
  test('All city departments are indexed', async () => {
    const departments = [
      'Public Works',
      'Police Department',
      'Fire Department',
      'Parks and Recreation',
      'Utilities',
    ];
    
    for (const dept of departments) {
      const results = await searchKnowledgeBase(dept);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].similarity).toBeGreaterThan(0.7);
    }
  });
  
  test('Bilingual content retrieval works', async () => {
    const queryEn = 'How do I pay my water bill?';
    const queryEs = '¿Cómo pago mi factura de agua?';
    
    const resultsEn = await searchKnowledgeBase(queryEn);
    const resultsEs = await searchKnowledgeBase(queryEs);
    
    // Both should return similar content
    expect(resultsEn[0].metadata.sourceUrl).toBe(resultsEs[0].metadata.sourceUrl);
  });
  
  test('Contact information is preserved', async () => {
    const query = 'What is the phone number for utilities?';
    const results = await searchKnowledgeBase(query);
    
    const hasPhoneNumber = results.some(r => 
      /\d{3}-\d{3}-\d{4}/.test(r.content)
    );
    
    expect(hasPhoneNumber).toBe(true);
  });
});
```

### Human Review Process

**Sampling Strategy**:
- Review 10 random chunks daily
- Review all new content weekly
- Review top 100 most-retrieved chunks monthly

**Review Checklist**:
- [ ] Content is accurate
- [ ] Source citation is correct
- [ ] No duplicate information
- [ ] Proper language detection
- [ ] Keywords are relevant
- [ ] No broken links

---

## Appendix: Sample Data

### Example Scraped Document

```json
{
  "id": "d1a2b3c4",
  "url": "https://www.harlingentx.gov/services/utilities/water",
  "title": "Water Service | City of Harlingen",
  "content": "The City of Harlingen provides water service to all residents and businesses within city limits. Our water treatment facility ensures safe, clean drinking water.\n\nBilling Information:\nWater bills are sent monthly. You can pay online, by phone, or in person at City Hall.\n\nCustomer Service:\nFor questions about your water service, call 956-555-WATER (9283) or email water@harlingentx.gov.\n\nNew Service Setup:\nTo establish new water service, visit our office with a valid ID and proof of residence.",
  "metadata": {
    "department": "Utilities Department",
    "category": "services",
    "subcategory": "utilities",
    "language": "en",
    "lastUpdated": "2025-01-10",
    "scrapedAt": "2025-01-17T10:30:00Z"
  }
}
```

### Example Processed Chunks

```json
[
  {
    "id": "d1a2b3c4#chunk-0",
    "documentId": "d1a2b3c4",
    "content": "The City of Harlingen provides water service to all residents and businesses within city limits. Our water treatment facility ensures safe, clean drinking water.\n\nBilling Information:\nWater bills are sent monthly.",
    "chunkIndex": 0,
    "totalChunks": 2,
    "breadcrumb": "Home > Services > Utilities > Water",
    "entities": ["City of Harlingen", "Utilities Department"],
    "keywords": ["water", "service", "billing", "residents"],
    "syntheticQuestions": [
      "How do I get water service?",
      "When are water bills sent?"
    ],
    "embedding": [0.123, 0.456, ...],
    "embeddingModel": "all-MiniLM-L6-v2",
    "metadata": {
      "sourceUrl": "https://www.harlingentx.gov/services/utilities/water",
      "sourceTitle": "Water Service | City of Harlingen",
      "department": "Utilities Department",
      "category": "services",
      "language": "en",
      "hasContactInfo": false
    }
  },
  {
    "id": "d1a2b3c4#chunk-1",
    "documentId": "d1a2b3c4",
    "content": "You can pay online, by phone, or in person at City Hall.\n\nCustomer Service:\nFor questions about your water service, call 956-555-WATER (9283) or email water@harlingentx.gov.\n\nNew Service Setup:\nTo establish new water service, visit our office with a valid ID and proof of residence.",
    "chunkIndex": 1,
    "totalChunks": 2,
    "breadcrumb": "Home > Services > Utilities > Water",
    "entities": ["956-555-9283", "water@harlingentx.gov", "City Hall"],
    "keywords": ["pay", "contact", "phone", "email", "setup"],
    "syntheticQuestions": [
      "How do I pay my water bill?",
      "What is the water department phone number?",
      "How do I set up new water service?"
    ],
    "embedding": [0.789, 0.012, ...],
    "embeddingModel": "all-MiniLM-L6-v2",
    "metadata": {
      "sourceUrl": "https://www.harlingentx.gov/services/utilities/water",
      "sourceTitle": "Water Service | City of Harlingen",
      "department": "Utilities Department",
      "category": "services",
      "language": "en",
      "hasContactInfo": true,
      "hasAddress": true
    }
  }
]
```

---

## Conclusion

This knowledge base strategy provides a comprehensive, maintainable foundation for HarliBot. By carefully scraping, processing, and indexing all harlingentx.gov content, we ensure the chatbot can accurately answer citizen questions with proper source attribution.

**Key Strengths**:
1. ✅ Comprehensive coverage of city website
2. ✅ Bilingual support from the ground up
3. ✅ High-quality embeddings for accurate retrieval
4. ✅ Automated update pipeline for freshness
5. ✅ Structured approach to maintenance and QA

**Next Steps**:
1. Execute scraping pipeline
2. Generate and validate embeddings
3. Build vector index
4. Integrate with chatbot API
5. Test retrieval accuracy with sample queries

---

**Document Version**: 1.0  
**Last Updated**: January 17, 2025  
**Next Review**: Post-prototype delivery
