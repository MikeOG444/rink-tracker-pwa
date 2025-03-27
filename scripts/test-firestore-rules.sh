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

# Start the Firebase emulator in the background
echo "Starting Firebase emulator..."
firebase emulators:start --only firestore &
EMULATOR_PID=$!

# Give the emulator time to start
sleep 5

# Run the tests
echo "Running Firestore rules tests..."
npx jest tests/firestore-rules.test.js

# Capture the test result
TEST_RESULT=$?

# Kill the emulator
echo "Stopping Firebase emulator..."
kill $EMULATOR_PID

# Return the test result
exit $TEST_RESULT
