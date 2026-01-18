# HarliBot Project

AI chatbot solution for the City of Harlingen, Texas - providing bilingual (English/Spanish) assistance for city services.

## Project Structure

```
HarliBot/
├── backend/              # Python embedding service & data pipeline
│   ├── embedding-service.py
│   ├── requirements.txt
│   └── Dockerfile
├── dev/files/           # Starter files (to be organized)
├── docs/                # Proposal and documentation
├── frontend/            # Next.js application
│   ├── app/
│   ├── components/
│   └── lib/
├── scripts/             # Data pipeline scripts
│   ├── scraper.ts
│   ├── processor.ts
│   ├── embedder.ts
│   └── indexer.ts
└── data/                # Generated data (gitignored)
    ├── raw/
    ├── processed/
    └── embeddings/
```

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Docker (for local development)
- ChromaDB Cloud account
- Google Cloud API key (Gemini)

## Setup

### 1. Environment Configuration

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual credentials:
- `CHROMADB_API_KEY` - Your ChromaDB Cloud API key
- `GOOGLE_API_KEY` - Your Google Gemini API key

### 2. Install Dependencies

**Frontend (Next.js)**:
```bash
cd frontend
npm install
```

**Backend (Python embedding service)**:
```bash
cd backend
pip install -r requirements.txt
```

**Data Pipeline Scripts**:
```bash
cd scripts
npm install
```

## Development Workflow

### Phase 1: Build Knowledge Base

1. **Scrape City Website**:
```bash
cd scripts
npm run scrape
```

2. **Process Content**:
```bash
npm run process
```

3. **Generate Embeddings**:
```bash
# Start embedding service
cd ../backend
python embedding-service.py

# Run embedder
cd ../scripts
npm run embed
```

4. **Index to ChromaDB**:
```bash
npm run index
```

### Phase 2: Run Application

1. **Start Embedding Service** (in one terminal):
```bash
cd backend
python embedding-service.py
```

2. **Start Next.js Dev Server** (in another terminal):
```bash
cd frontend
npm run dev
```

3. **Open Browser**:
Navigate to `http://localhost:3000`

## Architecture

- **Frontend**: Next.js with React, TypeScript, Tailwind CSS
- **Backend**: FastAPI Python service for embeddings
- **Vector Database**: ChromaDB Cloud
- **LLM**: Google Gemini 1.5 Flash
- **Embedding Model**: sentence-transformers/paraphrase-multilingual-mpnet-base-v2

## Deployment

See [deployment documentation](docs/deployment.md) for AWS deployment instructions.

## License

MIT License - See LICENSE file for details

## Contact

Jonathan Rocha - MS Data Science Candidate (SMU)
