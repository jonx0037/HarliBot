#!/usr/bin/env python3
"""
Test different ChromaDB Cloud authentication methods
"""
import chromadb
from chromadb.config import Settings

API_KEY = "ck-6tncjhmyR3FsmgrDGNCNFitXNiCXmU7cfwaWGkFeFLc2"

# Try different authentication approaches
auth_methods = [
    ("X-Chroma-Token header", {"X-Chroma-Token": API_KEY}),
    ("Bearer token", {"Authorization": f"Bearer {API_KEY}"}),
    ("Token scheme", {"Authorization": f"Token {API_KEY}"}),
]

for method_name, headers in auth_methods:
    print(f"\n{'='*60}")
    print(f"Testing: {method_name}")
    print(f"{'='*60}")
    try:
        client = chromadb.HttpClient(
            host="https://api.trychroma.com",
            headers=headers
        )
        print(f"✅ SUCCESS with {method_name}!")
        collections = client.list_collections()
        print(f"   Found {len(collections)} collection(s)")
        break
    except Exception as e:
        print(f"❌ FAILED: {e}")

# Also try CloudClient if available
print(f"\n{'='*60}")
print("Testing: CloudClient (if available)")
print(f"{'='*60}")
try:
    client = chromadb.CloudClient(api_key=API_KEY)
    print("✅ SUCCESS with CloudClient!")
    collections = client.list_collections()
    print(f"   Found {len(collections)} collection(s)")
except AttributeError:
    print("❌ CloudClient not available in this version")
except Exception as e:
    print(f"❌ FAILED: {e}")
