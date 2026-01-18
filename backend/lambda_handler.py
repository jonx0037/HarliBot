"""
AWS Lambda handler for HarliBot Embedding Service

This handler wraps the sentence-transformers model for serverless deployment.
Optimized for Lambda container runtime with API Gateway integration.
"""

import json
import logging
import os
from typing import List, Dict, Any, Optional

from sentence_transformers import SentenceTransformer

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Global model instance (persists across warm invocations)
MODEL_NAME = "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
model: Optional[SentenceTransformer] = None


def load_model():
    """Load the embedding model (called on cold start)"""
    global model
    if model is None:
        logger.info(f"Cold start: Loading model {MODEL_NAME}")
        model = SentenceTransformer(MODEL_NAME)
        logger.info(f"Model loaded. Dimension: {model.get_sentence_embedding_dimension()}")
    return model


def create_cors_headers(origin: str = "*") -> Dict[str, str]:
    """Create CORS headers for API Gateway response"""
    # Allow Vercel domains
    allowed_origins = [
        "http://localhost:3000",
        "https://harli-bot.vercel.app",
        "https://harli-bot-git-main-jonathan-aaron-rocha.vercel.app",
    ]
    
    # Check if origin is in allowed list, otherwise use wildcard for other Vercel previews
    if origin in allowed_origins or ".vercel.app" in origin:
        cors_origin = origin
    else:
        cors_origin = "*"
    
    return {
        "Access-Control-Allow-Origin": cors_origin,
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "POST,GET,OPTIONS",
        "Access-Control-Allow-Credentials": "true",
    }


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main Lambda handler for API Gateway events
    
    Supports:
    - POST /embed - Generate embeddings for batch of texts
    - GET /health - Health check endpoint
    - OPTIONS /* - CORS preflight
    """
    
    # Log request for debugging
    logger.info(f"Event: {json.dumps(event)}")
    
    # Get origin for CORS
    origin = event.get("headers", {}).get("origin", "*")
    cors_headers = create_cors_headers(origin)
    
    # Handle CORS preflight
    http_method = event.get("httpMethod", "")
    if http_method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({"message": "OK"})
        }
    
    # Handle different paths
    path = event.get("path", "")
    
    try:
        # Health check endpoint
        if path == "/health" and http_method == "GET":
            return handle_health(cors_headers)
        
        # Embedding endpoint
        elif path == "/embed" and http_method == "POST":
            return handle_embed(event, cors_headers)
        
        # Unknown endpoint
        else:
            return {
                "statusCode": 404,
                "headers": cors_headers,
                "body": json.dumps({
                    "error": "Not found",
                    "path": path,
                    "method": http_method
                })
            }
    
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}", exc_info=True)
        return {
            "statusCode": 500,
            "headers": cors_headers,
            "body": json.dumps({
                "error": "Internal server error",
                "message": str(e)
            })
        }


def handle_health(cors_headers: Dict[str, str]) -> Dict[str, Any]:
    """Handle health check requests"""
    try:
        mdl = load_model()
        return {
            "statusCode": 200,
            "headers": {**cors_headers, "Content-Type": "application/json"},
            "body": json.dumps({
                "status": "healthy",
                "service": "HarliBot Embedding Service",
                "model": MODEL_NAME,
                "dimension": mdl.get_sentence_embedding_dimension()
            })
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "statusCode": 503,
            "headers": {**cors_headers, "Content-Type": "application/json"},
            "body": json.dumps({
                "status": "unhealthy",
                "error": str(e)
            })
        }


def handle_embed(event: Dict[str, Any], cors_headers: Dict[str, str]) -> Dict[str, Any]:
    """Handle embedding generation requests"""
    
    # Parse request body
    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError as e:
        return {
            "statusCode": 400,
            "headers": {**cors_headers, "Content-Type": "application/json"},
            "body": json.dumps({
                "error": "Invalid JSON",
                "message": str(e)
            })
        }
    
    # Validate input
    texts = body.get("texts", [])
    if not texts:
        return {
            "statusCode": 400,
            "headers": {**cors_headers, "Content-Type": "application/json"},
            "body": json.dumps({
                "error": "Missing required field: texts",
                "message": "Request must include 'texts' array"
            })
        }
    
    if not isinstance(texts, list):
        return {
            "statusCode": 400,
            "headers": {**cors_headers, "Content-Type": "application/json"},
            "body": json.dumps({
                "error": "Invalid type for 'texts'",
                "message": "'texts' must be an array of strings"
            })
        }
    
    if len(texts) > 100:
        return {
            "statusCode": 400,
            "headers": {**cors_headers, "Content-Type": "application/json"},
            "body": json.dumps({
                "error": "Too many texts",
                "message": "Maximum 100 texts per request"
            })
        }
    
    # Generate embeddings
    try:
        mdl = load_model()
        normalize = body.get("normalize", True)
        
        logger.info(f"Generating embeddings for {len(texts)} texts")
        
        embeddings = mdl.encode(
            texts,
            normalize_embeddings=normalize,
            show_progress_bar=False,
            convert_to_numpy=True
        )
        
        embeddings_list = embeddings.tolist()
        
        logger.info(f"Successfully generated {len(embeddings_list)} embeddings")
        
        return {
            "statusCode": 200,
            "headers": {**cors_headers, "Content-Type": "application/json"},
            "body": json.dumps({
                "embeddings": embeddings_list,
                "model": MODEL_NAME,
                "dimension": len(embeddings_list[0]) if embeddings_list else 0,
                "count": len(embeddings_list)
            })
        }
        
    except Exception as e:
        logger.error(f"Error generating embeddings: {str(e)}", exc_info=True)
        return {
            "statusCode": 500,
            "headers": {**cors_headers, "Content-Type": "application/json"},
            "body": json.dumps({
                "error": "Failed to generate embeddings",
                "message": str(e)
            })
        }
