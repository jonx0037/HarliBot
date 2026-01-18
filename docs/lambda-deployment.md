# AWS Lambda Deployment Guide

This guide covers deploying the HarliBot embedding service to AWS Lambda with API Gateway.

## Prerequisites

1. **AWS CLI** - [Install guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
2. **AWS SAM CLI** - Install with `brew install aws-sam-cli` (macOS)
3. **Docker** - Required for building container images
4. **AWS Account** - Account ID: `656008069605`

## Quick Start

### 1. Configure AWS Credentials

```bash
aws configure
```

Enter your AWS Access Key ID, Secret Access Key, and set region to `us-east-1`.

### 2. Deploy to Lambda

Run the automated deployment script:

```bash
cd backend
./deploy.sh
```

The script will:
- Create ECR repository if needed
- Build Docker image with the embedding model
- Push image to ECR
- Deploy Lambda function and API Gateway via SAM
- Output the API endpoint URL

**Deployment time**: ~10-15 minutes (first time)

### 3. Update Vercel Environment Variable

After deployment completes, copy the API endpoint URL and update in Vercel:

1. Go to your Vercel dashboard
2. Select the HarliBot project
3. Navigate to **Settings → Environment Variables**
4. Add or update `EMBEDDING_SERVICE_URL` to the API endpoint (e.g., `https://abc123.execute-api.us-east-1.amazonaws.com/prod`)
5. Redeploy the frontend

## Testing

### Test Health Endpoint

```bash
curl https://YOUR_API_ENDPOINT/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "HarliBot Embedding Service",
  "model": "sentence-transformers/paraphrase-multilingual-mpnet-base-v2",
  "dimension": 768
}
```

### Test Embedding Generation

```bash
curl -X POST "https://YOUR_API_ENDPOINT/embed" \
  -H "Content-Type: application/json" \
  -d '{
    "texts": ["Hello world", "Hola mundo"],
    "normalize": true
  }'
```

Expected response:
```json
{
  "embeddings": [[0.123, -0.456, ...], [0.789, -0.012, ...]],
  "model": "sentence-transformers/paraphrase-multilingual-mpnet-base-v2",
  "dimension": 768,
  "count": 2
}
```

## Manual Deployment Steps

If you prefer manual deployment or troubleshooting:

### 1. Create ECR Repository

```bash
aws ecr create-repository \
  --repository-name harlibot-embedding \
  --region us-east-1
```

### 2. Build Docker Image

```bash
cd backend
docker build -f Dockerfile.lambda -t harlibot-embedding:latest .
```

### 3. Push to ECR

```bash
# Authenticate Docker
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 656008069605.dkr.ecr.us-east-1.amazonaws.com

# Tag image
docker tag harlibot-embedding:latest \
  656008069605.dkr.ecr.us-east-1.amazonaws.com/harlibot-embedding:latest

# Push
docker push 656008069605.dkr.ecr.us-east-1.amazonaws.com/harlibot-embedding:latest
```

### 4. Deploy with SAM

```bash
cd /Users/jonathanrocha/Documents/GitHub/HarliBot

# Build
sam build

# Deploy (first time - guided)
sam deploy --guided

# Deploy (subsequent)
sam deploy
```

## Architecture

```
┌─────────────┐
│   Client    │
│  (Vercel)   │
└──────┬──────┘
       │ HTTPS
       ▼
┌──────────────┐
│ API Gateway  │ ← /embed, /health endpoints
│              │ ← CORS configured
└──────┬───────┘
       │ Invoke
       ▼
┌──────────────┐
│   Lambda     │ ← Container Image (2-4GB)
│   Function   │ ← 4GB memory, 60s timeout
│              │ ← Model pre-loaded in image
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ CloudWatch   │ ← Logs, metrics
│    Logs      │
└──────────────┘
```

## Files

- **`lambda_handler.py`** - Lambda function handler
- **`Dockerfile.lambda`** - Container image definition
- **`requirements-lambda.txt`** - Python dependencies
- **`template.yaml`** - SAM infrastructure template
- **`samconfig.toml`** - SAM deployment configuration
- **`deploy.sh`** - Automated deployment script

## Configuration

### Lambda Function Settings

- **Memory**: 4096 MB (4GB) - Required for large ML model
- **Timeout**: 60 seconds
- **Ephemeral Storage**: 2048 MB
- **Architecture**: x86_64

### API Gateway

- **Stage**: prod
- **CORS**: Enabled for all origins (can restrict to Vercel domains)
- **Endpoints**:
  - `GET /health` - Health check
  - `POST /embed` - Generate embeddings
  - `OPTIONS /*` - CORS preflight

## Monitoring

### View Logs

```bash
# Stream logs in real-time
sam logs --name harlibot-embedding-service --tail

# View specific time range
sam logs --name harlibot-embedding-service \
  --start-time '10min ago' \
  --end-time 'now'
```

### CloudWatch Console

1. Go to AWS Console → CloudWatch → Logs
2. Log group: `/aws/lambda/harlibot-embedding-service`
3. View recent invocations, errors, and performance metrics

## Updating the Service

### Update Code Only

```bash
cd backend

# Rebuild and push image
docker build -f Dockerfile.lambda -t harlibot-embedding:latest .
docker tag harlibot-embedding:latest \
  656008069605.dkr.ecr.us-east-1.amazonaws.com/harlibot-embedding:latest
docker push 656008069605.dkr.ecr.us-east-1.amazonaws.com/harlibot-embedding:latest

# Update Lambda function
aws lambda update-function-code \
  --function-name harlibot-embedding-service \
  --image-uri 656008069605.dkr.ecr.us-east-1.amazonaws.com/harlibot-embedding:latest
```

### Update Infrastructure

```bash
# Make changes to template.yaml
# Then redeploy
sam build
sam deploy
```

## Troubleshooting

### Cold Starts Taking Too Long

- Normal for first invocation: 5-10 seconds
- Consider enabling Provisioned Concurrency (adds cost)
- Keep container image optimized

### Out of Memory Errors

- Increase Lambda memory in `template.yaml`
- Check CloudWatch logs for memory usage patterns

### CORS Errors

- Verify `Access-Control-Allow-Origin` in Lambda response
- Check API Gateway CORS settings match frontend domain

### Image Too Large

- Current image ~2-3GB (within Lambda's 10GB limit)
- Use CPU-only PyTorch (already configured)
- Model is pre-downloaded during build

## Cost Optimization

### Current Configuration (~$1-3/month)

- Lambda invocations: First 1M requests/month free
- Lambda compute: Pay per GB-second
- API Gateway: First 1M requests/month free
- ECR storage: ~$0.10/GB/month

### Reduce Costs

1. **Reduce memory** if possible (test with 2GB first)
2. **Reduce timeout** to minimum needed
3. **Use reserved concurrency limits** to prevent runaway costs
4. **Delete old ECR images** periodically

## Next Steps

1. ✅ Deploy to Lambda
2. ✅ Test endpoints
3. ✅ Update Vercel environment variable
4. Test chat functionality in production
5. Monitor CloudWatch for errors
6. Optimize based on usage patterns
