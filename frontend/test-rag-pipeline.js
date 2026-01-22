// Test ChromaDB Connection - Frontend
const { CloudClient } = require('chromadb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

async function testChromaDB() {
    console.log('🔍 Testing ChromaDB Connection...\n');

    // Check environment variables
    console.log('Environment Variables:');
    console.log('- CHROMADB_API_KEY:', process.env.CHROMADB_API_KEY ? '✓ Set (' + process.env.CHROMADB_API_KEY.substring(0, 10) + '...)' : '✗ Missing');
    console.log('- CHROMADB_TENANT:', process.env.CHROMADB_TENANT || '✗ Missing');
    console.log('- CHROMADB_DATABASE:', process.env.CHROMADB_DATABASE || '✗ Missing');
    console.log('- CHROMADB_COLLECTION:', process.env.CHROMADB_COLLECTION || '✗ Missing');
    console.log('');

    try {
        // Initialize client
        console.log('📡 Connecting to ChromaDB Cloud...');
        const client = new CloudClient({
            apiKey: process.env.CHROMADB_API_KEY,
            tenant: process.env.CHROMADB_TENANT,
            database: process.env.CHROMADB_DATABASE,
        });
        console.log('✅ Client created successfully\n');

        // Get collection
        console.log(`📚 Fetching collection: ${process.env.CHROMADB_COLLECTION}...`);
        const collection = await client.getCollection({
            name: process.env.CHROMADB_COLLECTION
        });
        console.log('✅ Collection found\n');

        // Get collection stats
        console.log('📊 Collection Statistics:');
        const count = await collection.count();
        console.log(`- Total documents: ${count}`);
        console.log('');

        // Test query with a sample embedding (1024 dimensions, all zeros)
        console.log('🔎 Testing query functionality...');
        const testEmbedding = new Array(1024).fill(0);
        const results = await collection.query({
            queryEmbeddings: [testEmbedding],
            nResults: 3,
        });

        console.log('✅ Query successful');
        console.log(`- Results returned: ${results.ids[0]?.length || 0}`);

        if (results.ids[0]?.length > 0) {
            console.log('\nSample result:');
            console.log('- ID:', results.ids[0][0]);
            console.log('- Document preview:', results.documents[0][0]?.substring(0, 100) + '...');
            console.log('- Language:', results.metadatas[0][0]?.language);
            console.log('- Source:', results.metadatas[0][0]?.sourceUrl);
        }

        console.log('\n✅ All ChromaDB tests passed!\n');
        return true;

    } catch (error) {
        console.error('\n❌ ChromaDB Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        console.error('\nStack:', error.stack);
        return false;
    }
}

async function testEmbeddingService() {
    console.log('\n🔧 Testing Embedding Service...\n');

    const embeddingUrl = process.env.EMBEDDING_SERVICE_URL;
    console.log('- URL:', embeddingUrl || '✗ Missing');

    if (!embeddingUrl) {
        console.error('❌ EMBEDDING_SERVICE_URL not set');
        return false;
    }

    try {
        // Test health endpoint
        console.log('\n📡 Testing health endpoint...');
        const healthResponse = await fetch(`${embeddingUrl}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthResponse.status, healthData);

        // Test embed endpoint
        console.log('\n📡 Testing embed endpoint...');
        const embedResponse = await fetch(`${embeddingUrl}/embed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                texts: ['Hello, this is a test message.']
            })
        });

        const embedData = await embedResponse.json();

        if (embedResponse.ok && embedData.embeddings) {
            console.log('✅ Embedding generated successfully');
            console.log('- Embedding dimension:', embedData.embeddings[0].length);
            console.log('- Expected dimension: 1024');

            if (embedData.embeddings[0].length === 1024) {
                console.log('✅ Dimension matches!\n');
                return true;
            } else {
                console.error('❌ Dimension mismatch!\n');
                return false;
            }
        } else {
            console.error('❌ Embedding generation failed:', embedData);
            return false;
        }

    } catch (error) {
        console.error('❌ Embedding Service Error:', error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('═══════════════════════════════════════════');
    console.log('  HarliBot RAG Pipeline Diagnostic Tests  ');
    console.log('═══════════════════════════════════════════\n');

    const chromaOk = await testChromaDB();
    const embedOk = await testEmbeddingService();

    console.log('\n═══════════════════════════════════════════');
    console.log('  Test Summary  ');
    console.log('═══════════════════════════════════════════');
    console.log('ChromaDB Connection:', chromaOk ? '✅ PASS' : '❌ FAIL');
    console.log('Embedding Service:', embedOk ? '✅ PASS' : '❌ FAIL');
    console.log('═══════════════════════════════════════════\n');

    if (chromaOk && embedOk) {
        console.log('🎉 All tests passed! RAG pipeline components are working.\n');
        process.exit(0);
    } else {
        console.log('⚠️  Some tests failed. Please review the errors above.\n');
        process.exit(1);
    }
}

runAllTests();
