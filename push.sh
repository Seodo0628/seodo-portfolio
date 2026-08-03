#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "Adding changes..."
git add -A

echo "Committing..."
git commit -m "auto deploy $(date '+%Y-%m-%d %H:%M')"

echo "Pushing to GitHub..."
git push origin main

echo "Done!"
