/** Minimal RFC4180-style CSV parser for import wizard rows. */
export function parseCsvText(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
      row.push(field);
      field = "";
      if (row.some((c) => c.trim().length > 0)) rows.push(row);
      row = [];
      if (ch === "\r") i += 1;
    } else if (ch !== "\r") {
      field += ch;
    }
  }
  row.push(field);
  if (row.some((c) => c.trim().length > 0)) rows.push(row);
  return rows;
}

export function rowsToObjects(rows: string[][], columnMap: Record<string, string>): Record<string, string>[] {
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim());
  const out: Record<string, string>[] = [];
  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i];
    const obj: Record<string, string> = { __rowNumber: String(i + 1) };
    for (const [field, headerName] of Object.entries(columnMap)) {
      if (!headerName) continue;
      const idx = header.findIndex((h) => h.toLowerCase() === headerName.toLowerCase());
      obj[field] = idx >= 0 ? (cols[idx] ?? "").trim() : "";
    }
    out.push(obj);
  }
  return out;
}
