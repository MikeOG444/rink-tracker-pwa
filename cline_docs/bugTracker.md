# Bug Tracker

This document tracks bugs identified in the Rink Tracker application and their solutions.

## Bug #1: Map Layout Issue in Production

**Date Reported:** March 11, 2025

**Environment:** Production (https://rink-tracker-3620e.web.app)

**Description:**  
When accessing the map page without logging in, the map only takes up about 1/3 of the screen width, with the rest being empty black space.

**Expected Behavior:**  
The map should expand to fill the entire viewport width.

**Actual Behavior:**  
The map is constrained to approximately 1/3 of the screen width, with empty black space on the right side.

**Root Cause:**  
The issue is in `src/index.css`, which contains problematic styles from the default Vite template:

```css
body {
  margin: 0;
  display: flex;
  place-items: center;  /* This is centering the content horizontally */
  min-width: 320px;
  min-height: 100vh;
}
```

These styles are causing the body element to center its content horizontally, which is why the map is only taking up a portion of the screen width instead of expanding to fill the entire viewport.

**Steps to Reproduce:**
1. Visit https://rink-tracker-3620e.web.app
2. Click on the "Map" navigation link
3. Observe that the map only takes up about 1/3 of the screen width

**Fix:**
1. Modify the `src/index.css` file to remove the centering styles:
```css
body {
  margin: 0;
  /* Remove display: flex and place-items: center */
  min-width: 320px;
  min-height: 100vh;
}
```

**Status:** Fixed

**Priority:** High - This affects the core functionality of the application

**Implementation:**
1. Modified `src/index.css` to remove the problematic styles:
   - Removed `display: flex` and `place-items: center` from the body element
   - Committed changes to the repository
2. Rebuilt and redeployed the application to Firebase Hosting

**Notes:**
- The authentication flow is working correctly - the map is accessible to non-logged-in users
- The "Log Activity" button in the rink details panel correctly redirects to the auth page when clicked by a non-logged-in user
