import * as FB from './services/firebase/firebase.js';
import { getElement } from './ui.js';

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAR72Z6w2rHaSVo41LV7tcCMxiPvceZrYA",
  authDomain: "squid-tech-main.firebaseapp.com",
  projectId: "squid-tech-main",
  storageBucket: "squid-tech-main.firebasestorage.app",
  messagingSenderId: "1036086289694",
  appId: "1:1036086289694:web:0a04a7646b43f73b1fd50f",
  measurementId: "G-WVV9B12B97"
};

async function initAdmin() {
    document.documentElement.classList.add('js-ready');

    const adminPassword = getElement('#adminPassword', false);
    const adminLoginBtn = getElement('#adminLoginBtn', false);
    const adminLogoutBtn = getElement('#adminLogoutBtn', false);
    const adminStatus = getElement('#adminStatus', false);
    const inviteName = getElement('#inviteName', false);
    const addInviteBtn = getElement('#addInviteBtn', false);
    const inviteList = getElement('#inviteList', false);
    const joinRequestsList = getElement('#joinRequestsList', false);

    // Hide the email field — password only
    const adminEmail = getElement('#adminEmail', false);
    if (adminEmail) {
        adminEmail.style.display = 'none';
        adminEmail.closest && adminEmail.closest('p') && (adminEmail.closest('p').style.display = 'none');
    }

    // Hide the "admins are defined in Firestore" hint
    const adminHint = document.querySelector('.admin-hint');
    if (adminHint) adminHint.style.display = 'none';

    // ── Inject Game Control Section into the page ──────────────────────────────
    let gameControlSection = document.querySelector('#gameControlSection');
    if (!gameControlSection) {
        gameControlSection = document.createElement('div');
        gameControlSection.id = 'gameControlSection';
        gameControlSection.style.cssText = `
            margin: 24px 0 0 0;
            padding: 18px 20px;
            background: rgba(255,255,255,0.07);
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.15);
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
        `;
        gameControlSection.innerHTML = `
            <span style="font-weight:700;font-size:1rem;color:#fff;margin-right:4px;">🎮 Game Control</span>
            <button id="startAllBtn" style="
                padding: 10px 28px;
                background: linear-gradient(135deg, #22c55e, #16a34a);
                color: #fff; border: none; border-radius: 8px;
                font-size: 1rem; font-weight: 700; cursor: pointer;
                letter-spacing: 0.5px;
            ">▶ Start Game for All</button>
            <button id="resetAllBtn" style="
                padding: 10px 28px;
                background: linear-gradient(135deg, #ef4444, #b91c1c);
                color: #fff; border: none; border-radius: 8px;
                font-size: 1rem; font-weight: 700; cursor: pointer;
                letter-spacing: 0.5px;
            ">⏹ Reset / Stop</button>
            <span id="gameControlStatus" style="color:#a3e635;font-size:0.9rem;font-weight:600;margin-left:8px;"></span>
        `;
        const adminPanel = document.querySelector('.admin-panel') || document.querySelector('main') || document.body;
        adminPanel.appendChild(gameControlSection);
    }

    const startAllBtn = document.querySelector('#startAllBtn');
    const resetAllBtn = document.querySelector('#resetAllBtn');
    const gameControlStatus = document.querySelector('#gameControlStatus');

    // ── Initialize Firebase ────────────────────────────────────────────────────
    const { db } = await FB.initFirebase(FIREBASE_CONFIG);
    if (!db && adminStatus) adminStatus.textContent = 'Firebase not available.';

    let joinRequestsUnsub = null;
    let invitesUnsub = null;

    // ── Render helpers ─────────────────────────────────────────────────────────
    function renderInvites(items) {
        if (!inviteList) return;
        inviteList.innerHTML = '';
        if (!items.length) {
            inviteList.innerHTML = '<li>No invites yet.</li>';
            return;
        }
        items.forEach(item => {
            const li = document.createElement('li');
            const name = item?.name || item?.id || 'Unknown';
            const span = document.createElement('span');
            span.textContent = name;
            const actions = document.createElement('div');
            actions.className = 'admin-actions';
            const removeBtn = document.createElement('button');
            removeBtn.className = 'admin-btn';
            removeBtn.textContent = 'Remove';
            removeBtn.addEventListener('click', async () => {
                try { await FB.removeInvite(name); } catch (e) { console.error(e); }
            });
            actions.appendChild(removeBtn);
            li.appendChild(span);
            li.appendChild(actions);
            inviteList.appendChild(li);
        });
    }

    function renderJoinRequests(items) {
        if (!joinRequestsList) return;
        joinRequestsList.innerHTML = '';
        if (!items.length) {
            joinRequestsList.innerHTML = '<li>No pending requests.</li>';
            return;
        }
        items.forEach(item => {
            const li = document.createElement('li');
            const name = item?.name || item?.id || 'Unknown';
            const span = document.createElement('span');
            span.textContent = name;
            const actions = document.createElement('div');
            actions.className = 'admin-actions';

            const approveBtn = document.createElement('button');
            approveBtn.className = 'admin-btn';
            approveBtn.textContent = 'Approve';
            approveBtn.addEventListener('click', async () => {
                try { await FB.approveJoin(name, 'admin'); } catch (e) { console.error(e); }
            });

            const denyBtn = document.createElement('button');
            denyBtn.className = 'admin-btn';
            denyBtn.textContent = 'Deny';
            denyBtn.addEventListener('click', async () => {
                try { await FB.denyJoin(name, 'admin'); } catch (e) { console.error(e); }
            });

            actions.appendChild(approveBtn);
            actions.appendChild(denyBtn);
            li.appendChild(span);
            li.appendChild(actions);
            joinRequestsList.appendChild(li);
        });
    }

    function setAdminUi(user) {
        if (adminStatus) adminStatus.textContent = user ? 'Signed in as Admin' : 'Signed out';
        if (adminLoginBtn) adminLoginBtn.disabled = !!user;
        if (adminLogoutBtn) adminLogoutBtn.disabled = !user;
        if (!user) {
            if (inviteList) inviteList.innerHTML = '<li>Sign in to view invites.</li>';
            if (joinRequestsList) joinRequestsList.innerHTML = '<li>Sign in to view requests.</li>';
        }
    }

    // ── Auth handlers ──────────────────────────────────────────────────────────
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', async () => {
            const password = adminPassword ? adminPassword.value : '';
            if (!password) {
                if (adminStatus) adminStatus.textContent = 'Please enter the admin password.';
                return;
            }
            try {
                await FB.signInAdmin(null, password);
            } catch (e) {
                console.error(e);
                if (adminStatus) adminStatus.textContent = 'Incorrect password.';
                if (adminPassword) adminPassword.value = '';
            }
        });
    }

    if (adminPassword) {
        adminPassword.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && adminLoginBtn && !adminLoginBtn.disabled) {
                adminLoginBtn.click();
            }
        });
    }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', async () => {
            try { await FB.signOutAdmin(); }
            catch (e) { console.error(e); }
        });
    }

    // ── Invite handler ─────────────────────────────────────────────────────────
    if (addInviteBtn) {
        addInviteBtn.addEventListener('click', async () => {
            const name = inviteName ? inviteName.value.trim() : '';
            if (!name) return;
            try {
                await FB.addInvite(name, 'admin');
                if (inviteName) inviteName.value = '';
            } catch (e) { console.error(e); }
        });
    }

    // ── Game Control handlers ──────────────────────────────────────────────────
    if (startAllBtn) {
        startAllBtn.addEventListener('click', async () => {
            try {
                startAllBtn.disabled = true;
                startAllBtn.textContent = 'Starting...';
                await FB.setGameStart(true);
                if (gameControlStatus) gameControlStatus.textContent = '✅ Game started for all players!';
                startAllBtn.textContent = '▶ Start Game for All';
                startAllBtn.disabled = false;
            } catch (e) {
                console.error(e);
                if (gameControlStatus) gameControlStatus.textContent = '❌ Failed to start.';
                startAllBtn.textContent = '▶ Start Game for All';
                startAllBtn.disabled = false;
            }
        });
    }

    if (resetAllBtn) {
        resetAllBtn.addEventListener('click', async () => {
            try {
                resetAllBtn.disabled = true;
                resetAllBtn.textContent = 'Resetting...';
                await FB.resetGameStart();
                if (gameControlStatus) gameControlStatus.textContent = '🔄 Game reset. Players can start fresh.';
                resetAllBtn.textContent = '⏹ Reset / Stop';
                resetAllBtn.disabled = false;
            } catch (e) {
                console.error(e);
                if (gameControlStatus) gameControlStatus.textContent = '❌ Failed to reset.';
                resetAllBtn.textContent = '⏹ Reset / Stop';
                resetAllBtn.disabled = false;
            }
        });
    }

    // ── Auth state listener ────────────────────────────────────────────────────
    await FB.onAdminAuthStateChanged(async user => {
        setAdminUi(user);
        if (joinRequestsUnsub) joinRequestsUnsub();
        if (invitesUnsub) invitesUnsub();
        joinRequestsUnsub = null;
        invitesUnsub = null;
        if (user) {
            invitesUnsub = await FB.listenInvites(items => renderInvites(items));
            joinRequestsUnsub = await FB.listenJoinRequests(items => renderJoinRequests(items));
        }
    });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAdmin);
else initAdmin();