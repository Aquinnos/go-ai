export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    if (meta) {
      console.info(`[app] ${message}`, meta);
      return;
    }
    console.info(`[app] ${message}`);
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    if (meta) {
      console.warn(`[app] ${message}`, meta);
      return;
    }
    console.warn(`[app] ${message}`);
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    if (meta) {
      console.error(`[app] ${message}`, meta);
      return;
    }
    console.error(`[app] ${message}`);
  },
};
