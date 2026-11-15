/**
 * Utilitaire de génération et téléchargement de fichiers CSV encodés UTF-8 avec BOM
 * pour ouverture directe sans altération des accents dans Excel.
 */
function escapeCsvCell(value: string | number | boolean | null | undefined): string {
  const str = String(value ?? '');
  if (/[;"\n\r,]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number | boolean | null | undefined>>
): void {
  const headerLine = headers.map(escapeCsvCell).join(';');
  const bodyLines = rows.map(row => row.map(escapeCsvCell).join(';'));
  const csvContent = '\uFEFF' + [headerLine, ...bodyLines].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
