import { PushNotifications } from '@capacitor/push-notifications';

export class NotificationService {
  async init() {
    try {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.warn("[FinaPro] Permiso para notificaciones push denegado por el usuario.");
        return;
      }

      await PushNotifications.register();
      this._setupListeners();
    } catch (error) {
      // Corregida la sintaxis que bloqueaba el árbol de análisis de Vite
      console.error("[FinaPro] Error al inicializar notificaciones de hardware:", error.message);
    }
  }

  _setupListeners() {
    PushNotifications.addListener('registration', (token) => {
      console.log('[FinaPro] Token de Hardware registrado con éxito:', token.value);
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('[FinaPro] Error en el registro de push de Capacitor:', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[FinaPro] Alerta recibida en tiempo real:', notification);
      this._triggerAlertUI(notification.title, notification.body);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('[FinaPro] El socio interactuó con la alerta:', action.notification);
    });
  }

  _triggerAlertUI(title, body) {
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    
    const banner = document.createElement('div');
    banner.style.cssText = `
      position: fixed; top: 70px; left: 16px; right: 16px;
      background: #e65100; color: white; padding: 14px;
      border-radius: 8px; z-index: 9999; font-weight: bold;
      box-shadow: 0 4px 10px rgba(0,0,0,0.5); border-left: 5px solid #ff9800;
    `;
    banner.innerHTML = `<div>⚠️ ${title}</div><div style="font-weight:normal;font-size:0.85rem;margin-top:4px;">${body}</div>`;
    document.body.appendChild(banner);
    
    setTimeout(() => banner.remove(), 6000);
  }
}