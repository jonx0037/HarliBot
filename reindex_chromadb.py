#!/usr/bin/env python3
"""
Re-index ChromaDB Cloud with correct City of Harlingen content
"""
import chromadb
import json
from pathlib import Path

API_KEY = "ck-6tncjhmyR3FsmgrDGNCNFitXNiCXmU7cfwaWGkFeFLc2"
COLLECTION_NAME = "harlingen_city_content"

print("Connecting to ChromaDB Cloud...")
client = chromadb.CloudClient(api_key=API_KEY)

# Step 1: Delete the old collection
print(f"\n1. Deleting old collection '{COLLECTION_NAME}'...")
try:
    client.delete_collection(name=COLLECTION_NAME)
    print("   ✅ Old collection deleted")
except Exception as e:
    print(f"   ⚠️  Could not delete (may not exist): {e}")

# Step 2: Create new collection with correct embedding dimension
print(f"\n2. Creating new collection with 768-dimensional embeddings...")
collection = client.create_collection(
    name=COLLECTION_NAME,
    metadata={"hnsw:space": "cosine"}  # Use cosine similarity
)
print(f"   ✅ Collection created (ID: {collection.id})")

# Step 3: Load processed chunks
print("\n3. Loading processed city content chunks...")
chunks_file = Path("/Users/jonathanrocha/Documents/GitHub/HarliBot/data/processed/chunks.json")
with open(chunks_file, 'r') as f:
    chunks = json.load(f)
print(f"   ✅ Loaded {len(chunks)} chunks")

# Step 4: Load embeddings
print("\n4. Loading pre-computed embeddings...")
embeddings_file = Path("/Users/jonathanrocha/Documents/GitHub/HarliBot/data/embeddings/vectors.json")
with open(embeddings_file, 'r') as f:
    embeddings_data = json.load(f)
print(f"   ✅ Loaded embeddings for {len(embeddings_data)} chunks")

# Step 5: Prepare data for indexing
print("\n5. Preparing data for indexing...")
ids = []
documents = []
metadatas = []
embeddings = []

for chunk in chunks:
    chunk_id = chunk['id']
    
    # Find matching embedding
    embedding_entry = next((e for e in embeddings_data if e['id'] == chunk_id), None)
    if not embedding_entry:
        print(f"   ⚠️  No embedding found for chunk {chunk_id}, skipping...")
        continue
    
    ids.append(chunk_id)
    documents.append(chunk['content'])
    metadatas.append(chunk['metadata'])
    embeddings.append(embedding_entry['embedding'])

print(f"   ✅ Prepared {len(ids)} documents for indexing")

# Step 6: Add to collection in batches
print("\n6. Adding documents to collection...")
batch_size = 100
for i in range(0, len(ids), batch_size):
    batch_end = min(i + batch_size, len(ids))
    print(f"   Adding batch {i//batch_size + 1} ({i+1}-{batch_end} of {len(ids)})...")
    
    collection.add(
        ids=ids[i:batch_end],
        documents=documents[i:batch_end],
        metadatas=metadatas[i:batch_end],
        embeddings=embeddings[i:batch_end]
    )

print(f"\n✅ SUCCESS! Re-indexed {collection.count()} documents")
print(f"\nCollection details:")
print(f"  Name: {collection.name}")
print(f"  ID: {collection.id}")
print(f"  Total documents: {collection.count()}")

# Test a query
print("\n7. Testing query...")
sample = collection.peek(limit=1)
if sample['ids']:
    print(f"   Sample document ID: {sample['ids'][0]}")
    print(f"   Content preview: {sample['documents'][0][:100]}...")
    print(f"   Metadata: {sample['metadatas'][0]}")

print("\n🎉 Re-indexing complete! The chatbot should now work correctly.")
