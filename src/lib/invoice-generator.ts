import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, differenceInDays } from "date-fns";
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
  transportCharges: number;
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
  
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Company Logo/Name (Left)
  doc.setFillColor(0, 0, 0);
  doc.rect(15, 15, 15, 15, "F");
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("S. S. KHORJUWEKAR", 35, 20);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("At. Post Majgaon - 416 541", 35, 25);
  doc.text("Tal. Sawantwadi, Dist. Sindhudurg", 35, 29);
  doc.text("Site Address: Dodamarg, Dodamarg", 35, 33);
  doc.text("Cell - 9422055041 / 9422076645", 35, 37);
  
  // INVOICE Title (Right)
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - 15, 28, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`DATE: ${format(new Date(data.invoiceDate), "dd.MM.yyyy")}`, pageWidth - 15, 35, { align: "right" });
  
  // Gray Box for Invoice To and Ship To
  doc.setFillColor(245, 245, 245);
  doc.rect(15, 45, pageWidth - 30, 50, "F");
  
  // Invoice To (Left)
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text("INVOICE TO", 20, 52);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(data.customer.name.toUpperCase(), 20, 60);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  
  let leftY = 67;
  if (data.customer.address) {
    const addressLines = doc.splitTextToSize(data.customer.address, 75);
    doc.text(addressLines, 20, leftY);
    leftY += addressLines.length * 5;
  }
  if (data.customer.contactNo) {
    doc.text(data.customer.contactNo, 20, leftY + 3);
  }
  
  // Ship To (Right)
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  doc.text("SHIP TO", pageWidth / 2 + 5, 52);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(data.site.siteName.toUpperCase(), pageWidth / 2 + 5, 60);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  
  let rightY = 67;
  const locationLines = doc.splitTextToSize(data.site.location, 75);
  doc.text(locationLines, pageWidth / 2 + 5, rightY);
  rightY += locationLines.length * 5;
  
  if (data.site.vehicleNo) {
    doc.text(`Vehicle: ${data.site.vehicleNo}`, pageWidth / 2 + 5, rightY + 3);
    rightY += 5;
  }
  if (data.site.challanNo) {
    doc.text(`Challan: ${data.site.challanNo}`, pageWidth / 2 + 5, rightY + 3);
  }
  
  // Date and Invoice Number
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`DATE: ${format(new Date(data.site.issueDate), "dd MMMM yyyy")}`, 15, 105);
  doc.text(`INVOICE NO: ${data.invoiceNumber}`, pageWidth - 15, 105, { align: "right" });
  
  // Items Table
  const tableData: any[] = [];
  let itemNo = 1;
  
  // Calculate days - use grace period end date if available, otherwise use today
  const endDate = data.site.gracePeriodEndDate ? new Date(data.site.gracePeriodEndDate) : new Date();
  const issueDate = new Date(data.site.issueDate);
  const daysElapsed = Math.max(1, differenceInDays(endDate, issueDate) + 1);
  
  // Add material items - use the actual rent amount from data, not recalculated
  data.materialBreakdown.forEach((item) => {
    // Check if this is first issue and has grace period
    const isFirstIssue = true; // All materials in invoice are from first issue
    const useMonthlyRate = isFirstIssue && item.materialType.gracePeriodDays > 0;
    
    // Calculate per-item rent
    let itemRent: number;
    let description: string;
    
    if (useMonthlyRate) {
      // Use monthly rate for materials with grace period
      itemRent = item.initialQuantity * item.materialType.monthlyRate;
      description = `${item.materialType.name} ${item.materialType.size}\n(Monthly rate)`;
    } else {
      // Use day calculation for plates (0 grace period)
      itemRent = item.initialQuantity * item.materialType.rentPerDay * daysElapsed;
      description = `${item.materialType.name} ${item.materialType.size}\n(${daysElapsed} days rental)`;
    }
    
    tableData.push([
      itemNo++,
      description,
      useMonthlyRate ? `Rs.${item.materialType.monthlyRate.toFixed(2)}/mo` : `Rs.${item.materialType.rentPerDay.toFixed(2)}/day`,
      item.initialQuantity,
      `Rs.${itemRent.toFixed(2)}`
    ]);
  });
  
  // Add loading charges
  if (data.issueLoadingCharges > 0) {
    tableData.push([
      itemNo++,
      "Issue Loading & Unloading Charges",
      "-",
      "-",
      `Rs.${data.issueLoadingCharges.toFixed(2)}`
    ]);
  }
  
  if (data.returnLoadingCharges > 0) {
    tableData.push([
      itemNo++,
      "Return Loading & Unloading Charges",
      "-",
      "-",
      `Rs.${data.returnLoadingCharges.toFixed(2)}`
    ]);
  }
  
  // Transport charges
  if (data.transportCharges > 0) {
    tableData.push([
      itemNo++,
      "Transportation Charges",
      "-",
      "-",
      `Rs.${data.transportCharges.toFixed(2)}`
    ]);
  }
  
  // Daily penalty after grace period
  if (data.penaltyAmount > 0) {
    tableData.push([
      itemNo++,
      `Additional Rent (${data.daysOverdue} days after grace period)`,
      "-",
      "-",
      `Rs.${data.penaltyAmount.toFixed(2)}`
    ]);
  }
  
  // Lost items penalty only (no late penalties)
  if (data.lostItemsPenalty > 0) {
    tableData.push([
      itemNo++,
      "Lost/Damaged Items Penalty",
      "-",
      "-",
      `Rs.${data.lostItemsPenalty.toFixed(2)}`
    ]);
  }
  
  // Calculate subtotal (includes penalties)
  const subtotal = data.rentAmount + data.issueLoadingCharges + data.returnLoadingCharges + 
                   data.transportCharges + data.penaltyAmount + data.lostItemsPenalty;
  
  autoTable(doc, {
    startY: 115,
    head: [["NO", "ITEM DESCRIPTION", "PRICE", "QUANTITY", "TOTAL"]],
    body: tableData,
    theme: "plain",
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      fontSize: 9,
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 5,
      textColor: [60, 60, 60],
    },
    columnStyles: {
      0: { cellWidth: 15, halign: "center" },
      1: { cellWidth: 80 },
      2: { cellWidth: 30, halign: "right" },
      3: { cellWidth: 25, halign: "center" },
      4: { cellWidth: 35, halign: "right" },
    },
    didDrawPage: (data) => {
      // Draw line under header
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(15, data.cursor!.y - 5, pageWidth - 15, data.cursor!.y - 5);
    },
  });
  
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Subtotal, Tax, Grand Total
  doc.setDrawColor(200, 200, 200);
  doc.line(15, finalY, pageWidth - 15, finalY);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("SUBTOTAL:", pageWidth - 80, finalY + 8);
  doc.text(`Rs.${subtotal.toFixed(2)}`, pageWidth - 15, finalY + 8, { align: "right" });
  
  // Payments
  const payments = data.site.history.filter(h => h.action === "Payment" && h.amount);
  let paymentsY = finalY + 15;
  
  if (payments.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENTS:", pageWidth - 80, paymentsY);
    paymentsY += 7;
    
    doc.setFont("helvetica", "normal");
    payments.forEach((payment) => {
      const paymentDate = format(new Date(payment.date), "dd MMM yyyy");
      doc.text(`${paymentDate}:`, pageWidth - 80, paymentsY);
      doc.text(`-Rs.${payment.amount?.toFixed(2)}`, pageWidth - 15, paymentsY, { align: "right" });
      paymentsY += 6;
    });
    paymentsY += 3;
  }
  
  doc.setDrawColor(200, 200, 200);
  doc.line(15, paymentsY, pageWidth - 15, paymentsY);
  
  // Grand Total
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("GRAND TOTAL:", pageWidth - 80, paymentsY + 8);
  doc.text(`Rs.${data.remainingDue.toFixed(2)}`, pageWidth - 15, paymentsY + 8, { align: "right" });
  
  // Total Due (Large) - Left aligned with more space
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("TOTAL DUE", 15, paymentsY + 20);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text(`Rs.${data.remainingDue.toLocaleString("en-IN")}`, 15, paymentsY + 35);
  
  // Bottom section - 3 columns with proper spacing
  const bottomY = paymentsY + 55;
  
  // Left Column - Customer Signature
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("CUSTOMER SIGNATURE", 15, bottomY);
  
  // Draw signature line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(15, bottomY + 20, 65, bottomY + 20);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(data.customer.name, 15, bottomY + 25);
  
  // Middle Column - Terms & Condition
  const middleX = 80;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Terms & Condition", middleX, bottomY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  
  if (data.site.gracePeriodEndDate) {
    const endDate = format(new Date(data.site.gracePeriodEndDate), "dd MMM yyyy");
    doc.text(`Grace period ends: ${endDate}`, middleX, bottomY + 7);
  } else {
    const gracePeriod = data.materialBreakdown[0]?.materialType.gracePeriodDays || 30;
    doc.text(`Grace period: ${gracePeriod} days from issue date.`, middleX, bottomY + 7);
  }
  
  doc.text("After grace period, rent continues daily.", middleX, bottomY + 13);
  doc.text("Lost/damaged items will be charged", middleX, bottomY + 19);
  doc.text("as per material rates.", middleX, bottomY + 24);
  
  // Right Column - Owner Signature
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("OWNER SIGNATURE", pageWidth - 15, bottomY, { align: "right" });
  
  // Draw signature line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(pageWidth - 65, bottomY + 20, pageWidth - 15, bottomY + 20);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("S. S. KHORJUWEKAR", pageWidth - 15, bottomY + 25, { align: "right" });
  
  // Footer - Questions section
  const footerY = bottomY + 35;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Questions?", 15, footerY);
  doc.setFontSize(7);
  doc.text("Email us at info@sskhorjuwekar.com", 15, footerY + 5);
  doc.text("or call us at 9422055041 / 9422076645", 15, footerY + 10);
  
  // Bottom footer - Company address
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("At. Post Majgaon - 416 541, Tal. Sawantwadi, Dist. Sindhudurg", 15, pageHeight - 8);
  
  // Save PDF
  const fileName = `Invoice_${data.invoiceNumber}_${data.customer.name.replace(/\s+/g, "_")}.pdf`;
  doc.save(fileName);
}

export function generateInvoiceNumber(): string {
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `F${random}A`;
}
