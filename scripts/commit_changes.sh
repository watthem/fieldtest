#!/bin/bash

# Script to automate repomix generation and git commit

# Navigate to the project root (assuming the script is in a subdirectory like 'scripts')
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." &> /dev/null && pwd)"

cd "$PROJECT_ROOT" || exit 1

echo "Running in project root: $(pwd)"

# Prompt for commit message
read -p "Enter commit message: " COMMIT_MESSAGE

if [ -z "$COMMIT_MESSAGE" ]; then
    echo "Commit message cannot be empty. Aborting."
    exit 1
fi

# Run npx repomix
echo "Running npx repomix..."
npx repomix
if [ $? -ne 0 ]; then
    echo "npx repomix failed. Aborting commit."
    exit 1
fi

# Move repomix-output.xml to artifacts, creating artifacts directory if it doesn't exist
ARTIFACTS_DIR="$PROJECT_ROOT/artifacts"
mkdir -p "$ARTIFACTS_DIR"
if [ -f "repomix-output.xml" ]; then
    echo "Moving repomix-output.xml to $ARTIFACTS_DIR/..."
    mv repomix-output.xml "$ARTIFACTS_DIR/"
else
    echo "Warning: repomix-output.xml not found in project root after running npx repomix."
fi

# Add all changes to git
echo "Adding all changes to git..."
git add .

# Commit changes
echo "Committing changes with message: '$COMMIT_MESSAGE'..."
git commit -m "$COMMIT_MESSAGE"

if [ $? -eq 0 ]; then
    echo "Changes committed successfully."
else
    echo "Git commit failed. Please check git status and resolve any issues."
fi 