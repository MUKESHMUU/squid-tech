// Modular Firebase v9 service for leaderboard
let app = null;
let db = null;
let initialized = false;
let _lastSubmitAt = 0;
let _initPromise = null;

// ─── Admin Auth (no Firebase Auth — simple password) ──────────────────────────
const ADMIN_PASSWORD = 'squidtech2025';
const ADMIN_SESSION_KEY = 'squid_admin_session';

function makeAdminUser() {
    return { uid: 'admin', email: 'admin@squidtech' };
}

export async function signInAdmin(email, password) {
    if (!password) throw new Error('Password required');
    if (password !== ADMIN_PASSWORD) throw new Error('Incorrect password');
    localStorage.setItem(ADMIN_SESSION_KEY, '1');
    _notifyAuthListeners(makeAdminUser());
    return { user: makeAdminUser() };
}

export async function signOutAdmin() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    _notifyAuthListeners(null);
}

const _authListeners = new Set();

function _notifyAuthListeners(user) {
    _authListeners.forEach(cb => { try { cb(user); } catch (e) {} });
}

export async function onAdminAuthStateChanged(callback) {
    if (!callback) return () => {};
    _authListeners.add(callback);
    const isLoggedIn = localStorage.getItem(ADMIN_SESSION_KEY) === '1';
    // Wait for Firebase to be ready before firing the callback
    if (_initPromise) await _initPromise;
    // FIX 1: replaced setTimeout(0) with Promise.resolve().then() so callback
    // fires after _initPromise is truly resolved, not just scheduled
    Promise.resolve().then(() => callback(isLoggedIn ? makeAdminUser() : null));
    return () => _authListeners.delete(callback);
}

// ─── Firebase / Firestore ─────────────────────────────────────────────────────
export async function initFirebase(config) {
    if (initialized) return { app, db };
    // If already initializing, wait for it
    if (_initPromise) return _initPromise;

    _initPromise = (async () => {
        try {
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js');
            app = initializeApp(config);
            const firestoreMod = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
            db = firestoreMod.getFirestore(app);
            initialized = true;
            return { app, db };
        } catch (err) {
            console.error('Firebase initialization failed', err);
            _initPromise = null;
            return { app: null, db: null };
        }
    })();

    return _initPromise;
}

function normalizeName(name) {
    return String(name || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_\-]/g, '');
}

export async function submitScore({ name, score, reactionTime }) {
    if (!initialized || !db) throw new Error('Firebase not initialized');
    if (!name || typeof name !== 'string' || name.trim() === '') throw new Error('Name required');
    if (!Number.isFinite(score)) throw new Error('Score must be numeric');
    if (score < 0 || score > 200000) throw new Error('Score out of allowed range');

    const now = Date.now();
    if (now - _lastSubmitAt < 5000) throw new Error('Duplicate submission blocked');
    _lastSubmitAt = now;

    try {
        const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
        const docRef = await addDoc(collection(db, 'leaderboard'), {
            name: name.trim(),
            score: Number(score),
            reactionTime: Number(reactionTime) || null,
            date: serverTimestamp()
        });
        return { id: docRef.id };
    } catch (err) {
        console.error('submitScore error', err);
        throw err;
    }
}

export async function listenTopScores(onUpdate, limitCount = 10) {
    if (_initPromise) await _initPromise;
    if (!initialized || !db) return () => {};
    try {
        const { collection, query, orderBy, limit, onSnapshot } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
        const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(limitCount));
        const unsubscribe = onSnapshot(q, snap => {
            const items = [];
            snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            onUpdate(items);
        }, err => console.error('Leaderboard listener error', err));
        return unsubscribe;
    } catch (err) {
        console.error('listenTopScores failed', err);
        return () => {};
    }
}

export async function requestJoin(name) {
    if (_initPromise) await _initPromise;
    if (!initialized || !db) throw new Error('Firebase not initialized');
    const cleanName = String(name || '').trim();
    if (!cleanName) throw new Error('Name required');

    const { doc, getDoc, serverTimestamp, setDoc } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
    const id = normalizeName(cleanName);
    const inviteRef = doc(db, 'invites', id);
    const inviteSnap = await getDoc(inviteRef);
    if (!inviteSnap.exists()) throw new Error('Invite not found');

    // FIX 2: Check existing status before overwriting — prevents approved player
    // from re-requesting and accidentally resetting their status back to 'pending'
    const requestRef = doc(db, 'joinRequests', id);
    const existingSnap = await getDoc(requestRef);
    if (existingSnap.exists()) {
        const existingStatus = existingSnap.data()?.status;
        if (existingStatus === 'approved') throw new Error('Already approved! Wait for admin to start the game.');
        if (existingStatus === 'pending') throw new Error('Request already pending. Please wait for approval.');
    }

    await setDoc(requestRef, {
        name: cleanName,
        status: 'pending',
        requestedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    }, { merge: true });
    return { id, status: 'pending' };
}

export async function listenJoinStatus(name, onUpdate) {
    if (_initPromise) await _initPromise;
    if (!initialized || !db) return () => {};
    if (!name) return () => {};
    const { doc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
    const id = normalizeName(name);
    const requestRef = doc(db, 'joinRequests', id);
    const unsubscribe = onSnapshot(requestRef, snap => {
        if (!snap.exists()) return onUpdate({ status: 'none' });
        onUpdate({ id: snap.id, ...snap.data() });
    }, err => console.error('Join status listener error', err));
    return unsubscribe;
}

export async function listenJoinRequests(onUpdate) {
    if (_initPromise) await _initPromise;
    if (!initialized || !db) return () => {};
    const { collection, query, where, onSnapshot } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
    const q = query(collection(db, 'joinRequests'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, snap => {
        const items = [];
        snap.forEach(docSnap => items.push({ id: docSnap.id, ...docSnap.data() }));
        onUpdate(items);
    }, err => console.error('Join requests listener error', err));
    return unsubscribe;
}

export async function approveJoin(name, adminEmail) {
    if (_initPromise) await _initPromise;
    if (!initialized || !db) throw new Error('Firebase not initialized');
    const { doc, serverTimestamp, setDoc } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
    const id = normalizeName(name);
    const requestRef = doc(db, 'joinRequests', id);
    await setDoc(requestRef, {
        name: String(name || '').trim(),
        status: 'approved',
        approvedBy: adminEmail || null,
        updatedAt: serverTimestamp()
    }, { merge: true });
}

export async function denyJoin(name, adminEmail) {
    if (_initPromise) await _initPromise;
    if (!initialized || !db) throw new Error('Firebase not initialized');
    const { doc, serverTimestamp, setDoc } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
    const id = normalizeName(name);
    const requestRef = doc(db, 'joinRequests', id);
    await setDoc(requestRef, {
        name: String(name || '').trim(),
        status: 'denied',
        approvedBy: adminEmail || null,
        updatedAt: serverTimestamp()
    }, { merge: true });
}

export async function addInvite(name, adminEmail) {
    if (_initPromise) await _initPromise;
    if (!initialized || !db) throw new Error('Firebase not initialized');
    const cleanName = String(name || '').trim();
    if (!cleanName) throw new Error('Invite name required');
    const { doc, serverTimestamp, setDoc } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
    const id = normalizeName(cleanName);
    await setDoc(doc(db, 'invites', id), {
        name: cleanName,
        createdBy: adminEmail || null,
        createdAt: serverTimestamp()
    }, { merge: true });
}

export async function removeInvite(name) {
    if (_initPromise) await _initPromise;
    if (!initialized || !db) throw new Error('Firebase not initialized');
    const cleanName = String(name || '').trim();
    if (!cleanName) return;
    const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
    const id = normalizeName(cleanName);
    await deleteDoc(doc(db, 'invites', id));
}

export async function listenInvites(onUpdate) {
    if (_initPromise) await _initPromise;
    if (!initialized || !db) return () => {};
    const { collection, onSnapshot } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
    const unsubscribe = onSnapshot(collection(db, 'invites'), snap => {
        const items = [];
        snap.forEach(docSnap => items.push({ id: docSnap.id, ...docSnap.data() }));
        onUpdate(items);
    }, err => console.error('Invite listener error', err));
    return unsubscribe;
}

// ─── Live Score Upsert (updates same doc per player during game) ─────────────

export async function upsertLiveScore({ name, score, reactionTime }) {
    if (_initPromise) await _initPromise;
    if (!initialized || !db) throw new Error('Firebase not initialized');
    if (!name || typeof name !== 'string' || name.trim() === '') throw new Error('Name required');
    if (!Number.isFinite(score)) throw new Error('Score must be numeric');

    const { doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
    const id = normalizeName(name);
    await setDoc(doc(db, 'leaderboard', id), {
        name: name.trim(),
        score: Number(score),
        reactionTime: Number(reactionTime) || null,
        date: serverTimestamp()
    }, { merge: true });
    return { id };
}

// ─── Global Game Control ──────────────────────────────────────────────────────

export async function setGameStart(started) {
    if (_initPromise) await _initPromise;
    if (!initialized || !db) throw new Error('Firebase not initialized');
    const { doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
    await setDoc(doc(db, 'gameControl', 'state'), {
        started: !!started,
        updatedAt: serverTimestamp()
    });
}

export async function resetGameStart() {
    return setGameStart(false);
}

export async function listenGameStart(onUpdate) {
    if (_initPromise) await _initPromise;
    if (!initialized || !db) return () => {};
    const { doc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
    const unsubscribe = onSnapshot(doc(db, 'gameControl', 'state'), snap => {
        if (!snap.exists()) return onUpdate({ started: false });
        onUpdate(snap.data());
    }, err => console.error('Game control listener error', err));
    return unsubscribe;
}