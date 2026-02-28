// ==========================================
// SQUID TECH: Code to Survive - Game Logic
// ==========================================

class SquidGameController {
    constructor() {
        // Game State
        this.gameStarted = false;
        this.gameOver = false;
        this.currentRoundIndex = 0;
        this.currentPhase = null; // 'green' or 'red'
        this.score = 0;
        this.roundResponses = [];
        this.answerSubmittedTime = null;
        this.roundStartTime = null;
        this.greenLightEndTime = null;
        this.selectedOption = null;
        this.answerLocked = false;

        // Timers
        this.overallStartTime = null;
        this.phaseTimerInterval = null;
        this.phaseAutoAdvanceTimeout = null;
        this.greenLightDuration = 0;
        this.redLightDuration = 30; // Fixed 30 seconds
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

    attachEventListeners() {
        this.dom.startBtn.addEventListener('click', () => this.startGame());
        this.dom.restartBtn.addEventListener('click', () => this.restartGame());
        
        // MCQ option listeners
        document.querySelectorAll('.mcq-option').forEach((btn, index) => {
            btn.addEventListener('click', () => this.selectOption(index));
        });
    }

    startGame() {
        console.log('🎮 Game Started!');
        this.gameStarted = true;
        this.gameOver = false;
        this.currentRoundIndex = 0;
        this.score = 0;
        this.roundResponses = [];
        this.overallStartTime = Date.now();

        // Hide start section
        this.dom.startSection.style.display = 'none';
        this.dom.gameOver.style.display = 'none';

        // Remove any existing glow
        this.dom.gameContainer.classList.remove('green-glow', 'red-glow');

        // Start first round
        this.startRound();

        // Start overall game timer
        this.startOverallTimer();
    }

    startRound() {
        if (this.currentRoundIndex >= GAME_SCENARIOS.length) {
            this.endGame();
            return;
        }

        console.log(`📍 Starting Round ${this.currentRoundIndex + 1}`);
        this.roundStartTime = Date.now();
        this.answerSubmittedTime = null;
        this.selectedOption = null;
        this.answerLocked = false;
        this.dom.submissionStatus.textContent = '';
        this.dom.submissionStatus.className = '';

        // Update round display
        this.updateRoundDisplay();

        // Start Green Light
        this.startGreenLight();
    }

    startGreenLight() {
        this.currentPhase = 'green';
        console.log('🟢 Green Light Started');

        // Generate random duration between 10-45 seconds
        this.greenLightDuration = Math.floor(Math.random() * 36) + 10; // 10-45 seconds
        this.greenLightEndTime = Date.now() + (this.greenLightDuration * 1000);

        // Update UI
        this.updatePhaseIndicator('green');
        this.dom.scenarioBox.style.display = 'block';
        this.dom.questionBox.style.display = 'none';
        this.dom.answerSection.style.display = 'none';

        // Display scenario
        const scenario = GAME_SCENARIOS[this.currentRoundIndex];
        this.dom.scenarioText.textContent = scenario.scenario;

        // Start phase timer display
        this.startPhaseTimer('green', this.greenLightDuration);

        // Auto-switch to red light after duration
        clearTimeout(this.phaseAutoAdvanceTimeout);
        this.phaseAutoAdvanceTimeout = setTimeout(() => {
            this.startRedLight();
        }, this.greenLightDuration * 1000);
    }

    startRedLight() {
        this.currentPhase = 'red';
        console.log('🔴 Red Light Started');
        this.answerLocked = false;
        this.selectedOption = null;

        // Stop green timer
        clearInterval(this.phaseTimerInterval);
        clearTimeout(this.phaseAutoAdvanceTimeout);

        // Update UI
        this.updatePhaseIndicator('red');
        this.dom.scenarioBox.style.display = 'none';
        this.dom.questionBox.style.display = 'block';
        this.dom.answerSection.style.display = 'flex';

        // Display question
        const scenario = GAME_SCENARIOS[this.currentRoundIndex];
        this.dom.questionText.textContent = scenario.question;

        // Setup MCQ options
        this.setupMCQOptions(scenario);

        // Record red light start time
        this.greenLightEndTime = Date.now();

        // Start phase timer display
        this.startPhaseTimer('red', this.redLightDuration);

        // Auto-advance to next round after 30 seconds
        clearTimeout(this.phaseAutoAdvanceTimeout);
        this.phaseAutoAdvanceTimeout = setTimeout(() => {
            this.endRedLight();
        }, this.redLightDuration * 1000);
    }

    setupMCQOptions(scenario) {
        const options = document.querySelectorAll('.mcq-option');
        options.forEach((btn, index) => {
            btn.textContent = scenario.options[index];
            btn.classList.remove('selected', 'correct', 'incorrect', 'disabled');
            btn.disabled = false;
            btn.dataset.optionIndex = index;
        });
    }

    startPhaseTimer(phase, duration) {
        // Clear existing timer
        if (this.phaseTimerInterval) {
            clearInterval(this.phaseTimerInterval);
        }

        let elapsed = 0;
        const startTime = Date.now();
        const totalCircumference = 282.7;

        const updateTimer = () => {
            elapsed = (Date.now() - startTime) / 1000;

            if (elapsed >= duration) {
                elapsed = duration;
            }

            // Update timer display
            const displaySeconds = Math.max(0, duration - elapsed);
            const minutes = Math.floor(displaySeconds / 60);
            const seconds = Math.floor(displaySeconds % 60);
            this.dom.timerText.textContent = 
                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            // Update progress circle
            const progress = elapsed / duration;
            const offset = totalCircumference * (1 - progress);
            this.dom.timerProgress.style.strokeDashoffset = offset;

            // Update circle color
            if (phase === 'green') {
                this.dom.timerProgress.classList.add('green');
                this.dom.timerProgress.classList.remove('red');
            } else {
                this.dom.timerProgress.classList.remove('green');
                this.dom.timerProgress.classList.add('red');
            }
        };

        // Initial update
        updateTimer();

        // Set interval for continuous update
        this.phaseTimerInterval = setInterval(() => {
            if (Date.now() - startTime >= duration * 1000) {
                clearInterval(this.phaseTimerInterval);
            } else {
                updateTimer();
            }
        }, 100);
    }

    startOverallTimer() {
        if (this.overallTimerInterval) {
            clearInterval(this.overallTimerInterval);
        }

        this.overallTimerInterval = setInterval(() => {
            if (this.gameStarted && !this.gameOver) {
                const elapsed = Math.floor((Date.now() - this.overallStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                this.dom.totalTime.textContent = 
                    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
        }, 100);
    }

    selectOption(optionIndex) {
        if (this.answerLocked || this.currentPhase !== 'red') {
            return;
        }

        this.selectedOption = optionIndex;
        const options = document.querySelectorAll('.mcq-option');
        options.forEach((btn, index) => {
            btn.classList.remove('selected');
            if (index === optionIndex) {
                btn.classList.add('selected');
            }
        });

        // Auto-submit on selection
        this.submitAnswer();
    }

    submitAnswer() {
        if (this.selectedOption === null || this.answerLocked) {
            console.log('⚠️ No answer selected or already submitted');
            return;
        }

        this.answerLocked = true;

        // Calculate submission time (from red light start)
        const submissionTime = (Date.now() - this.greenLightEndTime) / 1000;
        const scenario = GAME_SCENARIOS[this.currentRoundIndex];

        // Validate answer
        const isCorrect = this.selectedOption === scenario.correctAnswer;

        // Calculate score change
        const scoreChange = this.calculateScore(isCorrect, submissionTime);

        // Update score
        const newScore = this.score + scoreChange;
        this.score = Math.max(0, newScore); // No negative scores

        // Show feedback
        this.showFeedback(isCorrect, submissionTime, scoreChange, scenario);

        // Record response
        this.roundResponses.push({
            roundIndex: this.currentRoundIndex,
            userOption: this.selectedOption,
            correctOption: scenario.correctAnswer,
            isCorrect,
            submissionTime,
            scoreChange,
            scoreAfter: this.score
        });

        // Disable further interactions
        this.disableMCQOptions();

        // Stop red light timer
        clearInterval(this.phaseTimerInterval);
        clearTimeout(this.phaseAutoAdvanceTimeout);

        // Advance after brief delay for feedback
        setTimeout(() => {
            this.advanceToNextRound();
        }, 2000);
    }

    calculateScore(isCorrect, submissionTime) {
        if (!isCorrect) {
            // Wrong answer penalty
            if (this.score >= 200) {
                return -200; // Reduce by 200 points
            } else if (this.score === 0) {
                return 0; // Stays at 0
            } else {
                return -this.score; // Reduce to 0
            }
        }

        // Correct answer scoring
        if (submissionTime <= 15) {
            return 1500; // 1500 points for fast answer
        } else if (submissionTime <= 30) {
            return 1300; // 1300 points for slower answer
        }

        return 0; // Should not reach (red light is 30 seconds max)
    }

    showFeedback(isCorrect, submissionTime, scoreChange, scenario) {
        const statusEl = this.dom.submissionStatus;
        const options = document.querySelectorAll('.mcq-option');

        // Show correct/incorrect on options
        options.forEach((btn, index) => {
            if (index === scenario.correctAnswer) {
                btn.classList.add('correct');
            } else if (index === this.selectedOption && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        if (isCorrect) {
            statusEl.className = 'success';
            const pointsText = scoreChange >= 1500 ? '1500 points ⚡' : '1300 points ✓';
            statusEl.innerHTML = `
                <div style="font-size: 1.2em; margin-bottom: 8px;">✅ Correct!</div>
                <div style="font-size: 0.95em;">+${pointsText}</div>
                <div style="font-size: 0.85em; margin-top: 5px;">Time: ${submissionTime.toFixed(1)}s | Total Score: ${this.score}</div>
            `;
        } else {
            statusEl.className = 'error';
            const penalty = scoreChange < 0 ? Math.abs(scoreChange) : 0;
            statusEl.innerHTML = `
                <div style="font-size: 1.2em; margin-bottom: 8px;">❌ Incorrect</div>
                <div style="font-size: 0.9em;">Correct answer: ${scenario.options[scenario.correctAnswer]}</div>
                <div style="font-size: 0.85em; margin-top: 5px;">${penalty > 0 ? `-${penalty} points` : 'No penalty'} | Total Score: ${this.score}</div>
            `;
        }

        this.updateScoreDisplay();
    }

    disableMCQOptions() {
        const options = document.querySelectorAll('.mcq-option');
        options.forEach(btn => {
            btn.disabled = true;
            btn.classList.add('disabled');
        });
    }

    endRedLight() {
        if (!this.answerLocked && this.currentPhase === 'red') {
            console.log('🔴 Red Light Expired - No Answer Submitted');
            this.answerLocked = true;
            
            // No score change for no answer
            this.dom.submissionStatus.className = 'error';
            this.dom.submissionStatus.innerHTML = `
                <div style="font-size: 1.2em;">⏱️ Time's Up!</div>
                <div style="font-size: 0.9em; margin-top: 5px;">No answer submitted. Moving to next round...</div>
            `;

            this.disableMCQOptions();
            
            // Advance after brief delay
            setTimeout(() => {
                this.advanceToNextRound();
            }, 2000);
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

        // Stop all timers
        clearInterval(this.phaseTimerInterval);
        clearTimeout(this.phaseAutoAdvanceTimeout);
        clearInterval(this.overallTimerInterval);

        // Calculate final stats
        const elapsedSeconds = Math.floor((Date.now() - this.overallStartTime) / 1000);
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;

        // Update game over screen
        this.dom.finalScore.textContent = this.score.toLocaleString();
        this.dom.finalTime.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Show game over screen
        this.dom.scenarioBox.style.display = 'none';
        this.dom.questionBox.style.display = 'none';
        this.dom.answerSection.style.display = 'none';
        this.dom.gameOver.style.display = 'block';
        this.dom.gameContainer.classList.remove('green-glow', 'red-glow');

        // Log summary
        console.log('=== GAME SUMMARY ===');
        console.log(`Final Score: ${this.score}`);
        console.log(`Total Time: ${minutes}m ${seconds}s`);
        console.log(`Responses:`, this.roundResponses);
    }

    restartGame() {
        console.log('🔄 Restarting Game...');
        this.gameStarted = false;
        this.gameOver = false;
        this.currentRoundIndex = 0;
        this.score = 0;
        this.roundResponses = [];
        this.selectedOption = null;
        this.answerLocked = false;

        // Clear all timers
        clearInterval(this.phaseTimerInterval);
        clearTimeout(this.phaseAutoAdvanceTimeout);
        clearInterval(this.overallTimerInterval);

        // Reset UI
        this.dom.gameOver.style.display = 'none';
        this.dom.startSection.style.display = 'flex';
        this.dom.gameContainer.classList.remove('green-glow', 'red-glow');
        this.updateScoreDisplay();
        this.updateRoundDisplay();
        this.dom.timerText.textContent = '00:00';
        this.dom.totalTime.textContent = '00:00';
    }

    updatePhaseIndicator(phase) {
        this.dom.phaseLight.className = 'phase-light';
        
        if (phase === 'green') {
            this.dom.phaseLight.classList.add('green');
            this.dom.phaseText.textContent = '🟢 Green Light - Read Carefully!';
            this.dom.gameContainer.classList.remove('red-glow');
            this.dom.gameContainer.classList.add('green-glow');
        } else if (phase === 'red') {
            this.dom.phaseLight.classList.add('red');
            this.dom.phaseText.textContent = '🔴 Red Light - Answer Now!';
            this.dom.gameContainer.classList.remove('green-glow');
            this.dom.gameContainer.classList.add('red-glow');
        }
    }

    updateScoreDisplay() {
        this.dom.currentScore.textContent = this.score.toLocaleString();
    }

    updateRoundDisplay() {
        this.dom.currentRound.textContent = (this.currentRoundIndex + 1);
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new SquidGameController();
    console.log('🎮 SQUID TECH: Code to Survive - Ready to play!');
});
