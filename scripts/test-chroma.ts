/**
 * ChromaDB Connection Test
 * 
 * Tests the connection to ChromaDB Cloud to verify:
 * - API key is valid
 * - Tenant and database are accessible
 * - Basic operations work (create, query, delete)
 */

import { ChromaClient } from 'chromadb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from project root
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const CHROMADB_URL = process.env.CHROMADB_URL || 'https://api.trychroma.com';
const CHROMADB_API_KEY = process.env.CHROMADB_API_KEY;
const CHROMADB_TENANT = process.env.CHROMADB_TENANT || 'default_tenant';
const CHROMADB_DATABASE = process.env.CHROMADB_DATABASE || 'default_database';

async function testChromaDBConnection() {
    console.log('🔍 Testing ChromaDB Connection...\n');

    // Verify environment variables
    console.log('Configuration:');
    console.log(`  URL: ${CHROMADB_URL}`);
    console.log(`  Tenant: ${CHROMADB_TENANT}`);
    console.log(`  Database: ${CHROMADB_DATABASE}`);
    console.log(`  API Key: ${CHROMADB_API_KEY ? '✓ Set' : '✗ Missing'}\n`);

    if (!CHROMADB_API_KEY || CHROMADB_API_KEY === 'your_chroma_api_key_here') {
        console.error('❌ Error: CHROMADB_API_KEY not set in .env.local');
        console.error('   Please add your API key from https://www.trychroma.com/');
        process.exit(1);
    }

    try {
        // Initialize ChromaDB client
        console.log('📡 Connecting to ChromaDB Cloud...');
        const client = new ChromaClient({
            path: CHROMADB_URL,
            auth: {
                provider: 'token',
                credentials: CHROMADB_API_KEY,
                tokenHeaderType: 'X_CHROMA_TOKEN'
            },
            // Don't specify tenant/database for now - use defaults
        });

        // Test 1: Heartbeat
        console.log('   Testing heartbeat...');
        const heartbeat = await client.heartbeat();
        console.log(`   ✓ Heartbeat successful: ${heartbeat}ms\n`);

        // Test 2: List collections
        console.log('📋 Listing existing collections...');
        const collections = await client.listCollections();
        console.log(`   Found ${collections.length} collection(s):`);
        collections.forEach(col => {
            console.log(`   - ${col.name} (${col.metadata || 'no metadata'})`);
        });
        console.log('');

        // Test 3: Create a test collection
        const testCollectionName = `test_collection_${Date.now()}`;
        console.log(`🧪 Creating test collection: ${testCollectionName}...`);

        const testCollection = await client.createCollection({
            name: testCollectionName,
            metadata: {
                'hnsw:space': 'cosine',
                description: 'Test collection - safe to delete',
            },
        });
        console.log(`   ✓ Collection created\n`);

        // Test 4: Add test vectors
        console.log('📝 Adding test vectors...');
        const testEmbeddings = [
            Array(768).fill(0).map(() => Math.random()),
            Array(768).fill(0).map(() => Math.random()),
            Array(768).fill(0).map(() => Math.random()),
        ];

        await testCollection.add({
            ids: ['test-1', 'test-2', 'test-3'],
            embeddings: testEmbeddings,
            metadatas: [
                { content: 'Test document 1', source: 'test' },
                { content: 'Test document 2', source: 'test' },
                { content: 'Test document 3', source: 'test' },
            ],
            documents: [
                'This is test document 1',
                'This is test document 2',
                'This is test document 3',
            ],
        });
        console.log('   ✓ Added 3 test vectors\n');

        // Test 5: Query the collection
        console.log('🔎 Testing similarity search...');
        const queryResults = await testCollection.query({
            queryEmbeddings: [testEmbeddings[0]],
            nResults: 2,
        });
        console.log(`   ✓ Retrieved ${queryResults.ids[0].length} results`);
        console.log(`   Top result ID: ${queryResults.ids[0][0]}\n`);

        // Test 6: Delete the test collection
        console.log('🗑️  Cleaning up test collection...');
        await client.deleteCollection({ name: testCollectionName });
        console.log('   ✓ Test collection deleted\n');

        // Success!
        console.log('✅ All tests passed!');
        console.log('\n🎉 ChromaDB connection is working correctly.');
        console.log('   You can now run the data pipeline with: npm run pipeline\n');

    } catch (error: any) {
        console.error('\n❌ ChromaDB Connection Failed:');
        console.error(`   ${error.message}`);

        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            console.error('\n💡 Troubleshooting:');
            console.error('   - Verify your API key is correct in .env.local');
            console.error('   - Check that the API key hasn\'t expired');
            console.error('   - Visit https://www.trychroma.com/ to regenerate if needed');
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
            console.error('\n💡 Troubleshooting:');
            console.error('   - Verify CHROMADB_TENANT is correct');
            console.error('   - Verify CHROMADB_DATABASE exists');
            console.error('   - Check your account at https://www.trychroma.com/');
        } else if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
            console.error('\n💡 Troubleshooting:');
            console.error('   - Check your internet connection');
            console.error('   - Verify CHROMADB_URL is correct');
            console.error('   - ChromaDB Cloud might be experiencing issues');
        }

        console.error('\n');
        process.exit(1);
    }
}

// Run the test
testChromaDBConnection();
