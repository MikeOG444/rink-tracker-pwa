# Firestore Security Rules Changelog

This document tracks changes to the Firestore security rules over time.

## [1.0.0] - 2025-03-27

### Added
- Initial security rules implementation
- Rules for `activities` collection
  - Users can only create, read, update, and delete their own activities
- Rules for `rinks` collection
  - Public read access
  - Authenticated users can create and update rinks
  - No delete access (admin-only operation)
- Rules for `user_rinks` collection
  - Users can only create, read, update, and delete their own user-rink relationships
  - Document ID validation to ensure format `{userId}_{rinkId}`
- Rules for `rink_visits` collection
  - Users can only create, read, update, and delete their own visits
  - Public visits can be read by anyone

### Helper Functions
- `isSignedIn()` - Checks if the user is authenticated
- `isOwner(userId)` - Checks if the authenticated user is the owner of the document

## How to Update This Changelog

When making changes to the security rules:

1. Increment the version number (follow [Semantic Versioning](https://semver.org/))
2. Add a new section with the date of the change
3. Document what was added, changed, or removed
4. Include any new helper functions or modifications to existing ones
5. Explain the rationale behind significant changes

Example:

```
## [1.1.0] - YYYY-MM-DD

### Added
- Rules for new `user_profiles` collection
  - Users can only read/write their own profiles
  - Public fields can be read by anyone

### Changed
- Modified `rinks` collection rules to allow admins to delete rinks
- Updated `isOwner()` function to also check for admin role

### Removed
- Removed redundant check in `user_rinks` rules
```

## Deployment History

| Version | Date | Deployed By | Notes |
|---------|------|-------------|-------|
| 1.0.0 | 2025-03-27 | Mike O'Gara | Initial deployment to prevent database lockout |
