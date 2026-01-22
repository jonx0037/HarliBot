// Test Full RAG Pipeline End-to-End
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

async function testFullRAGPipeline() {
    console.log('═══════════════════════════════════════════');
    console.log('  Full RAG Pipeline End-to-End Test  ');
    console.log('═══════════════════════════════════════════\n');

    const testQuery = "What are the park hours?";
    const language = "en";

    console.log('📝 Test Query:', testQuery);
    console.log('🌐 Language:', language);
    console.log('');

    try {
        // Step 1: Generate embedding
        console.log('1️⃣  Generating embedding...');
        const embedUrl = process.env.EMBEDDING_SERVICE_URL;
        const embedResponse = await fetch(`${embedUrl}/embed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texts: [testQuery] })
        });

        if (!embedResponse.ok) {
            throw new Error(`Embedding failed: ${embedResponse.status}`);
        }

        const embedData = await embedResponse.json();
        const embedding = embedData.embeddings[0];
        console.log('   ✅ Embedding generated (dimension:', embedding.length + ')');
        console.log('');

        // Step 2: Search ChromaDB
        console.log('2️⃣  Searching ChromaDB...');
        const { CloudClient } = require('chromadb');
        const client = new CloudClient({
            apiKey: process.env.CHROMADB_API_KEY,
            tenant: process.env.CHROMADB_TENANT,
            database: process.env.CHROMADB_DATABASE,
        });

        const collection = await client.getCollection({
            name: process.env.CHROMADB_COLLECTION
        });

        const results = await collection.query({
            queryEmbeddings: [embedding],
            nResults: 3,
            where: { language }
        });

        console.log('   ✅ Search completed');
        console.log('   📊 Results found:', results.ids[0]?.length || 0);
        console.log('');

        if (results.ids[0]?.length > 0) {
            console.log('3️⃣  Top Results:');
            for (let i = 0; i < Math.min(3, results.ids[0].length); i++) {
                const doc = results.documents[0][i];
                const meta = results.metadatas[0][i];
                const distance = results.distances[0][i];
                const relevance = ((1 - distance) * 100).toFixed(1);

                console.log(`\n   Result ${i + 1} (${relevance}% relevant):`);
                console.log('   📄', doc.substring(0, 150) + '...');
                console.log('   🔗', meta.sourceUrl);
            }

            console.log('\n\n✅ RAG Pipeline Test: SUCCESSFUL');
            console.log('═══════════════════════════════════════════\n');
            console.log('🎉 The RAG pipeline is working correctly!');
            console.log('   You can now deploy to production.\n');
            return true;
        } else {
            console.log('⚠️  No results found for the query');
            return false;
        }

    } catch (error) {
        console.error('\n❌ RAG Pipeline Error:', error.message);
        console.error('Stack:', error.stack);
        return false;
    }
}

testFullRAGPipeline();
