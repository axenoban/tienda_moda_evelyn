import localforage from 'localforage';

// Configuración de la base de datos local indexada
localforage.config({
  name: 'FinaPro_ModaEvelyn',
  version: 1.0,
  storeName: 'local_persistence',
  description: 'Almacenamiento primario offline para la gestión en ferias'
});

export class LocalDataSource {
  // Guarda cualquier estructura de datos bajo una clave única
  async setItem(key, value) {
    try {
      return await localforage.setItem(key, value);
    } catch (error) {
      throw new Error(`Error en persistencia local (Write) para ${key}: ${error.message}`);
    }
  }

  // Recupera los datos locales de forma inmediata
  async getItem(key) {
    try {
      return await localforage.getItem(key);
    } catch (error) {
      throw new Error(`Error en persistencia local (Read) para ${key}: ${error.message}`);
    }
  }

  // Obtiene todas las llaves para procesos de sincronización masiva
  async getAllKeys() {
    return await localforage.keys();
  }
}