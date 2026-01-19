#!/usr/bin/env python3
"""
Generate Cohere embeddings and re-index ChromaDB Cloud
Uses Cohere's embed-english-v3.0 model (1024 dimensions)
"""
import chromadb
import cohere
import json
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

# Configuration
COHERE_API_KEY = os.getenv('COHERE_API_KEY')
CHROMADB_API_KEY = os.getenv('CHROMADB_API_KEY', 'ck-6tncjhmyR3FsmgrDGNCNFitXNiCXmU7cfwaWGkFeFLc2')
COLLECTION_NAME = "harlingen_city_content"

if not COHERE_API_KEY:
    print("❌ ERROR: COHERE_API_KEY not found in environment")
    print("Please add it to .env.local")
    exit(1)

print("🚀 Starting Cohere embedding generation and ChromaDB re-indexing...")
print(f"   Cohere API Key: {COHERE_API_KEY[:10]}...")
print(f"   ChromaDB API Key: {CHROMADB_API_KEY[:10]}...")

# Step 1: Initialize Cohere client
print("\n1️⃣  Initializing Cohere client...")
co = cohere.Client(COHERE_API_KEY)
print("   ✅ Cohere client ready")

# Step 2: Load processed chunks
print("\n2️⃣  Loading city content chunks...")
chunks_file = Path("data/processed/chunks.json")
with open(chunks_file, 'r') as f:
    chunks = json.load(f)
print(f"   ✅ Loaded {len(chunks)} chunks")

# Step 3: Generate embeddings using Cohere
print("\n3️⃣  Generating embeddings with Cohere embed-english-v3.0 (1024-dim)...")
texts = [chunk['content'] for chunk in chunks]

# Cohere batch limit is 96 texts per request
batch_size = 96
all_embeddings = []

for i in range(0, len(texts), batch_size):
    batch_texts = texts[i:i+batch_size]
    batch_num = i // batch_size + 1
    total_batches = (len(texts) + batch_size - 1) // batch_size
    
    print(f"   Batch {batch_num}/{total_batches}: Generating embeddings for {len(batch_texts)} texts...")
    
    response = co.embed(
        texts=batch_texts,
        model='embed-english-v3.0',  # 1024 dimensions
        input_type='search_document'
    )
    
    all_embeddings.extend(response.embeddings)
    print(f"   ✅ Batch {batch_num} complete ({len(all_embeddings)}/{len(texts)} total)")

print(f"\n   ✅ Generated {len(all_embeddings)} embeddings")
print(f"   📊 Embedding dimension: {len(all_embeddings[0])}")

# Step 4: Connect to ChromaDB Cloud
print("\n4️⃣  Connecting to ChromaDB Cloud...")
client = chromadb.CloudClient(api_key=CHROMADB_API_KEY)
print("   ✅ Connected to ChromaDB Cloud")

# Step 5: Delete old collection
print(f"\n5️⃣  Deleting old collection '{COLLECTION_NAME}'...")
try:
    client.delete_collection(name=COLLECTION_NAME)
    print("   ✅ Old collection deleted")
except Exception as e:
    print(f"   ⚠️  Could not delete (may not exist): {e}")

# Step 6: Create new collection
print(f"\n6️⃣  Creating new collection with 1024-dimensional embeddings...")
collection = client.create_collection(
    name=COLLECTION_NAME,
    metadata={"hnsw:space": "cosine"}
)
print(f"   ✅ Collection created (ID: {collection.id})")

# Step 7: Prepare data for indexing
print("\n7️⃣  Preparing data for indexing...")
ids = [chunk['id'] for chunk in chunks]
documents = [chunk['content'] for chunk in chunks]
metadatas = [chunk['metadata'] for chunk in chunks]

print(f"   ✅ Prepared {len(ids)} documents")

# Step 8: Add to collection in batches
print("\n8️⃣  Adding documents to ChromaDB collection...")
chroma_batch_size = 100

for i in range(0, len(ids), chroma_batch_size):
    batch_end = min(i + chroma_batch_size, len(ids))
    batch_num = i // chroma_batch_size + 1
    total_batches = (len(ids) + chroma_batch_size - 1) // chroma_batch_size
    
    print(f"   Batch {batch_num}/{total_batches}: Adding documents {i+1}-{batch_end}...")
    
    collection.add(
        ids=ids[i:batch_end],
        documents=documents[i:batch_end],
        metadatas=metadatas[i:batch_end],
        embeddings=all_embeddings[i:batch_end]
    )

print(f"\n   ✅ Indexed {collection.count()} documents")

# Step 9: Verify collection
print("\n9️⃣  Verifying collection...")
print(f"   Collection Name: {collection.name}")
print(f"   Collection ID: {collection.id}")
print(f"   Total Documents: {collection.count()}")

# Test a query
sample = collection.peek(limit=1)
if sample['ids']:
    print(f"\n   📄 Sample document:")
    print(f"      ID: {sample['ids'][0]}")
    print(f"      Content: {sample['documents'][0][:100]}...")
    print(f"      Metadata: {sample['metadatas'][0]}")

print("\n🎉 SUCCESS! ChromaDB re-indexed with Cohere embeddings")
print("   The chatbot should now work correctly with 1024-dimensional embeddings")
