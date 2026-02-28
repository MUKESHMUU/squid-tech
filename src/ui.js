// UI helpers and rendering - plain DOM operations with null-safety
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
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function renderMCQ(containerEl, options = []) {
    if (!containerEl) return;
    containerEl.innerHTML = '';
    options.forEach((text, idx) => {
        const btn = document.createElement('button');
        btn.className = 'mcq-option';
        btn.type = 'button';
        btn.dataset.option = String(idx);
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
    statusEl.textContent = msg;
}

export function showToast(message, duration = 3000) {
    try {
        let toast = document.getElementById('appToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'appToast';
            toast.style.position = 'fixed';
            toast.style.bottom = '24px';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.background = 'rgba(0,0,0,0.8)';
            toast.style.color = '#fff';
            toast.style.padding = '10px 16px';
            toast.style.borderRadius = '6px';
            toast.style.zIndex = '9999';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.style.opacity = '1';
        setTimeout(() => { toast.style.transition = 'opacity 0.3s'; toast.style.opacity = '0'; }, duration);
    } catch (err) { console.warn('showToast failed', err); }
}

export function setLoadingStatus(statusEl, { loading = false, message = '' } = {}) {
    if (!statusEl) return;
    if (loading) {
        statusEl.className = 'info';
        statusEl.textContent = message || 'Loading...';
    } else {
        // leave class management to callers
        statusEl.textContent = message || '';
    }
}

export function safeText(el, text) {
    if (!el) return;
    el.textContent = text;
}
