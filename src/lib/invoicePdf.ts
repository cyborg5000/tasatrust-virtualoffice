import type { InvoiceDetails } from "@/lib/billingInvoice";
import { formatCurrency, TASA_TRUST_INVOICE_ISSUER } from "@/lib/billingInvoice";

async function imageUrlToDataUrl(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Unable to load invoice logo.");
  }

  const blob = await response.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function formatInvoiceDate(date: Date | null) {
  if (!date) return "Not available";
  return new Intl.DateTimeFormat("en-SG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function statusLabel(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function downloadInvoicePdf(invoice: InvoiceDetails, logoUrl: string) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 48;
  const navy = "#15223B";
  const gold = "#C89D3C";
  const muted = "#5F6B7A";
  const border = "#DDE3EA";

  let logoDataUrl: string | null = null;
  try {
    logoDataUrl = await imageUrlToDataUrl(logoUrl);
  } catch (error) {
    console.warn("Invoice logo could not be embedded:", error);
  }

  pdf.setFillColor(navy);
  pdf.rect(0, 0, pageWidth, 118, "F");

  if (logoDataUrl) {
    pdf.addImage(logoDataUrl, "PNG", margin, 36, 118, 39);
  } else {
    pdf.setTextColor("#FFFFFF");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text(TASA_TRUST_INVOICE_ISSUER.displayName, margin, 58);
  }

  pdf.setTextColor("#FFFFFF");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(26);
  pdf.text("Invoice", pageWidth - margin, 56, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(invoice.invoiceNumber, pageWidth - margin, 76, { align: "right" });

  pdf.setDrawColor(gold);
  pdf.setLineWidth(2);
  pdf.line(margin, 118, pageWidth - margin, 118);

  let y = 154;

  pdf.setTextColor(navy);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("From", margin, y);
  pdf.text("Bill To", pageWidth / 2 + 20, y);

  y += 18;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text(TASA_TRUST_INVOICE_ISSUER.displayName, margin, y);
  pdf.text(invoice.billedTo.name, pageWidth / 2 + 20, y);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.setTextColor(muted);

  let issuerY = y + 15;
  pdf.text(TASA_TRUST_INVOICE_ISSUER.legalName, margin, issuerY);
  issuerY += 13;
  pdf.text(`UEN: ${TASA_TRUST_INVOICE_ISSUER.uen}`, margin, issuerY);
  for (const line of TASA_TRUST_INVOICE_ISSUER.address) {
    issuerY += 13;
    pdf.text(line, margin, issuerY);
  }
  issuerY += 13;
  pdf.text(TASA_TRUST_INVOICE_ISSUER.website, margin, issuerY);

  let billedY = y + 15;
  if (invoice.billedTo.contactName) {
    pdf.text(invoice.billedTo.contactName, pageWidth / 2 + 20, billedY);
    billedY += 13;
  }
  if (invoice.billedTo.email) {
    pdf.text(invoice.billedTo.email, pageWidth / 2 + 20, billedY);
    billedY += 13;
  }
  if (invoice.billedTo.phone) {
    pdf.text(invoice.billedTo.phone, pageWidth / 2 + 20, billedY);
  }

  y = 272;
  pdf.setDrawColor(border);
  pdf.setLineWidth(1);
  pdf.roundedRect(margin, y - 20, pageWidth - margin * 2, 74, 8, 8);

  pdf.setTextColor(muted);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("Issue Date", margin + 18, y);
  pdf.text("Status", margin + 190, y);
  pdf.text("Payment Reference", margin + 330, y);

  pdf.setTextColor(navy);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(formatInvoiceDate(invoice.issuedAt), margin + 18, y + 20);
  pdf.text(statusLabel(invoice.status), margin + 190, y + 20);
  pdf.text(invoice.paymentReference || "Not available", margin + 330, y + 20, {
    maxWidth: pageWidth - margin - (margin + 330),
  });

  y = 382;
  pdf.setFillColor("#F5F7FA");
  pdf.roundedRect(margin, y - 24, pageWidth - margin * 2, 36, 6, 6, "F");
  pdf.setTextColor(navy);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("Description", margin + 16, y);
  pdf.text("Billing", pageWidth - margin - 174, y);
  pdf.text("Amount", pageWidth - margin - 16, y, { align: "right" });

  y += 40;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  for (const item of invoice.lineItems) {
    const descriptionLines = pdf.splitTextToSize(item.description, 250);
    pdf.setTextColor(navy);
    pdf.text(descriptionLines, margin + 16, y);
    pdf.setTextColor(muted);
    pdf.text(item.periodLabel, pageWidth - margin - 174, y);
    pdf.setTextColor(navy);
    pdf.text(item.amountLabel, pageWidth - margin - 16, y, { align: "right" });
    y += Math.max(34, descriptionLines.length * 13 + 16);
  }

  pdf.setDrawColor(border);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 30;

  pdf.setTextColor(muted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text("Subtotal", pageWidth - margin - 170, y);
  pdf.text(formatCurrency(invoice.subtotal), pageWidth - margin - 16, y, { align: "right" });

  y += 24;
  pdf.setTextColor(navy);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("Total Paid", pageWidth - margin - 170, y);
  pdf.text(formatCurrency(invoice.totalPaid), pageWidth - margin - 16, y, { align: "right" });

  pdf.setTextColor(muted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.text(
    "This invoice records the payment line shown in your TASA Trust member billing history.",
    margin,
    790,
  );

  pdf.save(`${invoice.invoiceNumber}.pdf`);
}
