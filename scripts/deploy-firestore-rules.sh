#!/bin/bash

# Script to deploy Firestore security rules
# Usage: ./scripts/deploy-firestore-rules.sh

# Ensure we're in the project root
cd "$(dirname "$0")/.." || exit

# Check if firebase-tools is installed
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if user is logged in
firebase login:list &> /dev/null
if [ $? -ne 0 ]; then
    echo "You need to log in to Firebase first."
    firebase login
fi

# Deploy the rules and indexes
echo "Deploying Firestore security rules and indexes..."
firebase deploy --only firestore

# Update the changelog with deployment info
if [ $? -eq 0 ]; then
    echo "Rules deployed successfully!"
    
    # Get the current version from the changelog
    VERSION=$(grep -m 1 "\[.*\]" cline_docs/security-rules-changelog.md | sed -E 's/.*\[(.*)\].*/\1/')
    DATE=$(date +%Y-%m-%d)
    USER=$(git config user.name || echo "Unknown")
    
    echo "Updating deployment history in changelog..."
    # Use a temporary file to avoid issues with in-place editing
    awk -v ver="$VERSION" -v date="$DATE" -v user="$USER" '
    /\| Version \| Date \| Deployed By \| Notes \|/ {
        print;
        print "|---------|----|-------------|-------|";
        print "| " ver " | " date " | " user " | Deployed via script |";
        next;
    }
    /\|---------\|----|-------------\|-------\|/ { next; }
    /\| [0-9]+\.[0-9]+\.[0-9]+ \|/ { next; }
    { print; }
    ' cline_docs/security-rules-changelog.md > temp_changelog.md
    
    mv temp_changelog.md cline_docs/security-rules-changelog.md
    
    echo "Changelog updated."
else
    echo "Deployment failed. Please check the error messages above."
fi
