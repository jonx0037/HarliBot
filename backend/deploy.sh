#!/bin/bash

# HarliBot Embedding Service - AWS Lambda Deployment Script
# Deploys the embedding service as a Lambda container image with API Gateway

set -e  # Exit on error

echo "========================================="
echo "HarliBot Embedding Service Deployment"
echo "========================================="

# Configuration
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="656008069605"
ECR_REPO_NAME="harlibot-embedding"
IMAGE_TAG="latest"
STACK_NAME="harlibot-embedding-service"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "\n${YELLOW}Step 1: Checking prerequisites...${NC}"

if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI not found. Please install it first.${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker not found. Please install it first.${NC}"
    exit 1
fi

if ! command -v sam &> /dev/null; then
    echo -e "${RED}Error: AWS SAM CLI not found. Please install it first.${NC}"
    echo "Install with: brew install aws-sam-cli"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites found${NC}"

# Step 2: Create ECR repository if it doesn't exist
echo -e "\n${YELLOW}Step 2: Setting up ECR repository...${NC}"

if aws ecr describe-repositories --repository-names ${ECR_REPO_NAME} --region ${AWS_REGION} &> /dev/null; then
    echo -e "${GREEN}✓ ECR repository already exists${NC}"
else
    echo "Creating ECR repository..."
    aws ecr create-repository \
        --repository-name ${ECR_REPO_NAME} \
        --region ${AWS_REGION} \
        --image-scanning-configuration scanOnPush=true
    echo -e "${GREEN}✓ ECR repository created${NC}"
fi

# Step 3: Authenticate Docker to ECR
echo -e "\n${YELLOW}Step 3: Authenticating Docker to ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | \
    docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
echo -e "${GREEN}✓ Docker authenticated${NC}"

# Step 4: Build Docker image
echo -e "\n${YELLOW}Step 4: Building Docker image...${NC}"
cd backend
docker build -f Dockerfile.lambda -t ${ECR_REPO_NAME}:${IMAGE_TAG} .
echo -e "${GREEN}✓ Docker image built${NC}"
cd ..

# Step 5: Tag and push to ECR
echo -e "\n${YELLOW}Step 5: Pushing image to ECR...${NC}"
ECR_IMAGE_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:${IMAGE_TAG}"
docker tag ${ECR_REPO_NAME}:${IMAGE_TAG} ${ECR_IMAGE_URI}
docker push ${ECR_IMAGE_URI}
echo -e "${GREEN}✓ Image pushed to ECR${NC}"

# Step 6: Build SAM application
echo -e "\n${YELLOW}Step 6: Building SAM application...${NC}"
sam build
echo -e "${GREEN}✓ SAM build complete${NC}"

# Step 7: Deploy with SAM
echo -e "\n${YELLOW}Step 7: Deploying to AWS Lambda...${NC}"
sam deploy --no-confirm-changeset

# Step 8: Get API endpoint
echo -e "\n${YELLOW}Step 8: Retrieving API endpoint...${NC}"
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --region ${AWS_REGION} \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
    --output text)

echo ""
echo "========================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "========================================="
echo ""
echo "API Gateway Endpoint:"
echo -e "${GREEN}${API_ENDPOINT}${NC}"
echo ""
echo "Test the endpoint with:"
echo "curl -X POST \"${API_ENDPOINT}/embed\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"texts\": [\"Hello world\", \"Hola mundo\"]}'"
echo ""
echo "Next steps:"
echo "1. Update EMBEDDING_SERVICE_URL in Vercel to: ${API_ENDPOINT}"
echo "2. Test the /health endpoint: curl ${API_ENDPOINT}/health"
echo "3. Test the chat functionality in the deployed Vercel app"
echo ""
