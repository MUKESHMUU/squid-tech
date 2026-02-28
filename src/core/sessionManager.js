// SessionManager - manages saving/loading game session to localStorage
export class SessionManager {
    constructor({ key = 'squid_session', ttlMs = 30 * 60 * 1000, debounceMs = 1000 } = {}) {
        this.key = key;
        this.ttlMs = ttlMs;
        this.debounceMs = debounceMs;
        this._writeTimer = null;
        this._lastState = null;
        this._subscribers = [];
        this._locked = false; // if session is finished/locked

        window.addEventListener('storage', (e) => this._onStorageEvent(e));
        window.addEventListener('beforeunload', () => this._writeNow());
    }

    _safeParse(raw) {
        try {
            return JSON.parse(raw);
        } catch (err) {
            console.warn('SessionManager: corrupted session data', err);
            return null;
        }
    }

    _onStorageEvent(e) {
        if (e.key !== this.key) return;
        const state = e.newValue ? this._safeParse(e.newValue) : null;
        // notify subscribers of external change
        this._subscribers.forEach(cb => {
            try { cb(state, { external: true }); } catch (err) { console.error(err); }
        });
    }

    load() {
        const raw = localStorage.getItem(this.key);
        if (!raw) return null;
        const state = this._safeParse(raw);
        if (!state) {
            this.clear();
            return null;
        }
        // integrity checks
        if (!state.startedAt || !state.lastUpdated) {
            this.clear();
            return null;
        }
        if (this.isExpired(state)) {
            this.clear();
            return null;
        }
        this._lastState = state;
        return state;
    }

    save(state) {
        if (this._locked) return;
        // shallow copy and enrich
        const toStore = Object.assign({}, state, { lastUpdated: Date.now() });
        this._lastState = toStore;
        // debounce writes
        if (this._writeTimer) clearTimeout(this._writeTimer);
        this._writeTimer = setTimeout(() => this._writeNow(), this.debounceMs);
    }

    _writeNow() {
        if (!this._lastState) return;
        try {
            localStorage.setItem(this.key, JSON.stringify(this._lastState));
        } catch (err) {
            console.error('SessionManager write failed', err);
        }
    }

    clear() {
        try { localStorage.removeItem(this.key); } catch (e) {}
        this._lastState = null;
    }

    isExpired(state) {
        if (!state) return true;
        const ref = state.lastUpdated || state.startedAt || 0;
        return (Date.now() - ref) > this.ttlMs;
    }

    markFinished() {
        if (!this._lastState) return;
        this._lastState.phase = 'finished';
        this._locked = true;
        this.save(this._lastState);
        this._writeNow();
    }

    lock() { this._locked = true; }
    unlock() { this._locked = false; }

    subscribe(cb) { if (typeof cb === 'function') this._subscribers.push(cb); }
}
