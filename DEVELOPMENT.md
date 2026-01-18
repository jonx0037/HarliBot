# HarliBot Development Guide

## Quick Start

### Prerequisites

Make sure you have installed:
- **Python 3.10+** with pip
- **Node.js 18+** with npm
- **Git**

### 1. Clone and Setup

```bash
cd /Users/jonathanrocha/Documents/GitHub/HarliBot

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..

# Install pipeline dependencies
cd scripts
npm install
cd ..
```

### 2. Start the Embedding Service

In a terminal:

```bash
cd backend
python embedding-service.py
```

You should see:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Test it:
```bash
curl http://localhost:8000/health
```

### 3. Run the Data Pipeline

With the embedding service running, in another terminal:

```bash
cd scripts

# Step 1: Scrape city website (creates data/raw/documents.json)
npm run scrape

# Step 2: Process and chunk (creates data/processed/chunks.json)
npm run process

# Step 3: Generate embeddings (creates data/embeddings/vectors.json)
npm run embed

# Step 4: Index to ChromaDB Cloud
npm run index
```

**OR** run the entire pipeline:
```bash
npm run pipeline
```

## What We've Built So Far

### ✅ Completed

1. **Project Structure**:
   - `backend/` - Python FastAPI embedding service
   - `scripts/` - Data pipeline TypeScript scripts
   - `frontend/` - Next.js app (to be built)
   - `data/` - Generated data (gitignored)

2. **Backend Embedding Service** (`backend/embedding-service.py`):
   - FastAPI REST API
   - Multilingual embeddings (50+ languages)
   - Model: `paraphrase-multilingual-mpnet-base-v2`
   - Batch processing support (up to 100 texts)
   - Health checks
   - CORS enabled for Next.js frontend

3. **Data Pipeline Scripts**:
   - `scraper.ts` - Web scraping with Playwright/Crawlee
   - `processor.ts` - Content chunking with LangChain
   - `embedder.ts` - Calls Python service for embeddings
   - `indexer.ts` - ChromaDB Cloud integration

4. **Configuration**:
   - `.env.local` - Environment variables (with your Gemini API key)
   - `.gitignore` - Protects secrets
   - `README.md` - Project documentation

### 🚧 Next Steps

1. **Complete ChromaDB Cloud Setup**:
   - Get API key from https://www.trychroma.com/jonx0037
   - Add to `.env.local`: `CHROMADB_API_KEY=your_key`
   - Test indexer script

2. **Test Data Pipeline**:
   - Run scraper on a few pages (adjust `maxRequestsPerCrawl` in scraper.ts)
   - Verify processed chunks
   - Generate embeddings
   - Index to ChromaDB

3 **Build Frontend** (Next.js):
   - Move React components from `dev/files` to `frontend/`
   - Set up Next.js project
   - Integrate with API routes

4. **Implement Chat API**:
   - RAG pipeline: query embedding → ChromaDB search → Gemini generation
   - Bilingual prompt templates
   - Source citations

## Environment Variables

Your `.env.local` file should have:

```bash
# ChromaDB Cloud
CHROMADB_URL=https://api.trychroma.com
CHROMADB_API_KEY=<GET_THIS_FROM_CHROMA_DASHBOARD>
CHROMADB_TENANT=jonx0037
CHROMADB_DATABASE=harlibot
CHROMADB_COLLECTION=harlingen_city_content

# Gemini API (already configured)
GOOGLE_API_KEY=AIzaSyCuM72823cFI3vA7S3E7y3QXSIWsEy9UK0
GEMINI_MODEL=gemini-1.5-flash
LLM_PROVIDER=gemini

# Embedding Service
EMBEDDING_SERVICE_URL=http://localhost:8000
```

## Troubleshooting

### Embedding Service Won't Start
- Check Python version: `python --version` (should be 3.10+)
- Install dependencies: `pip install -r requirements.txt`
- Port already in use: Kill process on port 8000

### Scraper Fails
- Install Playwright browsers: `npx playwright install`
- Check internet connection
- Verify harlingentx.gov is accessible

### TypeScript Errors
- Install dependencies: `npm install`
- Check Node version: `node --version` (should be 18+)

## API Documentation

### Embedding Service

**Health Check**:
```bash
GET http://localhost:8000/health
```

**Generate Embeddings**:
```bash
POST http://localhost:8000/embed
Content-Type: application/json

{
  "texts": ["How do I pay my water bill?", "¿Cómo pago mi factura?"],
  "normalize": true
}
```

Response:
```json
{
  "embeddings": [[0.123, -0.456, ...], [0.789, 0.234, ...]],
  "model": "sentence-transformers/paraphrase-multilingual-mpnet-base-v2",
  "dimension": 768,
  "count": 2
}
```

## Development Workflow

### Adding More Content

1. Update `scraper.ts` URL patterns if needed
2. Run scraper: `npm run scrape`
3. Process: `npm run process`
4. Embed: `npm run embed`
5. Index: `npm run index`

### Testing Embeddings

The embedder script automatically runs similarity tests after generating embeddings. Look for output like:

```
Similarity test:
  Water + Water: 0.876 (should be high)
  Water + Police: 0.234 (should be lower)
✓ Similarity test passed
```

## Notes for Jonathan

- Your Gemini API key is already configured in `.env.local`
- The embedding model supports excellent Spanish quality
- ChromaDB Cloud setup is the main blocker for testing end-to-end
- Frontend components are ready in `dev/files/` - need to be integrated into Next.js project
- All scripts use TypeScript with proper types for your MSDS projects

## Architecture Summary

```
User Query (English/Spanish)
    ↓
Next.js Frontend
    ↓
API Route (/api/chat)
    ↓
1. Embedding Service (Python) → Query Vector
2. ChromaDB Cloud → Find Similar Content
3. Gemini API → Generate Response
    ↓
Response with Sources
```

## Support

If you encounter issues:
1. Check this guide first
2. Verify environment variables
3. Check service logs (embedding service, npm scripts)
4. Review error messages carefully

Good luck with HarliBot! 🚀
