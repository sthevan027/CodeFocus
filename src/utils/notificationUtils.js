// Utilitário para notificações desktop
class NotificationManager {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.isSupported = 'Notification' in window;
    this.init();
  }

  async init() {
    if (this.isSupported) {
      const permission = await Notification.requestPermission();
      console.log('Permissão de notificação:', permission);
    }
    
    // Inicializar contexto de áudio
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('AudioContext não suportado:', error);
    }
  }

  // Criar som de notificação
  createNotificationSound(frequency = 800, duration = 0.5) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Som de foco iniciado
  playFocusStartSound() {
    this.createNotificationSound(600, 0.3);
  }

  // Som de pausa
  playPauseSound() {
    this.createNotificationSound(400, 0.2);
  }

  // Som de ciclo finalizado
  playCycleCompleteSound() {
    this.createNotificationSound(1000, 1.0);
    setTimeout(() => this.createNotificationSound(800, 0.5), 200);
    setTimeout(() => this.createNotificationSound(600, 0.3), 400);
  }

  // Notificação visual
  showNotification(title, options = {}) {
    if (!this.isSupported || Notification.permission !== 'granted') {
      // Fallback: alert simples
      alert(`${title}\n${options.body || ''}`);
      return;
    }

    const notification = new Notification(title, {
              icon: '/favicon.ico',
        badge: '/favicon.ico',
      requireInteraction: false,
      silent: false,
      ...options
    });

    // Auto-remover após 5 segundos
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }

  // Notificação de foco iniciado
  notifyFocusStarted(cycleName = '') {
    this.playFocusStartSound();
    this.showNotification('🎯 Foco Iniciado', {
      body: cycleName ? `Ciclo: ${cycleName}` : 'Hora de focar!',
      tag: 'focus-started'
    });
  }

  // Notificação de pausa
  notifyPauseStarted(phase = 'shortBreak') {
    this.playPauseSound();
    const phaseName = phase === 'shortBreak' ? 'Pausa Curta' : 'Pausa Longa';
    this.showNotification('☕ Pausa Iniciada', {
      body: `Tempo de ${phaseName.toLowerCase()}`,
      tag: 'pause-started'
    });
  }

  // Notificação de ciclo finalizado
  notifyCycleComplete(phase = 'focus') {
    this.playCycleCompleteSound();
    const phaseName = phase === 'focus' ? 'Foco' : 'Pausa';
    this.showNotification('✅ Ciclo Finalizado!', {
      body: `${phaseName} concluído com sucesso!`,
      tag: 'cycle-complete',
      requireInteraction: true
    });
  }

  // Notificação de timer pausado
  notifyTimerPaused() {
    this.playPauseSound();
    this.showNotification('⏸️ Timer Pausado', {
      body: 'Você pode continuar quando quiser',
      tag: 'timer-paused'
    });
  }

  // Notificação de timer resumido
  notifyTimerResumed() {
    this.playFocusStartSound();
    this.showNotification('▶️ Timer Continuado', {
      body: 'De volta ao foco!',
      tag: 'timer-resumed'
    });
  }
}

// Instância global
const notificationManager = new NotificationManager();

export default notificationManager; 