# rink-tracker-pwa

**Rink Tracker** is a **Progressive Web App (PWA)** that helps hockey players track their rink visits, log activities, and compete with friends. The app includes **Google Maps integration, Firebase backend, and gamification elements** for a seamless and engaging experience.
# 🏒 Rink Tracker - Progressive Web App (PWA)

**Rink Tracker** is a **Progressive Web App (PWA)** that helps hockey players track their rink visits, log activities, and compete with friends. The app includes **Google Maps integration, Firebase backend, and gamification elements** for a seamless and engaging experience.

---

## 🚀 Features

✅ **Track Your Rink Visits** - Log details of games, practices, and skills sessions.  
✅ **Interactive Map** - Find rinks, view details, and log visits from the map.  
✅ **Leaderboard & Gamification** - Compete with friends for the most visits, streaks, and achievements.  
✅ **Offline Support** - Log visits even when offline and sync data later.  
✅ **Google & Social Login** - Secure authentication with Firebase.  
✅ **Responsive & Mobile-First** - Optimized for mobile, tablet, and desktop.  

---

## 🏗️ Tech Stack

- **Frontend**: React.js, Material-UI, Redux Toolkit
- **Backend**: Firebase Authentication, Firestore, Cloud Functions
- **Maps Integration**: Google Maps API, Places API
- **PWA Features**: Workbox.js for caching and offline support
- **Hosting & Deployment**: Firebase Hosting, GitHub Actions for CI/CD

---

## 🔧 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/rink-tracker-pwa.git
cd rink-tracker-pwa
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Setup Firebase

1. Create a **Firebase project** in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Google, Email/Password).
3. Setup **Firestore Database** & **Firebase Storage**.
4. Copy your **Firebase Config** and create a `.env.local` file:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### 4️⃣ Run the Development Server

```bash
npm run dev
```

### 5️⃣ Deploy to Firebase

Ensure Firebase CLI is installed:

```bash
npm install -g firebase-tools
firebase login
firebase init
```

Then deploy:

```bash
firebase deploy
```

---

## 🛠️ Development Workflow

1. **Feature Branches** - Use separate branches for each feature.
2. **Pull Requests & Code Reviews** - Ensure quality before merging.
3. **CI/CD with GitHub Actions** - Automatic testing & deployment.
4. **Testing** - Unit tests with Jest, end-to-end tests with Cypress.

---

## 📌 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m "Added feature"`
4. Push to GitHub: `git push origin feature-name`
5. Submit a Pull Request.

---

## 🐜 License



---

## ✉️ Contact

For feedback or questions, feel free to reach out!



