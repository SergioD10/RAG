#!/bin/bash

echo "Starting RAG Frontend 2..."
echo "Make sure the RAG backend is running on http://localhost:8000"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the development server
echo "Starting development server on http://localhost:3000"
npm run dev