#!/bin/bash
# Script to update existing Vercel environment variables for HarliBot
# This removes old values and sets new production values

set -e

echo "🔄 Updating HarliBot Vercel Environment Variables"
echo "=================================================="
echo ""

# Function to update an environment variable
update_env() {
    local var_name=$1
    local var_value=$2
    
    echo "📝 Updating $var_name..."
    
    # Remove existing variable from all environments
    vercel env rm "$var_name" production --yes 2>/dev/null || true
    vercel env rm "$var_name" preview --yes 2>/dev/null || true
    vercel env rm "$var_name" development --yes 2>/dev/null || true
    
    # Add new value to production
    echo "$var_value" | vercel env add "$var_name" production
}

echo "🎯 Updating critical backend service URLs..."
echo ""

# Update Embedding Service URL (AWS Lambda)
update_env "EMBEDDING_SERVICE_URL" "https://oeb9lfxq56.execute-api.us-east-1.amazonaws.com/prod"

# Update ChromaDB URL
update_env "CHROMADB_URL" "https://api.trychroma.com"

# Fix GEMINI_MODEL typo (was GEMINI_MODEl)
echo "🔧 Fixing GEMINI_MODEL typo..."
vercel env rm "GEMINI_MODEl" production --yes 2>/dev/null || true
update_env "GEMINI_MODEL" "gemini-2.0-flash"

echo ""
echo "✅ Environment variables updated successfully!"
echo ""
echo "🔄 Triggering production deployment..."
vercel --prod --yes

echo ""
echo "🎉 Deployment initiated!"
echo "📊 Monitor at: https://vercel.com/dashboard"
echo "🧪 Test chatbot at: https://harli-bot.vercel.app/"
