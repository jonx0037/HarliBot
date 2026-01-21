
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), 'frontend/.env.local') });

// Mock global fetch if needed (Node 18+ has native fetch, but verify)
if (!global.fetch) {
    throw new Error('Node.js version too low, fetch not found');
}

// Import the RAG function (we need to use specific relative paths from script location)
// We'll write this script to the root, so paths will be into frontend/src/...
// BUT importing from outside src in Next.js projects with aliases (@/lib/...) can be tricky with plain tsx.
// Instead, let's create a standalone test that reconstructs the critical path to isolate the failure.

async function testBackend() {
    console.log('🧪 Testing RAG components independent of Next.js build...');

    // 1. Test Variables
    const COHERE_KEY = process.env.COHERE_API_KEY;
    const CHROMA_KEY = process.env.CHROMADB_API_KEY;

    console.log(`   COHERE_API_KEY present: ${!!COHERE_KEY}`);
    console.log(`   CHROMADB_API_KEY present: ${!!CHROMA_KEY}`);

    if (!COHERE_KEY || !CHROMA_KEY) {
        console.error('❌ Missing environment variables. Cannot proceed.');
        return;
    }

    // 2. Test Cohere Direct (Simulating embeddings.ts server path)
    console.log('\n1️⃣ Testing Cohere Embedding (Direct)...');
    try {
        const cohereRes = await fetch('https://api.cohere.ai/v1/embed', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${COHERE_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                texts: ['test query'],
                model: 'embed-multilingual-v3.0',
                input_type: 'search_query',
                truncate: 'END'
            }),
        });

        if (!cohereRes.ok) {
            const err = await cohereRes.text();
            throw new Error(`Cohere failed: ${cohereRes.status} - ${err}`);
        }

        const cohereData = await cohereRes.json();
        const embedding = cohereData.embeddings?.[0];
        console.log(`   ✅ Generated embedding: ${embedding?.length} dimensions`);

        if (!embedding) throw new Error('No embedding returned');

        // 3. Test ChromaDB (Simulating chromadb.ts)
        console.log('\n2️⃣ Testing ChromaDB Connection...');
        const { CloudClient } = await import('chromadb');
        const client = new CloudClient({ apiKey: CHROMA_KEY });

        // Mock embedding function to satisfy strict type requirements
        const mockEmbeddingFunction = {
            generate: async (texts: string[]) => texts.map(() => Array(1024).fill(0))
        };

        const collection = await client.getCollection({
            name: 'harlingen_city_content',
            embeddingFunction: mockEmbeddingFunction
        });

        console.log(`   ✅ Connected to collection: ${collection.name}`);
        const count = await collection.count();
        console.log(`   📊 Collection count: ${count}`);

        // 4. Test Search
        console.log('\n3️⃣ Testing Vector Search...');
        const results = await collection.query({
            queryEmbeddings: [embedding],
            nResults: 3,
            where: { language: 'en' },
        });

        const ids = results.ids && results.ids[0] ? results.ids[0] : [];
        const found = ids.length;
        console.log(`   ✅ Found ${found} results`);

        if (found > 0 && results.documents && results.documents[0]) {
            const doc = results.documents[0][0];
            console.log(`   Draft Result: ${doc ? doc.substring(0, 50) : 'N/A'}...`);
        } else {
            console.warn('   ⚠️ No results found (this might be okay if DB is empty, but unexpected)');
        }

    } catch (error) {
        console.error('❌ Test Failed:', error);
    }
}

testBackend();
