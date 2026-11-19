export interface PdfExportOptions {
  container: HTMLElement;
  fileName?: string;
  onProgress?: (current: number, total: number) => void;
}

/**
 * Exports all `.a4-sheet` elements inside `container` into a crisp 7-page A4 PDF.
 * Dynamically imports browser-only libraries so Next.js SSR stays clean and fast.
 */
export async function exportOfficialFormPdf({
  container,
  fileName = 'UDYOG-Application-Form.pdf',
  onProgress,
}: PdfExportOptions): Promise<void> {
  if (typeof window === 'undefined') return;

  const [{ toPng }, { jsPDF }] = await Promise.all([
    import('html-to-image'),
    import('jspdf'),
  ]);

  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const sheets = Array.from(container.querySelectorAll<HTMLElement>('.a4-sheet'));
  if (sheets.length === 0) {
    throw new Error('প্রিভিউ পাতা পাওয়া যায়নি।');
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidthMm = 210;
  const pageHeightMm = 297;

  const previousZoom = container.style.getPropertyValue('--preview-zoom');
  container.style.setProperty('--preview-zoom', '1');

  try {
    for (let i = 0; i < sheets.length; i += 1) {
      const sheet = sheets[i];
      onProgress?.(i + 1, sheets.length);

      const dataUrl = await toPng(sheet, {
        cacheBust: true,
        pixelRatio: 2.2,
        backgroundColor: '#ffffff',
        width: sheet.offsetWidth,
        height: sheet.offsetHeight,
        style: {
          zoom: '1',
          transform: 'none',
          margin: '0',
          boxShadow: 'none',
        },
      });

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidthMm, pageHeightMm, undefined, 'FAST');
    }

    pdf.save(fileName);
  } finally {
    if (previousZoom) {
      container.style.setProperty('--preview-zoom', previousZoom);
    } else {
      container.style.removeProperty('--preview-zoom');
    }
  }
}
