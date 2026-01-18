#!/bin/bash
# Script to configure Vercel environment variables for HarliBot
# Run this from the repository root: ./scripts/configure-vercel-env.sh

set -e

echo "🚀 HarliBot Vercel Environment Configuration"
echo "=============================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Link to Vercel project (if not already linked)
echo "📡 Linking to Vercel project..."
vercel link --yes || true

echo ""
echo "📝 Setting environment variables for Production..."
echo ""

# Embedding Service
vercel env add EMBEDDING_SERVICE_URL production <<< "https://31sw7weg4d.execute-api.us-east-1.amazonaws.com/prod"

# ChromaDB Cloud
vercel env add CHROMADB_URL production <<< "https://api.trychroma.com"
vercel env add CHROMADB_API_KEY production <<< "ck-NUx2w6rYT6APj1W8NJthB6yphoFj2DTVo7qWRHNXVGJ"
vercel env add CHROMADB_TENANT production <<< "5dd15f77-38ad-4426-aa5f-0f4c401154a3"
vercel env add CHROMADB_DATABASE production <<< "harlibot"
vercel env add CHROMADB_COLLECTION production <<< "harlingen_city_content"

# Gemini API
vercel env add GOOGLE_API_KEY production <<< "AIzaSyCuM72823cFI3vA7S3E7y3QXSIWsEy9UK0"
vercel env add GEMINI_MODEL production <<< "gemini-2.0-flash"
vercel env add LLM_PROVIDER production <<< "gemini"

# Performance Configuration
vercel env add MAX_CONVERSATION_HISTORY production <<< "6"
vercel env add MAX_QUERY_LENGTH production <<< "500"
vercel env add SIMILARITY_SEARCH_TOP_K production <<< "5"
vercel env add LLM_MAX_TOKENS production <<< "512"
vercel env add LLM_TEMPERATURE production <<< "0.7"

echo ""
echo "✅ Environment variables configured successfully!"
echo ""
echo "🔄 Triggering deployment..."
vercel --prod

echo ""
echo "🎉 Deployment initiated! Check status at: https://vercel.com/dashboard"
echo ""
echo "⏱️  Deployment typically takes 2-3 minutes."
echo "📊 Once complete, test the chatbot at: https://harli-bot.vercel.app/"
