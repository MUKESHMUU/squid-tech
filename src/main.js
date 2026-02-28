import { SquidGameController } from './gameController.js';
import * as FB from './services/firebase/firebase.js';
import { getElement, setLoadingLeaderboard } from './ui.js';
import { renderLeaderboard } from './ui/leaderboard.js';
import { SessionManager } from './core/sessionManager.js';

const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyBvv2LWEE7Qgj437Iwv4v0guV7bPCvQp38',
    authDomain: 'squid-tech-4eaf8.firebaseapp.com',
    projectId: 'squid-tech-4eaf8',
    storageBucket: 'squid-tech-4eaf8.firebasestorage.app',
    messagingSenderId: '1079894135221',
    appId: '1:1079894135221:web:d3744bfa469a07960e89fc'
};

async function initApp() {
    document.documentElement.classList.add('js-ready');

    // UI elements
    const playerInput = getElement('#playerName', false);
    const startBtn = getElement('#startBtn', true);
    const leaderboardList = getElement('#leaderboardList', false);
    const requestAccessBtn = getElement('#requestAccessBtn', false);
    const accessStatus = getElement('#accessStatus', false);

    // Load stored name
    const savedName = localStorage.getItem('squid_player_name') || '';
    if (playerInput) playerInput.value = savedName;

    // Block start if no name
    let isApproved = false;
    let joinStatusUnsub = null;
    let lastName = '';

    function getPlayerName() {
        return playerInput ? playerInput.value.trim() : '';
    }

    function setAccessStatus(message, type = '') {
        if (!accessStatus) return;
        accessStatus.textContent = message || '';
        accessStatus.className = `access-status ${type}`.trim();
    }

    function updateStartEnabled() {
        const ok = getPlayerName().length > 0 && isApproved;
        if (startBtn) startBtn.disabled = !ok;
    }

    function validateName() {
        const name = getPlayerName();
        const ok = name.length > 0;
        return ok;
    }

    if (playerInput) {
        playerInput.addEventListener('input', () => {
            const name = getPlayerName();
            validateName();
            localStorage.setItem('squid_player_name', name);
            if (name !== lastName) {
                lastName = name;
                subscribeJoinStatus(name);
            }
            updateStartEnabled();
        });
    }

    updateStartEnabled();

    // Initialize Firebase
    const { db } = await FB.initFirebase(FIREBASE_CONFIG);
    if (!db) console.info('Firebase not available — leaderboard disabled until configured.');

    async function subscribeJoinStatus(name) {
        if (joinStatusUnsub) joinStatusUnsub();
        isApproved = false;
        updateStartEnabled();
        if (!db || !name) return;
        joinStatusUnsub = await FB.listenJoinStatus(name, data => {
            const status = data?.status || 'none';
            if (status === 'approved') {
                isApproved = true;
                setAccessStatus('Approved. You can start.', 'success');
            } else if (status === 'pending') {
                isApproved = false;
                setAccessStatus('Request pending approval.', 'pending');
            } else if (status === 'denied') {
                isApproved = false;
                setAccessStatus('Request denied. Contact admin.', 'error');
            } else {
                isApproved = false;
                setAccessStatus('Invite-only. Request access to join.', '');
            }
            updateStartEnabled();
        });
    }

    if (requestAccessBtn) {
        requestAccessBtn.addEventListener('click', async () => {
            const name = getPlayerName();
            if (!name) {
                setAccessStatus('Enter your name to request access.', 'error');
                return;
            }
            if (!db) {
                setAccessStatus('Approval unavailable. Firebase not connected.', 'error');
                return;
            }
            setAccessStatus('Requesting access...', 'pending');
            try {
                await FB.requestJoin(name);
                setAccessStatus('Request sent. Waiting for approval.', 'pending');
            } catch (err) {
                const msg = err?.message || 'Request failed.';
                if (msg.toLowerCase().includes('invite')) setAccessStatus('Not on the invite list.', 'error');
                else setAccessStatus(msg, 'error');
            }
        });
    }

    // Initial join status for saved name
    if (savedName) {
        lastName = savedName;
        subscribeJoinStatus(savedName);
    }

    // Start controller
    const controller = new SquidGameController();
    controller.setStartGuard(() => isApproved);
    // Session manager (localStorage) - restore if possible
    const sessionManager = new SessionManager();
    controller.setSessionManager(sessionManager);
    const existing = sessionManager.load();
    if (existing) {
        // restore controller state from session; controller will handle timers
        await controller.restoreFromSession(existing);
    }
    window.game = controller;

    // Leaderboard real-time
    if (db && leaderboardList) {
        setLoadingLeaderboard(true, leaderboardList);
        const unsubscribe = await FB.listenTopScores(items => {
            setLoadingLeaderboard(false, leaderboardList);
            renderLeaderboard(leaderboardList, items, controller.lastSubmissionId || null);
        }, 10);
        window._leaderboardUnsubscribe = unsubscribe;
    }

    // Hook into game end to submit score
    controller.onGameEnd = async () => {
        const name = localStorage.getItem('squid_player_name') || '';
        if (!name) {
            alert('Please set a display name before submitting your score.');
            return;
        }
        // compute reactionTime (average) if available
        const responses = controller.roundResponses || [];
        const times = responses.map(r => r.submissionTime).filter(t => Number.isFinite(t) && t > 0);
        const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : null;

        try {
            // show saving UI
            if (controller.dom && controller.dom.submissionStatus) controller.dom.submissionStatus.textContent = 'Saving score...';
            const res = await FB.submitScore({ name, score: controller.score, reactionTime: avg });
            controller.lastSubmissionId = res?.id || null;
            if (controller.dom && controller.dom.submissionStatus) controller.dom.submissionStatus.textContent = 'Score saved.';
            try { sessionManager.markFinished(); } catch (e) {}
        } catch (err) {
            console.error('Score submit failed', err);
            if (controller.dom && controller.dom.submissionStatus) controller.dom.submissionStatus.textContent = 'Save failed. Try again.';
        } finally {
            // refresh handled by real-time listener
        }
    };

}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp);
else initApp();
