export class VoiceController {
  constructor(onCommandDetected) {
    this.onCommandDetected = onCommandDetected;
    this.recognition = null;
    this.isListening = false;
    this._initSpeech();
  }

  _initSpeech() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("El reconocimiento de voz no está soportado en este entorno.");
      return;
    }
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'es-BO'; // Configurado para modismos y acento de Bolivia
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase();
      this._parseCommand(text);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onStatusChange) this.onStatusChange(false);
    };
  }

  toggleListening(onStatusChange) {
    if (!this.recognition) return alert("Reconocimiento de voz no disponible.");
    this.onStatusChange = onStatusChange;

    if (this.isListening) {
      this.recognition.stop();
    } else {
      this.isListening = true;
      this.onStatusChange(true);
      this.recognition.start();
    }
  }

  _parseCommand(text) {
    // Limpieza de texto para capturar números dictados en el taller
    // Ej: "largo dos punto cinco" -> { field: "lCorte", value: 2.5 }
    const numbers = text.match(/\d+(\.\d+)?/);
    if (!numbers) return;

    const value = parseFloat(numbers[0]);

    if (text.includes('largo') || text.includes('trazo')) {
      this.onCommandDetected('lCorte', value);
    } else if (text.includes('modelo')) {
      this.onCommandDetected('nModelos', value);
    } else if (text.includes('rendimiento') || text.includes('prendas')) {
      this.onCommandDetected('rColor', value);
    } else if (text.includes('color') || text.includes('capas')) {
      this.onCommandDetected('cTotal', value);
    } else if (text.includes('precio') || text.includes('tela')) {
      this.onCommandDetected('pTela', value);
    }
  }
}