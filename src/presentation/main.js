import { CuttingBatchView } from './views/CuttingBatchView.js';
import { SalesView } from './views/SalesView.js';
import { FamilyExpensesView } from './views/FamilyExpensesView.js';
import { MonthlyBalanceView } from './views/MonthlyBalanceView.js';
import { LiquidationView } from './views/LiquidationView.js';
import { InventoryView } from './views/InventoryView.js';
import { SeasonalPredictionView } from './views/SeasonalPredictionView.js';
import { CloudSyncService } from '../data/services/CloudSyncService.js';
import { NotificationService } from '../data/services/NotificationService.js'; // Integración de alertas de hardware

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const syncService = new CloudSyncService(); // Instancia del motor de sincronización multiusuario
  
  // Barra de navegación superior fija
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
  body.insertBefore(navContainer, body.firstChild);

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
    targetView.render(viewContainer);
  }

  mod.btn.addEventListener('click', () => switchView(mod.btn, mod.view));
  modules.forEach(mod => {
    mod.btn.addEventListener('click', () => switchView(mod.btn, mod.view));
  });

  switchView(modules[0].btn, modules[0].view);

  // =========================================================================
  // AUTOMATIZACIÓN DEL EVENT LOOP DE SINCRONIZACIÓN (OFFLINE-FIRST)
  // =========================================================================
  
  // 1. Verificación inicial: Sincroniza al arrancar la app si ya cuenta con señal celular
  if (navigator.onLine) {
    syncService.syncLocalDataToCloud();
  }

  // 2. Escuchador de Red Activo: Detecta la transición de Offline a Online de forma nativa
  window.addEventListener('online', () => {
    // Alerta háptica sutil para indicar discretamente al socio que hay reconexión
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    console.log("[FinaPro] Conexión activa detectada. Iniciando vaciado de transacciones pendientes...");
    syncService.syncLocalDataToCloud(); // Ejecuta la hibridación transparente en la nube
  });

  // 3. Suscripción en Tiempo Real: Reacciona ante cambios remotos generados por el otro socio
  syncService.subscribeToRemoteChanges((payload) => {
    console.log("[FinaPro] Actualización remota sincronizada:", payload);
    
    // Si el usuario está visualizando el Inventario o el Balance, se puede forzar un refresco dinámico
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab && (activeTab.id === 'tab-inventory' || activeTab.id === 'tab-balance')) {
      const currentModule = modules.find(mod => mod.btn === activeTab);
      if (currentModule && typeof currentModule.view._loadVariantsList === 'function') {
        currentModule.view._loadVariantsList(viewContainer);
      }
    }
  });

  // =========================================================================
  // INITIALIZACIÓN DEL MÓDULO DE HARDWARE: NOTIFICACIONES PUSH
  // =========================================================================
  const notificationService = new NotificationService();
  notificationService.init();
});