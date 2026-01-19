#!/usr/bin/env python3
"""
Get ChromaDB Cloud collection details and test query
"""
import chromadb

API_KEY = "ck-6tncjhmyR3FsmgrDGNCNFitXNiCXmU7cfwaWGkFeFLc2"

try:
    print("Connecting to ChromaDB Cloud...")
    client = chromadb.CloudClient(api_key=API_KEY)
    
    print("\n✅ Connected successfully!")
    
    # List collections
    collections = client.list_collections()
    print(f"\nFound {len(collections)} collection(s):")
    for coll in collections:
        print(f"  - Name: {coll.name}")
        print(f"    ID: {coll.id}")
        count = coll.count()
        print(f"    Document count: {count}")
        
        # Get a sample document
        if count > 0:
            sample = coll.peek(limit=1)
            print(f"    Sample document:")
            if sample['ids']:
                print(f"      ID: {sample['ids'][0]}")
            if sample['metadatas'] and sample['metadatas'][0]:
                print(f"      Metadata: {sample['metadatas'][0]}")
        print()
    
    # Try to access harlingen_city_content
    print("Accessing 'harlingen_city_content' collection...")
    collection = client.get_collection(name="harlingen_city_content")
    print(f"✅ Collection found!")
    print(f"   Total documents: {collection.count()}")
    
    # Test a simple query
    print("\nTesting query with sample embedding...")
    import numpy as np
    # Create a random embedding (768 dimensions for the multilingual model)
    test_embedding = np.random.rand(768).tolist()
    
    results = collection.query(
        query_embeddings=[test_embedding],
        n_results=2,
        where={"language": "en"}
    )
    
    print(f"✅ Query successful!")
    print(f"   Returned {len(results['ids'][0])} results")
    if results['documents'] and results['documents'][0]:
        print(f"   First result: {results['documents'][0][0][:100]}...")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
