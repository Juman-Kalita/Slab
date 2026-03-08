import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import type { Customer, MaterialType, Site } from "./rental-store";

interface InvoiceData {
  customer: Customer;
  site: Site;
  invoiceNumber: string;
  invoiceDate: string;
  rentAmount: number;
  issueLoadingCharges: number;
  penaltyAmount: number;
  returnLoadingCharges: number;
  lostItemsPenalty: number;
  totalRequired: number;
  amountPaid: number;
  remainingDue: number;
  daysOverdue: number;
  isWithinGracePeriod: boolean;
  materialBreakdown: Array<{
    materialType: MaterialType;
    quantity: number;
    initialQuantity: number;
  }>;
}

export function generateInvoice(data: InvoiceData): void {
  const doc = new jsPDF();
  
  // Header Box with Company Info
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, 190, 35);
  
  // Customer Name
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Name of Customer:", 12, 18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(data.customer.name.toUpperCase(), 50, 18);
  
  // Company Info (Right Side)
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("S. S. KHORJUWEKAR", 140, 16);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("At. Post Majgaon - 416 541", 140, 21);
  doc.text("Tal. Sawantwadi, Dist. Sindhudurg", 140, 25);
  doc.text("Cell - 9422055041 / 9422076645", 140, 29);
  
  // Site Address
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Site Address:", 12, 28);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.site.siteName}, ${data.site.location}`, 35, 28);
  
  // Materials Summary
  const materialsOnHire = data.materialBreakdown
    .map(m => `${m.materialType.name}(${m.materialType.size}) ${m.initialQuantity} Nos`)
    .join(", ");
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("No. of Materials on Hire:", 12, 35);
  doc.setFont("helvetica", "bold");
  const splitMaterials = doc.splitTextToSize(materialsOnHire, 120);
  doc.text(splitMaterials, 55, 35);
  
  // Invoice Number and Date (Right Side)
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("No. :", 165, 35);
  doc.setFont("helvetica", "bold");
  doc.text(data.invoiceNumber.split("-").pop() || data.invoiceNumber, 175, 35);
  
  doc.setFont("helvetica", "normal");
  doc.text("Date :", 165, 41);
  doc.setFont("helvetica", "bold");
  doc.text(format(new Date(data.invoiceDate), "dd/MM/yy"), 175, 41);
  
  // Shipping Details (Vehicle & Challan)
  let yPos = 42;
  if (data.site.vehicleNo || data.site.challanNo) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    if (data.site.vehicleNo) {
      doc.text(`Vehicle No: ${data.site.vehicleNo}`, 12, yPos);
      yPos += 5;
    }
    if (data.site.challanNo) {
      doc.text(`Challan No: ${data.site.challanNo}`, 12, yPos);
      yPos += 5;
    }
  }
  
  // Main Table
  const tableStartY = 50;
  
  // Table Header
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.rect(10, tableStartY, 190, 10);
  doc.line(15, tableStartY, 15, tableStartY + 10);
  doc.line(140, tableStartY, 140, tableStartY + 10);
  doc.line(160, tableStartY, 160, tableStartY + 10);
  doc.line(180, tableStartY, 180, tableStartY + 10);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Sr.", 11, tableStartY + 6);
  doc.text("No.", 11, tableStartY + 9);
  doc.text("Description", 70, tableStartY + 7);
  doc.text("Qty.", 145, tableStartY + 6);
  doc.text("in Nos.", 143, tableStartY + 9);
  doc.text("Rate", 166, tableStartY + 7);
  doc.text("Amount", 185, tableStartY + 6);
  doc.text("Rs.     Ps.", 182, tableStartY + 9);
  
  // Table Content
  let contentY = tableStartY + 15;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  
  // Materials List
  data.materialBreakdown.forEach((item, index) => {
    if (index > 0) contentY += 5;
    doc.text(`${item.materialType.name} ${item.materialType.size}`, 17, contentY);
    contentY += 4;
  });
  
  contentY += 5;
  
  // Payment Details Section
  doc.setFont("helvetica", "bold");
  doc.text(`1. Payment of ${format(new Date(data.site.issueDate), "dd/MM/yy")} to ${format(new Date(), "dd/MM/yy")}`, 17, contentY);
  contentY += 5;
  
  // Calculate days
  const daysElapsed = Math.floor((new Date().getTime() - new Date(data.site.issueDate).getTime()) / (1000 * 60 * 60 * 24));
  
  doc.setFont("helvetica", "normal");
  doc.text(`(${daysElapsed} days) ×`, 17, contentY);
  
  // Show material breakdown with rates
  data.materialBreakdown.forEach((item) => {
    contentY += 5;
    doc.text(`(${item.materialType.size}) ${item.initialQuantity}`, 35, contentY);
    doc.text(`${item.materialType.rentPerDay.toFixed(2)}`, 145, contentY);
    const itemTotal = item.initialQuantity * item.materialType.rentPerDay * daysElapsed;
    doc.text(itemTotal.toFixed(2), 185, contentY, { align: "right" });
  });
  
  contentY += 10;
  
  // Loading Charges
  if (data.issueLoadingCharges > 0) {
    doc.text("2. Issue Loading & Unloading Charges", 17, contentY);
    contentY += 5;
    doc.text(data.issueLoadingCharges.toFixed(2), 185, contentY, { align: "right" });
    contentY += 8;
  }
  
  // Return Loading Charges
  if (data.returnLoadingCharges > 0) {
    doc.text("3. Return Loading & Unloading Charges", 17, contentY);
    contentY += 5;
    doc.text(data.returnLoadingCharges.toFixed(2), 185, contentY, { align: "right" });
    contentY += 8;
  }
  
  // Transport Charges
  const transportCharges = data.site.history
    .filter(h => h.action === "Returned" && h.transportCharges)
    .reduce((sum, h) => sum + (h.transportCharges || 0), 0);
  
  if (transportCharges > 0) {
    doc.text("4. Transportation Charges", 17, contentY);
    contentY += 5;
    doc.text(transportCharges.toFixed(2), 185, contentY, { align: "right" });
    contentY += 8;
  }
  
  // Late Penalty
  if (data.penaltyAmount > 0) {
    doc.text(`5. Late Penalty (${data.daysOverdue} days overdue)`, 17, contentY);
    contentY += 5;
    doc.text(data.penaltyAmount.toFixed(2), 185, contentY, { align: "right" });
    contentY += 8;
  }
  
  // Lost Items Penalty
  if (data.lostItemsPenalty > 0) {
    doc.text("6. Lost/Damaged Items Penalty", 17, contentY);
    contentY += 5;
    doc.text(data.lostItemsPenalty.toFixed(2), 185, contentY, { align: "right" });
    contentY += 8;
  }
  
  contentY += 5;
  
  // Payment History
  const payments = data.site.history.filter(h => h.action === "Payment" && h.amount);
  if (payments.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Payment History:", 17, contentY);
    contentY += 5;
    
    doc.setFont("helvetica", "normal");
    payments.forEach((payment, index) => {
      const paymentDate = format(new Date(payment.date), "dd/MM/yy");
      const paymentText = `Payment of ${paymentDate}`;
      doc.text(paymentText, 17, contentY);
      doc.text(`-${payment.amount?.toFixed(2)}`, 185, contentY, { align: "right" });
      
      if (payment.paymentMethod) {
        doc.setFontSize(7);
        doc.text(`(${payment.paymentMethod})`, 17, contentY + 3);
        doc.setFontSize(9);
      }
      contentY += 6;
    });
    contentY += 5;
  }
  
  // Previous Balance (if any previous invoices)
  const previousInvoices = data.site.history.filter(h => h.action === "Invoice");
  if (previousInvoices.length > 0) {
    doc.setFont("helvetica", "bold");
    const lastInvoice = previousInvoices[previousInvoices.length - 1];
    doc.text(`Last Balance (Bill No. ${lastInvoice.invoiceNumber || "N/A"})`, 17, contentY);
    contentY += 5;
    doc.setFont("helvetica", "normal");
    // This would need to be calculated from history
    contentY += 5;
  }
  
  // Current Balance
  contentY += 5;
  doc.setFont("helvetica", "bold");
  doc.text(`Current Balance (Bill No. ${data.invoiceNumber.split("-").pop()})`, 17, contentY);
  contentY += 5;
  
  // Highlight the final amount
  doc.setFillColor(255, 255, 0);
  doc.rect(165, contentY - 4, 30, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(data.remainingDue.toFixed(2), 185, contentY, { align: "right" });
  
  // Draw table border
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.rect(10, tableStartY, 190, contentY - tableStartY + 10);
  doc.line(15, tableStartY, 15, contentY + 10);
  doc.line(140, tableStartY, 140, contentY + 10);
  doc.line(160, tableStartY, 160, contentY + 10);
  doc.line(180, tableStartY, 180, contentY + 10);
  
  // Total line
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Total ....", 145, contentY + 8);
  doc.text(data.remainingDue.toFixed(2), 185, contentY + 8, { align: "right" });
  
  // Signature Section
  const signatureY = contentY + 20;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Customer Signature", 15, signatureY);
  doc.text("Owner Signature", 160, signatureY);
  
  // Footer with additional info
  const footerY = 270;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  
  // Contact info
  if (data.customer.contactNo) {
    doc.text(`Customer Contact: ${data.customer.contactNo}`, 15, footerY);
  }
  
  // Issue date
  doc.text(`Issue Date: ${format(new Date(data.site.issueDate), "dd MMM yyyy")}`, 15, footerY + 5);
  
  // Grace period info
  const gracePeriod = data.materialBreakdown[0]?.materialType.gracePeriodDays || 30;
  doc.text(`Grace Period: ${gracePeriod} days`, 15, footerY + 10);
  
  // Status
  if (data.isWithinGracePeriod) {
    doc.setTextColor(0, 150, 0);
    doc.text("Status: Within Grace Period", 15, footerY + 15);
  } else {
    doc.setTextColor(200, 0, 0);
    doc.text(`Status: Overdue by ${data.daysOverdue} days`, 15, footerY + 15);
  }
  
  doc.setTextColor(100);
  doc.text(`Generated: ${format(new Date(), "dd MMM yyyy, hh:mm a")}`, 105, footerY + 20, { align: "center" });
  
  // Save PDF
  const fileName = `Invoice_${data.invoiceNumber}_${data.customer.name.replace(/\s+/g, "_")}_${data.site.siteName.replace(/\s+/g, "_")}.pdf`;
  doc.save(fileName);
}

export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `INV-${year}${month}${day}-${random}`;
}
