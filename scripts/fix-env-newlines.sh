#!/bin/bash
# Script to fix malformed environment variables with newline characters
# This removes the variables and re-adds them with clean values

set -e

echo "🔧 Fixing Malformed Environment Variables"
echo "=========================================="
echo ""
echo "Issue: CHROMADB_URL, EMBEDDING_SERVICE_URL, and GEMINI_MODEL have trailing \\n characters"
echo ""

# Function to cleanly update an environment variable
clean_update_env() {
    local var_name=$1
    local var_value=$2
    
    echo "🧹 Cleaning $var_name..."
    
    # Remove from all environments
    vercel env rm "$var_name" production --yes 2>/dev/null || true
    vercel env rm "$var_name" preview --yes 2>/dev/null || true
    vercel env rm "$var_name" development --yes 2>/dev/null || true
    
    # Add clean value (using printf to avoid newlines)
    printf "%s" "$var_value" | vercel env add "$var_name" production
    printf "%s" "$var_value" | vercel env add "$var_name" preview
    printf "%s" "$var_value" | vercel env add "$var_name" development
}

echo "🎯 Fixing critical environment variables..."
echo ""

# Fix EMBEDDING_SERVICE_URL (remove trailing \n)
clean_update_env "EMBEDDING_SERVICE_URL" "https://31sw7weg4d.execute-api.us-east-1.amazonaws.com/prod"

# Fix CHROMADB_URL (remove trailing \n)
clean_update_env "CHROMADB_URL" "https://api.trychroma.com"

# Fix GEMINI_MODEL (remove trailing \n)
clean_update_env "GEMINI_MODEL" "gemini-2.0-flash"

echo ""
echo "✅ Environment variables cleaned successfully!"
echo ""
echo "🔄 Triggering production deployment..."
cd frontend
vercel --prod --yes

echo ""
echo "🎉 Deployment initiated!"
echo "⏱️  Wait 2-3 minutes for deployment to complete"
echo "🧪 Test chatbot at: https://harli-bot.vercel.app/"
