# HarliBot RAG Pipeline - Production Deployment Checklist

## ✅ Issues Found and Fixed

### 1. **ChromaDB Credentials**

- **Problem**: Using old API key
- **Fix**: Updated to new credentials from dashboard
  - API Key: `ck-4VtBJM7rP7sVcESAC6ZmjbzHSaEBvkvWCa7YPNoE4YXc`
  - Database: `HarliBot` (was lowercase `harlibot`)
  - Tenant: `5dd15f77-38ad-4426-aa5f-0f4c401154a3`

### 2. **Embedding Service URL Mismatch**

- **Problem**: Frontend `.env.local` had old Lambda URL
- **Fix**: Updated to current endpoint
  - Old: `https://31sw7weg4d.execute-api.us-east-1.amazonaws.com/prod`
  - New: `https://oeb9lfxq56.execute-api.us-east-1.amazonaws.com/prod`

### 3. **Verification Results** ✅

- ChromaDB connection: PASS (37 documents indexed)
- Embedding service: PASS (1024-dimension embeddings)
- End-to-end RAG: PASS (36%+ relevance scores)

---

## 🚀 Vercel Deployment Steps

### Update These Environment Variables in Vercel

1. **Go to**: <https://vercel.com> → HarliBot Project → Settings → Environment Variables

2. **Update the following variables** (for Production, Preview, and Development):

   ```bash
   CHROMADB_API_KEY=ck-4VtBJM7rP7sVcESAC6ZmjbzHSaEBvkvWCa7YPNoE4YXc
   CHROMADB_DATABASE=HarliBot
   EMBEDDING_SERVICE_URL=https://oeb9lfxq56.execute-api.us-east-1.amazonaws.com/prod
   ```

   **Keep these unchanged:**

   ```bash
   CHROMADB_TENANT=5dd15f77-38ad-4426-aa5f-0f4c401154a3
   CHROMADB_COLLECTION=harlingen_city_content
   GOOGLE_API_KEY=AIzaSyCuM72823cFI3vA7S3E7y3QXSIWsEy9UK0
   GEMINI_MODEL=gemini-2.0-flash
   ```

3. **Trigger Redeployment**:
   - Push changes to GitHub (automatic deployment), OR
   - Click "Redeploy" in Vercel dashboard

4. **Test Production**:
   - Visit your live site: <https://harli-bot.vercel.app>
   - Ask a test question: "What are the park hours?"
   - Verify you get REAL responses (not "demo mode")

---

## 📝 Files Changed Locally

- `/Users/jonathanrocha/Documents/GitHub/HarliBot/.env.local`
- `/Users/jonathanrocha/Documents/GitHub/HarliBot/frontend/.env.local`

**Important**: `.env.local` files are gitignored, so changes won't be committed. You only need to update Vercel variables.

---

## 🧪 Post-Deployment Verification

After deployment, test these queries:

1. English: "What are the park hours?"
2. Spanish: "¿Cuáles son los horarios del parque?"
3. Services: "How do I get a permit?"

Expected behavior: Real-time RAG responses with source citations, NOT demo mode messages.
