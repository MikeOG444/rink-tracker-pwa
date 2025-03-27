# Firestore Security Rules

This document provides an overview of the Firestore security rules for the Rink Tracker application and instructions for maintaining them.

## Overview

Firestore security rules protect your database by controlling who can read and write data. The rules in this project follow these principles:

1. **Authentication Required**: Most operations require the user to be signed in
2. **User Data Isolation**: Users can only access their own data
3. **Public/Private Data Separation**: Some data (like rinks) is public, while user-specific data is protected
4. **Validation**: Ensures data being written follows expected patterns

## Files

- `firestore.rules` - The main rules file that is deployed to Firebase
- `firestore.indexes.json` - Defines the Firestore indexes for optimized queries
- `cline_docs/firestore-schema.md` - Documentation of the database schema and access patterns
- `cline_docs/security-rules-changelog.md` - Changelog for tracking changes to the rules
- `tests/firestore-rules.test.js` - Tests for the security rules
- `scripts/deploy-firestore-rules.sh` - Script for deploying the rules and indexes
- `scripts/test-firestore-rules.sh` - Script for testing the rules

## Deployment

To deploy the security rules and indexes:

```bash
npm run deploy:firestore
```

This will:
1. Deploy the rules and indexes to Firebase
2. Update the changelog with the deployment information

## Testing

To test the security rules:

```bash
npm run test:firestore-rules
```

This will:
1. Start the Firebase emulator
2. Run the tests in `tests/firestore-rules.test.js`
3. Stop the emulator

## When to Update Rules

Security rules should be reviewed and potentially updated when:

1. **Adding new collections**: Any new collection needs appropriate security rules
2. **Changing document structure**: If you add/remove/modify fields that are used in security rules
3. **Changing access patterns**: If you change who should have access to what data
4. **Adding new features**: Features that change how data is accessed or stored

## How to Update Rules

1. Modify the `firestore.rules` file
2. Update the `firestore-schema.md` file if the schema has changed
3. Add a new entry to the `security-rules-changelog.md` file
4. Update or add tests in `tests/firestore-rules.test.js`
5. Run the tests to ensure the rules work as expected
6. Deploy the rules

## Pull Requests

When submitting a pull request that affects Firestore data or access patterns, make sure to:

1. Check the "Security Rules Check" section in the PR template
2. Include any necessary updates to the security rules
3. Include tests for the updated rules

## Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Rules Unit Testing Documentation](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
