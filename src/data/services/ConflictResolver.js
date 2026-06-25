export class ConflictResolver {
  /**
   * Resuelve el estado de sincronización entre registros locales y de la nube.
   * Aplica la estrategia objetiva "Last-Write-Wins" basada en marcas de tiempo ISO de alta precisión.
   */
  resolve(localRecord, remoteRecord) {
    if (!remoteRecord) return localRecord; // No existe disputa remota
    if (!localRecord) return remoteRecord;  // No existe registro local

    const localTime = new Date(localRecord.updatedAt || localRecord.createdAt).getTime();
    const remoteTime = new Date(remoteRecord.updatedAt || remoteRecord.createdAt).getTime();

    // El registro con la modificación más reciente en campo tiene prioridad absoluta //
    if (localTime >= remoteTime) {
      return {
        ...localRecord,
        synced: false // Requiere actualizar la nube
      };
    } else {
      return {
        ...remoteRecord,
        synced: true // Consolidado con el estado del servidor
      };
    }
  }
}