export const HANDLE_PATTERN = /^[A-Za-z0-9_]{3,32}$/;

export function isValidHandle(value: string): boolean {
  return HANDLE_PATTERN.test(value.trim().replace(/^@+/, ""));
}

export function normalizeHandle(value: string): string {
  return `@${value.trim().replace(/^@+/, "").toLowerCase()}`;
}
