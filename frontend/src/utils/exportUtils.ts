// src/utils/exportUtils.ts

export interface ExportRow {
  category: string;
  metric: string;
  value: number | string;
}

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

/** CSV export — pure JS, no dependency. */
export const exportToCSV = async (
  filename: string,
  rows: ExportRow[],
): Promise<void> => {
  const header = ['Category', 'Metric', 'Value'];

  const escape = (v: unknown): string => {
    const s = String(v ?? '');
    // Quote if it contains a comma, quote, newline, or leading/trailing space.
    if (/[",\n\r]/.test(s) || s !== s.trim()) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = [
    header.join(','),
    ...rows.map((r) => [r.category, r.metric, r.value].map(escape).join(',')),
  ];

  // Prepend BOM so Excel opens UTF-8 correctly.
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], {
    type: 'text/csv;charset=utf-8;',
  });

  downloadBlob(blob, `${filename}.csv`);
};

/** Excel (.xlsx) export via SheetJS. */
export const exportToExcel = async (
  filename: string,
  rows: ExportRow[],
  sheetName = 'Overview',
): Promise<void> => {
  const XLSX = await import('xlsx');

  const data = rows.map((r) => ({
    Category: r.category,
    Metric: r.metric,
    Value: r.value,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [{ wch: 24 }, { wch: 34 }, { wch: 14 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  downloadBlob(blob, `${filename}.xlsx`);
};

/** PDF export via jsPDF + autotable. */
export const exportToPDF = async (
  filename: string,
  rows: ExportRow[],
  options?: { title?: string; subtitle?: string },
): Promise<void> => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const title = options?.title ?? 'Report';
  const subtitle = options?.subtitle;

  // Header
  doc.setFontSize(18);
  doc.setTextColor(17, 24, 39);
  doc.text(title, 40, 50);

  if (subtitle) {
    doc.setFontSize(11);
    doc.setTextColor(107, 114, 128);
    doc.text(subtitle, 40, 70);
  }

  // Table
  autoTable(doc, {
    startY: subtitle ? 90 : 75,
    head: [['Category', 'Metric', 'Value']],
    body: rows.map((r) => [r.category, r.metric, String(r.value)]),
    styles: { fontSize: 10, cellPadding: 6, textColor: [31, 41, 55] },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: {
      0: { cellWidth: 130 },
      1: { cellWidth: 260 },
      2: { cellWidth: 90, halign: 'right' },
    },
    margin: { left: 40, right: 40 },
  });

  // Footer with page numbers
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 40, pageHeight - 20, {
      align: 'right',
    });
  }

  doc.save(`${filename}.pdf`);
};


// ─────────────────────────────────────────────────────────────
// DETAILED PDF (document-style export)
// ─────────────────────────────────────────────────────────────

export interface ExportSectionField {
  label: string;
  value: string | number | null | undefined;
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
  /** Optional pretty-printed JSON blocks (old/new value, payload, etc.). */
  jsonBlocks?: ExportSectionJsonBlock[];
}

/**
 * Renders a report-style PDF where each section is a "card" of
 * label/value pairs, optionally followed by formatted JSON blocks.
 *
 * Best suited for content that doesn't fit neatly into a spreadsheet —
 * audit logs, moderation records, incident reports.
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
    // Estimate height: heading + subheading + fields + separator.
    // If we can't fit the header block, start a new page.
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

    // Fields table
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

      cursorY = (doc as any).lastAutoTable.finalY + 8;
    }

    // JSON blocks
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

        // Draw in chunks so we can paginate.
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

    // Separator
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