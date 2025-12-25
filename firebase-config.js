// Firebase Configuration
// Replace these values with your actual Firebase project configuration
// You can find these in your Firebase Console -> Project Settings -> General

const firebaseConfig = {
  apiKey: "AIzaSyC1elvm-s3DJkH4o1O_4Vd9TWrvjl-JsuA",
  authDomain: "life-reset-e39f4.firebaseapp.com",
  projectId: "life-reset-e39f4",
  storageBucket: "life-reset-e39f4.appspot.com",
  messagingSenderId: "214444955038",
  appId: "1:214444955038:web:666ab309bdc1171e7c728f",
  measurementId: "G-GXHKRHYEM1"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
    
    // Enable Firestore offline persistence
    // This allows the app to work offline and sync when back online
    firebase.firestore().enablePersistence({ synchronizeTabs: true })
        .then(() => {
            console.log("Firestore offline persistence enabled");
        })
        .catch((err) => {
            if (err.code === 'failed-precondition') {
                // Multiple tabs open, persistence can only be enabled in one tab
                console.warn("Firestore persistence unavailable: multiple tabs open");
            } else if (err.code === 'unimplemented') {
                // The browser doesn't support persistence
                console.warn("Firestore persistence not supported in this browser");
            } else {
                console.error("Error enabling Firestore persistence:", err);
            }
        });
} catch (error) {
    console.error("Error initializing Firebase:", error);
}
