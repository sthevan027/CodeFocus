// Utilitário para notificações in-app
class NotificationManager {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.toastContainer = null;
    this.init();
  }

  async init() {
    // Inicializar contexto de áudio
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('AudioContext não suportado:', error);
    }
    
    // Criar container para toasts
    this.createToastContainer();
  }

  // Criar container para toasts
  createToastContainer() {
    if (this.toastContainer) return;
    
    this.toastContainer = document.createElement('div');
    this.toastContainer.id = 'toast-container';
    this.toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(this.toastContainer);
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

  // Mostrar toast no site
  showToast(title, message = '', type = 'info', duration = 4000) {
    this.createToastContainer();
    
    const toast = document.createElement('div');
    toast.style.cssText = `
      background: rgba(30, 41, 59, 0.95);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 12px;
      color: white;
      min-width: 300px;
      max-width: 400px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      pointer-events: auto;
      transform: translateX(100%);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    `;

    const typeColors = {
      info: '#3B82F6',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444'
    };

    const borderColor = typeColors[type] || typeColors.info;
    toast.style.borderLeftColor = borderColor;
    toast.style.borderLeftWidth = '4px';

    toast.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="font-size: 20px; line-height: 1; margin-top: 2px;">
          ${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : '🎯'}
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${title}</div>
          ${message ? `<div style="font-size: 13px; opacity: 0.8; line-height: 1.4;">${message}</div>` : ''}
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          padding: 0;
          margin-left: 8px;
        ">×</button>
      </div>
    `;

    this.toastContainer.appendChild(toast);

    // Animar entrada
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 10);

    // Auto-remover
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }, duration);

    return toast;
  }

  // Notificação de foco iniciado
  notifyFocusStarted(cycleName = '') {
    this.playFocusStartSound();
    this.showToast(
      '🎯 Foco Iniciado', 
      cycleName ? `Ciclo: ${cycleName}` : 'Hora de focar!',
      'success'
    );
  }

  // Notificação de pausa
  notifyPauseStarted(phase = 'shortBreak') {
    this.playPauseSound();
    const phaseName = phase === 'shortBreak' ? 'Pausa Curta' : 'Pausa Longa';
    this.showToast(
      '☕ Pausa Iniciada', 
      `Tempo de ${phaseName.toLowerCase()}`,
      'info'
    );
  }

  // Notificação de ciclo finalizado
  notifyCycleComplete(phase = 'focus') {
    this.playCycleCompleteSound();
    const phaseName = phase === 'focus' ? 'Foco' : 'Pausa';
    this.showToast(
      '✅ Ciclo Finalizado!', 
      `${phaseName} concluído com sucesso!`,
      'success',
      6000 // Duração maior para ciclo completo
    );
  }

  // Notificação de timer pausado
  notifyTimerPaused() {
    this.playPauseSound();
    this.showToast(
      '⏸️ Timer Pausado', 
      'Você pode continuar quando quiser',
      'warning'
    );
  }

  // Notificação de timer resumido
  notifyTimerResumed() {
    this.playFocusStartSound();
    this.showToast(
      '▶️ Timer Continuado', 
      'De volta ao foco!',
      'success'
    );
  }
}

// Instância global
const notificationManager = new NotificationManager();

export default notificationManager; 