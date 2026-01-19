# 🚀 Vercel Deployment Checklist

## ✅ Completed Steps

1. **Re-indexed ChromaDB Cloud** with 1024-dimensional Cohere embeddings
   - Collection: `harlingen_city_content`
   - Collection ID: `84ae9d33-9020-471c-9996-a3c86ef87530`
   - Total documents: 37

2. **Verified RAG Pipeline** working correctly
   - Semantic search returning accurate results
   - Top match distance: 0.28 (excellent similarity)

3. **Updated Environment Files**
   - Added `COHERE_API_KEY` to `.env.local`
   - Added `COHERE_API_KEY` to `.env.production`

---

## 📋 Vercel Environment Variables

Go to **Vercel Dashboard → Settings → Environment Variables** and add:

```bash
# ChromaDB Cloud
CHROMADB_URL=https://api.trychroma.com
CHROMADB_API_KEY=ck-6tncjhmyR3FsmgrDGNCNFitXNiCXmU7cfwaWGkFeFLc2
CHROMADB_TENANT=5dd15f77-38ad-4426-aa5f-0f4c401154a3
CHROMADB_DATABASE=harlibot
CHROMADB_COLLECTION=harlingen_city_content

# Gemini API
GOOGLE_API_KEY=AIzaSyCuM72823cFI3vA7S3E7y3QXSIWsEy9UK0
GEMINI_MODEL=gemini-2.0-flash
LLM_PROVIDER=gemini

# Embedding Service (Lambda with Cohere)
EMBEDDING_SERVICE_URL=https://31sw7weg4d.execute-api.us-east-1.amazonaws.com/prod

# Rate Limiting & Performance
MAX_CONVERSATION_HISTORY=6
MAX_QUERY_LENGTH=500
SIMILARITY_SEARCH_TOP_K=5
LLM_MAX_TOKENS=512
LLM_TEMPERATURE=0.7
```

> **Note**: The `COHERE_API_KEY` is NOT needed in Vercel since the Lambda function handles embedding generation.

---

## 🎯 Deployment Steps

1. **Commit and Push**
   ```bash
   git add .
   git commit -m "Re-indexed ChromaDB with Cohere embeddings"
   git push origin main
   ```

2. **Verify Vercel Auto-Deploy**
   - Check Vercel dashboard for deployment status
   - Wait for build to complete

3. **Test Production**
   - Visit your Vercel URL
   - Test the chatbot with queries like:
     - "What are the city commission meeting times?"
     - "¿Cuáles son los horarios de las reuniones de la comisión de la ciudad?"

---

## 🧪 Expected Behavior

- ✅ Chatbot should respond with **real information** (not demo mode)
- ✅ Responses should include **source citations**
- ✅ Both **English and Spanish** should work
- ✅ No "Embedding service unavailable" errors

---

## 🐛 Troubleshooting

If you see "demo mode" responses:

1. **Check Vercel Logs**
   - Look for error messages in deployment logs
   - Check function logs for API errors

2. **Verify Environment Variables**
   - Ensure all variables are set in Vercel
   - Check for typos in variable names

3. **Test Embedding Service**
   - The Lambda endpoint should be accessible
   - Check AWS CloudWatch logs if needed

---

## 📊 Success Metrics

- **ChromaDB**: 37 documents indexed with 1024-dim embeddings
- **Semantic Search**: Distance < 0.5 for relevant results
- **Response Time**: < 3 seconds for typical queries
- **Accuracy**: Responses match source content

---

## 🎉 You're Ready!

The RAG pipeline is fully operational and ready for production deployment!
