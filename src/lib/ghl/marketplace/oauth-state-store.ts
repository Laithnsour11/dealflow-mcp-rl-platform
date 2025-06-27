/**
 * OAuth State Store - Manages OAuth state tokens for CSRF protection
 */

interface OAuthState {
  tenantId: string;
  createdAt: Date;
}

class OAuthStateStore {
  private states = new Map<string, OAuthState>();
  private readonly STATE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

  /**
   * Add a new state token
   */
  add(state: string, tenantId: string): void {
    this.states.set(state, {
      tenantId,
      createdAt: new Date()
    });
    
    // Clean up expired states
    this.cleanup();
  }

  /**
   * Verify and consume a state token
   */
  verify(state: string): { valid: boolean; tenantId?: string } {
    const stateData = this.states.get(state);
    
    if (!stateData) {
      return { valid: false };
    }

    // Check if expired
    const now = new Date();
    if (now.getTime() - stateData.createdAt.getTime() > this.STATE_EXPIRY_MS) {
      this.states.delete(state);
      return { valid: false };
    }

    // Valid state - consume it
    this.states.delete(state);
    return { valid: true, tenantId: stateData.tenantId };
  }

  /**
   * Clean up expired states
   */
  private cleanup(): void {
    const now = new Date();
    for (const [key, value] of this.states.entries()) {
      if (now.getTime() - value.createdAt.getTime() > this.STATE_EXPIRY_MS) {
        this.states.delete(key);
      }
    }
  }
}

// Singleton instance
export const oauthStateStore = new OAuthStateStore();