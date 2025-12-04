// src/utils/errors.ts
export function extractDbError(err: any) {
  if (!err) return { message: "Unknown error" };
  return {
    code: err.code ?? err.status ?? null,
    message: err.message ?? err.error_description ?? String(err),
    details: err.details ?? null,
    hint: err.hint ?? null,
  };
}
