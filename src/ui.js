// ==========================================
// SQUID TECH: Code to Survive - UI Helpers
// FIXED VERSION
// ==========================================

export function getElement(selector, required = true) {
    const el = document.querySelector(selector);
    if (!el) {
        const msg = `Required element missing: ${selector}`;
        if (required) {
            console.error(msg);
        } else {
            console.warn(`Optional element missing: ${selector}`);
        }
    }
    return el;
}

export function formatTime(seconds) {
    // BUG FIX #1: Was not guarding against NaN/negative input
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) seconds = 0;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function renderMCQ(containerEl, options = []) {
    if (!containerEl) return;

    // BUG FIX #2: Was not validating options array — would crash on null/undefined
    if (!Array.isArray(options) || options.length === 0) {
        console.warn('renderMCQ called with empty or invalid options');
        return;
    }

    containerEl.innerHTML = '';
    options.forEach((text, idx) => {
        const btn = document.createElement('button');
        btn.className = 'mcq-option';
        btn.type = 'button';
        // BUG FIX #3: Both dataset keys set for backwards compatibility with gameLogic
        btn.dataset.option = String(idx);
        btn.dataset.optionIndex = String(idx);
        btn.textContent = text;
        containerEl.appendChild(btn);
    });
}

export function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"'`]/g, s => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '`': '&#96;'
    }[s]));
}

export function setSaving(isSaving, statusEl, msg = 'Saving...') {
    if (!statusEl) return;
    if (isSaving) {
        statusEl.className = 'info';
        statusEl.textContent = msg;
    } else {
        statusEl.className = '';
        statusEl.textContent = '';
    }
}

export function setLoadingLeaderboard(isLoading, container) {
    if (!container) return;
    if (isLoading) container.innerHTML = '<li>Loading leaderboard...</li>';
}

export function setError(msg, statusEl) {
    if (!statusEl) return;
    statusEl.className = 'error';
    // BUG FIX #4: Was setting textContent — use escapeHtml for safety
    statusEl.textContent = escapeHtml(msg);
}

export function showToast(message, duration = 3000) {
    try {
        let toast = document.getElementById('appToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'appToast';
            toast.style.cssText = [
                'position:fixed',
                'bottom:24px',
                'left:50%',
                'transform:translateX(-50%)',
                'background:rgba(0,0,0,0.85)',
                'color:#fff',
                'padding:10px 20px',
                'border-radius:8px',
                'z-index:9999',
                'font-size:14px',
                'pointer-events:none',
                'transition:opacity 0.3s'
            ].join(';');
            document.body.appendChild(toast);
        }

        // BUG FIX #5: Previous toasts were never properly cleared before showing new one
        // causing overlapping fade-out transitions
        toast.style.transition = 'none';
        toast.style.opacity = '1';
        toast.textContent = escapeHtml(message); // BUG FIX #6: XSS via message param

        // Clear any previous fade timeout
        if (toast._fadeTimeout) clearTimeout(toast._fadeTimeout);
        toast._fadeTimeout = setTimeout(() => {
            toast.style.transition = 'opacity 0.4s';
            toast.style.opacity = '0';
        }, duration);

    } catch (err) {
        console.warn('showToast failed', err);
    }
}

export function setLoadingStatus(statusEl, { loading = false, message = '' } = {}) {
    if (!statusEl) return;
    if (loading) {
        statusEl.className = 'info';
        statusEl.textContent = message || 'Loading...';
    } else {
        statusEl.textContent = message || '';
    }
}

export function safeText(el, text) {
    if (!el) return;
    // BUG FIX #7: Was not guarding against null/undefined text
    el.textContent = text ?? '';
}

// BUG FIX #8: NEW HELPER — missing from original but needed by leaderboard/admin
// Safely renders a list of leaderboard entries into a <ul>/<ol> element
export function renderLeaderboard(containerEl, entries = []) {
    if (!containerEl) return;

    if (!Array.isArray(entries) || entries.length === 0) {
        containerEl.innerHTML = '<li class="no-entries">No scores yet. Be the first!</li>';
        return;
    }

    containerEl.innerHTML = entries.map((entry, i) => {
        const rank = i + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
        const name = escapeHtml(entry.name || 'Anonymous');
        const score = (entry.score || 0).toLocaleString();
        const time = formatTime(entry.time || 0);
        return `<li class="leaderboard-entry rank-${rank}">
            <span class="rank">${medal}</span>
            <span class="player-name">${name}</span>
            <span class="player-score">${score} pts</span>
            <span class="player-time">${time}</span>
        </li>`;
    }).join('');
}