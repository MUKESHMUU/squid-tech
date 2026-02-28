import { GAME_SCENARIOS } from '../gameData.js';
import * as UI from './ui.js';

export class SquidGameController {
    constructor({ uiRoot = document } = {}) {
        this.uiRoot = uiRoot;

        // State
        this.gameStarted = false;
        this.gameOver = false;
        this.currentRoundIndex = 0;
        this.currentPhase = null; // 'green'|'red'
        this.score = 0;
        this.roundResponses = [];
        this.answerLocked = false;
        this.greenLightDuration = 0;
        this.redLightDuration = 30;
        this.greenLightEndTime = null;

        // Timers
        this.phaseTimerInterval = null;
        this.phaseAutoAdvanceTimeout = null;
        this.overallTimerInterval = null;
        this.overallStartTime = null;
        this.redStartTime = null; // clearer than re-using green end time

        // DOM
        this.dom = this.collectDom();
        this.domInitOk = this.verifyDomInit();
        this.attachListeners();
        this.lastSubmissionId = null;
        this.startGuard = null;
        // session support (may be injected later)
        this.sessionManager = null;
        this._saveThrottle = null;
        this._sessionLocked = false;
    }

    collectDom() {
        const get = UI.getElement;
        return {
            startBtn: get('#startBtn', true),
            restartBtn: get('#restartBtn', true),
            scenarioBox: get('#scenarioBox', true),
            questionBox: get('#questionBox', true),
            answerSection: get('#answerSection', true),
            startSection: get('#startSection', true),
            gameOver: get('#gameOver', true),
            gameContainer: get('.game-container', true),
            phaseLight: get('.phase-light', true),
            phaseText: get('#phaseText', true),
            timerText: get('#timerText', true),
            timerProgress: get('#timerProgress', true),
            currentRound: get('#currentRound', true),
            currentScore: get('#currentScore', true),
            totalTime: get('#totalTime', true),
            scenarioText: get('#scenarioText', true),
            questionText: get('#questionText', true),
            submissionStatus: get('#submissionStatus', true),
            finalScore: get('#finalScore', true),
            finalTime: get('#finalTime', true),
            mcqContainer: get('.mcq-container', true),
            leaderboardList: get('#leaderboardList', false)
        };
    }

    verifyDomInit() {
        // If any required element is missing (null), disable the start button and prevent crashes
        const missing = Object.entries(this.dom).filter(([, el]) => el === null);
        if (missing.length > 0) {
            console.error('DOM initialization failed. Missing required elements:', missing.map(m => m[0]));
            if (this.dom.startBtn) {
                try { this.dom.startBtn.disabled = true; } catch (e) {}
            }
            return false;
        }
        return true;
    }

    attachListeners() {
        if (this.dom.startBtn) this.dom.startBtn.addEventListener('click', () => this.startGame());
        if (this.dom.restartBtn) this.dom.restartBtn.addEventListener('click', () => this.restartGame());

        // Event delegation for MCQ clicks (supports dynamic rendering)
        if (this.dom.mcqContainer) {
            this.dom.mcqContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.mcq-option');
                if (!btn || btn.disabled) return;
                const opt = btn.dataset.option;
                const idx = opt != null ? Number(opt) : null;
                if (idx !== null && !this.answerLocked && this.currentPhase === 'red') {
                    this.selectOption(idx);
                }
            });
        }
    }

    // --- Session integration ---
    setSessionManager(sm) {
        if (!sm) return;
        this.sessionManager = sm;
        sm.subscribe((state, meta) => {
            if (meta && meta.external) {
                if (state && state.phase === 'finished') {
                    this.lockForRemoteFinish();
                } else {
                    this.applyExternalState(state);
                }
            }
        });
    }

    applyExternalState(state) {
        if (!state) return;
        if (typeof state.score === 'number') { this.score = state.score; this.updateScoreDisplay(); }
        if (typeof state.questionIndex === 'number') { this.currentRoundIndex = state.questionIndex; this.updateRoundDisplay(); }
        if (state.phase) { this.currentPhase = state.phase; this.updatePhaseIndicator(state.phase); }
    }

    lockForRemoteFinish() {
        this.answerLocked = true;
        this.gameOver = true;
        this._sessionLocked = true;
        if (this.dom && this.dom.submissionStatus) this.dom.submissionStatus.textContent = 'Game finished in another tab.';
    }

    maybeSaveSession() {
        if (!this.sessionManager) return;
        // throttle local calls to avoid too-frequent updates
        if (this._saveThrottle) clearTimeout(this._saveThrottle);
        this._saveThrottle = setTimeout(() => {
            const s = this.collectSessionState();
            this.sessionManager.save(s);
        }, 500);
    }

    collectSessionState() {
        return {
            playerName: (localStorage.getItem('squid_player_name') || ''),
            score: this.score,
            phase: this.currentPhase || 'idle',
            greenLightEndTime: this.greenLightEndTime || null,
            redStartTime: this.redStartTime || null,
            questionIndex: this.currentRoundIndex,
            startedAt: this.overallStartTime || Date.now(),
            lastUpdated: Date.now(),
            selectedOption: this.selectedOption || null
        };
    }

    async restoreFromSession(state) {
        if (!state) return;
        // integrity checks and allowed transitions
        const allowedPhases = ['idle', 'green', 'red', 'question', 'finished'];
        if (!allowedPhases.includes(state.phase)) return;

        // preserve startedAt
        if (!state.startedAt) return;

        this.score = typeof state.score === 'number' ? state.score : 0;
        this.currentRoundIndex = typeof state.questionIndex === 'number' ? state.questionIndex : 0;
        this.updateScoreDisplay();
        this.updateRoundDisplay();

        // restore phase behavior
        if (state.phase === 'green') {
            const remainingMs = (state.greenLightEndTime || 0) - Date.now();
            if (remainingMs <= 0) {
                // immediately transition to red
                this.startRedLight();
            } else {
                this.currentPhase = 'green';
                this.greenLightEndTime = state.greenLightEndTime;
                const remainingSec = Math.ceil(remainingMs / 1000);
                this.updatePhaseIndicator('green');
                this.startPhaseTimer('green', remainingSec);
                clearTimeout(this.phaseAutoAdvanceTimeout);
                this.phaseAutoAdvanceTimeout = setTimeout(() => this.startRedLight(), remainingMs);
            }
        } else if (state.phase === 'red') {
            this.currentPhase = 'red';
            this.redStartTime = state.redStartTime || Date.now();
            const elapsed = Date.now() - this.redStartTime;
            const remainingMs = Math.max(0, (this.redLightDuration * 1000) - elapsed);
            if (remainingMs <= 0) {
                // red expired
                this.endRedLight();
            } else {
                this.updatePhaseIndicator('red');
                this.startPhaseTimer('red', remainingMs / 1000);
                clearTimeout(this.phaseAutoAdvanceTimeout);
                this.phaseAutoAdvanceTimeout = setTimeout(() => this.endRedLight(), remainingMs);
            }
        } else if (state.phase === 'finished') {
            this.endGame();
        } else {
            // idle or question - set UI state
            this.currentPhase = state.phase;
            this.updatePhaseIndicator(this.currentPhase);
        }

        // show restoration toast
        UI.showToast('Game restored from previous session', 3000);
    }

    startGame() {
        if (!this.domInitOk) {
            console.error('Cannot start game: DOM not initialized correctly.');
            return;
        }
        if (this.startGuard && !this.startGuard()) {
            UI.showToast('Waiting for admin approval.', 2500);
            return;
        }
        this.gameStarted = true;
        this.gameOver = false;
        this.currentRoundIndex = 0;
        this.score = 0;
        this.roundResponses = [];
        this.overallStartTime = Date.now();

        if (this.dom.startSection) this.dom.startSection.style.display = 'none';
        if (this.dom.gameOver) this.dom.gameOver.style.display = 'none';

        this.startOverallTimer();
        this.startRound();
        this.maybeSaveSession();
    }

    setStartGuard(fn) {
        this.startGuard = typeof fn === 'function' ? fn : null;
    }

    startRound() {
        if (this.currentRoundIndex >= GAME_SCENARIOS.length) return this.endGame();

        this.answerLocked = false;
        this.dom.submissionStatus && (this.dom.submissionStatus.textContent = '');
        this.updateRoundDisplay();
        this.startGreenLight();
    }

    startGreenLight() {
        this.currentPhase = 'green';
        this.greenLightDuration = 15; // Fixed 15 seconds
        // store green end timestamp for reference
        this.greenLightEndTime = Date.now() + (this.greenLightDuration * 1000);
        this.updatePhaseIndicator('green');
        if (this.dom.scenarioBox) this.dom.scenarioBox.style.display = 'block';
        if (this.dom.questionBox) this.dom.questionBox.style.display = 'none';
        if (this.dom.answerSection) this.dom.answerSection.style.display = 'none';

        const scenario = GAME_SCENARIOS[this.currentRoundIndex];
        UI.safeText(this.dom.scenarioText, scenario?.scenario || '');

        this.startPhaseTimer('green', this.greenLightDuration);
        clearTimeout(this.phaseAutoAdvanceTimeout);
        this.phaseAutoAdvanceTimeout = setTimeout(() => this.startRedLight(), this.greenLightDuration * 1000);
        this.maybeSaveSession();
    }

    startRedLight() {
        this.currentPhase = 'red';
        this.answerLocked = false;
        this.updatePhaseIndicator('red');
        if (this.dom.scenarioBox) this.dom.scenarioBox.style.display = 'none';
        if (this.dom.questionBox) this.dom.questionBox.style.display = 'block';
        if (this.dom.answerSection) this.dom.answerSection.style.display = 'flex';

        const scenario = GAME_SCENARIOS[this.currentRoundIndex];
        UI.safeText(this.dom.questionText, scenario?.question || '');

        // Render MCQ dynamically
        UI.renderMCQ(this.dom.mcqContainer, scenario?.options || []);

        // store red start timestamp separately from green end
        this.redStartTime = Date.now();
        this.startPhaseTimer('red', this.redLightDuration);
        clearTimeout(this.phaseAutoAdvanceTimeout);
        this.phaseAutoAdvanceTimeout = setTimeout(() => this.endRedLight(), this.redLightDuration * 1000);
        this.maybeSaveSession();
    }

    startPhaseTimer(phase, duration) {
        if (this.phaseTimerInterval) clearInterval(this.phaseTimerInterval);
        const start = Date.now();
        const totalCircumference = 282.7;
        const update = () => {
            const elapsed = (Date.now() - start) / 1000;
            const remaining = Math.max(0, duration - elapsed);
            if (this.dom.timerText) this.dom.timerText.textContent = UI.formatTime(remaining);
            const progress = Math.min(1, elapsed / duration);
            const offset = totalCircumference * (1 - progress);
            if (this.dom.timerProgress) this.dom.timerProgress.style.strokeDashoffset = offset;
            if (phase === 'green') {
                this.dom.timerProgress && this.dom.timerProgress.classList.add('green');
                this.dom.timerProgress && this.dom.timerProgress.classList.remove('red');
            } else {
                this.dom.timerProgress && this.dom.timerProgress.classList.remove('green');
                this.dom.timerProgress && this.dom.timerProgress.classList.add('red');
            }
        };
        update();
        this.phaseTimerInterval = setInterval(() => {
            if (Date.now() - start >= duration * 1000) clearInterval(this.phaseTimerInterval);
            else update();
        }, 200);
    }

    startOverallTimer() {
        if (this.overallTimerInterval) clearInterval(this.overallTimerInterval);
        this.overallTimerInterval = setInterval(() => {
            if (this.gameStarted && !this.gameOver && this.dom.totalTime && this.overallStartTime) {
                const elapsed = Math.floor((Date.now() - this.overallStartTime) / 1000);
                this.dom.totalTime.textContent = UI.formatTime(elapsed);
            }
        }, 500);
    }

    selectOption(optionIndex) {
        if (this.answerLocked || this.currentPhase !== 'red') return;
        this.selectedOption = optionIndex;
        // mark selection
        const buttons = this.dom.mcqContainer ? Array.from(this.dom.mcqContainer.querySelectorAll('.mcq-option')) : [];
        buttons.forEach((b, i) => b.classList.toggle('selected', i === optionIndex));
        this.submitAnswer();
    }

    submitAnswer() {
        if (this.selectedOption == null || this.answerLocked) return;
        this.answerLocked = true;
        const submissionTime = this.redStartTime ? (Date.now() - this.redStartTime) / 1000 : 0; // seconds
        const scenario = GAME_SCENARIOS[this.currentRoundIndex];
        const isCorrect = this.selectedOption === scenario.correctAnswer;
        const scoreChange = this.calculateScore(isCorrect, submissionTime);
        this.score = Math.max(0, this.score + scoreChange);

        this.showFeedback(isCorrect, submissionTime, scoreChange, scenario);

        this.roundResponses.push({
            roundIndex: this.currentRoundIndex,
            userOption: this.selectedOption,
            correctOption: scenario.correctAnswer,
            isCorrect,
            submissionTime,
            scoreChange,
            scoreAfter: this.score
        });

        this.disableMCQOptions();
        clearInterval(this.phaseTimerInterval);
        clearTimeout(this.phaseAutoAdvanceTimeout);
        this.maybeSaveSession();
        setTimeout(() => this.advanceToNextRound(), 1200);
    }

    calculateScore(isCorrect, submissionTime) {
        // validation helper
        const validateResult = (value) => {
            if (!Number.isFinite(value)) {
                console.warn('calculateScore produced non-finite value:', value);
                return 0;
            }
            // ensure integer
            let v = Math.trunc(value);
            // prevent overflow beyond safe integer
            if (Math.abs(v) > Number.MAX_SAFE_INTEGER) {
                console.warn('Score value overflow detected:', v);
                v = Math.sign(v) * Number.MAX_SAFE_INTEGER;
            }
            return v;
        };

        if (!isCorrect) {
            // Wrong answer -> enforce UI rule: if current score >= 200, final score becomes exactly 200.
            if (this.score >= 200) {
                const delta = 200 - this.score; // negative or zero, will set final to 200
                return validateResult(delta);
            }

            if (this.score === 0) return 0;

            // otherwise reduce to 0
            return validateResult(-this.score);
        }

        // Correct answer scoring
        let points = 0;
        if (submissionTime <= 15) points = 1500;
        else if (submissionTime <= 30) points = 1300;
        else points = 0;

        return validateResult(points);
    }

    showFeedback(isCorrect, submissionTime, scoreChange, scenario) {
        const statusEl = this.dom.submissionStatus;
        const options = this.dom.mcqContainer ? Array.from(this.dom.mcqContainer.querySelectorAll('.mcq-option')) : [];
        options.forEach((btn, index) => {
            btn.classList.remove('correct', 'incorrect');
            if (index === scenario.correctAnswer) btn.classList.add('correct');
            else if (index === this.selectedOption && !isCorrect) btn.classList.add('incorrect');
            btn.disabled = true;
        });

        if (!statusEl) return;
        if (isCorrect) {
            statusEl.className = 'success';
            const pointsText = scoreChange >= 1500 ? '1500 points ⚡' : '1300 points ✓';
            statusEl.innerHTML = `\n                <div style="font-size: 1.1em">✅ Correct!</div>\n                <div style="font-size: 0.95em">+${pointsText}</div>\n                <div style="font-size:0.85em; margin-top:4px">Time: ${submissionTime.toFixed(1)}s | Total Score: ${this.score}</div>\n            `;
        } else {
            statusEl.className = 'error';
            const penalty = scoreChange < 0 ? Math.abs(scoreChange) : 0;
            statusEl.innerHTML = `\n                <div style="font-size: 1.1em">❌ Incorrect</div>\n                <div style="font-size: 0.9em">Correct answer: ${scenario.options[scenario.correctAnswer]}</div>\n                <div style="font-size:0.85em; margin-top:4px">${penalty > 0 ? `-${penalty} points` : 'No penalty'} | Total Score: ${this.score}</div>\n            `;
        }
        this.updateScoreDisplay();
    }

    disableMCQOptions() {
        if (!this.dom.mcqContainer) return;
        const options = this.dom.mcqContainer.querySelectorAll('.mcq-option');
        options.forEach(btn => {
            btn.disabled = true;
            btn.classList.add('disabled');
        });
    }

    endRedLight() {
        if (!this.answerLocked && this.currentPhase === 'red') {
            this.answerLocked = true;
            if (this.dom.submissionStatus) {
                this.dom.submissionStatus.className = 'error';
                this.dom.submissionStatus.innerHTML = `\n                    <div style="font-size:1.1em">⏱️ Time's Up!</div>\n                    <div style="font-size:0.9em; margin-top:6px">No answer submitted. Moving to next round...</div>\n                `;
            }
            this.disableMCQOptions();
            setTimeout(() => this.advanceToNextRound(), 1200);
        }
    }

    advanceToNextRound() {
        this.currentRoundIndex++;
        this.maybeSaveSession();
        if (this.currentRoundIndex < GAME_SCENARIOS.length) this.startRound();
        else this.endGame();
    }

    endGame() {
        this.gameOver = true;
        this.gameStarted = false;
        clearInterval(this.phaseTimerInterval);
        clearTimeout(this.phaseAutoAdvanceTimeout);
        clearInterval(this.overallTimerInterval);

        const elapsedSeconds = this.overallStartTime ? Math.floor((Date.now() - this.overallStartTime) / 1000) : 0;
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;

        if (this.dom.finalScore) this.dom.finalScore.textContent = this.score.toLocaleString();
        if (this.dom.finalTime) this.dom.finalTime.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (this.dom.scenarioBox) this.dom.scenarioBox.style.display = 'none';
        if (this.dom.questionBox) this.dom.questionBox.style.display = 'none';
        if (this.dom.answerSection) this.dom.answerSection.style.display = 'none';
        if (this.dom.gameOver) this.dom.gameOver.style.display = 'block';

        this.maybeSaveSession();

        // Notify optional hook for post-game actions (e.g., submit score)
        try {
            if (typeof this.onGameEnd === 'function') {
                const maybePromise = this.onGameEnd();
                if (maybePromise && typeof maybePromise.then === 'function') {
                    maybePromise.catch(err => console.error('onGameEnd failed', err));
                }
            }
        } catch (err) {
            console.error('onGameEnd invocation error', err);
        }
    }

    restartGame() {
        this.gameStarted = false;
        this.gameOver = false;
        this.currentRoundIndex = 0;
        this.score = 0;
        this.roundResponses = [];
        this.selectedOption = null;
        this.answerLocked = false;
        clearInterval(this.phaseTimerInterval);
        clearTimeout(this.phaseAutoAdvanceTimeout);
        clearInterval(this.overallTimerInterval);

        if (this.dom.gameOver) this.dom.gameOver.style.display = 'none';
        if (this.dom.startSection) this.dom.startSection.style.display = 'flex';
        if (this.dom.timerText) this.dom.timerText.textContent = '00:00';
        if (this.dom.totalTime) this.dom.totalTime.textContent = '00:00';
        this.updateScoreDisplay();
        this.updateRoundDisplay();
        this.maybeSaveSession();
    }

    updatePhaseIndicator(phase) {
        if (!this.dom.phaseLight) return;
        this.dom.phaseLight.className = 'phase-light';
        if (phase === 'green') {
            this.dom.phaseLight.classList.add('green');
            if (this.dom.phaseText) this.dom.phaseText.textContent = '🟢 Green Light - Read Carefully!';
            this.dom.gameContainer && this.dom.gameContainer.classList && this.dom.gameContainer.classList.add('green-glow');
            this.dom.gameContainer && this.dom.gameContainer.classList && this.dom.gameContainer.classList.remove('red-glow');
        } else {
            this.dom.phaseLight.classList.add('red');
            if (this.dom.phaseText) this.dom.phaseText.textContent = '🔴 Red Light - Answer Now!';
            this.dom.gameContainer && this.dom.gameContainer.classList && this.dom.gameContainer.classList.add('red-glow');
            this.dom.gameContainer && this.dom.gameContainer.classList && this.dom.gameContainer.classList.remove('green-glow');
        }
    }

    updateScoreDisplay() {
        if (this.dom.currentScore) this.dom.currentScore.textContent = this.score.toLocaleString();
    }

    updateRoundDisplay() {
        if (this.dom.currentRound) this.dom.currentRound.textContent = (this.currentRoundIndex + 1);
    }
}
