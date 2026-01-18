#!/bin/bash

# Lambda Warmup Script
# Keeps the HarliBot embedding Lambda function warm by pinging it periodically

set -e

LAMBDA_ENDPOINT="https://31sw7weg4d.execute-api.us-east-1.amazonaws.com/prod"

echo "========================================="
echo "HarliBot Lambda Warmup Script"
echo "========================================="
echo ""
echo "Endpoint: $LAMBDA_ENDPOINT"
echo ""

# Ping health endpoint
echo "Pinging /health endpoint..."
HEALTH_RESPONSE=$(curl -s "$LAMBDA_ENDPOINT/health")

if echo "$HEALTH_RESPONSE" | jq -e '.status == "healthy"' > /dev/null 2>&1; then
    echo "✓ Health check successful"
    echo "$HEALTH_RESPONSE" | jq .
else
    echo "✗ Health check failed"
    echo "$HEALTH_RESPONSE"
    exit 1
fi

echo ""
echo "Lambda is now warm and ready to serve requests!"
echo ""
