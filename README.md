# SQUID TECH: Code to Survive

A production-ready web-based coding challenge game with real-time leaderboard powered by Firebase. Test your coding knowledge with 30 rounds of Green Light (read) / Red Light (answer) gameplay.

## Features

- ✅ **30 Beginner-Friendly Coding Scenarios** — MCQ-based questions covering tech fundamentals
- ✅ **Green/Red Light Phases** — Timed read phase (10–45s) + answer phase (30s max)
- ✅ **Real-Time Leaderboard** — Live Firebase Firestore integration (top 10 players)
- ✅ **Session Restoration** — Resume interrupted games with timer state preservation
- ✅ **Cross-Tab Sync** — Multi-tab support with automatic UI sync
- ✅ **Scoring System** — Fast answers (≤15s) = 1500 pts; slower (>15s) = 1300 pts; wrong answers clamped to max 200
- ✅ **Mobile Responsive** — Optimized for desktop and tablet
- ✅ **Modern Stack** — ES6 modules, no build step required, vanilla JS + CSS

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JS (ES6 modules), CSS3 |
| Backend / Database | Firebase Firestore (real-time) |
| Authentication | Firebase (planned for v2) |
| Hosting | Firebase Hosting, Vercel, or Netlify |
| Session | Browser localStorage (auto-expiring) |

## Project Structure

```
.
├── index.html                    # Main HTML entry point
├── gameData.js                   # 30 scenario dataset (ES module)
├── styles.css                    # Responsive styling (1074 lines)
├── README.md                     # This file
├── DEPLOYMENT.md                 # Deployment guide
├── .env.example                  # Firebase config template
├── .gitignore                    # Git ignore list
│
└── src/
    ├── main.js                   # App bootstrap, session & Firebase init
    ├── gameController.js         # Game logic, timing, scoring (397 lines)
    ├── ui.js                     # DOM helpers, rendering, state mgmt
    │
    ├── core/
    │   └── sessionManager.js     # localStorage session handling
    │
    ├── ui/
    │   └── leaderboard.js        # Real-time leaderboard renderer
    │
    └── services/
        └── firebase/
            └── firebase.js       # Firebase v9 modular SDK integration
```

## Quick Start

### Local Development

1. **Clone / Extract**
   ```bash
   cd Squid_Tech-main
   ```

2. **Start HTTP Server** (Python)
   ```bash
   python -m http.server 8000
   ```
   Or Node.js:
   ```bash
   npx http-server
   ```

3. **Open Browser**
   ```
   http://localhost:8000
   ```

4. **Play**
   - Enter your display name
   - Click "Start Game"
   - Read scenario (green light), answer question (red light)
   - Complete all 30 rounds

### Configure Firebase (Leaderboard)

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable Firestore Database (start in test mode for dev)

2. **Get Config**
   - Project Settings → General → SDK setup
   - Copy the Firebase config object

3. **Update `src/main.js`**
   - Replace `FIREBASE_CONFIG` placeholder:
   ```javascript
   const FIREBASE_CONFIG = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

4. **Firestore Rules** (production)
   - Update security rules in Firebase Console:
   ```firestore
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /leaderboard/{doc=**} {
         allow write: if request.resource.data.score >= 0 && 
                        request.resource.data.score <= 200 &&
                        request.resource.data.name.size() > 0 &&
                        request.resource.data.name.size() <= 50;
         allow read: if true;
       }
     }
   }
   ```

## Deployment Options

See [DEPLOYMENT.md](DEPLOYMENT.md) for full instructions on:
- **Firebase Hosting** — Zero-config, built-in CDN
- **Vercel** — One-click deploy from Git
- **Netlify** — Drag-and-drop or Git integration
- **GitHub Pages** — Free static hosting
- **Traditional Hosting** — cPanel, shared server, VPS

## Game Rules

| Rule | Details |
|------|---------|
| **Rounds** | 30 total questions |
| **Green Light** | Random 10–45 seconds to read scenario |
| **Red Light** | Fixed 30 seconds to answer (4 MCQ options) |
| **Scoring** | Fast (≤15s): 1500 pts \| Slow (>15s): 1300 pts |
| **Wrong Answer** | If score ≥200 → clamp to 200 \| If score = 0 → stay 0 |
| **Session TTL** | 30 minutes (auto-expires if idle) |
| **Leaderboard** | Top 10 players sorted by score (tie-break: fastest time) |

## API & Customization

### Session State Format
```javascript
{
  playerName: string,
  score: number,           // 0–1500+
  phase: "idle"|"green"|"red"|"question"|"finished",
  greenLightEndTime: timestamp,
  redStartTime: timestamp,
  questionIndex: number,   // 0–29
  startedAt: timestamp,
  lastUpdated: timestamp
}
```

### Firebase Collection Schema
```javascript
// /leaderboard/{docId}
{
  name: string,                // player display name (required, ≤50 chars)
  score: number,               // 0–200 (validated server-side)
  reactionTime: number,        // avg seconds per answer (nullable)
  date: serverTimestamp        // Firestore timestamp
}
```

### Key Classes & Functions

**GameController** (`src/gameController.js`)
```javascript
controller = new SquidGameController();
controller.startGame();
controller.restartGame();
controller.collectSessionState();
controller.setSessionManager(sessionManager);
```

**SessionManager** (`src/core/sessionManager.js`)
```javascript
sm = new SessionManager({ ttlMs: 30*60*1000, debounceMs: 1000 });
sm.load();           // hydrate
sm.save(state);      // debounced write
sm.markFinished();   // lock session
sm.subscribe(cb);    // listen to cross-tab syncs
```

**Firebase Service** (`src/services/firebase/firebase.js`)
```javascript
await initFirebase(config);
await submitScore({ name, score, reactionTime });
const unsub = listenTopScores(callback, limit=10);
```

## Console Development

Access the game instance in browser DevTools:
```javascript
// In console:
window.game.score              // current score
window.game.currentRoundIndex  // 0–29
window.game.roundResponses     // [ { roundIndex, userOption, correctOption, isCorrect, submissionTime, scoreChange, scoreAfter } ]
window.game.collectSessionState()  // dump current state
```

## Performance & Best Practices

- **No Build Step** — Vanilla ES6 modules work in modern browsers
- **Debounced Saves** — Session writes throttled at 1s (configurable)
- **Event Delegation** — MCQ clicks use single delegated listener
- **Document Fragment** — Leaderboard renders with batch DOM insertion
- **Safe Parsing** — Corrupted localStorage data auto-cleared
- **Minimal Reflows** — Timer ticker at 200ms interval, overall timer at 500ms

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ❌ IE 11 (no ES modules)

## Security Considerations

- **Input Sanitization** — Player names HTML-escaped before display
- **Client-Side Validation** — Score range (0–200) enforced before submit
- **Server-Side Validation** — Firestore rules enforce same checks
- **CORS-Safe** — Firebase SDK handles auth tokens
- **No Sensitive Data** — Scores, names, times stored in clear (no PII)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Module not found errors | Ensure `src/` folder exists; check relative paths |
| Firebase leaderboard empty | Verify config in `src/main.js`; check Firestore rules |
| Session not restoring | Check localStorage enabled; verify TTL not exceeded |
| "X rated for 18+" in DevTools | Expected. Game uses emoji and color effects. |
| Scores not submitting | Check Firebase project billing enabled \| verify Firestore rules |
| First round never auto-advances | Browser DevTools console for errors; check GAME_SCENARIOS data |

## Future Enhancements (v2)

- [ ] User authentication (Google Sign-In)
- [ ] Leaderboard filters (daily, weekly, all-time)
- [ ] Achievements / badges
- [ ] Category-based challenges
- [ ] Multiplayer mode
- [ ] Audio effects & sounds
- [ ] Dark/light theme toggle
- [ ] Analytics dashboard

## License

MIT. Free to use, modify, and distribute.

## Support & Contribution

For issues, feature requests, or contributions:
- Open a GitHub issue or pull request
- Email: [your-email@example.com]

---

**Version:** 2.0.0 (Production-Ready)  
**Last Updated:** February 10, 2026  
**Maintainer:** Your Name
