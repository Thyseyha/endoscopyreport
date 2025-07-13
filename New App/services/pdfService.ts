

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportReportToPdf = async (reportElementIds: string[], patientName: string) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const usableWidth = pdfWidth - margin * 2;
  const usableHeight = pdfHeight - margin * 2;

  for (let i = 0; i < reportElementIds.length; i++) {
    const elementId = reportElementIds[i];
    const input = document.getElementById(elementId);
    if (!input) {
      console.error(`Element with id ${elementId} not found.`);
      continue;
    }

    if (i > 0) {
      pdf.addPage();
    }

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: input.offsetWidth,
      height: input.offsetHeight,
      windowWidth: input.scrollWidth,
      windowHeight: input.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;

    let finalImgWidth = usableWidth;
    let finalImgHeight = finalImgWidth / ratio;

    if (finalImgHeight > usableHeight) {
      finalImgHeight = usableHeight;
      finalImgWidth = finalImgHeight * ratio;
    }

    const x = margin + (usableWidth - finalImgWidth) / 2;
    const y = margin;

    pdf.addImage(imgData, 'PNG', x, y, finalImgWidth, finalImgHeight);
  }

  const fileName = `Report_${patientName.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};
