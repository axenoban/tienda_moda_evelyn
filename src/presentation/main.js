import { CuttingBatchView } from './views/CuttingBatchView.js';
import { SalesView } from './views/SalesView.js';
import { FamilyExpensesView } from './views/FamilyExpensesView.js';
import { MonthlyBalanceView } from './views/MonthlyBalanceView.js';
import { LiquidationView } from './views/LiquidationView.js';

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  
  const navContainer = document.createElement('div');
  navContainer.className = 'nav-tabs';
  navContainer.innerHTML = `
    <button class="tab-btn active" id="tab-cutting">Corte</button>
    <button class="tab-btn" id="tab-sales">Ventas</button>
    <button class="tab-btn" id="tab-expenses">Egresos</button>
    <button class="tab-btn" id="tab-balance">Cascada</button>
    <button class="tab-btn" id="tab-liq">Saldos</button>
  `;
  body.insertBefore(navContainer, body.firstChild);

  const viewContainer = document.createElement('div');
  viewContainer.id = 'view-content';
  body.appendChild(viewContainer);

  const modules = [
    { btn: document.getElementById('tab-cutting'), view: new CuttingBatchView() },
    { btn: document.getElementById('tab-sales'), view: new SalesView() },
    { btn: document.getElementById('tab-expenses'), view: new FamilyExpensesView() },
    { btn: document.getElementById('tab-balance'), view: new MonthlyBalanceView() },
    { btn: document.getElementById('tab-liq'), view: new LiquidationView() }
  ];

  function switchView(activeTab, targetView) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    activeTab.classList.add('active');
    targetView.render(viewContainer);
  }

  modules.forEach(mod => {
    mod.btn.addEventListener('click', () => switchView(mod.btn, mod.view));
  });

  switchView(modules[0].btn, modules[0].view);
});