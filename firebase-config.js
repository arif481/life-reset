/**
 * @fileoverview Firebase Configuration & Initialization
 * @description Firebase SDK setup with authentication and Firestore
 * @version 1.0.0
 */

'use strict';

/* ==========================================================================
   Firebase Configuration
   ========================================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyC1elvm-s3DJkH4o1O_4Vd9TWrvjl-JsuA",
  authDomain: "life-reset-e39f4.firebaseapp.com",
  projectId: "life-reset-e39f4",
  storageBucket: "life-reset-e39f4.appspot.com",
  messagingSenderId: "214444955038",
  appId: "1:214444955038:web:666ab309bdc1171e7c728f",
  measurementId: "G-GXHKRHYEM1"
};

// Global Firebase references
var auth = null;
var db = null;
var firebaseReady = false;

// Initialize Firebase
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
    auth = firebase.auth();
    db = firebase.firestore();
    
    // Set auth persistence to LOCAL (survives browser/app restarts)
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
            console.log("Firebase auth persistence set to LOCAL");
        })
        .catch((error) => {
            console.warn("Could not set auth persistence:", error);
        });
    
    console.log("Firebase initialized successfully");
    
    // Enable Firestore offline persistence
    db.enablePersistence({ synchronizeTabs: true })
        .then(() => {
            console.log("Firestore offline persistence enabled");
        })
        .catch((err) => {
            if (err.code === 'failed-precondition') {
                console.warn("Firestore persistence unavailable: multiple tabs open");
            } else if (err.code === 'unimplemented') {
                console.warn("Firestore persistence not supported in this browser");
            }
        });
    
    firebaseReady = true;
} catch (error) {
    console.error("Error initializing Firebase:", error);
}
