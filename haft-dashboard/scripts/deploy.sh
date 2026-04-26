#!/bin/bash
# Fast FTP deploy using lftp
# Env vars from .env.deploy

set -e

source .env.deploy

echo "🚀 Deploying to haft.adxengine.net..."
echo "📁 Host: $FTP_HOST:$FTP_PORT"
echo "👤 User: $FTP_USER"

lftp -u "$FTP_USER,$FTP_PASSWORD" -e "
set net:timeout 10
set net:max-retries 2
open -e \"
  cd $FTP_REMOTE_PATH
  mirror --reverse --delete --continue .next .next
  mirror --reverse --delete --continue public public
  put package.json
  put next.config.ts
  put .env.local
  quit
\" $FTP_HOST:$FTP_PORT
"

echo "✨ Deploy complete! Visit https://haft.adxengine.net"
