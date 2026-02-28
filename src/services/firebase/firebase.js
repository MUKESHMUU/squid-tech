// Modular Firebase v9 service for leaderboard
let app = null;
let db = null;
let auth = null;
let initialized = false;
let _lastSubmitAt = 0;
let firestoreMod = null;
let authMod = null;

export async function initFirebase(config) {
    if (initialized) return { app, db };
    try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js');
        firestoreMod = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
        app = initializeApp(config);
        db = firestoreMod.getFirestore(app);
        initialized = true;
        return { app, db };
    } catch (err) {
        console.error('Firebase initialization failed', err);
        return { app: null, db: null };
    }
}

export async function initAuth() {
    if (!initialized || !app) throw new Error('Firebase not initialized');
    if (auth) return auth;
    authMod = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js');
    auth = authMod.getAuth(app);
    return auth;
}

export async function onAdminAuthStateChanged(callback) {
    if (!callback) return () => {};
    await initAuth();
    return authMod.onAuthStateChanged(auth, callback);
}

export async function signInAdmin(email, password) {
    if (!email || !password) throw new Error('Email and password required');
    await initAuth();
    return authMod.signInWithEmailAndPassword(auth, email, password);
}

export async function signOutAdmin() {
    await initAuth();
    return authMod.signOut(auth);
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

    // Validation
    if (!name || typeof name !== 'string' || name.trim() === '') throw new Error('Name required');
    if (!Number.isFinite(score)) throw new Error('Score must be numeric');
    if (score < 0 || score > 200) throw new Error('Score out of allowed range');

    // Prevent duplicate rapid submissions (5s)
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
    if (!initialized || !db) return () => {};
    try {
        const { collection, query, orderBy, limit, onSnapshot } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
        const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), orderBy('reactionTime', 'asc'), limit(limitCount));
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
    if (!initialized || !db) throw new Error('Firebase not initialized');
    const cleanName = String(name || '').trim();
    if (!cleanName) throw new Error('Name required');

    const { doc, getDoc, serverTimestamp, setDoc } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
    const id = normalizeName(cleanName);
    const inviteRef = doc(db, 'invites', id);
    const inviteSnap = await getDoc(inviteRef);
    if (!inviteSnap.exists()) throw new Error('Invite not found');

    const requestRef = doc(db, 'joinRequests', id);
    await setDoc(requestRef, {
        name: cleanName,
        status: 'pending',
        requestedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    }, { merge: true });
    return { id, status: 'pending' };
}

export async function listenJoinStatus(name, onUpdate) {
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
    if (!initialized || !db) throw new Error('Firebase not initialized');
    const cleanName = String(name || '').trim();
    if (!cleanName) return;
    const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
    const id = normalizeName(cleanName);
    await deleteDoc(doc(db, 'invites', id));
}

export async function listenInvites(onUpdate) {
    if (!initialized || !db) return () => {};
    const { collection, onSnapshot } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
    const unsubscribe = onSnapshot(collection(db, 'invites'), snap => {
        const items = [];
        snap.forEach(docSnap => items.push({ id: docSnap.id, ...docSnap.data() }));
        onUpdate(items);
    }, err => console.error('Invite listener error', err));
    return unsubscribe;
}
