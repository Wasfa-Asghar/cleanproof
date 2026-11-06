/** Prefix cells that could be interpreted as formulas in Excel/Sheets. */
export function sanitizeCsvCell(value: string) {
  if (/^[=+\-@\t\r]/.test(value)) return `'${value}`;
  return value;
}

export function escapeCsvField(value: string) {
  const sanitized = sanitizeCsvCell(value);
  if (/[",\n]/.test(sanitized)) return `"${sanitized.replace(/"/g, '""')}"`;
  return sanitized;
}

export function toCsvRow(fields: string[]) {
  return fields.map((f) => escapeCsvField(String(f ?? ""))).join(",");
}
