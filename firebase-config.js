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
} catch (error) {
    console.error("Error initializing Firebase:", error);
}
