import { CuttingBatchView } from './views/CuttingBatchView.js';
import { FamilyExpensesView } from './views/FamilyExpensesView.js';
import { MonthlyBalanceView } from './views/MonthlyBalanceView.js';

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  
  const navContainer = document.createElement('div');
  navContainer.className = 'nav-tabs';
  navContainer.innerHTML = `
    <button class="tab-btn active" id="tab-cutting">Mesa de Corte</button>
    <button class="tab-btn" id="tab-expenses">Egresos</button>
    <button class="tab-btn" id="tab-balance">Balance Cascada</button>
  `;
  body.insertBefore(navContainer, body.firstChild);

  const viewContainer = document.createElement('div');
  viewContainer.id = 'view-content';
  body.appendChild(viewContainer);

  const cuttingView = new CuttingBatchView();
  const expensesView = new FamilyExpensesView();
  const balanceView = new MonthlyBalanceView();

  const btnCutting = document.getElementById('tab-cutting');
  const btnExpenses = document.getElementById('tab-expenses');
  const btnBalance = document.getElementById('tab-balance');

  function switchView(activeTab, targetView) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    activeTab.classList.add('active');
    targetView.render(viewContainer);
  }

  btnCutting.addEventListener('click', () => switchView(btnCutting, cuttingView));
  btnExpenses.addEventListener('click', () => switchView(btnExpenses, expensesView));
  btnBalance.addEventListener('click', () => switchView(btnBalance, balanceView));

  switchView(btnCutting, cuttingView);
});