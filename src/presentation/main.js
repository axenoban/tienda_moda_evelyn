import { CuttingBatchView } from './views/CuttingBatchView.js';
import { FamilyExpensesView } from './views/FamilyExpensesView.js';

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  
  // 1. Inyectar barra de navegación superior fija
  const navContainer = document.createElement('div');
  navContainer.className = 'nav-tabs';
  navContainer.innerHTML = `
    <button class="tab-btn active" id="tab-cutting">Mesa de Corte</button>
    <button class="tab-btn" id="tab-expenses">Egresos Familiares</button>
  `;
  body.insertBefore(navContainer, body.firstChild);

  // 2. Contenedor dinámico de vistas
  const viewContainer = document.createElement('div');
  viewContainer.id = 'view-content';
  body.appendChild(viewContainer);

  // Instanciar controladores de vistas
  const cuttingView = new CuttingBatchView();
  const expensesView = new FamilyExpensesView();

  const btnCutting = document.getElementById('tab-cutting');
  const btnExpenses = document.getElementById('tab-expenses');

  // Enrutador rápido interno
  function switchView(activeTab, targetView) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    activeTab.classList.add('active');
    targetView.render(viewContainer);
  }

  // Eventos de intercambio táctil sin retardo
  btnCutting.addEventListener('click', () => switchView(btnCutting, cuttingView));
  btnExpenses.addEventListener('click', () => switchView(btnExpenses, expensesView));

  // Inicializar en la vista operativa primaria
  switchView(btnCutting, cuttingView);
});