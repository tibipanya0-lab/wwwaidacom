#!/bin/bash
set -e

VPS_HOST="root@91.214.112.239"
VPS_STATIC="/opt/inaya-backend/static"
SSH_OPTS="-o StrictHostKeyChecking=no"

echo "=== Building frontend ==="
npm run build

echo "=== Deploying static files ==="
rsync -az --delete \
  --exclude='douglas/' \
  --exclude='admin.html' \
  --exclude='inaya-hero.html' \
  dist/ "${VPS_HOST}:${VPS_STATIC}/"

echo "=== Deploying hero HTML ==="
scp ${SSH_OPTS} public/inaya-hero.html "${VPS_HOST}:${VPS_STATIC}/inaya-hero.html"

echo "=== Done ==="
echo "Frontend deployed to ${VPS_HOST}:${VPS_STATIC}"
