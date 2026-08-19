#!/bin/bash
set -e

echo "🚀 Deploying SafetyNet to Google Cloud Run..."

# 1. Check if PROJECT_ID is set
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
  echo "⚠️ No default project set. Please run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

echo "📦 Project: $PROJECT_ID"
echo "🔨 Enabling required Google Cloud APIs (Cloud Run, Cloud Build, Artifact Registry)..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

echo "🚢 Deploying directly from source to Cloud Run..."
gcloud run deploy safetynet \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --min-instances 0 \
  --max-instances 10

echo "✅ SafetyNet is now live on Google Cloud Run!"