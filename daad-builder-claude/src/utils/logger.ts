/**
 * Development-only logger. Silenced in production builds.
 * Use instead of console.log for debug output.
 */
const isDev = import.meta.env?.DEV ?? true;

export const devLog = isDev
  ? (...args: unknown[]) => console.log(...args)
  : (..._args: unknown[]) => {};

export const devWarn = isDev
  ? (...args: unknown[]) => console.warn(...args)
  : (..._args: unknown[]) => {};

export const devError = (...args: unknown[]) => console.error(...args);
