"""
AWS Lambda handler for HarliBot Embedding Service

This handler uses Cohere's Embed Multilingual v2.0 API to match
ChromaDB Cloud's embedding model (768 dimensions).

Optimized for Lambda runtime with API Gateway integration.
"""

import json
import logging
import os
from typing import List, Dict, Any
import cohere

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Cohere configuration
COHERE_API_KEY = os.environ.get("COHERE_API_KEY")
MODEL_NAME = "embed-multilingual-v2.0"
MODEL_DIMENSION = 768

# Global Cohere client (persists across warm invocations)
cohere_client = None


def get_cohere_client():
    """Get or create Cohere client"""
    global cohere_client
    if cohere_client is None:
        if not COHERE_API_KEY:
            raise ValueError("COHERE_API_KEY environment variable is required")
        logger.info("Initializing Cohere client")
        cohere_client = cohere.Client(COHERE_API_KEY)
        logger.info("Cohere client initialized successfully")
    return cohere_client


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
    """
    Handle health check requests
    
    Lightweight check that verifies Cohere API key is configured.
    """
    try:
        if COHERE_API_KEY:
            return {
                "statusCode": 200,
                "headers": {**cors_headers, "Content-Type": "application/json"},
                "body": json.dumps({
                    "status": "healthy",
                    "service": "HarliBot Embedding Service",
                    "provider": "Cohere",
                    "model": MODEL_NAME,
                    "dimension": MODEL_DIMENSION,
                    "api_key_configured": True
                })
            }
        else:
            return {
                "statusCode": 503,
                "headers": {**cors_headers, "Content-Type": "application/json"},
                "body": json.dumps({
                    "status": "unhealthy",
                    "service": "HarliBot Embedding Service",
                    "error": "COHERE_API_KEY not configured"
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
    """Handle embedding generation requests using Cohere API"""
    
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
    
    if len(texts) > 96:  # Cohere's batch limit
        return {
            "statusCode": 400,
            "headers": {**cors_headers, "Content-Type": "application/json"},
            "body": json.dumps({
                "error": "Too many texts",
                "message": "Maximum 96 texts per request (Cohere limit)"
            })
        }
    
    # Generate embeddings using Cohere API
    try:
        client = get_cohere_client()
        
        logger.info(f"Generating embeddings for {len(texts)} texts using Cohere")
        
        # Call Cohere embed API
        response = client.embed(
            texts=texts,
            model=MODEL_NAME,
            input_type="search_query",  # Optimized for search/retrieval
            truncate="END"  # Truncate long texts from the end
        )
        
        embeddings_list = response.embeddings
        
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
