export const PACKAGE_PATTERN = /^[a-zA-Z_]\w*(\.[a-zA-Z_]\w*)*\.?$/;
export const MAX_PACKAGES = 20;
export const MIN_RETENTION = 1;
export const MAX_RETENTION = 3650;

export function validatePackage(value: string, current: readonly string[]): string | null {
  const name = value.trim();
  if (!PACKAGE_PATTERN.test(name)) {
    return 'Pacote Java inválido (ex.: com.empresa).';
  }
  if (current.includes(name)) {
    return 'Pacote já adicionado.';
  }
  return current.length >= MAX_PACKAGES ? `No máximo ${MAX_PACKAGES} pacotes.` : null;
}

export function validateRetention(days: number): string | null {
  return Number.isInteger(days) && days >= MIN_RETENTION && days <= MAX_RETENTION
    ? null
    : `Informe de ${MIN_RETENTION} a ${MAX_RETENTION} dias.`;
}
