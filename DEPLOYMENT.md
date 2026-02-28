# Deployment Guide: SQUID TECH

This guide covers deploying SQUID TECH to production across multiple platforms.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Firebase Hosting](#firebase-hosting) ⭐ Recommended
3. [Vercel](#vercel)
4. [Netlify](#netlify)
5. [GitHub Pages](#github-pages)
6. [Traditional Hosting](#traditional-hosting)
7. [Post-Deployment](#post-deployment)

---

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] **Firebase Project Created**
  - [ ] Firestore Database enabled (production rules applied)
  - [ ] Config obtained and inserted in `src/main.js`
  
- [ ] **Code Quality**
  - [ ] No `REPLACE_ME` placeholders remain in source
  - [ ] Console errors cleared (DevTools)
  - [ ] Session restoration tested locally
  - [ ] Cross-tab sync tested (open 2 tabs)
  
- [ ] **Content Review**
  - [ ] Game scenarios reviewed for accuracy
  - [ ] Scoring rules verified
  - [ ] Leaderboard working with test data
  
- [ ] **Security**
  - [ ] Firestore rules deployed (score validation)
  - [ ] No API keys in version control (use env vars)
  - [ ] CORS properly configured if needed
  
- [ ] **Performance**
  - [ ] Page loads in <2s (lighthouse)
  - [ ] No memory leaks on long sessions
  - [ ] Mobile performance acceptable

---

## Firebase Hosting ⭐ Recommended

**Best for:** Tight Firebase integration, CDN, automatic HTTPS, zero-config.

### Setup & Deploy

**1. Install Firebase CLI**
```bash
npm install -g firebase-tools
```

**2. Login**
```bash
firebase login
```

**3. Initialize Firebase Project**
```bash
firebase init hosting
```
When prompted:
- Select Firebase project (same as Firestore project)
- Public directory: `.` (or current directory)
- Configure single-page app routing: **Yes**
- Overwrite public/index.html: **No**

**4. Create `firebase.json`** (if not auto-created)
```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**",
      ".git/**",
      "README.md",
      "DEPLOYMENT.md",
      ".env",
      ".env.example",
      "gameLogic.js"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.{js,css,png,jpg,jpeg,gif,svg,woff,woff2,ttf,eot}",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "index.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=3600"
          }
        ]
      }
    ]
  }
}
```

**5. Deploy**
```bash
firebase deploy --only hosting
```

**6. Live**
Your app is now live at: `https://YOUR_PROJECT.web.app`

### Post-Deploy

- [ ] Verify Firestore rules working (`Config → Firestore`)
- [ ] Test submitting a score from live site
- [ ] Check custom domain (if desired)

---

## Vercel

**Best for:** Git-based deployments, instant preview links, serverless functions (future).

### Setup & Deploy

**1. Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit: SQUID TECH v2"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/squid-tech.git
git push -u origin main
```

**2. Import to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Select GitHub repository
- Framework: **Other** (no build required)
- Build command: (leave empty)
- Output directory: (leave empty)
- Root directory: (leave empty)
- Click "Deploy"

**3. Configure Environment Variables**
- Project Settings → Environment Variables
- Add:
  ```
  NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
  ...etc
  ```
- Note: Use `NEXT_PUBLIC_` prefix for client-side vars

**4. Update `src/main.js`** to use env vars
```javascript
const FIREBASE_CONFIG = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "REPLACE_ME",
    ...
};
```

**5. Live**
Your app auto-deploys on every push to `main`: `https://squid-tech.vercel.app`

---

## Netlify

**Best for:** Drag-and-drop simplicity, automated deploy preview, Netlify functions.

### Setup & Deploy

**Option A: Git-Based (Recommended)**

1. **Push to GitHub** (same as Vercel above)

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Authorize GitHub
   - Select repository
   - Build settings:
     - Build command: (leave empty)
     - Publish directory: `.`
   - Click "Deploy site"

3. **Environment Variables**
   - Site Settings → Build & deploy → Environment
   - Add Firebase config keys (no `NEXT_PUBLIC_` needed)

4. **Live**
   - Auto-deployed to: `https://squid-tech.netlify.app` (or custom domain)

**Option B: Drag & Drop**

1. Build locally: `python -m http.server` → verify working
2. Select all project files
3. Drag into Netlify dashboard
4. Done! (limited; no auto-redeploy)

### Custom Domain

- Domain settings → Add custom domain
- Point nameservers or set CNAME record
- Automatic HTTPS via Let's Encrypt

---

## GitHub Pages

**Best for:** Free static hosting, existing GitHub user, portfolio project.

### Setup & Deploy

**1. Create `gh-pages` Branch**
```bash
git checkout --orphan gh-pages
git reset --hard
git commit --allow-empty -m "Initial gh-pages"
git push origin gh-pages
```

**2. Configure Repository Settings**
- Settings → Pages
- Source: Deploy from a branch
- Branch: `gh-pages` / root
- Save

**3. Deploy via GitHub Actions**
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy
        run: |
          git config --global user.email "ci@example.com"
          git config --global user.name "CI Bot"
          git clone --branch gh-pages https://x-access-token:${{ secrets.GITHUB_TOKEN }}@github.com/${{ github.repository }} deploy
          cp -r src index.html gameData.js styles.css deploy/
          cd deploy
          git add .
          git commit -m "Deploy on $(date)" || true
          git push
```

**4. Live**
- Auto-deploys on every push to `main`
- Available at: `https://YOUR_USERNAME.github.io/squid-tech`

---

## Traditional Hosting

**Best for:** Full control, custom server setup, legacy environments.

### cPanel / Shared Hosting

**1. Prepare Files**
```bash
zip -r squid-tech.zip . -x "*.git*" "node_modules*" ".env*" "*.md"
```

**2. Upload via FTP/SFTP**
- Use FileZilla or cPanel File Manager
- Upload `squid-tech.zip` to public_html
- Extract: `unzip squid-tech.zip`

**3. `.htaccess` for SPA Routing** (if using Apache)
Create `.htaccess` in root:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**4. Live**
- Navigate to `https://yourdomain.com`

### VPS / Dedicated Server (Node.js)

**1. SSH into Server**
```bash
ssh root@YOUR_VPS_IP
```

**2. Install Node.js & PM2**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

**3. Clone & Setup**
```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/squid-tech.git
cd squid-tech
npm install -g http-server  # or use Node server
```

**4. Start Server with PM2**
```bash
pm2 start "http-server" --name squid-tech
pm2 startup
pm2 save
```

**5. Setup NGINX Reverse Proxy**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}
```

**6. Enable HTTPS (Let's Encrypt)**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

**7. Live**
- Navigate to `https://yourdomain.com`

---

## Post-Deployment

### Verification Checklist

- [ ] **Functionality**
  - [ ] Load homepage → name input appears
  - [ ] Enter name → Start button enabled
  - [ ] Start game → Green light phase begins
  - [ ] Answer question → Score updates
  - [ ] Complete 30 rounds → Game over screen
  - [ ] Leaderboard shows top 10 players
  
- [ ] **Performance**
  - [ ] Page load: <2s
  - [ ] Lighthouse score: >90
  - [ ] No console errors
  
- [ ] **Persistence**
  - [ ] Refresh mid-game → Session restores
  - [ ] Open 2 tabs → Cross-tab sync works
  - [ ] Close browser → localStorage persists
  
- [ ] **Firebase**
  - [ ] Scores submitted to Firestore
  - [ ] Leaderboard updates in real-time
  - [ ] Security rules enforced (no invalid scores)

### Monitoring & Analytics

**Firebase Console**
- Monitor Firestore reads/writes
- View function logs (if serverless)
- Check storage quotas

**Application Performance Monitoring (APM)**
- Vercel: Dashboard → Analytics
- Netlify: Site → Analytics
- Firebase: Performance tab

**Error Tracking** (Optional)
- Add Sentry: `npm install @sentry/browser`
- Initialize in `src/main.js`:
```javascript
import * as Sentry from "@sentry/browser";
Sentry.init({ dsn: "YOUR_SENTRY_DSN" });
```

### Scaling Tips

- **CDN:** Enable edge caching (Vercel/Netlify/Firebase auto-handle)
- **Database:** Firestore auto-scales; set read quotas if needed
- **Sessions:** localStorage TTL handles cleanup; consider archiving old records
- **Leaderboard:** Current top 10 query; add pagination if >1M records

---

## Domain & SSL

### Register Domain

1. **GoDaddy, Namecheap, or Route53**
   - Register domain (e.g., squid-tech.com)

### Point to Hosting

| Hosting | Action |
|---------|--------|
| Firebase Hosting | Settings → Custom domains → Add |
| Vercel | Settings → Domains → Add |
| Netlify | Domain settings → Configure |
| GitHub Pages | Settings → Pages → Custom domain |
| VPS | DNS → A record → Your VPS IP |

### SSL Certificate

- **Firebase/Vercel/Netlify:** Auto HTTPS
- **GitHub Pages:** Auto HTTPS
- **VPS:** Use Let's Encrypt (Certbot)

---

## Troubleshooting Deployment

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Check file paths; use relative imports from `src/` |
| Leaderboard shows "Loading..." | Verify Firebase config; check browser console |
| Scores not saving | Check Firestore rules; verify rules allow writes |
| 404 on page refresh | Enable SPA routing (rewrite all to index.html) |
| Slow page load | Enable gzip compression; check Firebase quotas |
| Cache not clearing | Bust with query param: `index.html?v=20260210` |

---

## Rollback

If deployment fails:

**Firebase Hosting**
```bash
firebase hosting:channels:list
firebase hosting:channels:deploy CHANNEL_ID
```

**Vercel/Netlify**
- Dashboard → Deployments → Rollback to previous

**GitHub Pages / VPS**
```bash
git revert HEAD~1
git push origin main
```

---

## Next Steps

1. ✅ Deploy to production
2. 📊 Monitor performance & errors
3. 🎯 Gather user feedback
4. 🔧 Plan v2 features (auth, analytics, achievements)
5. 📈 Scale infrastructure as needed

---

**Deployment Checklist Complete?** You're ready to go live! 🚀
