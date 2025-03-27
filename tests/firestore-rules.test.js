const firebase = require('@firebase/rules-unit-testing');
const fs = require('fs');
const path = require('path');

/**
 * The emulator will accept any project ID for testing.
 */
const PROJECT_ID = 'firestore-rules-test';

/**
 * Creates a new app with authentication data.
 */
function getAuthedApp(auth) {
  return firebase.initializeTestApp({
    projectId: PROJECT_ID,
    auth
  }).firestore();
}

/**
 * Creates a new admin app.
 */
function getAdminApp() {
  return firebase.initializeAdminApp({
    projectId: PROJECT_ID
  }).firestore();
}

beforeAll(async () => {
  // Load the rules file
  const rules = fs.readFileSync(path.resolve(__dirname, '../firestore.rules'), 'utf8');
  
  // Deploy rules to the emulator
  await firebase.loadFirestoreRules({
    projectId: PROJECT_ID,
    rules
  });
});

beforeEach(async () => {
  // Clear the database between tests
  await firebase.clearFirestoreData({ projectId: PROJECT_ID });
});

afterAll(async () => {
  // Delete all apps
  await Promise.all(firebase.apps().map(app => app.delete()));
});

describe('Firestore Security Rules', () => {
  const userId = 'user1';
  const otherUserId = 'user2';
  const rinkId = 'rink1';
  
  describe('activities collection', () => {
    it('allows users to create their own activities', async () => {
      const db = getAuthedApp({ uid: userId });
      const activityData = {
        userId: userId,
        rinkId: rinkId,
        type: 'HOCKEY_GAME',
        date: new Date(),
        duration: 60,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await firebase.assertSucceeds(
        db.collection('activities').add(activityData)
      );
    });
    
    it('prevents users from creating activities for others', async () => {
      const db = getAuthedApp({ uid: userId });
      const activityData = {
        userId: otherUserId, // Different user ID
        rinkId: rinkId,
        type: 'HOCKEY_GAME',
        date: new Date(),
        duration: 60,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await firebase.assertFails(
        db.collection('activities').add(activityData)
      );
    });
    
    it('allows users to read their own activities', async () => {
      // Set up test data
      const admin = getAdminApp();
      const activityRef = await admin.collection('activities').add({
        userId: userId,
        rinkId: rinkId,
        type: 'HOCKEY_GAME',
        date: new Date(),
        duration: 60,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Test reading as the owner
      const db = getAuthedApp({ uid: userId });
      await firebase.assertSucceeds(
        db.collection('activities').doc(activityRef.id).get()
      );
    });
    
    it('prevents users from reading others activities', async () => {
      // Set up test data
      const admin = getAdminApp();
      const activityRef = await admin.collection('activities').add({
        userId: userId,
        rinkId: rinkId,
        type: 'HOCKEY_GAME',
        date: new Date(),
        duration: 60,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Test reading as another user
      const db = getAuthedApp({ uid: otherUserId });
      await firebase.assertFails(
        db.collection('activities').doc(activityRef.id).get()
      );
    });
  });
  
  describe('rinks collection', () => {
    it('allows anyone to read rink data', async () => {
      // Set up test data
      const admin = getAdminApp();
      const rinkRef = await admin.collection('rinks').doc(rinkId).set({
        id: rinkId,
        name: 'Test Rink',
        address: '123 Test St',
        position: { lat: 43.123, lng: -79.456 },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Test reading as an unauthenticated user
      const db = firebase.initializeTestApp({
        projectId: PROJECT_ID
      }).firestore();
      
      await firebase.assertSucceeds(
        db.collection('rinks').doc(rinkId).get()
      );
    });
    
    it('allows authenticated users to create rinks', async () => {
      const db = getAuthedApp({ uid: userId });
      const rinkData = {
        id: 'new-rink',
        name: 'New Rink',
        address: '456 New St',
        position: { lat: 43.789, lng: -79.012 },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await firebase.assertSucceeds(
        db.collection('rinks').doc('new-rink').set(rinkData)
      );
    });
    
    it('prevents unauthenticated users from creating rinks', async () => {
      const db = firebase.initializeTestApp({
        projectId: PROJECT_ID
      }).firestore();
      
      const rinkData = {
        id: 'new-rink',
        name: 'New Rink',
        address: '456 New St',
        position: { lat: 43.789, lng: -79.012 },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await firebase.assertFails(
        db.collection('rinks').doc('new-rink').set(rinkData)
      );
    });
  });
  
  describe('user_rinks collection', () => {
    const userRinkId = `${userId}_${rinkId}`;
    const otherUserRinkId = `${otherUserId}_${rinkId}`;
    
    it('allows users to create their own user_rink documents', async () => {
      const db = getAuthedApp({ uid: userId });
      const userRinkData = {
        userId: userId,
        rinkId: rinkId,
        isFavorite: false,
        visitCount: 1,
        hasVerifiedVisit: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await firebase.assertSucceeds(
        db.collection('user_rinks').doc(userRinkId).set(userRinkData)
      );
    });
    
    it('prevents users from creating user_rink documents for others', async () => {
      const db = getAuthedApp({ uid: userId });
      const userRinkData = {
        userId: otherUserId, // Different user ID
        rinkId: rinkId,
        isFavorite: false,
        visitCount: 1,
        hasVerifiedVisit: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await firebase.assertFails(
        db.collection('user_rinks').doc(otherUserRinkId).set(userRinkData)
      );
    });
    
    it('allows users to read their own user_rink documents', async () => {
      // Set up test data
      const admin = getAdminApp();
      await admin.collection('user_rinks').doc(userRinkId).set({
        userId: userId,
        rinkId: rinkId,
        isFavorite: false,
        visitCount: 1,
        hasVerifiedVisit: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Test reading as the owner
      const db = getAuthedApp({ uid: userId });
      await firebase.assertSucceeds(
        db.collection('user_rinks').doc(userRinkId).get()
      );
    });
    
    it('prevents users from reading others user_rink documents', async () => {
      // Set up test data
      const admin = getAdminApp();
      await admin.collection('user_rinks').doc(userRinkId).set({
        userId: userId,
        rinkId: rinkId,
        isFavorite: false,
        visitCount: 1,
        hasVerifiedVisit: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Test reading as another user
      const db = getAuthedApp({ uid: otherUserId });
      await firebase.assertFails(
        db.collection('user_rinks').doc(userRinkId).get()
      );
    });
  });
  
  describe('rink_visits collection', () => {
    it('allows users to create their own visits', async () => {
      const db = getAuthedApp({ uid: userId });
      const visitData = {
        userId: userId,
        rinkId: rinkId,
        date: new Date(),
        activityType: 'HOCKEY_GAME',
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await firebase.assertSucceeds(
        db.collection('rink_visits').add(visitData)
      );
    });
    
    it('prevents users from creating visits for others', async () => {
      const db = getAuthedApp({ uid: userId });
      const visitData = {
        userId: otherUserId, // Different user ID
        rinkId: rinkId,
        date: new Date(),
        activityType: 'HOCKEY_GAME',
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await firebase.assertFails(
        db.collection('rink_visits').add(visitData)
      );
    });
    
    it('allows users to read their own private visits', async () => {
      // Set up test data
      const admin = getAdminApp();
      const visitRef = await admin.collection('rink_visits').add({
        userId: userId,
        rinkId: rinkId,
        date: new Date(),
        activityType: 'HOCKEY_GAME',
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Test reading as the owner
      const db = getAuthedApp({ uid: userId });
      await firebase.assertSucceeds(
        db.collection('rink_visits').doc(visitRef.id).get()
      );
    });
    
    it('prevents users from reading others private visits', async () => {
      // Set up test data
      const admin = getAdminApp();
      const visitRef = await admin.collection('rink_visits').add({
        userId: userId,
        rinkId: rinkId,
        date: new Date(),
        activityType: 'HOCKEY_GAME',
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Test reading as another user
      const db = getAuthedApp({ uid: otherUserId });
      await firebase.assertFails(
        db.collection('rink_visits').doc(visitRef.id).get()
      );
    });
    
    it('allows anyone to read public visits', async () => {
      // Set up test data
      const admin = getAdminApp();
      const visitRef = await admin.collection('rink_visits').add({
        userId: userId,
        rinkId: rinkId,
        date: new Date(),
        activityType: 'HOCKEY_GAME',
        isPublic: true, // Public visit
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Test reading as another user
      const db = getAuthedApp({ uid: otherUserId });
      await firebase.assertSucceeds(
        db.collection('rink_visits').doc(visitRef.id).get()
      );
    });
  });
});
