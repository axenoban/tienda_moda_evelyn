import { FinancialRepository } from '../repositories/FinancialRepository.js';
import { createClient } from '@supabase/supabase-js'; // Asumiendo Supabase Realtime

const supabaseUrl = 'https://tu-proyecto.supabase.co';
const supabaseKey = 'tu-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

export class CloudSyncService {
  constructor() {
    this.repository = new FinancialRepository();
  }

  // Ejecuta la sincronización en cascada de registros pendientes hacia la nube
  async syncLocalDataToCloud() {
    if (!navigator.onLine) return console.log("Dispositivo offline. Sincronización pospuesta.");

    try {
      const pendingRecords = await this.repository.getPendingSyncRecords();

      for (const item of pendingRecords) {
        const { key, record } = item;
        const tableName = key.startsWith('batch_') ? 'cutting_batches' : 'family_expenses';

        // Subida a la base de datos distribuida en la nube
        const { error } = await supabase
          .from(tableName)
          .upsert({
            id: record.id,
            data: record.metadata || record,
            metrics: record.results || null,
            created_at: record.createdAt
          });

        if (!error) {
          // Marcamos el registro como sincronizado localmente para evitar duplicidad
          record.synced = true;
          await this.repository.localDb.setItem(key, record);
        }
      }
      console.log("Sincronización multiusuario en tiempo real completada con éxito.");
    } catch (error) {
      console.error("Error durante la sincronización Cloud-First:", error.message);
    }
  }

  // Escucha cambios remotos en tiempo real provocados por el otro socio
  subscribeToRemoteChanges(onRemoteUpdate) {
    return supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        onRemoteUpdate(payload);
      })
      .subscribe();
  }
}