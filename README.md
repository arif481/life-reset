# Life Reset 🌟

> A modern personal wellness Progressive Web App (PWA) for building better habits, tracking mood, journaling, and gamifying self-improvement.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Android-orange.svg)

## ✨ Features

### 📋 Task Management
- Daily task tracking with customizable categories
- Morning, Health, Productivity, and Evening routines
- Add custom tasks for personalized workflows
- Real-time progress tracking and completion rates

### 😊 Mood Tracking
- 5-level mood scale with emoji indicators
- Intensity slider for nuanced tracking
- Trigger identification (work, relationships, health, etc.)
- Mood statistics and trend analysis

### 📔 Journal
- Rich text journaling with daily entries
- Sentiment analysis for emotional insights
- Tag-based organization and search
- Word count and writing statistics

### 📊 Analytics Dashboard
- Interactive charts powered by Chart.js
- Mood trend visualization
- Task completion patterns
- XP progress tracking
- Weekly/monthly insights

### 🎮 Gamification System
- Experience points (XP) for completing activities
- Level progression system
- Unlockable badges and achievements
- Streak tracking with celebrations
- Level-up animations and confetti

### 🔧 Customization
- Dark/Light mode toggle
- Push notification reminders
- Data export/import
- Profile management

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase project (for authentication and data storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/life-reset.git
   cd life-reset
   ```

2. **Configure Firebase**
   ```bash
   # Create config from template
   cp firebase-config.template.js firebase-config.js
   ```
   
   Update `firebase-config.js` with your Firebase credentials:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

3. **Enable Firebase Services**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Enable **Authentication** (Email/Password + Google Sign-In)
   - Enable **Cloud Firestore**
   - Deploy security rules from `firestore.rules`

4. **Run the App**
   ```bash
   # Using any static server
   npx serve .
   
   # Or simply open index.html in your browser
   ```

## 📱 Android Build

This app supports Android deployment via Capacitor:

```bash
# Install dependencies
npm install

# Sync web assets to Android
npm run sync

# Open in Android Studio
npm run android
```

See [ANDROID-BUILD.md](ANDROID-BUILD.md) for detailed instructions.

## 🏗️ Project Structure

```
life-reset/
├── app/                      # Feature modules (v2.0)
│   ├── features/
│   │   ├── tasks/           # Task management
│   │   ├── mood/            # Mood tracking
│   │   ├── journal/         # Journaling
│   │   ├── analytics/       # Charts & insights
│   │   ├── settings/        # User preferences
│   │   └── gamification/    # XP & badges
│   └── shared/
│       ├── components/      # Reusable UI components
│       └── utils/           # Helper functions
├── css/                      # Stylesheets
├── js/                       # Legacy scripts
├── icons/                    # App icons
├── android/                  # Capacitor Android project
├── index.html               # Main entry point
├── sw.js                    # Service Worker (PWA)
├── manifest.webmanifest     # PWA manifest
├── firestore.rules          # Firebase security rules
└── capacitor.config.json    # Capacitor configuration
```

## 🔐 Security

- **Authentication**: Email/password and Google OAuth
- **Authorization**: Row-level security via Firestore rules
- **Data Validation**: Server-side validation in Firestore rules
- **XSS Prevention**: Input sanitization throughout the app
- **Offline Support**: IndexedDB caching with Firebase sync

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | Vanilla JavaScript (ES6+) |
| Styling | CSS3 with CSS Variables |
| Backend | Firebase (Firestore, Auth) |
| Charts | Chart.js |
| PWA | Service Worker, Web Manifest |
| Mobile | Capacitor (Android) |

## 📖 Architecture

The app follows a **feature-based modular architecture**:

- **Data Layer** (`*.data.js`): Firebase/Firestore operations
- **Logic Layer** (`*.logic.js`): Pure business logic functions
- **UI Layer** (`*.ui.js`): DOM manipulation and rendering
- **Events Layer** (`*.events.js`): Event handlers and coordination

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support Resources

If you're going through a difficult time, help is available:
- **India**: AASRA - 9820466726
- **US**: Crisis Text Line - Text HOME to 741741
- **International**: [Find a helpline](https://findahelpline.com/)

---

<p align="center">
  <b>Track your progress. Celebrate small wins. Keep moving forward. 🚀</b>
</p>
