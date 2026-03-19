import { clsx, type ClassValue } from "clsx";
import { jsPDF } from "jspdf";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type DownloadPdfOptions = {
  content: string;
  fileName?: string;
  title: string;
};

export function downloadTextAsPdf({ content, fileName = "nexis-estrategia.pdf", title }: DownloadPdfOptions) {
  const doc = new jsPDF({ format: "a4", unit: "pt" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = 18;
  let cursorY = margin;

  const addPageIfNeeded = (extraSpace = 0) => {
    if (cursorY + extraSpace <= pageHeight - margin) return;
    doc.addPage();
    cursorY = margin;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  const titleLines = doc.splitTextToSize(title, maxWidth);
  titleLines.forEach((line: string) => {
    addPageIfNeeded(lineHeight);
    doc.text(line, margin, cursorY);
    cursorY += lineHeight;
  });

  cursorY += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(110, 118, 136);
  doc.text(`Gerado pelo Nexis em ${new Date().toLocaleString("pt-BR")}`, margin, cursorY);

  cursorY += 28;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);

  const paragraphs = content
    .replace(/\r/g, "")
    .split("\n")
    .map((paragraph) => paragraph.trim());

  paragraphs.forEach((paragraph) => {
    const safeParagraph = paragraph.length > 0 ? paragraph : " ";
    const lines = doc.splitTextToSize(safeParagraph, maxWidth);
    lines.forEach((line: string) => {
      addPageIfNeeded(lineHeight);
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    });
    cursorY += 8;
  });

  doc.save(fileName.replace(/[^a-z0-9\-_.]/gi, "-").toLowerCase());
}

