// src/utils/exportUtils.ts

// ─────────────────────────────────────────────────────────────
// SHARED TYPES
// ─────────────────────────────────────────────────────────────

export type ExportCell = string | number | null | undefined;

export interface ExportColumn {
  /** Key into each row object. */
  key: string;
  /** Header text shown in the output. */
  header: string;
  /** Optional: right-align (useful for numbers). */
  align?: 'left' | 'right';
  /**
   * Relative column width. Widths are normalized across the table,
   * so values don't need to sum to any particular number — just be
   * proportional (e.g. 30, 20, 10 → 50% / 33% / 17%).
   *
   * Used as a hint for the Excel column width too (in characters).
   */
  width?: number;
  /**
   * PDF table only: truncate any cell value longer than this many
   * characters, appending "…". Ignored by CSV/Excel (they keep the
   * full value).
   */
  maxChars?: number;
}

export type ExportRow = Record<string, ExportCell>;

// ─────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────

/** Trigger a browser download for a Blob. */
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ─────────────────────────────────────────────────────────────
// CSV EXPORT (no dependencies)
// ─────────────────────────────────────────────────────────────

export const exportToCSV = async (
  filename: string,
  columns: ExportColumn[],
  rows: ExportRow[],
): Promise<void> => {
  const escape = (v: unknown): string => {
    const s = String(v ?? '');
    // Quote if it contains a comma, quote, newline, or leading/trailing space.
    if (/[",\n\r]/.test(s) || s !== s.trim()) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = [
    columns.map((c) => escape(c.header)).join(','),
    ...rows.map((row) => columns.map((c) => escape(row[c.key])).join(',')),
  ];

  // Prepend BOM so Excel opens UTF-8 correctly.
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], {
    type: 'text/csv;charset=utf-8;',
  });

  downloadBlob(blob, `${filename}.csv`);
};

// ─────────────────────────────────────────────────────────────
// EXCEL EXPORT (SheetJS)
// ─────────────────────────────────────────────────────────────

export const exportToExcel = async (
  filename: string,
  columns: ExportColumn[],
  rows: ExportRow[],
  sheetName = 'Sheet1',
): Promise<void> => {
  const XLSX = await import('xlsx');

  const data = rows.map((row) => {
    const out: Record<string, ExportCell> = {};
    columns.forEach((c) => {
      out[c.header] = row[c.key];
    });
    return out;
  });

  const worksheet = XLSX.utils.json_to_sheet(data, {
    header: columns.map((c) => c.header),
  });
  worksheet['!cols'] = columns.map((c) => ({ wch: c.width ?? 20 }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  downloadBlob(blob, `${filename}.xlsx`);
};

// ─────────────────────────────────────────────────────────────
// TABLE PDF (jsPDF + autotable)
// ─────────────────────────────────────────────────────────────

export const exportToPDF = async (
  filename: string,
  columns: ExportColumn[],
  rows: ExportRow[],
  options?: {
    title?: string;
    subtitle?: string;
    /** 'landscape' (default — tables do better wide) or 'portrait'. */
    orientation?: 'portrait' | 'landscape';
    /** Override the auto font size (pt). */
    fontSize?: number;
  },
): Promise<void> => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const orientation = options?.orientation ?? 'landscape';
  const doc = new jsPDF({ orientation, unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const leftMargin = 28;
  const rightMargin = 28;
  const contentWidth = pageWidth - leftMargin - rightMargin;

  // ── Header ────────────────────────────────────────────────
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(options?.title ?? 'Report', leftMargin, 38);

  let startY = 52;

  if (options?.subtitle) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    const subLines = doc.splitTextToSize(options.subtitle, contentWidth);
    doc.text(subLines, leftMargin, 54);
    startY = 54 + subLines.length * 12 + 8;
  }

  // ── Column widths ─────────────────────────────────────────
  // If every column declares a width, distribute contentWidth
  // proportionally. Otherwise fall back to equal widths.
  const declared = columns.map((c) => c.width ?? null);
  const allDeclared = declared.every((w) => w !== null && w > 0);

  let colWidths: number[];
  if (allDeclared) {
    const total = declared.reduce<number>((sum, w) => sum + (w ?? 0), 0);
    colWidths = declared.map((w) => ((w ?? 0) / total) * contentWidth);
  } else {
    const equal = contentWidth / columns.length;
    colWidths = columns.map(() => equal);
  }

  const columnStyles: Record<
    number,
    { cellWidth: number; halign: 'left' | 'right' }
  > = {};
  columns.forEach((c, i) => {
    columnStyles[i] = {
      cellWidth: colWidths[i],
      halign: c.align ?? 'left',
    };
  });

  // Auto font size: shrink when there are many columns.
  const fontSize =
    options?.fontSize ??
    (columns.length > 8 ? 7 : columns.length > 6 ? 8 : 9);

  // ── Table ─────────────────────────────────────────────────
  autoTable(doc, {
    startY,
    head: [columns.map((c) => c.header)],
    body: rows.map((row) =>
      columns.map((c) => {
        const raw = row[c.key];
        if (raw === null || raw === undefined) return '';
        let s = String(raw);
        if (c.maxChars && s.length > c.maxChars) {
          s = s.slice(0, Math.max(1, c.maxChars - 1)).trimEnd() + '…';
        }
        return s;
      }),
    ),
    styles: {
      fontSize,
      cellPadding: { top: 5, bottom: 5, left: 6, right: 6 },
      textColor: [31, 41, 55],
      overflow: 'linebreak',
      valign: 'top',
      lineColor: [229, 231, 235],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: fontSize + 1,
      halign: 'left',
      valign: 'middle',
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles,
    margin: { left: leftMargin, right: rightMargin },
    tableWidth: contentWidth,
    didParseCell: (data) => {
      // Keep header alignment matching the column alignment.
      if (data.section === 'head') {
        const col = columns[data.column.index];
        data.cell.styles.halign = col.align ?? 'left';
      }
    },
  });

  // ── Footer with page numbers ─────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - rightMargin,
      pageHeight - 16,
      { align: 'right' },
    );
    doc.text(
      `${rows.length} row${rows.length === 1 ? '' : 's'}`,
      leftMargin,
      pageHeight - 16,
    );
  }

  doc.save(`${filename}.pdf`);
};

// ─────────────────────────────────────────────────────────────
// DETAILED (document-style) PDF
// ─────────────────────────────────────────────────────────────

export interface ExportSectionField {
  label: string;
  value: string | number | null | undefined;
}

export interface ExportSectionParagraph {
  label: string;
  /** Long, wrapped text. Newlines are preserved. */
  text: string;
}

export interface ExportSectionJsonBlock {
  label: string;
  value: unknown;
}

export interface ExportSection {
  /** Section title, e.g. "REMOVE_FEED · 3f4a2b1c". */
  heading: string;
  /** Small line under the heading, e.g. an ISO timestamp. */
  subheading?: string;
  /** Label/value pairs rendered as a 2-column table. */
  fields: ExportSectionField[];
  /** Wrapped text blocks (description, comment threads, etc.). */
  paragraphs?: ExportSectionParagraph[];
  /** Optional pretty-printed JSON blocks (old/new value, payloads). */
  jsonBlocks?: ExportSectionJsonBlock[];
}

/**
 * Renders a report-style PDF where each section is a "card" of
 * label/value pairs, optionally followed by text paragraphs and
 * formatted JSON blocks.
 *
 * Best suited for content that doesn't fit neatly into a spreadsheet —
 * audit logs, moderation records, single-entity full records.
 */
export const exportToDetailedPDF = async (
  filename: string,
  sections: ExportSection[],
  options?: {
    title?: string;
    subtitle?: string;
    /** Vertical spacing between sections (points). Default 24. */
    sectionGap?: number;
  },
): Promise<void> => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const leftMargin = 40;
  const rightMargin = 40;
  const contentWidth = pageWidth - leftMargin - rightMargin;
  const bottomLimit = pageHeight - 60;
  const sectionGap = options?.sectionGap ?? 24;

  // ── Cover header ──────────────────────────────────────────
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(options?.title ?? 'Report', leftMargin, 50);

  let cursorY = 72;

  if (options?.subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    const subLines = doc.splitTextToSize(options.subtitle, contentWidth);
    doc.text(subLines, leftMargin, cursorY);
    cursorY += subLines.length * 14;
  }

  // Thin rule under the header.
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.6);
  doc.line(leftMargin, cursorY + 4, pageWidth - rightMargin, cursorY + 4);
  cursorY += 22;

  // ── Sections ──────────────────────────────────────────────
  if (sections.length === 0) {
    doc.setFontSize(11);
    doc.setTextColor(120);
    doc.text('No entries to display.', leftMargin, cursorY + 10);
  }

  sections.forEach((section, index) => {
    // Start a new page if the section header won't fit.
    if (cursorY > bottomLimit - 80) {
      doc.addPage();
      cursorY = 50;
    }

    // Index label
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(148, 163, 184);
    doc.text(`#${String(index + 1).padStart(3, '0')}`, leftMargin, cursorY);
    cursorY += 14;

    // Section heading
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    const headingLines = doc.splitTextToSize(section.heading, contentWidth);
    doc.text(headingLines, leftMargin, cursorY);
    cursorY += headingLines.length * 15;

    // Subheading
    if (section.subheading) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      const subLines = doc.splitTextToSize(section.subheading, contentWidth);
      doc.text(subLines, leftMargin, cursorY);
      cursorY += subLines.length * 12;
    }

    cursorY += 6;

    // ── Fields table ────────────────────────────────────────
    if (section.fields.length > 0) {
      autoTable(doc, {
        startY: cursorY,
        body: section.fields.map((f) => [
          f.label,
          f.value === null || f.value === undefined || f.value === ''
            ? '—'
            : String(f.value),
        ]),
        theme: 'plain',
        styles: {
          fontSize: 9.5,
          cellPadding: { top: 4, bottom: 4, left: 0, right: 8 },
          textColor: [31, 41, 55],
          valign: 'top',
        },
        columnStyles: {
          0: {
            cellWidth: 130,
            fontStyle: 'bold',
            textColor: [107, 114, 128],
          },
          1: { cellWidth: 'auto' },
        },
        margin: { left: leftMargin, right: rightMargin },
        tableWidth: contentWidth,
      });

      const lastAutoTable = (
        doc as unknown as { lastAutoTable: { finalY: number } }
      ).lastAutoTable;
      cursorY = lastAutoTable.finalY + 8;
    }

    // ── Paragraphs ──────────────────────────────────────────
    if (section.paragraphs && section.paragraphs.length > 0) {
      section.paragraphs.forEach((para) => {
        if (!para.text) return;

        // Label
        if (cursorY > bottomLimit - 30) {
          doc.addPage();
          cursorY = 50;
        }
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(107, 114, 128);
        doc.text(para.label.toUpperCase(), leftMargin, cursorY);
        cursorY += 12;

        // Body — rendered in paginated chunks.
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(31, 41, 55);

        const lines = doc.splitTextToSize(para.text, contentWidth);
        const lineHeight = 12;

        let li = 0;
        while (li < lines.length) {
          const availableHeight = bottomLimit - cursorY;
          const linesThatFit = Math.max(
            1,
            Math.floor(availableHeight / lineHeight),
          );
          const chunk = lines.slice(li, li + linesThatFit);

          doc.text(chunk, leftMargin, cursorY);
          cursorY += chunk.length * lineHeight;
          li += linesThatFit;

          if (li < lines.length) {
            doc.addPage();
            cursorY = 50;
          }
        }

        cursorY += 8;
      });
    }

    // ── JSON blocks ─────────────────────────────────────────
    if (section.jsonBlocks && section.jsonBlocks.length > 0) {
      section.jsonBlocks.forEach((block) => {
        const hasValue = block.value !== null && block.value !== undefined;
        if (!hasValue) return;

        if (cursorY > bottomLimit - 40) {
          doc.addPage();
          cursorY = 50;
        }

        // Block label
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(107, 114, 128);
        doc.text(block.label.toUpperCase(), leftMargin, cursorY);
        cursorY += 12;

        // JSON body in a light grey box
        const json = (() => {
          try {
            return JSON.stringify(block.value, null, 2);
          } catch {
            return String(block.value);
          }
        })();

        doc.setFont('courier', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(55, 65, 81);

        const lines = doc.splitTextToSize(json, contentWidth - 16);
        const lineHeight = 10;
        const boxPadding = 8;

        let li = 0;
        while (li < lines.length) {
          const availableHeight = bottomLimit - cursorY - boxPadding * 2;
          const linesThatFit = Math.max(
            1,
            Math.floor(availableHeight / lineHeight),
          );
          const chunk = lines.slice(li, li + linesThatFit);
          const boxHeight = chunk.length * lineHeight + boxPadding * 2;

          doc.setFillColor(249, 250, 251);
          doc.setDrawColor(229, 231, 235);
          doc.roundedRect(
            leftMargin,
            cursorY,
            contentWidth,
            boxHeight,
            4,
            4,
            'FD',
          );

          doc.text(chunk, leftMargin + boxPadding, cursorY + boxPadding + 8);

          cursorY += boxHeight + 8;
          li += linesThatFit;

          if (li < lines.length) {
            doc.addPage();
            cursorY = 50;
          }
        }

        cursorY += 6;
      });
    }

    // ── Separator ───────────────────────────────────────────
    if (index < sections.length - 1) {
      if (cursorY < bottomLimit - 10) {
        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(0.4);
        doc.line(leftMargin, cursorY, pageWidth - rightMargin, cursorY);
      }
      cursorY += sectionGap;
    }
  });

  // ── Footer with page numbers ─────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - rightMargin,
      pageHeight - 20,
      { align: 'right' },
    );
    doc.text(
      `${sections.length} entr${sections.length === 1 ? 'y' : 'ies'}`,
      leftMargin,
      pageHeight - 20,
    );
  }

  doc.save(`${filename}.pdf`);
};