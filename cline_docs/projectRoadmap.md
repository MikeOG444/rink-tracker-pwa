# Rink Tracker PWA - Project Roadmap

## Project Overview
🚀 Project Overview - Rink Tracker
Rink Tracker is a progressive web application (PWA) designed for hockey players, coaches, and fans to log and track their rink visits and activities. The app enhances the user experience with interactive maps, activity logging, and gamification features that encourage engagement and friendly competition.

🏒 Key Features
🏟️ Rink Tracking & Activity Logging
- Users can log games, practices, training sessions, open skates and games watched
- Activities are linked to specific rinks, allowing users to track where they've played
- Activities can be logged in real time or from hostorical visits
- Verified rink visits are automatically detected using geolocation

📍 Interactive Map
- Users can search for rinks by name or location
- Rinks are displayed on a map with differentiated markers based on visit status
- Selecting a rink provides details, including location, activity history, images and users at or recently at location

🏆 Leaderboards & Gamification
- Track unique rink visits and compare rankings with other users
- Track total activites logged
- Track total number of each activity logged
- Compete for a spot on player birth-year and global leaderboards
- Earn badges and achievements for milestones like first visit, 10 rinks, 50 rinks, and more

📊 Dashboard
- A personalized dashboard displays logged activities, rink visit history, and statistics
- Users can filter and sort activities to view their progress
- Activities are color-coded or marked to indicate verified vs. non-verified visits
- Support for offline activity logging, allowing entries to be saved and synced later


👤 Profile Management
- Users can edit their display name, avatar, and player/team information
- Manage activity history, including the ability to edit or delete past activities
- Customize experience settings, such as preferred rink notifications or leaderboard visibility
- Future enhancement: Link multiple accounts for families or teams

🔄 Social & Community Features (Future Enhancements)
- Follow friends and compare rink visit histories
- Share rink visit achievements and compete in challenges
- Suggest rink edits to improve data accuracy

📌 Why It Matters
Rink Tracker is more than just an activity log—it's a hockey community hub that encourages users to explore new rinks, track their progress, and connect with other players. By integrating maps, tracking, and leaderboards, the app creates a fun, engaging experience that motivates players to expand their rink horizons.

📍 Who is it for?
🏒 Players tracking their games, practices, and training
🧑‍🏫 Coaches monitoring player activity across rinks
📢 Hockey parents keeping track of their kids’ rink visits
🚗 Hockey travelers looking for new rinks to visit
🎮 Competitors who want to climb the leaderboards

### **📌 Updated Development Roadmap**  

## **🎯 High-Level Goals**  
- [ ] Provide a **seamless experience** for users to **search, track, and log** their rink visits and activities  
- [ ] Implement **secure user authentication**, including **email verification** and **password reset**  
- [ ] Develop an **interactive map** displaying rinks with **search and filtering** capabilities  
- [ ] Enable **real-time and historical activity logging**, with **verification for on-site visits**  
- [ ] Create a **dashboard** for managing logged activities, rink visits, and progress tracking  
- [ ] Implement **gamification** features, including **leaderboards, achievements, and badges**  
- [ ] Ensure **full offline functionality** with proper data sync when back online  
- [ ] Optimize the **UI/UX for mobile and desktop**, ensuring an **intuitive and engaging experience**  

---

## **🔑 Key Features**  

### **👤 User Authentication & Account Management**  
- [x] **Sign up, login, and password reset**  
- [x] **Google sign-in support**  
- [x] **Email verification process before dashboard access**  
- [ ] **User profile customization** (name, avatar, team, etc.)  

### **📍 Interactive Map & Rink Search**  
- [x] **Search for rinks by name or location**  
- [ ] **Display rink markers on the map** (visited, not visited, verified, etc.)  
- [ ] **Show rink details panel** (name, location, images, activity stats, etc.)  
- [ ] **Allow users to mark a rink as visited manually**  

### **🏒 Activity Logging & Rink Visits**  
- [ ] **Log activities (games, practices, training, open skates, and watched games)**  
- [ ] **Associate activities with a specific rink**  
- [ ] **Automatically verify activities logged at a rink when user is at the location**  
- [ ] **View activity history within the dashboard and rink details panel**  
- [ ] **Edit or delete past activities**  

### **📊 Dashboard & Activity Management**  
- [ ] **Personalized dashboard displaying activity history and rink visits**  
- [ ] **Sorting and filtering for activities (date, rink, activity type, verification status, etc.)**  
- [ ] **Offline logging support with sync upon reconnection**  
- [ ] **Show verification badges for verified/unverified activities**  

### **🏆 Gamification & Leaderboards**  
- [ ] **Track unique rinks visited and total activities logged**  
- [ ] **Global and birth-year leaderboards for rink visits & activities**  
- [ ] **Earn badges and achievements for milestones (e.g., first visit, 10 rinks, 50 rinks, etc.)**  

### **🔄 Offline Support & Progressive Web App (PWA) Features**  
- [ ] **Offline mode for activity logging**  
- [ ] **Automatic data sync once online**  
- [ ] **Installable as a PWA on mobile and desktop**  

### **📢 Social & Community (Future Enhancements)**  
- [ ] **Follow friends and compare rink visits**  
- [ ] **Challenges and rewards for users**  
- [ ] **Suggest rink edits for missing or incorrect data**  

---

## **✅ Completion Criteria**  
- All **high-level goals are met**  
- **Authentication and security measures** function properly  
- **Map functionality** (search, rink details, and visit tracking) works correctly  
- **Activity logging system** operates as expected  
- **Leaderboards and gamification elements** are implemented successfully  
- **Offline mode and data syncing** are fully functional  
- The **UI/UX is intuitive, visually appealing, and responsive**  
- The application passes **all tests (unit, integration, and end-to-end)**  
- **Firebase integration is efficient and secure**  

---

## **📌 Progress Tracker**  
- **Current Phase**: **Feature Development**  
- **Overall Progress**: 🚧 **In Progress**  

---

## **✅ Completed Tasks**  
- [x] **Project initialization**  
- [x] **Firebase setup & authentication**  
- [x] **Basic user login and sign-up flow**  
- [x] **Initial interactive map with rink search functionality**  
- [x] **Activity logging system prototype**  
- [x] **Basic offline support with IndexedDB**  
- [x] **Technical Debt Refactoring - Phase 1**: Refactored complex hooks and components
- [x] **Technical Debt Refactoring - Phase 2**: Implemented repository pattern and improved code quality
- [x] **Domain Model Implementation**: Created core domain models with validation and factory methods
- [x] **Repository Pattern Implementation**: Implemented repository pattern for domain models with Firestore integration
- [x] **Code Quality Improvements**: Eliminated code duplication, enhanced error handling, and improved type safety
- [x] **Bug Fixes**: Fixed issues with domain models' toObject methods and IndexedDB storage for offline activities
- [x] **Rink Selection Feature**: Implemented rink selection modal for activity logging with search functionality
- [x] **Bug Fixes**: Fixed activity type display issue (Open Skate vs. Recreational Skating)
- [x] **Bug Fixes**: Fixed activity type filtering issue in Dashboard by ensuring consistency between UI labels and stored values
- [x] **UX Improvements**: Enhanced RinkSelectionModal with search button and better user feedback
- [x] **Bug Fixes**: Fixed accessibility issues and Google Maps API error handling in RinkSelectionModal
- [x] **UX Improvements**: Added retry button for Google Maps API loading failures with improved error messages
- [x] **Architecture Improvements**: Moved Google Maps API loading to app level with GoogleMapsContext
- [x] **Infrastructure Improvements**: Created required Firestore composite indexes for activities and rink_visits collections
- [x] **Error Handling**: Implemented centralized error handling with custom error classes and structured logging
- [x] **Logging**: Created a comprehensive logging service with different log levels and context support

---

## **🔧 Future Tech Debt Cleanup**
- **Repository Test and Implementation Mismatches**: Fix discrepancies between FirestoreUserRinkRepository tests and implementation:
  - Method name mismatch: Repository uses `toObject()` but tests mock `toFirestore()`
  - Result handling in `findByUserId`: Tests expect 2 results but get 0
  - Error handling in `delete` method: Returns false instead of throwing an error
- **Complete Repository Testing**: Finish testing the repository implementations:
  - Write unit tests for repositories
  - Verify functionality works as expected
  - Check for regressions or performance issues
- **State Management Improvements**:
  - Evaluate React Context vs Redux for state management
  - Create a dedicated state slice for rink-related data
  - Implement proper state normalization
  - Add selectors for derived state
- **Code Quality Improvements**:
  - Identify and refactor any remaining complex methods
  - Improve error handling in UI components using the new error handling system
  - Enhance logging with the new logging service

## **🔮 Future Considerations**  
- **ice rink booking systems**  Integration with systems available and in use
- **Push notifications** for rink updates, events, and reminders  
- **More advanced filtering** for rink and activity searches  
- **Social features** (following users, sharing activities, and team-based tracking)  
- **User-generated content** (rink reviews, tips, and comments)  

---
