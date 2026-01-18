# HarliBot Technical Architecture Document
## System Design & Implementation Strategy

**Project**: HarliBot - City of Harlingen AI Chatbot  
**Version**: 1.0  
**Date**: January 17, 2025  
**Author**: Jonathan Rocha

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [System Components](#system-components)
3. [Technology Stack](#technology-stack)
4. [Data Flow](#data-flow)
5. [AI/ML Strategy](#aiml-strategy)
6. [Prototype vs Production Architecture](#prototype-vs-production-architecture)
7. [Migration Strategy](#migration-strategy)
8. [Security & Privacy](#security--privacy)
9. [Performance Considerations](#performance-considerations)
10. [Scalability & Maintenance](#scalability--maintenance)

---

## Architecture Overview

### Design Principles

1. **Modularity**: Components are decoupled and can be swapped independently
2. **Local-First**: Minimize external dependencies, prioritize self-hosted solutions
3. **Bilingual-Native**: Spanish and English support baked into every layer
4. **Progressive Enhancement**: Start simple, add complexity as needed
5. **City-Owned Infrastructure**: Path to full control and zero vendor lock-in

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     User Browser                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         harlingentx.gov (Demo Site)                    │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │     HarliBot Chat Widget (Embedded)              │  │ │
│  │  │  - Message Input/Output                          │  │ │
│  │  │  - Language Toggle (EN/ES)                       │  │ │
│  │  │  - Conversation History                          │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                 Next.js Application Server                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Frontend Layer (React)                    │ │
│  │  - Page Components                                     │ │
│  │  - Chat UI Components                                  │ │
│  │  - State Management (React Context)                    │ │
│  │  - i18n Provider (Bilingual)                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              API Routes (Backend)                      │ │
│  │  - POST /api/chat                                      │ │
│  │  - GET /api/health                                     │ │
│  │  - POST /api/feedback                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   AI Processing Layer                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         RAG Orchestrator (LangChain)                   │ │
│  │  1. Query Processing                                   │ │
│  │  2. Embedding Generation                               │ │
│  │  3. Vector Search                                      │ │
│  │  4. Context Assembly                                   │ │
│  │  5. LLM Inference                                      │ │
│  │  6. Response Formatting                                │ │
│  └────────────────────────────────────────────────────────┘ │
│                     ↓              ↓                         │
│  ┌─────────────────────┐  ┌──────────────────────────────┐ │
│  │  Vector Database    │  │   LLM Inference Engine       │ │
│  │  (ChromaDB/FAISS)   │  │   (Ollama Local)             │ │
│  │  - City content     │  │   - Llama 3.2 3B (Prototype) │ │
│  │  - Embeddings       │  │   - Llama 3.1 8B (Prod)      │ │
│  │  - Metadata         │  │   - Fine-tuned on city data  │ │
│  └─────────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↑
┌─────────────────────────────────────────────────────────────┐
│              Knowledge Base Pipeline                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  1. Web Scraper → 2. Content Processor →              │ │
│  │  3. Chunking → 4. Embedding → 5. Vector Storage       │ │
│  └────────────────────────────────────────────────────────┘ │
│  Source: harlingentx.gov (crawled and indexed)              │
└─────────────────────────────────────────────────────────────┘
```

---

## System Components

### 1. Frontend Layer

#### 1.1 Main Website (Demo)
**Technology**: Next.js 14 with App Router  
**Purpose**: Replicate harlingentx.gov for demonstration  
**Components**:
- `app/layout.tsx` - Root layout with bilingual support
- `app/page.tsx` - Homepage mirroring city site
- `components/Header.tsx` - Navigation bar
- `components/Footer.tsx` - Footer with city information
- `components/LanguageToggle.tsx` - EN/ES switcher

#### 1.2 Chat Widget
**Technology**: React with TypeScript  
**Purpose**: Embedded chatbot interface  
**Key Features**:
- Fixed position (bottom-right corner)
- Collapsible/expandable
- Message history with local storage
- Typing indicators
- Error handling with user-friendly messages

**Components**:
```
components/ChatWidget/
├── ChatWidget.tsx          # Main container component
├── ChatToggleButton.tsx    # Minimized state button
├── ChatWindow.tsx          # Expanded chat interface
├── MessageList.tsx         # Scrollable message history
├── Message.tsx             # Individual message bubble
├── MessageInput.tsx        # Text input with send button
└── TypingIndicator.tsx     # "Bot is typing..." animation
```

#### 1.3 State Management
**Technology**: React Context API + useReducer  
**Purpose**: Manage chat state without external dependencies  
**State Structure**:
```typescript
interface ChatState {
  messages: Message[];
  isOpen: boolean;
  isTyping: boolean;
  language: 'en' | 'es';
  error: string | null;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  language: 'en' | 'es';
}
```

#### 1.4 Internationalization (i18n)
**Technology**: next-i18next  
**Purpose**: Bilingual UI and content  
**Implementation**:
- Language detection from browser
- Toggle between EN/ES
- Translated UI strings
- Locale-specific formatting (dates, numbers)

**File Structure**:
```
public/locales/
├── en/
│   ├── common.json       # UI strings
│   └── chatbot.json      # Chatbot-specific text
└── es/
    ├── common.json
    └── chatbot.json
```

---

### 2. Backend Layer (Next.js API Routes)

#### 2.1 Chat Endpoint
**Route**: `POST /api/chat`  
**Purpose**: Process user messages and return bot responses  
**Input**:
```typescript
{
  message: string;
  language: 'en' | 'es';
  conversationHistory?: Message[];
}
```
**Output**:
```typescript
{
  response: string;
  sources?: string[];      // URLs of referenced city pages
  confidence?: number;     // 0-1 score
  timestamp: string;
}
```

**Processing Flow**:
1. Validate and sanitize input
2. Translate to English if Spanish (for embedding consistency)
3. Generate embedding for user query
4. Retrieve relevant context from vector DB
5. Construct prompt with context
6. Call LLM for inference
7. Translate response to Spanish if needed
8. Return formatted response

#### 2.2 Health Check Endpoint
**Route**: `GET /api/health`  
**Purpose**: Monitor system status  
**Returns**:
```typescript
{
  status: 'healthy' | 'degraded' | 'down';
  components: {
    vectorDB: 'up' | 'down';
    llm: 'up' | 'down';
    scraper: 'up' | 'down';
  };
  uptime: number;
  version: string;
}
```

#### 2.3 Feedback Endpoint
**Route**: `POST /api/feedback`  
**Purpose**: Collect user feedback for improvement  
**Input**:
```typescript
{
  messageId: string;
  rating: 'helpful' | 'not_helpful';
  comment?: string;
}
```

---

### 3. AI/ML Processing Layer

#### 3.1 RAG Orchestrator
**Technology**: LangChain  
**Purpose**: Coordinate retrieval-augmented generation pipeline  

**Pipeline Steps**:

**Step 1: Query Processing**
```python
# Normalize and clean user input
# Detect intent (greeting, question, command)
# Extract entities (dates, departments, services)
```

**Step 2: Embedding Generation**
```python
# Use sentence-transformers (all-MiniLM-L6-v2)
# Generate 384-dimensional vector
# Cache frequently asked questions
```

**Step 3: Vector Search**
```python
# Query ChromaDB/FAISS with embedding
# Retrieve top-k most similar chunks (k=5)
# Apply relevance threshold (>0.7 similarity)
```

**Step 4: Context Assembly**
```python
# Combine retrieved chunks
# Add metadata (source URLs, dates)
# Format for LLM prompt template
```

**Step 5: LLM Inference**
```python
# Build prompt with system instructions + context + query
# Call Ollama API (local inference)
# Stream response tokens
```

**Step 6: Response Formatting**
```python
# Extract answer from LLM output
# Add source citations
# Translate if Spanish requested
# Format with markdown if needed
```

#### 3.2 Embedding Model
**Model**: `all-MiniLM-L6-v2` (sentence-transformers)  
**Rationale**:
- Fast inference (local CPU)
- Multilingual support (includes Spanish)
- 384 dimensions (efficient storage)
- SOTA performance for semantic similarity

**Alternatives Considered**:
- `multilingual-e5-large`: Better quality, slower
- `paraphrase-multilingual-mpnet-base-v2`: Good balance
- Decision: Start with MiniLM, upgrade if needed

#### 3.3 Vector Database
**Prototype**: ChromaDB (embedded mode)  
**Production**: Qdrant or PostgreSQL + pgvector  

**Schema**:
```python
{
  "id": "uuid",
  "embedding": [0.123, 0.456, ...],  # 384-dim vector
  "content": "text chunk",
  "metadata": {
    "source_url": "https://harlingentx.gov/...",
    "page_title": "...",
    "section": "...",
    "last_updated": "2025-01-15",
    "language": "en" | "es"
  }
}
```

**Indexing Strategy**:
- HNSW algorithm for fast ANN search
- Cosine similarity metric
- Batch insertion for performance

#### 3.4 LLM Inference Engine
**Technology**: Ollama (local LLM runtime)  
**Prototype Model**: Llama 3.2 3B Instruct  
**Production Model**: Llama 3.1 8B Instruct (fine-tuned)  

**Why Ollama?**
- ✅ No external API dependencies
- ✅ City maintains full control
- ✅ No per-token costs
- ✅ Privacy-preserving (data never leaves city servers)
- ✅ Easy deployment and updates
- ✅ CPU-friendly inference (no GPU required for small models)

**Model Configuration**:
```bash
# Ollama modelfile
FROM llama3.2:3b-instruct

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER repeat_penalty 1.1
PARAMETER num_ctx 4096

SYSTEM """
You are HarliBot, the official AI assistant for the City of Harlingen, Texas.
Your role is to help residents find information about city services, departments,
events, and resources. Always be helpful, accurate, and professional.

When you don't know an answer, say so - don't make up information.
Always cite your sources when possible.
Respond in the same language as the question (English or Spanish).
"""
```

**Inference Parameters**:
- Temperature: 0.7 (balanced creativity/consistency)
- Max tokens: 512 (concise responses)
- Top-p: 0.9 (nucleus sampling)
- Streaming: Enabled (better UX)

---

### 4. Knowledge Base Pipeline

#### 4.1 Web Scraper
**Technology**: Python (Beautiful Soup 4 + Scrapy)  
**Purpose**: Extract content from harlingentx.gov  

**Scraping Strategy**:
```python
# scraper.py
import scrapy
from bs4 import BeautifulSoup

class HarlingenSpider(scrapy.Spider):
    name = 'harlingen'
    allowed_domains = ['harlingentx.gov']
    start_urls = ['https://www.harlingentx.gov/']
    
    # Respect robots.txt
    # Rate limit: 1 req/second
    # Max depth: 4 levels
    # Focus on: /departments, /services, /residents, /government
```

**Content Extraction**:
- Main content area (strip navigation, ads, footers)
- Page title and headings
- Metadata (last modified, department)
- Links (for citation)
- Ignore: Images, PDFs (for prototype)

**Output Format**:
```json
{
  "url": "https://www.harlingentx.gov/...",
  "title": "Page Title",
  "content": "Full text content...",
  "metadata": {
    "department": "Public Works",
    "last_updated": "2025-01-15",
    "language": "en"
  },
  "links": ["https://..."]
}
```

#### 4.2 Content Processor
**Technology**: Python (NLTK, spaCy)  
**Purpose**: Clean and normalize scraped content  

**Processing Steps**:
1. **HTML Cleanup**: Remove tags, scripts, styles
2. **Text Normalization**: Fix encoding, whitespace, special chars
3. **Language Detection**: Auto-detect EN vs ES content
4. **Entity Recognition**: Extract city departments, services, addresses
5. **Duplicate Detection**: Remove redundant content

#### 4.3 Chunking Strategy
**Purpose**: Split documents into semantically meaningful units  
**Method**: Recursive character splitting with overlap  

**Parameters**:
```python
chunk_size = 512  # tokens (~2048 characters)
chunk_overlap = 128  # tokens for context continuity
separators = ["\n\n", "\n", ". ", " "]  # Hierarchical splitting
```

**Rationale**:
- 512 tokens balances specificity vs. context
- Overlap prevents information loss at boundaries
- Hierarchical splitting respects document structure

**Example**:
```
Document: "The City of Harlingen offers many services. \n\n
           Water Service: Contact 956-555-1234. \n
           Trash Collection: Mondays and Thursdays."

Chunk 1: "The City of Harlingen offers many services. \n\n
          Water Service: Contact 956-555-1234."

Chunk 2: "Water Service: Contact 956-555-1234. \n
          Trash Collection: Mondays and Thursdays."
          (Note overlap with "Water Service" for context)
```

#### 4.4 Embedding Generation
**Technology**: sentence-transformers (Python)  
**Model**: all-MiniLM-L6-v2  
**Batch Processing**: 32 chunks at a time for efficiency  

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(chunks, batch_size=32, show_progress_bar=True)
```

#### 4.5 Vector Storage & Indexing
**Database**: ChromaDB (embedded)  
**Collection**: `harlingen_city_content`  
**Index Type**: HNSW (Hierarchical Navigable Small World)  

```python
import chromadb

client = chromadb.PersistentClient(path="./chroma_db")
collection = client.create_collection(
    name="harlingen_city_content",
    metadata={"hnsw:space": "cosine"}
)

# Add documents
collection.add(
    embeddings=embeddings,
    documents=chunks,
    metadatas=metadata,
    ids=ids
)
```

---

## Technology Stack

### Frontend Stack

| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| Framework | Next.js | 14.x | SSR, API routes, optimal React DX |
| Language | TypeScript | 5.x | Type safety, better maintainability |
| Styling | Tailwind CSS | 3.x | Rapid development, utility-first |
| UI Components | Headless UI | 1.x | Accessible, unstyled components |
| Icons | Heroicons | 2.x | Official Tailwind icons |
| i18n | next-i18next | 15.x | Best-in-class Next.js i18n |
| State | React Context | - | Built-in, no external deps |
| Forms | React Hook Form | 7.x | Performance, validation |

### Backend Stack (Prototype)

| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| Runtime | Node.js | 20 LTS | Stable, long-term support |
| Language | TypeScript | 5.x | Type safety across stack |
| API Framework | Next.js API Routes | 14.x | Seamless frontend integration |
| Validation | Zod | 3.x | TypeScript-first schema validation |

### AI/ML Stack

| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| LLM Runtime | Ollama | 0.1.x | Local inference, easy deployment |
| LLM Model (Prototype) | Llama 3.2 3B | - | Fast, CPU-friendly, instruction-tuned |
| LLM Model (Production) | Llama 3.1 8B | - | Better quality, fine-tunable |
| RAG Framework | LangChain.js | 0.1.x | JavaScript RAG orchestration |
| Embeddings | all-MiniLM-L6-v2 | - | Fast, multilingual, effective |
| Vector DB (Prototype) | ChromaDB | 0.4.x | Embedded mode, easy setup |
| Vector DB (Production) | Qdrant | 1.x | Production-grade, scalable |

### Data Pipeline Stack

| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| Web Scraping | Crawlee | 3.x | Modern Node.js scraping framework |
| HTML Parsing | Cheerio | 1.x | jQuery-like API, fast |
| Text Processing | compromise | 14.x | NLP for JavaScript |
| Chunking | LangChain Text Splitters | - | Semantic-aware splitting |

### Development & Deployment

| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| Version Control | Git + GitHub | - | Industry standard |
| Package Manager | pnpm | 8.x | Fast, disk-efficient |
| Linting | ESLint | 8.x | Code quality |
| Formatting | Prettier | 3.x | Consistent style |
| Testing | Vitest | 1.x | Fast, Vite-powered |
| CI/CD | GitHub Actions | - | Integrated with repo |
| Hosting (Prototype) | GitHub Pages | - | Free, simple |
| Hosting (Production) | Vercel / Self-hosted | - | Flexible deployment |
| Containerization | Docker | 24.x | Consistent environments |

---

## Data Flow

### User Query Flow

```
1. User types message in chat widget
   ↓
2. Frontend validates & sends to /api/chat
   ↓
3. API route receives request
   ↓
4. RAG orchestrator processes query:
   a. Generate embedding
   b. Search vector DB
   c. Retrieve relevant chunks
   d. Assemble context
   ↓
5. LLM inference (Ollama):
   a. Build prompt with context
   b. Generate response
   c. Stream tokens back
   ↓
6. Post-processing:
   a. Extract sources
   b. Translate if Spanish
   c. Format response
   ↓
7. Return to frontend
   ↓
8. Display in chat widget
```

### Knowledge Base Update Flow

```
1. Scraper runs (scheduled job)
   ↓
2. Fetch pages from harlingentx.gov
   ↓
3. Extract and clean content
   ↓
4. Detect changes (diff with existing)
   ↓
5. Process new/updated content:
   a. Chunk text
   b. Generate embeddings
   c. Store in vector DB
   ↓
6. Update index
   ↓
7. Log changes for audit
```

---

## AI/ML Strategy

### The "In-Between" Solution

**Challenge**: Avoid third-party APIs but need quick prototype  
**Solution**: Local-first architecture from day one  

**Prototype Configuration**:
```
┌─────────────────────────────────────┐
│   Ollama (Local Runtime)            │
│   Model: Llama 3.2 3B Instruct      │
│   Inference: CPU (MacBook/Desktop)  │
│   Speed: ~10-15 tokens/sec          │
│   Memory: ~4GB RAM                  │
└─────────────────────────────────────┘
         +
┌─────────────────────────────────────┐
│   ChromaDB (Embedded Vector DB)     │
│   Mode: In-memory + disk persist    │
│   Size: ~100MB for full site        │
└─────────────────────────────────────┘
         +
┌─────────────────────────────────────┐
│   sentence-transformers              │
│   Model: all-MiniLM-L6-v2           │
│   Inference: CPU                     │
│   Speed: ~100 docs/sec               │
└─────────────────────────────────────┘
```

**Why This Works**:
- ✅ No API keys or external services
- ✅ Runs on laptop for demo
- ✅ Instant setup (ollama pull llama3.2:3b)
- ✅ Same architecture as production
- ✅ Demonstrates city-owned approach

**Limitations (Acknowledged in Proposal)**:
- Slower than GPT-4 (acceptable for city use case)
- Less sophisticated reasoning (fine for FAQ/info retrieval)
- Requires local compute (city has servers)

---

## Prototype vs Production Architecture

### Prototype (Phase 1)

**Deployment**: Developer laptop → GitHub Pages  
**LLM**: Ollama + Llama 3.2 3B (pre-trained)  
**Vector DB**: ChromaDB (embedded, in-memory)  
**Hosting**: Static export on GitHub Pages  
**Scale**: Demo only, 1-10 concurrent users  
**Cost**: $0

**Constraints**:
- No server-side rendering on GitHub Pages
- Static export for frontend
- API routes need workaround (serverless functions or local dev server for demo)

**Workaround for Demo**:
```
Option A: Run local dev server during demo
  - Show live on localhost
  - Screen share or deploy to Vercel for live URL

Option B: Pre-generate responses
  - Create FAQ with canned responses
  - Simulate AI for common questions
  - Note: Less impressive, not recommended

Option C: Deploy to Vercel Free Tier
  - Full SSR + API routes
  - Same production-like experience
  - Free tier sufficient for demo
  
RECOMMENDATION: Option C (Vercel for demo)
```

### Production (Phase 2)

**Deployment**: City server or cloud VPS  
**LLM**: Ollama + Llama 3.1 8B (fine-tuned on city data)  
**Vector DB**: Qdrant (dedicated instance)  
**Hosting**: Docker containers on city infrastructure  
**Scale**: 100-500 concurrent users  
**Cost**: ~$500-1,500/year (hosting only)

**Infrastructure Requirements**:
- **CPU**: 8+ cores (for LLM inference)
- **RAM**: 16GB+ (8GB for model, 4GB for DB, 4GB OS)
- **Storage**: 50GB SSD (model + vectors + OS)
- **Network**: Standard broadband (1Gbps not required)

**Deployment Architecture**:
```
┌───────────────────────────────────────┐
│  Nginx (Reverse Proxy)                │
│  - SSL termination                    │
│  - Load balancing                     │
│  - Rate limiting                      │
└───────────────────────────────────────┘
              ↓
┌───────────────────────────────────────┐
│  Docker Compose Stack                 │
│  ┌─────────────────────────────────┐ │
│  │  Next.js Container              │ │
│  │  - Frontend + API routes        │ │
│  │  - Replicas: 2-3                │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │  Ollama Container               │ │
│  │  - LLM inference engine         │ │
│  │  - Model: Llama 3.1 8B          │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │  Qdrant Container               │ │
│  │  - Vector database              │ │
│  │  - Persistent volume            │ │
│  └─────────────────────────────────┘ │
└───────────────────────────────────────┘
```

---

## Migration Strategy

### Phase 1 → Phase 2 Transition

**Modular Architecture Enables Easy Swap**:

```typescript
// services/llm.ts (Abstraction Layer)

interface LLMProvider {
  generate(prompt: string, options?: GenerateOptions): Promise<string>;
  embed(text: string): Promise<number[]>;
}

// Prototype: Local Ollama
class OllamaProvider implements LLMProvider {
  async generate(prompt: string) {
    return fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      body: JSON.stringify({ model: 'llama3.2:3b', prompt })
    });
  }
}

// Production: City-hosted Ollama with fine-tuned model
class ProductionOllamaProvider implements LLMProvider {
  async generate(prompt: string) {
    return fetch('https://city-ai.harlingentx.gov/api/generate', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.AI_API_KEY}` },
      body: JSON.stringify({ model: 'llama3.1-harlingen-8b', prompt })
    });
  }
}

// Easy swap via environment variable
const llm: LLMProvider = process.env.NODE_ENV === 'production' 
  ? new ProductionOllamaProvider() 
  : new OllamaProvider();
```

### Fine-Tuning Process (Phase 2)

**Data Collection**:
1. Gather city-specific Q&A pairs
2. Create training set from:
   - Historical citizen inquiries
   - City employee FAQs
   - Departmental documentation
3. Format as instruction-tuning dataset

**Training**:
```bash
# Use Ollama's fine-tuning workflow
ollama create harlingen-llama3.1 -f ./Modelfile

# Modelfile
FROM llama3.1:8b
ADAPTER ./lora-adapters/harlingen-city.safetensors
PARAMETER temperature 0.7
SYSTEM "You are HarliBot, the official AI assistant..."
```

**Evaluation**:
- Test on held-out city questions
- Compare accuracy vs. base model
- Iterate until >90% accuracy on common queries

**Deployment**:
- Deploy fine-tuned model to city server
- Update environment variables
- Zero code changes required (thanks to abstraction layer)

---

## Security & Privacy

### Data Protection

**Principles**:
1. **Data Sovereignty**: All user data stays on city servers
2. **No External Transmission**: LLM inference happens locally
3. **Minimal Logging**: Log only what's necessary for debugging
4. **Anonymization**: Strip PII from feedback/analytics

**Implementation**:
```typescript
// Sanitize user input
function sanitizeInput(message: string): string {
  // Remove potential PII patterns
  const sanitized = message
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')  // SSN
    .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')  // Phone
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[EMAIL]');  // Email
  
  return sanitized;
}

// Logging policy
const logLevel = process.env.NODE_ENV === 'production' ? 'error' : 'debug';
// Never log full user messages in production
```

### Rate Limiting

**Purpose**: Prevent abuse and ensure fair usage  
**Implementation**:
```typescript
// API route: /api/chat
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 50,  // 50 requests per window
  message: 'Too many requests, please try again later.'
});

export default limiter(chatHandler);
```

### HTTPS & Authentication

**Prototype**: Not required (demo only)  
**Production**: 
- SSL/TLS encryption (Let's Encrypt)
- Optional: API key for advanced features
- Session management (if user accounts added)

---

## Performance Considerations

### Frontend Performance

**Optimization Techniques**:
1. **Code Splitting**: Lazy load chat widget
2. **Image Optimization**: Next.js Image component
3. **Caching**: Static assets cached at CDN
4. **Minification**: Automatic in production build

**Target Metrics**:
- First Contentful Paint (FCP): <1.5s
- Largest Contentful Paint (LCP): <2.5s
- Time to Interactive (TTI): <3.5s
- Chat widget load: <500ms

### Backend Performance

**LLM Inference**:
- Llama 3.2 3B: ~10-15 tokens/sec (CPU)
- Llama 3.1 8B: ~5-8 tokens/sec (CPU), ~40-60 tokens/sec (GPU)
- Streaming enabled for perceived speed

**Vector Search**:
- ChromaDB: <50ms for top-5 retrieval
- Qdrant: <20ms for top-5 retrieval
- Caching for frequent queries

**Response Time Targets**:
- P50: <2 seconds (median)
- P95: <5 seconds
- P99: <10 seconds

### Scalability

**Horizontal Scaling**:
- Next.js: Add more containers (stateless)
- Ollama: Add GPU nodes for faster inference
- Qdrant: Cluster mode for >1M vectors

**Vertical Scaling**:
- Increase RAM for larger models
- Add GPU for 10x inference speed
- NVMe SSD for faster vector I/O

---

## Scalability & Maintenance

### Monitoring & Observability

**Metrics to Track**:
1. **Usage**: Messages per day, unique users
2. **Performance**: Response time, token throughput
3. **Quality**: User feedback, accuracy rate
4. **Errors**: Failed queries, timeout rate

**Tools**:
- Logging: Winston or Pino (structured JSON logs)
- Monitoring: Prometheus + Grafana (optional)
- Alerting: Email/Slack notifications for errors

### Maintenance Plan

**Daily**:
- Monitor error logs
- Check system health endpoint

**Weekly**:
- Review user feedback
- Identify common unanswered questions

**Monthly**:
- Re-scrape harlingentx.gov for updates
- Retrain embeddings if significant content changes
- Performance optimization

**Quarterly**:
- Model evaluation (accuracy, speed)
- Consider fine-tuning updates
- Security audit

### Update Strategy

**Content Updates**:
```bash
# Automated script (cron job)
0 2 * * 0  # Every Sunday at 2 AM
cd /opt/harlibot
./scripts/update-knowledge-base.sh
```

**Model Updates**:
```bash
# Manual process (as needed)
ollama pull llama3.2:latest
ollama create harlingen-bot-v2 -f ./Modelfile
# Test in staging
# Deploy to production
```

**Code Updates**:
- GitHub Actions CI/CD pipeline
- Automated tests before deployment
- Blue-green deployment for zero downtime

---

## Appendix: Alternative Architectures Considered

### Option 1: Third-Party AI API (Rejected)
**Stack**: Next.js + OpenAI API  
**Pros**: Faster development, better quality  
**Cons**: Ongoing costs, vendor lock-in, data privacy concerns  
**Why Rejected**: City wants ownership and control

### Option 2: Fully Serverless (Rejected)
**Stack**: Next.js + AWS Lambda + Bedrock  
**Pros**: Auto-scaling, pay-per-use  
**Cons**: Complex pricing, still vendor-dependent  
**Why Rejected**: Doesn't align with city-owned goal

### Option 3: Custom Transformer from Scratch (Rejected)
**Stack**: PyTorch + Custom model training  
**Pros**: Complete control  
**Cons**: Months of development, requires ML expertise  
**Why Rejected**: Timeline too aggressive

### Selected: Local LLM with RAG (Chosen)
**Stack**: Next.js + Ollama + ChromaDB/Qdrant  
**Pros**: City-owned, cost-effective, proven approach  
**Cons**: Slightly slower than GPT-4 (acceptable)  
**Why Chosen**: Balances all requirements perfectly

---

## Conclusion

This architecture provides a clear path from prototype to production while maintaining the core principle of city ownership. The modular design allows for easy iteration and improvement, and the local-first approach ensures long-term cost savings and data sovereignty.

**Key Takeaways**:
1. ✅ No reliance on third-party AI APIs
2. ✅ Smooth migration from prototype to production
3. ✅ Bilingual support baked in at every layer
4. ✅ Scalable and maintainable
5. ✅ Cost-effective for small city budget

**Next Steps**:
1. Implement prototype following this architecture
2. Validate with Sergio Mujica and stakeholders
3. Refine based on feedback
4. Proceed to Phase 2 production deployment

---

**Document Version**: 1.0  
**Last Updated**: January 17, 2025  
**Next Review**: Post-prototype delivery
