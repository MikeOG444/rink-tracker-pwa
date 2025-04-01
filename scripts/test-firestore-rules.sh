#!/bin/bash

# Script to test Firestore security rules
# Usage: ./scripts/test-firestore-rules.sh

# Ensure we're in the project root
cd "$(dirname "$0")/.." || exit

# Check if firebase-tools is installed
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if @firebase/rules-unit-testing is installed
if ! npm list @firebase/rules-unit-testing &> /dev/null; then
    echo "@firebase/rules-unit-testing not found. Installing..."
    npm install --save-dev @firebase/rules-unit-testing
fi

# Run the tests using firebase emulators:exec
# This will automatically start the emulator, run the tests, and then stop the emulator
echo "Starting Firebase emulator and running tests..."
firebase emulators:exec --only firestore "npx jest tests/firestore-rules.test.js"

# Capture the test result
exit $?
