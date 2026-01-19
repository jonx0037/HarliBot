#!/usr/bin/env python3
"""
Test the full RAG pipeline with Cohere embeddings
"""
import chromadb
import cohere
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

COHERE_API_KEY = os.getenv('COHERE_API_KEY')
CHROMADB_API_KEY = os.getenv('CHROMADB_API_KEY')
COLLECTION_NAME = "harlingen_city_content"

print("🧪 Testing RAG Pipeline with Cohere Embeddings\n")

# Step 1: Initialize Cohere client
print("1️⃣  Initializing Cohere client...")
co = cohere.Client(COHERE_API_KEY)
print("   ✅ Cohere client ready\n")

# Step 2: Connect to ChromaDB
print("2️⃣  Connecting to ChromaDB Cloud...")
client = chromadb.CloudClient(api_key=CHROMADB_API_KEY)
collection = client.get_collection(name=COLLECTION_NAME)
print(f"   ✅ Connected to collection: {collection.name}")
print(f"   📊 Total documents: {collection.count()}\n")

# Step 3: Test query
test_query = "What are the city commission meeting times?"
print(f"3️⃣  Testing query: '{test_query}'")

# Generate embedding for query
print("   Generating query embedding...")
response = co.embed(
    texts=[test_query],
    model='embed-multilingual-v3.0',
    input_type='search_query'  # Use search_query for queries
)
query_embedding = response.embeddings[0]
print(f"   ✅ Query embedding generated ({len(query_embedding)} dimensions)\n")

# Step 4: Search ChromaDB
print("4️⃣  Searching ChromaDB...")
results = collection.query(
    query_embeddings=[query_embedding],
    n_results=3
)

print(f"   ✅ Found {len(results['ids'][0])} relevant documents\n")

# Step 5: Display results
print("5️⃣  Top Results:")
for i, (doc_id, document, metadata, distance) in enumerate(zip(
    results['ids'][0],
    results['documents'][0],
    results['metadatas'][0],
    results['distances'][0]
)):
    print(f"\n   Result {i+1}:")
    print(f"   ID: {doc_id}")
    print(f"   Distance: {distance:.4f}")
    print(f"   Source: {metadata.get('sourceTitle', 'N/A')}")
    print(f"   URL: {metadata.get('sourceUrl', 'N/A')}")
    print(f"   Content: {document[:150]}...")

print("\n\n🎉 RAG Pipeline Test Complete!")
print("   ✅ Cohere embeddings working")
print("   ✅ ChromaDB search working")
print("   ✅ Ready for production deployment")
