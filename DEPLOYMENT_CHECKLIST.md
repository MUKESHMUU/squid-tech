# Production Deployment Checklist

Use this checklist before deploying to production.

## Pre-Deployment (1 week before)

### Code & Testing
- [ ] All dependencies up to date (run `npm list` or manual check)
- [ ] No console errors in DevTools (F12)
- [ ] No `REPLACE_ME` or `TODO` placeholders in code
- [ ] All 30 game scenarios reviewed for accuracy
- [ ] Scoring logic verified (fast: 1500, slow: 1300, wrong: clamped to 200)
- [ ] Session restoration tested in 2 tabs
- [ ] Performance tested: <2s load time
- [ ] Cross-tab sync tested (open 2 tabs, finish in one, verify other locks)
- [ ] Mobile responsive tested (tablet & phone)
- [ ] Accessibility tested: keyboard navigation, screen reader (basic)

### Firebase Setup
- [ ] Firebase project created
- [ ] Firestore database enabled (production mode)
- [ ] Firebase config obtained (do not commit secrets)
- [ ] Security rules configured (score validation 0–200)
- [ ] Billing enabled (if needed beyond free tier)
- [ ] Backups configured (optional but recommended)

### Code Quality
- [ ] Code review completed
- [ ] Best practices documented in comments
- [ ] Error handling tested (network down, corrupted session)
- [ ] Memory leaks checked (long sessions should not grow unbounded)
- [ ] No hardcoded ports or localhost URLs

### Documentation
- [ ] README.md updated with correct info
- [ ] DEPLOYMENT.md reviewed
- [ ] .env.example created with placeholders
- [ ] .gitignore set up correctly
- [ ] CHANGELOG.md (optional) created

### Git & Version Control
- [ ] Code committed to main branch
- [ ] No secrets in commit history (check with `git log --all --full-history -- .env`)
- [ ] Git tag created: `v2.0.0` (semantic versioning)
- [ ] Remote repository public/private as desired

---

## Deployment Day

### Firebase Hosting (Recommended Path)

1. **Firebase CLI Setup**
   - [ ] Firebase CLI installed (`firebase --version`)
   - [ ] Logged in (`firebase login`)
   - [ ] Project linked (`firebase use --add`)

2. **Deploy**
   - [ ] Run smoke test locally: `python -m http.server 8000`
   - [ ] In DevTools, verify no errors
   - [ ] Deploy: `firebase deploy --only hosting`
   - [ ] Note deployment URL from console output

3. **Post-Deploy Verification**
   - [ ] Visit live URL in browser
   - [ ] Load game (no errors in DevTools)
   - [ ] Submit test score to Firestore
   - [ ] Leaderboard shows new entry
   - [ ] Session restoration works (refresh mid-game)

### Alternative: Vercel/Netlify Path

1. **Git Sync**
   - [ ] Code pushed to GitHub main branch
   - [ ] Connected to Vercel/Netlify
   - [ ] Build & deploy auto-triggered

2. **Environment Variables**
   - [ ] Firebase config added to project settings
   - [ ] No secrets exposed in logs

3. **Domain Setup**
   - [ ] Custom domain configured (if applicable)
   - [ ] HTTPS verified (lock icon in URL bar)

---

## Post-Deployment (24 hours)

### Live Monitoring

- [ ] Check Firebase Console for errors
- [ ] Monitor Firestore read/write quotas
- [ ] Review Lighthouse score: >85 on mobile, >90 on desktop
- [ ] Set up analytics (Firebase Analytics or Sentry)

### User Testing

- [ ] Play a full game end-to-end
- [ ] Verify leaderboard appears and updates
- [ ] Test on mobile device (iOS & Android)
- [ ] Confirm email notifications working (if implemented)

### Security Audit

- [ ] Verify Firestore rules enforced (try submitting invalid score)
- [ ] Check no API keys exposed in DevTools
- [ ] Verify HTTPS only (no mixed content warnings)
- [ ] Confirm CORS headers correct (if applicable)

### Performance Check

- [ ] Page load time <2s on 4G (use Lighthouse)
- [ ] no layout shifts (Cumulative Layout Shift <0.1)
- [ ] Interaction to paint <100ms
- [ ] No memory leaks after 10 min session

---

## One Week Post-Deployment

### Monitoring & Analytics

- [ ] Review user engagement metrics
- [ ] Track error rates (should be <0.1%)
- [ ] Monitor database usage (quota % of limit)
- [ ] Check CDN cache hit ratio (should be >80%)

### User Feedback

- [ ] Collect user feedback (survey, GitHub issues)
- [ ] Address critical bugs within 24h
- [ ] Document feature requests for v2.1

### Maintenance

- [ ] Set up automated backups (Firestore)
- [ ] Schedule security patch review (monthly)
- [ ] Plan for v2.1 features

---

## Ongoing (Post-Launch)

### Weekly

- [ ] Review error logs
- [ ] Monitor Firestore quotas
- [ ] Check leaderboard data quality

### Monthly

- [ ] Security audit (dependency updates, CVEs)
- [ ] Performance review (Lighthouse, CWV)
- [ ] User support tickets
- [ ] Database cleanup (if needed)

### Quarterly

- [ ] Plan v2.1 roadmap
- [ ] Update documentation
- [ ] Archive old leaderboard entries (optional)

---

## Rollback Plan

If critical issue found:

**Firebase Hosting**
```bash
firebase hosting:channels:list
firebase hosting:channels:deploy PREVIOUS_CHANNEL
```

**Vercel/Netlify**
- Dashboard → Deployments → Rollback

**GitHub Pages**
```bash
git revert COMMIT_HASH
git push origin main
```

---

## Sign-Off

- [ ] **Deployed By:** _________________________ Date: _______
- [ ] **Reviewed By:** _________________________ Date: _______
- [ ] **Approved for Live:** ___________________ Date: _______

---

## Notes

```
[Space for deployment notes, issues encountered, decisions made]


```

---

**🚀 Ready to Deploy?** Follow the checklist and launch with confidence!
