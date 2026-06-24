export class TactileKeyboard {
  constructor(onKeyPress, onDelete, onConfirm) {
    this.onKeyPress = onKeyPress;
    this.onDelete = onDelete;
    this.onConfirm = onConfirm;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'keyboard-container';

    // Distribución clásica de teclado de alta velocidad
    const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', '⌫'];

    keys.forEach(key => {
      const button = document.createElement('div');
      button.className = 'key-btn';
      if (key === '⌫') button.classList.add('key-action');
      button.innerText = key;

      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this._triggerHapticFeedback();
        
        if (key === '⌫') {
          this.onDelete();
        } else {
          this.onKeyPress(key);
        }
      });

      container.appendChild(button);
    });

    // Botón de confirmación masivo inferior
    const confirmBtn = document.createElement('div');
    confirmBtn.className = 'key-btn key-action';
    confirmBtn.style.gridColumn = 'span 3';
    confirmBtn.style.backgroundColor = 'var(--accent-color)';
    confirmBtn.style.color = '#000000';
    confirmBtn.innerText = 'CONFIRMAR REGISTRO';
    confirmBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this._triggerHapticFeedback();
      this.onConfirm();
    });
    container.appendChild(confirmBtn);

    return container;
  }

  _triggerHapticFeedback() {
    // API de vibración nativa para validación táctil veloz en feria
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  }
}