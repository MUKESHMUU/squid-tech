// Firebase service (modular SDK). Uses dynamic imports so app still loads if Firebase isn't configured.
// Replace the placeholder config with your Firebase project's configuration.

const FIREBASE_CONFIG = {
    apiKey: "REPLACE_ME",
    authDomain: "REPLACE_ME",
    projectId: "REPLACE_ME",
    storageBucket: "REPLACE_ME",
    messagingSenderId: "REPLACE_ME",
    appId: "REPLACE_ME"
};

let firestore = null;
let firebaseApp = null;

export async function initFirebase() {
    try {
        const [{ initializeApp }, { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot }] = await Promise.all([
            import('https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js'),
            import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js')
        ]);

        firebaseApp = initializeApp(FIREBASE_CONFIG);
        firestore = getFirestore(firebaseApp);

        return { firestore };
    } catch (err) {
        console.warn('Firebase not initialized (missing/invalid config or offline).', err);
        firestore = null;
        return { firestore: null };
    }
}

export async function submitScore(entry = { name: 'Anonymous', score: 0, timestamp: Date.now() }) {
    if (!firestore) throw new Error('Firestore not initialized');
    try {
        const { addDoc, collection } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
        const docRef = await addDoc(collection(firestore, 'leaderboard'), {
            name: entry.name,
            score: entry.score,
            ts: entry.timestamp || Date.now()
        });
        return { id: docRef.id };
    } catch (err) {
        console.error('submitScore failed', err);
        throw err;
    }
}

export async function listenLeaderboard(onUpdate, limitCount = 10) {
    if (!firestore) return () => {};
    try {
        const { collection, query, orderBy, limit, onSnapshot } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
        const q = query(collection(firestore, 'leaderboard'), orderBy('score', 'desc'), limit(limitCount));
        const unsubscribe = onSnapshot(q, snap => {
            const items = [];
            snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            onUpdate(items);
        }, err => {
            console.error('Leaderboard listener error', err);
        });
        return unsubscribe;
    } catch (err) {
        console.error('listenLeaderboard failed', err);
        return () => {};
    }
}
