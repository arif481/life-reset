# Life Reset

A personal wellness app to help you track daily progress, manage your mood, and journal your journey.

## Setup Instructions

### 1. Configure Firebase

This app requires Firebase for authentication and data storage. Follow these steps:

1. **Copy the template config file:**
   ```bash
   cp firebase-config.template.js firebase-config.js
   ```

2. **Get your Firebase credentials:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select an existing one
   - Go to Project Settings > General
   - Scroll down to "Your apps" and click the web icon (</>)
   - Copy your Firebase configuration

3. **Update `firebase-config.js`:**
   - Open `firebase-config.js`
   - Replace the placeholder values with your actual Firebase credentials
   - **IMPORTANT:** Never commit this file to git - it's already in `.gitignore`

4. **Enable Firebase services:**
   - In Firebase Console, enable **Authentication** (Email/Password and Google)
   - Enable **Cloud Firestore** database
   - Update Firestore security rules using the provided `firestore.rules` file

### 2. Run the App

Just open `index.html` in your web browser. No build process needed.

## Getting Started

**Create an Account**
- Sign up with email and password
- Use your Google account
- Or just explore as a guest

**Track Daily Tasks**
- Check off tasks as you complete them
- Your app automatically counts how many days in a row you've been consistent
- Add your own custom tasks

**Log Your Mood**
- Rate how you're feeling each day (1-5 scale)
- Write notes about what's affecting your mood
- See patterns over time with charts

**Write Journal Entries**
- Write freely about your thoughts and day
- Entries are organized by date
- Delete old entries whenever you want

**See Your Progress**
- Charts showing your mood trends
- How many tasks you're completing
- Your longest streak

**Customize**
- Toggle between dark and light mode
- Add custom tasks
- Update your profile

## How Your Data Stays Safe

Your information is stored securely. Only you can access it. When you create an account, your data is protected and no one else can see it.

## Using the App

1. Sign in with your preferred method
2. Go to Daily Tracker to check off tasks and log your mood
3. Visit Journal to write entries
4. Check Analytics to see your progress
5. Adjust Settings as needed

## If You Need Help

If you're struggling, these resources are available:
- **India**: AASRA - 9820466726
- **Global**: Crisis Text Line - Text HOME to 741741

## Questions?

The app is designed to be straightforward. Explore it and things should make sense. If something isn't clear, look for the icons and labels - they guide you through each section.

## About This App

Life Reset is built to help you on your personal journey. Whether you're working on building better habits, tracking your emotional health, or just staying consistent, this tool is here to support you.

Track your progress. Celebrate the small wins. Keep moving forward.
