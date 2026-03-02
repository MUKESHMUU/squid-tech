import * as FB from './services/firebase/firebase.js';
import { getElement } from './ui.js';

const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyBvv2LWEE7Qgj437Iwv4v0guV7bPCvQp38',
    authDomain: 'squid-tech-4eaf8.firebaseapp.com',
    projectId: 'squid-tech-4eaf8',
    storageBucket: 'squid-tech-4eaf8.firebasestorage.app',
    messagingSenderId: '1079894135221',
    appId: '1:1079894135221:web:d3744bfa469a07960e89fc'
};

async function initAdmin() {
    document.documentElement.classList.add('js-ready');

    // Note: adminEmail input is kept in HTML but hidden — we ignore it for auth
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

    // Hide the "admins are defined in Firestore" hint — no longer relevant
    const adminHint = document.querySelector('.admin-hint');
    if (adminHint) adminHint.style.display = 'none';

    const { db } = await FB.initFirebase(FIREBASE_CONFIG);
    if (!db && adminStatus) adminStatus.textContent = 'Firebase not available.';

    let joinRequestsUnsub = null;
    let invitesUnsub = null;

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

    // Allow pressing Enter in password field to log in
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