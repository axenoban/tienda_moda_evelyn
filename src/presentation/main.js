// Punto de entrada principal para la interfaz táctil de FinaPro
import { CuttingBatchView } from './views/CuttingBatchView.js';

document.addEventListener('DOMContentLoaded', () => {
  const view = new CuttingBatchView();
  view.init();
});