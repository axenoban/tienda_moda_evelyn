import { CuttingBatchView } from './views/CuttingBatchView.js';
import { SalesView } from './views/SalesView.js';
import { FamilyExpensesView } from './views/FamilyExpensesView.js';
import { MonthlyBalanceView } from './views/MonthlyBalanceView.js';
import { LiquidationView } from './views/LiquidationView.js';
import { InventoryView } from './views/InventoryView.js';
import { SeasonalPredictionView } from './views/SeasonalPredictionView.js';
import { CloudSyncService } from '../data/services/CloudSyncService.js';
import { NotificationService } from '../data/services/NotificationService.js';

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const syncService = new CloudSyncService();
  
  // Contenedor de navegación superior fija (Header nativo)
  const navContainer = document.createElement('div');
  navContainer.className = 'nav-tabs';
  navContainer.innerHTML = `
    <button class="tab-btn active" id="tab-cutting">Corte</button>
    <button class="tab-btn" id="tab-sales">Ventas</button>
    <button class="tab-btn" id="tab-inventory">Stock</button>
    <button class="tab-btn" id="tab-expenses">Egresos</button>
    <button class="tab-btn" id="tab-balance">Cascada</button>
    <button class="tab-btn" id="tab-seasonal">Ciclos</button>
    <button class="tab-btn" id="tab-liq">Saldos</button>
  `;
  body.appendChild(navContainer);

  // Área de visualización dinámica con scroll independiente
  const viewContainer = document.createElement('div');
  viewContainer.id = 'view-content';
  body.appendChild(viewContainer);

  const modules = [
    { btn: document.getElementById('tab-cutting'), view: new CuttingBatchView() },
    { btn: document.getElementById('tab-sales'), view: new SalesView() },
    { btn: document.getElementById('tab-inventory'), view: new InventoryView() },
    { btn: document.getElementById('tab-expenses'), view: new FamilyExpensesView() },
    { btn: document.getElementById('tab-balance'), view: new MonthlyBalanceView() },
    { btn: document.getElementById('tab-seasonal'), view: new SeasonalPredictionView() },
    { btn: document.getElementById('tab-liq'), view: new LiquidationView() }
  ];

  function switchView(activeTab, targetView) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    activeTab.classList.add('active');
    
    // Suavizado de transición al cambiar de módulo
    viewContainer.style.opacity = '0';
    setTimeout(() => {
      targetView.render(viewContainer);
      viewContainer.style.opacity = '1';
    }, 50);
  }

  modules.forEach(mod => {
    if (mod.btn) {
      mod.btn.addEventListener('click', () => switchView(mod.btn, mod.view));
    }
  });

  // Inicializar la primera vista de forma segura
  if (modules[0].btn) {
    switchView(modules[0].btn, modules[0].view);
  }

  // =========================================================================
  // AUTOMATIZACIÓN DEL EVENT LOOP DE SINCRONIZACIÓN (OFFLINE-FIRST)
  // =========================================================================
  if (navigator.onLine) {
    syncService.syncLocalDataToCloud();
  }

  window.addEventListener('online', () => {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    console.log("[FinaPro] Conexión activa detectada. Sincronizando...");
    syncService.syncLocalDataToCloud();
  });

  syncService.subscribeToRemoteChanges((payload) => {
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab && (activeTab.id === 'tab-inventory' || activeTab.id === 'tab-balance')) {
      const currentModule = modules.find(mod => mod.btn === activeTab);
      if (currentModule && typeof currentModule.view._loadVariantsList === 'function') {
        currentModule.view._loadVariantsList(viewContainer);
      }
    }
  });

  // Notificaciones de hardware nativas
  const notificationService = new NotificationService();
  notificationService.init();
});