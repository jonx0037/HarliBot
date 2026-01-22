#!/usr/bin/env python3
"""
Translate English content chunks to Spanish and re-index to ChromaDB.
Uses Google Gemini for high-quality translations.
"""

import os
import json
import time
from typing import List, Dict
from dotenv import load_dotenv
import google.generativeai as genai
import chromadb
from chromadb.config import Settings
import cohere

# Load environment variables
load_dotenv('.env.local')

# Configure APIs
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
CHROMADB_API_KEY = os.getenv('CHROMADB_API_KEY')
CHROMADB_TENANT = os.getenv('CHROMADB_TENANT')
CHROMADB_DATABASE = os.getenv('CHROMADB_DATABASE', 'HarliBot')
CHROMADB_COLLECTION = os.getenv('CHROMADB_COLLECTION', 'harlingen_city_content')
COHERE_API_KEY = os.getenv('COHERE_API_KEY')

# Initialize Gemini
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

# Initialize Cohere for embeddings
cohere_client = cohere.Client(COHERE_API_KEY)

def load_chunks(filepath: str = 'data/processed/chunks.json') -> List[Dict]:
    """Load processed content chunks."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def translate_text(text: str) -> str:
    """Translate English text to Spanish using Gemini."""
    prompt = f"""Translate the following English text to Spanish. 
Keep any technical terms, proper nouns, and city-specific names in their original form.
Maintain the same formatting and structure.

English text:
{text}

Spanish translation:"""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Translation error: {e}")
        return text  # Return original if translation fails

def create_spanish_chunk(en_chunk: Dict) -> Dict:
    """Create a Spanish version of an English chunk."""
    es_chunk = en_chunk.copy()
    
    # Translate content
    es_chunk['content'] = translate_text(en_chunk['content'])
    
    # Update IDs and metadata
    es_chunk['id'] = en_chunk['id'].replace('-chunk-', '-es-chunk-')
    es_chunk['metadata']['language'] = 'es'
    
    # Translate title if present
    if es_chunk['metadata'].get('sourceTitle'):
        es_chunk['metadata']['sourceTitle'] = translate_text(es_chunk['metadata']['sourceTitle'])
    
    return es_chunk

def generate_embedding(text: str) -> List[float]:
    """Generate embedding using Cohere."""
    response = cohere_client.embed(
        texts=[text],
        model='embed-multilingual-v3.0',
        input_type='search_document'
    )
    return response.embeddings[0]

def index_to_chromadb(chunks: List[Dict]):
    """Index translated chunks to ChromaDB Cloud."""
    # Initialize CloudClient
    client = chromadb.CloudClient(
        api_key=CHROMADB_API_KEY,
        tenant=CHROMADB_TENANT,
        database=CHROMADB_DATABASE,
    )
    
    # Get or create collection
    collection = client.get_or_create_collection(
        name=CHROMADB_COLLECTION,
        metadata={"description": "City of Harlingen bilingual content"}
    )
    
    print(f"Indexing {len(chunks)} Spanish chunks to ChromaDB...")
    
    # Process in batches
    batch_size = 10
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i+batch_size]
        
        ids = [c['id'] for c in batch]
        documents = [c['content'] for c in batch]
        metadatas = [c['metadata'] for c in batch]
        
        # Generate embeddings
        embeddings = []
        for doc in documents:
            emb = generate_embedding(doc)
            embeddings.append(emb)
            time.sleep(0.1)  # Rate limiting
        
        # Upsert to collection
        collection.upsert(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )
        
        print(f"  Indexed batch {i//batch_size + 1}/{(len(chunks) + batch_size - 1)//batch_size}")
    
    print(f"✅ Successfully indexed {len(chunks)} Spanish chunks!")
    return collection.count()

def main():
    print("=" * 50)
    print("HarliBot Spanish Content Generator")
    print("=" * 50)
    
    # Load English chunks
    print("\n1. Loading English chunks...")
    en_chunks = load_chunks()
    print(f"   Found {len(en_chunks)} English chunks")
    
    # Translate to Spanish
    print("\n2. Translating to Spanish...")
    es_chunks = []
    for i, chunk in enumerate(en_chunks):
        print(f"   Translating {i+1}/{len(en_chunks)}...", end='\r')
        es_chunk = create_spanish_chunk(chunk)
        es_chunks.append(es_chunk)
        time.sleep(0.5)  # Rate limiting for Gemini
    
    print(f"\n   Translated {len(es_chunks)} chunks to Spanish")
    
    # Save translated chunks
    output_path = 'data/processed/chunks_es.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(es_chunks, f, ensure_ascii=False, indent=2)
    print(f"   Saved to {output_path}")
    
    # Index to ChromaDB
    print("\n3. Indexing to ChromaDB Cloud...")
    total_count = index_to_chromadb(es_chunks)
    print(f"   Total documents in collection: {total_count}")
    
    print("\n" + "=" * 50)
    print("✅ Spanish content generation complete!")
    print("=" * 50)

if __name__ == '__main__':
    main()
