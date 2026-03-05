// ==========================================
// SQUID TECH: Code to Survive - Game Logic
// ==========================================

export class SquidGameController {
    constructor() {
        // Game State
        this.gameStarted = false;
        this.gameOver = false;
        this.currentRoundIndex = 0;
        this.currentPhase = null;
        this.score = 0;
        this.roundResponses = [];
        this.answerSubmittedTime = null;
        this.roundStartTime = null;
        this.greenLightEndTime = null;
        this.selectedOption = null;
        this.answerLocked = false;
        this.adminCanStart = false; // only true when admin fires signal
        this.isReady = false;       // player clicked "I'm Ready"

        // Timers
        this.overallStartTime = null;
        this.phaseTimerInterval = null;
        this.phaseAutoAdvanceTimeout = null;
        this.greenLightDuration = 0;
        this.redLightDuration = 30;
        this.overallTimerInterval = null;

        // UI References
        this.dom = {
            startBtn: document.getElementById('startBtn'),
            restartBtn: document.getElementById('restartBtn'),
            scenarioBox: document.getElementById('scenarioBox'),
            questionBox: document.getElementById('questionBox'),
            answerSection: document.getElementById('answerSection'),
            startSection: document.getElementById('startSection'),
            gameOver: document.getElementById('gameOver'),
            gameContainer: document.querySelector('.game-container'),
            phaseLight: document.querySelector('.phase-light'),
            phaseText: document.getElementById('phaseText'),
            timerText: document.getElementById('timerText'),
            timerProgress: document.getElementById('timerProgress'),
            currentRound: document.getElementById('currentRound'),
            currentScore: document.getElementById('currentScore'),
            totalTime: document.getElementById('totalTime'),
            scenarioText: document.getElementById('scenarioText'),
            questionText: document.getElementById('questionText'),
            submissionStatus: document.getElementById('submissionStatus'),
            finalScore: document.getElementById('finalScore'),
            finalTime: document.getElementById('finalTime'),
            mcqContainer: document.querySelector('.mcq-container')
        };

        this.attachEventListeners();
    }

    setStartGuard(fn) {
        this._startGuard = fn;
    }

    setSessionManager(sm) {
        this.sessionManager = sm;
    }

    // Called ONLY by main.js when admin fires the start signal
    unlockAndStart() {
        this.adminCanStart = true;
        this.isReady = true;
        if (this.dom.startBtn) this.dom.startBtn.disabled = false;
        this.startGame();
    }

    attachEventListeners() {
        if (this.dom.startBtn) {
            // Rename to "I'm Ready" — clicking ONLY marks player as ready, never starts game
            this.dom.startBtn.textContent = "I'm Ready";

            // Inject hint line below button
            if (!document.querySelector('#adminStartHint')) {
                const hint = document.createElement('p');
                hint.id = 'adminStartHint';
                hint.textContent = '⚡ Game will start automatically when admin starts it.';
                hint.style.cssText = 'margin-top:10px;font-size:0.85rem;color:rgba(255,255,255,0.55);text-align:center;';
                this.dom.startBtn.parentNode &&
                    this.dom.startBtn.parentNode.insertBefore(hint, this.dom.startBtn.nextSibling);
            }

            this.dom.startBtn.addEventListener('click', () => {
                if (this.isReady) return;
                this.isReady = true;
                this.dom.startBtn.textContent = '⏳ Waiting for Admin...';
                this.dom.startBtn.disabled = true;
                this.dom.startBtn.style.opacity = '0.7';
                this.dom.startBtn.style.cursor = 'not-allowed';
                const hint = document.querySelector('#adminStartHint');
                if (hint) hint.textContent = '✅ You are marked ready! Game starts when admin launches it.';
            });
        } else {
            console.error('❌ startBtn not found in DOM');
        }

        if (this.dom.restartBtn) {
            this.dom.restartBtn.addEventListener('click', () => this.restartGame());
        } else {
            console.error('❌ restartBtn not found in DOM');
        }

        if (this.dom.mcqContainer) {
            this.dom.mcqContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.mcq-option');
                if (btn) {
                    const index = parseInt(btn.dataset.option ?? btn.dataset.optionIndex, 10);
                    if (!isNaN(index)) this.selectOption(index);
                }
            });
        }
    }

    startGame() {
        // Hard block — admin MUST unlock via unlockAndStart()
        if (!this.adminCanStart) return;

        console.log('🎮 Game Started!');
        this.gameStarted = true;
        this.gameOver = false;
        this.currentRoundIndex = 0;
        this.score = 0;
        this.roundResponses = [];
        this.overallStartTime = Date.now();

        if (this.dom.startSection) this.dom.startSection.style.display = 'none';
        if (this.dom.gameOver) this.dom.gameOver.style.display = 'none';
        if (this.dom.gameContainer) this.dom.gameContainer.classList.remove('green-glow', 'red-glow');

        this.startRound();
        this.startOverallTimer();
    }

    startRound() {
        if (typeof GAME_SCENARIOS === 'undefined' || !Array.isArray(GAME_SCENARIOS)) {
            console.error('❌ GAME_SCENARIOS not loaded. Check script load order in HTML.');
            return;
        }

        if (this.currentRoundIndex >= GAME_SCENARIOS.length) {
            this.endGame();
            return;
        }

        console.log(`📍 Starting Round ${this.currentRoundIndex + 1}`);
        this.roundStartTime = Date.now();
        this.answerSubmittedTime = null;
        this.selectedOption = null;
        this.answerLocked = false;

        if (this.dom.submissionStatus) {
            this.dom.submissionStatus.textContent = '';
            this.dom.submissionStatus.className = '';
        }

        this.updateRoundDisplay();
        this.startGreenLight();
    }

    startGreenLight() {
        this.currentPhase = 'green';
        this.greenLightDuration = 15; // Fixed 15 seconds
        this.greenLightEndTime = Date.now() + (this.greenLightDuration * 1000);

        this.updatePhaseIndicator('green');

        if (this.dom.scenarioBox) this.dom.scenarioBox.style.display = 'block';
        if (this.dom.questionBox) this.dom.questionBox.style.display = 'none';
        if (this.dom.answerSection) this.dom.answerSection.style.display = 'none';

        const scenario = GAME_SCENARIOS[this.currentRoundIndex];
        if (this.dom.scenarioText) this.dom.scenarioText.textContent = scenario.scenario;

        this.startPhaseTimer('green', this.greenLightDuration);

        clearTimeout(this.phaseAutoAdvanceTimeout);
        this.phaseAutoAdvanceTimeout = setTimeout(() => {
            this.startRedLight();
        }, this.greenLightDuration * 1000);
    }

    startRedLight() {
        this.currentPhase = 'red';
        this.answerLocked = false;
        this.selectedOption = null;

        clearInterval(this.phaseTimerInterval);
        clearTimeout(this.phaseAutoAdvanceTimeout);

        this.updatePhaseIndicator('red');

        if (this.dom.scenarioBox) this.dom.scenarioBox.style.display = 'none';
        if (this.dom.questionBox) this.dom.questionBox.style.display = 'block';
        if (this.dom.answerSection) this.dom.answerSection.style.display = 'flex';

        const scenario = GAME_SCENARIOS[this.currentRoundIndex];
        if (this.dom.questionText) this.dom.questionText.textContent = scenario.question;

        this.setupMCQOptions(scenario);
        this.redLightStartTime = Date.now();

        this.startPhaseTimer('red', this.redLightDuration);

        clearTimeout(this.phaseAutoAdvanceTimeout);
        this.phaseAutoAdvanceTimeout = setTimeout(() => {
            this.endRedLight();
        }, this.redLightDuration * 1000);
    }

    setupMCQOptions(scenario) {
        if (!this.dom.mcqContainer) return;
        this.dom.mcqContainer.innerHTML = '';
        scenario.options.forEach((text, idx) => {
            const btn = document.createElement('button');
            btn.className = 'mcq-option';
            btn.type = 'button';
            btn.dataset.option = String(idx);
            btn.dataset.optionIndex = String(idx);
            btn.textContent = text;
            this.dom.mcqContainer.appendChild(btn);
        });
    }

    startPhaseTimer(phase, duration) {
        if (this.phaseTimerInterval) clearInterval(this.phaseTimerInterval);

        const startTime = Date.now();
        const totalCircumference = 282.7;

        const updateTimer = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const clampedElapsed = Math.min(elapsed, duration);
            const displaySeconds = Math.max(0, duration - clampedElapsed);
            const minutes = Math.floor(displaySeconds / 60);
            const seconds = Math.floor(displaySeconds % 60);

            if (this.dom.timerText) {
                this.dom.timerText.textContent =
                    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }

            if (this.dom.timerProgress) {
                const progress = clampedElapsed / duration;
                const offset = totalCircumference * (1 - progress);
                this.dom.timerProgress.style.strokeDashoffset = offset;
                if (phase === 'green') {
                    this.dom.timerProgress.classList.add('green');
                    this.dom.timerProgress.classList.remove('red');
                } else {
                    this.dom.timerProgress.classList.remove('green');
                    this.dom.timerProgress.classList.add('red');
                }
            }
        };

        updateTimer();
        this.phaseTimerInterval = setInterval(() => {
            if (Date.now() - startTime >= duration * 1000) clearInterval(this.phaseTimerInterval);
            else updateTimer();
        }, 100);
    }

    startOverallTimer() {
        if (this.overallTimerInterval) clearInterval(this.overallTimerInterval);
        this.overallTimerInterval = setInterval(() => {
            if (this.gameStarted && !this.gameOver) {
                const elapsed = Math.floor((Date.now() - this.overallStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                if (this.dom.totalTime) {
                    this.dom.totalTime.textContent =
                        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                }
            }
        }, 100);
    }

    selectOption(optionIndex) {
        if (this.answerLocked || this.currentPhase !== 'red') return;
        this.selectedOption = optionIndex;
        const options = this.dom.mcqContainer
            ? this.dom.mcqContainer.querySelectorAll('.mcq-option')
            : [];
        options.forEach((btn, index) => {
            btn.classList.remove('selected');
            if (index === optionIndex) btn.classList.add('selected');
        });
        this.submitAnswer();
    }

    submitAnswer() {
        if (this.selectedOption === null || this.answerLocked) return;

        this.answerLocked = true;
        const submissionTime = (Date.now() - this.redLightStartTime) / 1000;
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

        setTimeout(() => this.advanceToNextRound(), 2000);
    }

    // ==========================================
    // SCORE CALCULATION
    // noAnswer = true  → player did not answer in time
    // isCorrect        → player answered correctly
    // ==========================================
    calculateScore(isCorrect, submissionTime, noAnswer = false) {
        // No answer submitted
        if (noAnswer) {
            if (this.score >= 100) return -100;  // score ≥ 100 → -100
            return 0;                             // score < 100 → no change
        }

        // Wrong answer
        if (!isCorrect) {
            return -200;  // always -200 (Math.max(0,...) in submitAnswer prevents going below 0)
        }

        // Correct answer
        if (submissionTime <= 15) return 1500;   // correct within 15s → +1500
        if (submissionTime <= 30) return 1300;   // correct 15–30s → +1300
        return 0;                                // too slow → 0
    }

    showFeedback(isCorrect, submissionTime, scoreChange, scenario) {
        const statusEl = this.dom.submissionStatus;
        const options = this.dom.mcqContainer
            ? this.dom.mcqContainer.querySelectorAll('.mcq-option')
            : [];

        options.forEach((btn, index) => {
            if (index === scenario.correctAnswer) {
                btn.classList.add('correct');
            } else if (index === this.selectedOption && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        if (!statusEl) return;

        if (isCorrect) {
            statusEl.className = 'success';
            const pointsText = scoreChange >= 1500 ? '1500 points ⚡' : '1300 points ✓';
            statusEl.innerHTML = `
                <div style="font-size:1.2em;margin-bottom:8px;">✅ Correct!</div>
                <div style="font-size:0.95em;">+${pointsText}</div>
                <div style="font-size:0.85em;margin-top:5px;">Time: ${submissionTime.toFixed(1)}s | Total Score: ${this.score.toLocaleString()}</div>
            `;
        } else {
            statusEl.className = 'error';
            const penalty = scoreChange < 0 ? Math.abs(scoreChange) : 0;
            statusEl.innerHTML = `
                <div style="font-size:1.2em;margin-bottom:8px;">❌ Incorrect</div>
                <div style="font-size:0.9em;">Correct answer: ${this.escapeHtml(scenario.options[scenario.correctAnswer])}</div>
                <div style="font-size:0.85em;margin-top:5px;">${penalty > 0 ? `-${penalty} points` : 'No penalty'} | Total Score: ${this.score.toLocaleString()}</div>
            `;
        }

        this.updateScoreDisplay();
    }

    escapeHtml(str) {
        if (str == null) return '';
        return String(str).replace(/[&<>"'`]/g, s => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;',
            '"': '&quot;', "'": '&#39;', '`': '&#96;'
        }[s]));
    }

    disableMCQOptions() {
        const options = this.dom.mcqContainer
            ? this.dom.mcqContainer.querySelectorAll('.mcq-option')
            : [];
        options.forEach(btn => {
            btn.disabled = true;
            btn.classList.add('disabled');
        });
    }

    endRedLight() {
        if (!this.answerLocked && this.currentPhase === 'red') {
            this.answerLocked = true;

            // Apply no-answer penalty
            const scoreChange = this.calculateScore(false, 0, true);
            this.score = Math.max(0, this.score + scoreChange);
            this.updateScoreDisplay();

            if (this.dom.submissionStatus) {
                this.dom.submissionStatus.className = 'error';
                const penaltyText = scoreChange < 0 ? ` (-${Math.abs(scoreChange)} points)` : '';
                this.dom.submissionStatus.innerHTML = `
                    <div style="font-size:1.2em;">⏱️ Time's Up!${penaltyText}</div>
                    <div style="font-size:0.9em;margin-top:5px;">No answer submitted. Moving to next round...</div>
                `;
            }
            this.disableMCQOptions();
            setTimeout(() => this.advanceToNextRound(), 2000);
        }
    }

    advanceToNextRound() {
        console.log(`✅ Round ${this.currentRoundIndex + 1} Complete`);
        this.currentRoundIndex++;
        if (this.currentRoundIndex < GAME_SCENARIOS.length) {
            this.startRound();
        } else {
            this.endGame();
        }
    }

    endGame() {
        console.log('🏁 Game Over!');
        this.gameOver = true;
        this.gameStarted = false;

        clearInterval(this.phaseTimerInterval);
        clearTimeout(this.phaseAutoAdvanceTimeout);
        clearInterval(this.overallTimerInterval);

        const elapsedSeconds = Math.floor((Date.now() - this.overallStartTime) / 1000);
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;

        if (this.dom.finalScore) this.dom.finalScore.textContent = this.score.toLocaleString();
        if (this.dom.finalTime) {
            this.dom.finalTime.textContent =
                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        if (this.dom.scenarioBox) this.dom.scenarioBox.style.display = 'none';
        if (this.dom.questionBox) this.dom.questionBox.style.display = 'none';
        if (this.dom.answerSection) this.dom.answerSection.style.display = 'none';
        if (this.dom.gameOver) this.dom.gameOver.style.display = 'block';
        if (this.dom.gameContainer) this.dom.gameContainer.classList.remove('green-glow', 'red-glow');

        console.log('=== GAME SUMMARY ===');
        console.log(`Final Score: ${this.score}`);
        console.log(`Total Time: ${minutes}m ${seconds}s`);

        // Call onGameEnd hook set by main.js — triggers Firebase score save
        if (typeof this.onGameEnd === 'function') {
            this.onGameEnd().catch(err => console.error('onGameEnd failed:', err));
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
        this.adminCanStart = false;
        this.isReady = false;
        this.redLightStartTime = null;

        clearInterval(this.phaseTimerInterval);
        clearTimeout(this.phaseAutoAdvanceTimeout);
        clearInterval(this.overallTimerInterval);

        if (this.dom.gameOver) this.dom.gameOver.style.display = 'none';
        if (this.dom.startSection) this.dom.startSection.style.display = 'flex';
        if (this.dom.gameContainer) this.dom.gameContainer.classList.remove('green-glow', 'red-glow');
        if (this.dom.startBtn) {
            this.dom.startBtn.textContent = "I'm Ready";
            this.dom.startBtn.disabled = false;
            this.dom.startBtn.style.opacity = '1';
            this.dom.startBtn.style.cursor = 'pointer';
        }
        const hint = document.querySelector('#adminStartHint');
        if (hint) hint.textContent = '⚡ Game will start automatically when admin starts it.';

        this.updateScoreDisplay();
        this.updateRoundDisplay();
        if (this.dom.timerText) this.dom.timerText.textContent = '00:00';
        if (this.dom.totalTime) this.dom.totalTime.textContent = '00:00';
    }

    updatePhaseIndicator(phase) {
        if (!this.dom.phaseLight) return;
        this.dom.phaseLight.className = 'phase-light';

        if (phase === 'green') {
            this.dom.phaseLight.classList.add('green');
            if (this.dom.phaseText) this.dom.phaseText.textContent = '🟢 Green Light - Read Carefully!';
            if (this.dom.gameContainer) {
                this.dom.gameContainer.classList.remove('red-glow');
                this.dom.gameContainer.classList.add('green-glow');
            }
        } else if (phase === 'red') {
            this.dom.phaseLight.classList.add('red');
            if (this.dom.phaseText) this.dom.phaseText.textContent = '🔴 Red Light - Answer Now!';
            if (this.dom.gameContainer) {
                this.dom.gameContainer.classList.remove('green-glow');
                this.dom.gameContainer.classList.add('red-glow');
            }
        }
    }

    updateScoreDisplay() {
        if (this.dom.currentScore) this.dom.currentScore.textContent = this.score.toLocaleString();
    }

    updateRoundDisplay() {
        const display = Math.min(this.currentRoundIndex + 1, GAME_SCENARIOS.length);
        if (this.dom.currentRound) this.dom.currentRound.textContent = display;
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.game) {
        console.warn('⚠️ Game already initialized. Skipping duplicate init.');
        return;
    }
    window.game = new SquidGameController();
    console.log('🎮 SQUID TECH: Code to Survive - Ready to play!');
});