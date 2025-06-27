/**
 * Neon Database Manager
 * Wrapper around the direct database client for managing database operations
 */

import { getDirectDatabaseClient } from './direct-db-client';

class NeonDatabaseManager {
  private static instance: NeonDatabaseManager;

  private constructor() {}

  static getInstance(): NeonDatabaseManager {
    if (!NeonDatabaseManager.instance) {
      NeonDatabaseManager.instance = new NeonDatabaseManager();
    }
    return NeonDatabaseManager.instance;
  }

  getDatabase() {
    return getDirectDatabaseClient();
  }
}

export const neonDatabaseManager = NeonDatabaseManager.getInstance();