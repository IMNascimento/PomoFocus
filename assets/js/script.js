class PomodoroTimer {
            constructor() {
                this.workTime = 25 * 60;
                this.shortBreakTime = 5 * 60;
                this.longBreakTime = 15 * 60;
                this.currentTime = this.workTime;
                this.isRunning = false;
                this.currentSession = 1;
                this.maxSessions = 4;
                this.mode = 'work';
                this.timer = null;
                this.totalSeconds = this.workTime;
                this.currentActivity = '';
                
                // Dados da sessão
                this.sessionData = {
                    pomodoros: [],
                    activities: new Map(),
                    totalFocusTime: 0,
                    startTime: new Date()
                };
                
                this.initializeElements();
                this.loadSettings();
                this.updateDisplay();
                this.setupProgressRing();
                this.updateStats();
                this.updateCurrentActivityDisplay();
            }

            initializeElements() {
                this.timerDisplay = document.getElementById('timerDisplay');
                this.startBtn = document.getElementById('startBtn');
                this.pauseBtn = document.getElementById('pauseBtn');
                this.progressBar = document.getElementById('progressBar');
                this.activityInput = document.getElementById('activityInput');
                this.timerPage = document.getElementById('timer-page');
                this.currentActivityDisplay = document.getElementById('currentActivityDisplay');
                
                // Configurações
                this.workTimeInput = document.getElementById('workTime');
                this.shortBreakInput = document.getElementById('shortBreak');
                this.longBreakInput = document.getElementById('longBreak');
                
                // Event listeners
                this.workTimeInput.addEventListener('change', () => this.updateSettings());
                this.shortBreakInput.addEventListener('change', () => this.updateSettings());
                this.longBreakInput.addEventListener('change', () => this.updateSettings());
                
                this.activityInput.addEventListener('input', () => {
                    this.currentActivity = this.activityInput.value.trim();
                    this.updateCurrentActivityDisplay();
                    // Salvar atividade no localStorage para persistir entre sessões
                    localStorage.setItem('currentActivity', this.currentActivity);
                });
            }

            setupProgressRing() {
                const circle = this.progressBar;
                const radius = 90;
                const circumference = radius * 2 * Math.PI;
                
                circle.style.strokeDasharray = `${circumference} ${circumference}`;
                circle.style.strokeDashoffset = circumference;
            }

            loadSettings() {
                const savedWork = localStorage.getItem('workTime');
                const savedShort = localStorage.getItem('shortBreak');
                const savedLong = localStorage.getItem('longBreak');
                const savedActivity = localStorage.getItem('currentActivity');
                
                if (savedWork) {
                    this.workTime = parseInt(savedWork) * 60;
                    this.workTimeInput.value = savedWork;
                }
                if (savedShort) {
                    this.shortBreakTime = parseInt(savedShort) * 60;
                    this.shortBreakInput.value = savedShort;
                }
                if (savedLong) {
                    this.longBreakTime = parseInt(savedLong) * 60;
                    this.longBreakInput.value = savedLong;
                }
                if (savedActivity) {
                    this.currentActivity = savedActivity;
                    this.activityInput.value = savedActivity;
                }
                
                if (this.mode === 'work') {
                    this.currentTime = this.workTime;
                    this.totalSeconds = this.workTime;
                }
            }

            updateSettings() {
                if (!this.isRunning) {
                    this.workTime = parseInt(this.workTimeInput.value) * 60;
                    this.shortBreakTime = parseInt(this.shortBreakInput.value) * 60;
                    this.longBreakTime = parseInt(this.longBreakInput.value) * 60;
                    
                    localStorage.setItem('workTime', this.workTimeInput.value);
                    localStorage.setItem('shortBreak', this.shortBreakInput.value);
                    localStorage.setItem('longBreak', this.longBreakInput.value);
                    
                    if (this.mode === 'work') {
                        this.currentTime = this.workTime;
                        this.totalSeconds = this.workTime;
                    }
                    
                    this.updateDisplay();
                    this.updateProgress();
                }
            }

            updateCurrentActivityDisplay() {
                if (this.currentActivity) {
                    this.currentActivityDisplay.textContent = this.currentActivity;
                    this.currentActivityDisplay.classList.add('active');
                } else {
                    this.currentActivityDisplay.textContent = 'Defina uma atividade nas configurações';
                    this.currentActivityDisplay.classList.remove('active');
                }
            }

            formatTime(seconds) {
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = seconds % 60;
                return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
            }

            updateDisplay() {
                this.timerDisplay.textContent = this.formatTime(this.currentTime);
                this.updateModeButtons();
                this.updateModeClass();
            }

            updateModeButtons() {
                document.querySelectorAll('.mode-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                const activeBtn = document.querySelector(`[onclick="setMode('${this.mode}')"]`);
                if (activeBtn) {
                    activeBtn.classList.add('active');
                }
            }

            updateModeClass() {
                this.timerPage.className = 'timer-page';
                
                switch (this.mode) {
                    case 'work':
                        this.timerPage.classList.add('work-mode');
                        break;
                    case 'shortBreak':
                        this.timerPage.classList.add('break-mode');
                        break;
                    case 'longBreak':
                        this.timerPage.classList.add('long-break-mode');
                        break;
                }
            }

            updateProgress() {
                const circle = this.progressBar;
                const radius = 90;
                const circumference = radius * 2 * Math.PI;
                const progress = (this.totalSeconds - this.currentTime) / this.totalSeconds;
                const offset = circumference - (progress * circumference);
                
                circle.style.strokeDashoffset = offset;
            }

            setMode(mode) {
                if (!this.isRunning) {
                    this.mode = mode;
                    
                    switch (mode) {
                        case 'work':
                            this.currentTime = this.workTime;
                            this.totalSeconds = this.workTime;
                            break;
                        case 'shortBreak':
                            this.currentTime = this.shortBreakTime;
                            this.totalSeconds = this.shortBreakTime;
                            break;
                        case 'longBreak':
                            this.currentTime = this.longBreakTime;
                            this.totalSeconds = this.longBreakTime;
                            break;
                    }
                    
                    this.updateDisplay();
                    this.updateProgress();
                }
            }

            start() {
                if (!this.isRunning) {
                    this.isRunning = true;
                    this.startBtn.style.display = 'none';
                    this.pauseBtn.style.display = 'flex';
                    
                    this.timer = setInterval(() => {
                        this.currentTime--;
                        this.updateDisplay();
                        this.updateProgress();
                        
                        if (this.currentTime <= 10 && this.currentTime > 0) {
                            this.timerDisplay.classList.add('pulse');
                            this.progressBar.classList.add('pulse');
                            this.currentActivityDisplay.classList.add('pulse');
                        } else {
                            this.timerDisplay.classList.remove('pulse');
                            this.progressBar.classList.remove('pulse');
                            this.currentActivityDisplay.classList.remove('pulse');
                        }
                        
                        if (this.currentTime <= 0) {
                            this.complete();
                        }
                    }, 1000);
                }
            }

            pause() {
                if (this.isRunning) {
                    this.isRunning = false;
                    clearInterval(this.timer);
                    this.startBtn.style.display = 'flex';
                    this.pauseBtn.style.display = 'none';
                }
            }

            reset() {
                this.pause();
                
                switch (this.mode) {
                    case 'work':
                        this.currentTime = this.workTime;
                        this.totalSeconds = this.workTime;
                        break;
                    case 'shortBreak':
                        this.currentTime = this.shortBreakTime;
                        this.totalSeconds = this.shortBreakTime;
                        break;
                    case 'longBreak':
                        this.currentTime = this.longBreakTime;
                        this.totalSeconds = this.longBreakTime;
                        break;
                }
                
                this.updateDisplay();
                this.updateProgress();
                this.timerDisplay.classList.remove('pulse');
                this.progressBar.classList.remove('pulse');
                this.currentActivityDisplay.classList.remove('pulse');
            }

            complete() {
                this.pause();
                this.playNotificationSound();
                
                if (this.mode === 'work') {
                    // Salvar dados do pomodoro
                    const pomodoroData = {
                        activity: this.currentActivity || 'Sem descrição',
                        duration: this.workTime / 60,
                        completedAt: new Date(),
                        session: this.currentSession
                    };
                    
                    this.sessionData.pomodoros.push(pomodoroData);
                    this.sessionData.totalFocusTime += this.workTime;
                    
                    // Contar atividades
                    if (this.currentActivity) {
                        const count = this.sessionData.activities.get(this.currentActivity) || 0;
                        this.sessionData.activities.set(this.currentActivity, count + 1);
                    }
                    
                    this.updateStats();
                    
                    if (this.currentSession === this.maxSessions) {
                        this.setMode('longBreak');
                        this.currentSession = 1;
                        this.showNotification('🎉 Parabéns! Hora da pausa longa!');
                    } else {
                        this.setMode('shortBreak');
                        this.showNotification('☕ Ótimo trabalho! Hora da pausa!');
                    }
                } else {
                    this.setMode('work');
                    
                    if (this.currentSession < this.maxSessions) {
                        this.currentSession++;
                    }
                    
                    this.showNotification('💪 Pausa terminada! Vamos focar!');
                }
                
                // Auto-start após 3 segundos
                setTimeout(() => {
                    if (!this.isRunning) {
                        this.start();
                    }
                }, 3000);
            }

            showNotification(message) {
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Focus Timer', {
                        body: message,
                        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍅</text></svg>'
                    });
                }
                
                alert(message);
            }

            playNotificationSound() {
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
                    
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.3);
                } catch (error) {
                    console.log('Audio not supported');
                }
            }

            updateStats() {
                document.getElementById('totalPomodoros').textContent = this.sessionData.pomodoros.length;
                
                const hours = Math.floor(this.sessionData.totalFocusTime / 3600);
                const minutes = Math.floor((this.sessionData.totalFocusTime % 3600) / 60);
                document.getElementById('totalFocusTime').textContent = `${hours}h ${minutes}m`;
                
                document.getElementById('totalActivities').textContent = this.sessionData.activities.size;
                
                this.updateActivityHistory();
            }

            updateActivityHistory() {
                const historyDiv = document.getElementById('activityHistory');
                
                if (this.sessionData.pomodoros.length === 0) {
                    historyDiv.innerHTML = `
                        <div style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                            Nenhuma atividade registrada ainda
                        </div>
                    `;
                    return;
                }
                
                historyDiv.innerHTML = '';
                
                this.sessionData.pomodoros.forEach((pomodoro, index) => {
                    const item = document.createElement('div');
                    item.className = 'activity-item';
                    
                    const time = pomodoro.completedAt.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    item.innerHTML = `
                        <div class="activity-name">${pomodoro.activity}</div>
                        <div class="activity-time">${time} - ${pomodoro.duration}min</div>
                    `;
                    
                    historyDiv.appendChild(item);
                });
            }

            downloadStats() {
                const report = this.generateReport();
                
                let content = `RELATÓRIO DE PRODUTIVIDADE - FOCUS TIMER\n`;
                content += `=========================================\n\n`;
                content += `Período: ${report.sessionInfo.startTime.toLocaleString('pt-BR')} - ${report.sessionInfo.endTime.toLocaleString('pt-BR')}\n\n`;
                
                content += `RESUMO GERAL:\n`;
                content += `- Pomodoros Concluídos: ${report.sessionInfo.totalPomodoros}\n`;
                content += `- Tempo Total de Foco: ${Math.floor(report.sessionInfo.totalFocusTime / 3600)}h ${Math.floor((report.sessionInfo.totalFocusTime % 3600) / 60)}m\n`;
                content += `- Atividades Diferentes: ${report.sessionInfo.totalActivities}\n\n`;
                
                if (report.activitiesSummary.length > 0) {
                    content += `RESUMO POR ATIVIDADE:\n`;
                    report.activitiesSummary.forEach(activity => {
                        content += `- ${activity.activity}: ${activity.count} pomodoro(s) (${activity.totalTime}min)\n`;
                    });
                    content += `\n`;
                }
                
                content += `HISTÓRICO DETALHADO:\n`;
                report.pomodoros.forEach((pomodoro, index) => {
                    content += `${index + 1}. ${pomodoro.completedAt.toLocaleString('pt-BR')} - ${pomodoro.activity} (${pomodoro.duration}min)\n`;
                });
                
                const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `focus-timer-report-${new Date().toISOString().split('T')[0]}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            generateReport() {
                return {
                    sessionInfo: {
                        startTime: this.sessionData.startTime,
                        endTime: new Date(),
                        totalPomodoros: this.sessionData.pomodoros.length,
                        totalFocusTime: this.sessionData.totalFocusTime,
                        totalActivities: this.sessionData.activities.size
                    },
                    pomodoros: this.sessionData.pomodoros,
                    activitiesSummary: Array.from(this.sessionData.activities.entries()).map(([activity, count]) => ({
                        activity,
                        count,
                        totalTime: count * (this.workTime / 60)
                    }))
                };
            }
        }

        // Instanciar a aplicação
        const app = new PomodoroTimer();

        // Funções globais
        function startTimer() {
            app.start();
        }

        function pauseTimer() {
            app.pause();
        }

        function resetTimer() {
            app.reset();
        }

        function setMode(mode) {
            app.setMode(mode);
        }

        function showSettings() {
            document.getElementById('timer-page').classList.add('hidden');
            document.getElementById('settings-page').classList.add('active');
            app.updateStats();
        }

        function showTimer() {
            document.getElementById('settings-page').classList.remove('active');
            document.getElementById('timer-page').classList.remove('hidden');
        }

        function downloadStats() {
            app.downloadStats();
        }

        // Solicitar permissão para notificações
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Prevenir perda de dados ao fechar
        window.addEventListener('beforeunload', (e) => {
            if (app.sessionData.pomodoros.length > 0) {
                e.preventDefault();
                e.returnValue = 'Você tem dados de sessão não salvos. Deseja realmente sair?';
            }
        });