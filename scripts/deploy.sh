#!/bin/bash
set -e

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$PROJECT_ROOT/app"
TF_DIR="$PROJECT_ROOT/infrastructure/terraform"
OUT_DIR="$APP_DIR/out"
BUCKET_NAME="dravidamodel2026-site" # Must match terraform var.project_name + "-site"

echo "🚀 Starting Deployment..."

# 1. Build Next.js
echo "📦 Building Next.js application in $APP_DIR..."
cd "$APP_DIR"
npm install # Ensure dependencies are installed
npm run build

# 2. Deploy Infrastructure (Optional - Uncomment if you want to auto-apply)
# echo "🏗️ Applying Terraform..."
# cd "$TF_DIR"
# terraform init
# terraform apply

# 3. Sync to S3
echo "📂 Syncing to S3 ($BUCKET_NAME)..."
aws s3 sync "$OUT_DIR" "s3://$BUCKET_NAME" --delete

# 4. Invalidate CloudFront
# We need the Distribution ID. If you have it in an env var or output, use it.
# Otherwise, we can try to find it via the alias (domain name).
DOMAIN_NAME="dravidamodel2026.top"
echo "🔄 Finding CloudFront Distribution for $DOMAIN_NAME..."
DIST_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items!=null] | [?contains(Aliases.Items, '$DOMAIN_NAME')].Id | [0]" --output text)

if [ "$DIST_ID" != "None" ] && [ -n "$DIST_ID" ]; then
  echo "✨ Invalidating CloudFront Cache ($DIST_ID)..."
  aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*"
else
  echo "⚠️ Could not find CloudFront distribution for $DOMAIN_NAME. Please invalidate manually."
fi

echo "✅ Deployment Complete!"
