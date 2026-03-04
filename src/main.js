import { SquidGameController } from './gameController.js';
import * as FB from './services/firebase/firebase.js';
import { getElement, setLoadingLeaderboard } from './ui.js';
import { renderLeaderboard } from './ui/leaderboard.js';
import { SessionManager } from './core/sessionManager.js';

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAR72Z6w2rHaSVo41LV7tcCMxiPvceZrYA",
  authDomain: "squid-tech-main.firebaseapp.com",
  projectId: "squid-tech-main",
  storageBucket: "squid-tech-main.firebasestorage.app",
  messagingSenderId: "1036086289694",
  appId: "1:1036086289694:web:0a04a7646b43f73b1fd50f",
  measurementId: "G-WVV9B12B97"
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

    // Start button is always locked for player — only shows status
    function updateStartBtn() {
        if (!startBtn) return;
        startBtn.disabled = true;
        startBtn.style.cursor = 'not-allowed';
        if (isApproved && getPlayerName()) {
            startBtn.textContent = '⏳ Waiting for Admin to Start...';
            startBtn.style.opacity = '0.75';
        } else {
            startBtn.textContent = 'START GAME';
            startBtn.style.opacity = '0.4';
        }
    }

    if (playerInput) {
        playerInput.addEventListener('input', () => {
            const name = getPlayerName();
            localStorage.setItem('squid_player_name', name);
            if (name !== lastName) {
                lastName = name;
                subscribeJoinStatus(name);
            }
            updateStartBtn();
        });
    }

    updateStartBtn();

    // Initialize Firebase (single call)
    const { db } = await FB.initFirebase(FIREBASE_CONFIG);
    if (!db) console.info('Firebase not available — leaderboard disabled until configured.');

    async function subscribeJoinStatus(name) {
        if (joinStatusUnsub) joinStatusUnsub();
        isApproved = false;
        updateStartBtn();
        if (!db || !name) return;
        joinStatusUnsub = await FB.listenJoinStatus(name, data => {
            const status = data?.status || 'none';
            if (status === 'approved') {
                isApproved = true;
                setAccessStatus('✅ Approved! Waiting for admin to start the game.', 'success');
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
            updateStartBtn();
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
    controller.setStartGuard(() => true);
    const sessionManager = new SessionManager();
    controller.setSessionManager(sessionManager);
    sessionManager.clear();
    window.game = controller;

    // ── Listen for admin global game start signal ──────────────────────────────
    if (db) {
        await FB.listenGameStart(data => {
            if (data?.started === true) {
                // Admin fired — unlock and launch for all approved players
                if (isApproved && getPlayerName()) {
                    setAccessStatus('🚀 Game is starting!', 'success');
                    setTimeout(() => {
                        controller.unlockAndStart();
                    }, 500);
                }
            } else if (data?.started === false) {
                // Admin reset — re-lock everything
                controller.adminCanStart = false;
                updateStartBtn();
                if (isApproved) setAccessStatus('✅ Approved! Waiting for admin to start the game.', 'success');
            }
        });
    }

    // Leaderboard real-time
    if (db && leaderboardList) {
        setLoadingLeaderboard(true, leaderboardList);
        const unsubscribe = await FB.listenTopScores(items => {
            setLoadingLeaderboard(false, leaderboardList);
            renderLeaderboard(leaderboardList, items, controller.lastSubmissionId || null);
        }, 10);
        window._leaderboardUnsubscribe = unsubscribe;
    }

    // ── Live score update after every round ──────────────────────────────────
    const _liveScoreUpdate = async () => {
        const name = localStorage.getItem('squid_player_name') || '';
        if (!name || !db) return;
        const responses = controller.roundResponses || [];
        const times = responses.map(r => r.submissionTime).filter(t => Number.isFinite(t) && t > 0);
        const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : null;
        try {
            await FB.upsertLiveScore({ name, score: controller.score, reactionTime: avg });
        } catch (e) {
            console.warn('Live score update failed', e);
        }
    };

    // Patch advanceToNextRound to push live score after each round
    const _origAdvance = controller.advanceToNextRound.bind(controller);
    controller.advanceToNextRound = function() {
        _origAdvance();
        _liveScoreUpdate();
    };

    // Hook into game end to do final score save
    controller.onGameEnd = async () => {
        const name = localStorage.getItem('squid_player_name') || '';
        if (!name) {
            alert('Please set a display name before submitting your score.');
            return;
        }
        const responses = controller.roundResponses || [];
        const times = responses.map(r => r.submissionTime).filter(t => Number.isFinite(t) && t > 0);
        const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : null;

        try {
            if (controller.dom && controller.dom.submissionStatus) {
                controller.dom.submissionStatus.textContent = 'Saving score...';
            }
            // Final upsert with definitive score
            const res = await FB.upsertLiveScore({ name, score: controller.score, reactionTime: avg });
            controller.lastSubmissionId = res?.id || null;
            if (controller.dom && controller.dom.submissionStatus) {
                controller.dom.submissionStatus.textContent = 'Score saved!';
            }
            try { sessionManager.clear(); } catch (e) {}
        } catch (err) {
            console.error('Score submit failed', err);
            if (controller.dom && controller.dom.submissionStatus) {
                controller.dom.submissionStatus.textContent = 'Save failed. Try again.';
            }
        }
    };
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp);
else initApp();