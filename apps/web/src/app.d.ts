declare global {
  namespace App {
    interface Error {
      /** The engine's own code, so a surface can translate rather than guess. */
      code?: string;
      messageKey?: string;
      params?: Record<string, string | number>;
    }
  }
}

export {};
