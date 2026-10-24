// Unique names keep parallel runs from colliding and make cleanup targetable.
export function uniqueName(prefix: string): string {
  return `E2E ${prefix} ${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
