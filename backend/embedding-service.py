from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer
from typing import List, Optional
import uvicorn
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="HarliBot Embedding Service",
    description="Multilingual text embedding service for HarliBot RAG pipeline",
    version="1.0.0"
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instance (loaded once on startup)
MODEL_NAME = "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
model: Optional[SentenceTransformer] = None


class EmbeddingRequest(BaseModel):
    texts: List[str] = Field(..., min_items=1, max_items=100)
    model_name: Optional[str] = Field(default=MODEL_NAME)
    normalize: bool = Field(default=True)


class EmbeddingResponse(BaseModel):
    embeddings: List[List[float]]
    model: str
    dimension: int
    count: int


@app.on_event("startup")
async def startup_event():
    """Load the embedding model on startup"""
    global model
    logger.info(f"Loading embedding model: {MODEL_NAME}")
    try:
        model = SentenceTransformer(MODEL_NAME)
        logger.info(f"Model loaded successfully. Embedding dimension: {model.get_sentence_embedding_dimension()}")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "HarliBot Embedding Service",
        "model": MODEL_NAME,
        "dimension": model.get_sentence_embedding_dimension() if model else None
    }


@app.get("/health")
async def health():
    """Detailed health check"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    return {
        "status": "healthy",
        "model_loaded": True,
        "model_name": MODEL_NAME,
        "embedding_dimension": model.get_sentence_embedding_dimension()
    }


@app.post("/embed", response_model=EmbeddingResponse)
async def create_embeddings(request: EmbeddingRequest):
    """
    Generate embeddings for input texts.
    
    Supports:
    - Batch processing (up to 100 texts)
    - Multilingual content (50+ languages including Spanish)
    - Normalized vectors (L2 normalization)
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        logger.info(f"Generating embeddings for {len(request.texts)} texts")
        
        # Generate embeddings
        embeddings = model.encode(
            request.texts,
            normalize_embeddings=request.normalize,
            show_progress_bar=False,
            convert_to_numpy=True
        )
        
        # Convert to list of lists
        embeddings_list = embeddings.tolist()
        
        logger.info(f"Successfully generated {len(embeddings_list)} embeddings")
        
        return EmbeddingResponse(
            embeddings=embeddings_list,
            model=request.model_name or MODEL_NAME,
            dimension=len(embeddings_list[0]),
            count=len(embeddings_list)
        )
        
    except Exception as e:
        logger.error(f"Error generating embeddings: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate embeddings: {str(e)}")


class SingleEmbeddingRequest(BaseModel):
    text: str = Field(..., min_length=1)


@app.post("/embed/single")
async def create_single_embedding(request: SingleEmbeddingRequest):
    """
    Generate embedding for a single text (simplified endpoint).
    Useful for quick testing.
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        embedding = model.encode([request.text], normalize_embeddings=True)[0]
        
        return {
            "embedding": embedding.tolist(),
            "model": MODEL_NAME,
            "dimension": len(embedding)
        }
        
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "embedding-service:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
