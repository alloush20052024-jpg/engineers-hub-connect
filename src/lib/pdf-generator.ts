import jsPDF from "jspdf";

export function generatePDF(text: string, filename: string) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Use built-in font (supports basic Latin). For Arabic, we'll do a workaround.
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = 7;
  let y = margin;

  // Split text into lines
  const lines = text.split("\n");

  for (const line of lines) {
    if (line.trim() === "") {
      y += lineHeight / 2;
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      continue;
    }

    // Wrap long lines
    const wrappedLines = doc.splitTextToSize(line, maxWidth);
    for (const wl of wrappedLines) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(wl, margin, y);
      y += lineHeight;
    }
  }

  doc.save(filename);
}
