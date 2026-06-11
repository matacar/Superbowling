"use client";

/**
 * Botón para exportar a CSV (abre en Excel). Recibe encabezados y filas ya
 * formateadas desde el servidor y arma el archivo en el navegador.
 */

function escape(value: string): string {
  const v = value ?? "";
  return /[",\n;]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export default function ExportCSV({
  headers,
  rows,
  filename,
}: {
  headers: string[];
  rows: string[][];
  filename: string;
}) {
  function download() {
    const lines = [headers, ...rows].map((cols) => cols.map(escape).join(";"));
    // BOM para que Excel reconozca acentos en UTF-8.
    const csv = "﻿" + lines.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={rows.length === 0}
      className="rounded-lg border border-line px-4 py-2 text-sm text-muted transition hover:border-accent hover:text-cream disabled:opacity-50"
    >
      Exportar CSV
    </button>
  );
}
