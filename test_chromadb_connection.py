#!/usr/bin/env python3
"""
Test ChromaDB Cloud connection with new API key
"""
import chromadb
from chromadb.config import Settings

# New API key from user
API_KEY = "ck-6tncjhmyR3FsmgrDGNCNFitXNiCXmU7cfwaWGkFeFLc2"
CHROMADB_URL = "https://api.trychroma.com"

try:
    print(f"Connecting to ChromaDB Cloud at {CHROMADB_URL}...")
    
    # Try connecting with the new API key
    client = chromadb.HttpClient(
        host=CHROMADB_URL,
        headers={"Authorization": f"Bearer {API_KEY}"}
    )
    
    print("✅ Connection successful!")
    
    # List all collections
    print("\nListing collections...")
    collections = client.list_collections()
    print(f"Found {len(collections)} collection(s):")
    for coll in collections:
        print(f"  - {coll.name} (ID: {coll.id})")
        
    # Try to get the harlingen_city_content collection
    print("\nAttempting to access 'harlingen_city_content' collection...")
    collection = client.get_collection(name="harlingen_city_content")
    count = collection.count()
    print(f"✅ Collection found! Contains {count} documents")
    
except Exception as e:
    print(f"❌ Error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
