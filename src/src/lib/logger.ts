// /src/lib/logger.ts
export const log = {
  info: (...args: any[]) => console.info("[APP]", ...args),
  warn: (...args: any[]) => console.warn("[APP]", ...args),
  error: (...args: any[]) => console.error("[APP]", ...args),
  debug: (...args: any[]) => console.debug("[APP]", ...args),
};
