#!/bin/bash

# Check if OpenAI API key is provided
if [ -z "$1" ]; then
    echo "Error: OpenAI API key not provided"
    echo "Usage: ./run-plugin.sh YOUR_OPENAI_API_KEY"
    echo "Example: ./run-plugin.sh sk-..."
    exit 1
fi

# Export the API key
export OPENAI_API_KEY=$1

# Run the plugin
echo "Running plugin with provided API key..."
npx ts-node run-plugin.ts

# Clear the API key from environment
unset OPENAI_API_KEY
