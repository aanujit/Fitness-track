# Fitness Track

A React Native fitness and step-tracking mobile application.

## 🔗 Links
- **Public GitHub Repository:** [https://github.com/aanujit/Fitness-track.git]
- **APK Build / EAS Preview:** [Download APK](https://expo.dev/artifacts/eas/_pA1Bpj2IReY0xT6sV14sN6r6d5Bop2a-a9BoZudqcU.apk)

## 🛠 Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- A Firebase project (for Authentication & Database)

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <your-repo-link>
   cd Fitness_Track
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Copy the example environment file and update it with your Firebase configuration:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in the following variables using your Firebase Project settings:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   EXPO_PUBLIC_FIREBASE_MESSSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
   ```

4. **Start the Development Server**:
   ```bash
   npx expo start
   ```
   You can run the app on an Android Emulator, iOS Simulator, or a physical device using Expo Go.

## ☁️ Backend Setup

This project uses **Firebase** as its backend for Authentication and Realtime Database/Firestore. There is no custom backend server to deploy, as Firebase acts as a serverless backend.

- **Authentication**: Email/Password authentication must be enabled in the Firebase Console.
- **Database**: Ensure your database rules allow authenticated users to read and write their own data.

## 🔑 Test Credentials

Use the following pre-created account to test the application:

- **Email**: `anujitacharya@gmail.com`
- **Password**: `Admin@123`
*(Note to evaluator: If this account does not exist, please register a new account using these credentials on the sign-up screen).*

## ⚖️ Trade-offs & Known Limitations

- **Pedometer Accuracy**: The app relies on device sensors (`expo-sensors` Pedometer) which might have varying accuracy across different Android/iOS devices. It cannot background-sync step data indefinitely without a background task configuration, meaning steps might only update reliably when the app is active or in the foreground.
- **Local Storage vs. Cloud Sync**: Step data is heavily reliant on real-time sync with Firebase. If offline, the app may not sync properly until an internet connection is restored (offline persistence depends on Firebase cache settings).
- **Security**: The current JWT/Token management uses Expo Secure Store for basic auth token persistence, but standard Firebase Auth flow is primarily handling sessions.

