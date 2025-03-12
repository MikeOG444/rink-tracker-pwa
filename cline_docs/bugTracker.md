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

## Bug #2: Geolocation Error Banner and Duplicate "Set Location Manually" Buttons

**Date Reported:** March 12, 2025

**Environment:** Production (https://rink-tracker-3620e.web.app)

**Description:**  
When navigating to the map page, the error banner "Location Access Issue: Geolocation is not supported by this browser" appears even when geolocation is supported and permissions are granted. Additionally, there are two "Set Location Manually" buttons visible simultaneously.

**Expected Behavior:**  
1. The error banner should only appear if geolocation is truly not supported or if the user has denied permission.
2. There should only be one "Set Location Manually" button visible at a time.

**Actual Behavior:**  
1. The error banner appears on initial page load but disappears when the page is reloaded.
2. Two "Set Location Manually" buttons are visible: one in the error banner and another in the map controls.

**Root Cause:**  
1. Race condition in geolocation detection:
   - The `useGeolocationSupport` hook was checking for geolocation support too early, before the browser fully initialized.
   - Once the error state was set, it wasn't being properly cleared when geolocation became available.
2. The "Set Location Manually" button in the map controls was always being rendered, regardless of whether the error banner (which also has a "Set Location Manually" button) was visible.

**Steps to Reproduce:**
1. Visit https://rink-tracker-3620e.web.app/map
2. Observe the error banner "Location Access Issue: Geolocation is not supported by this browser"
3. Observe two "Set Location Manually" buttons: one in the error banner and another in the map controls
4. Reload the page and observe that the error banner disappears

**Fix:**
1. Improve the geolocation support detection:
   - Increase the initial delay in `useGeolocationSupport` from 500ms to 1000ms
   - Add a retry mechanism with increasing delays
   - Add proper logging for debugging
2. Enhance error handling in `useUserLocation`:
   - Add a retry mechanism for geolocation requests
   - Clear error state when geolocation becomes available
   - Add a double-check for geolocation support
3. Fix the duplicate UI elements:
   - Conditionally render the "Set Location Manually" button in `MapControls` only when there's no error

**Status:** Fixed

**Priority:** Medium - This affects user experience but doesn't prevent core functionality

**Implementation:**
1. Modified `src/hooks/location/useGeolocationSupport.ts`:
   - Increased initial delay to 1000ms
   - Added retry mechanism with up to 3 attempts
   - Added proper error logging
2. Modified `src/hooks/useUserLocation.ts`:
   - Added retry mechanism for geolocation requests
   - Added error state clearing when geolocation becomes available
   - Added double-check for geolocation support
3. Modified `src/components/pages/MapPage.tsx`:
   - Conditionally passed `setManualLocation` to `MapControls` only when there's no error

**Notes:**
- This issue was more noticeable in certain browsers and environments
- The fix ensures a more robust geolocation detection process
- The UI now correctly shows only one "Set Location Manually" button at a time
