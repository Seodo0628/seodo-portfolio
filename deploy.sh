#!/bin/bash
set -e
cd /Users/seodo/Documents/web/seodo
git add -A
git commit -m "auto deploy"
git push --force origin main
