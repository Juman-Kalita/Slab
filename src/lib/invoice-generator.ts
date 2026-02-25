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
  
  // Company Header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("MATERIAL RENTAL PRO", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Construction Material Rental Services", 105, 28, { align: "center" });
  
  // Invoice Details Box
  doc.setDrawColor(200);
  doc.setFillColor(245, 245, 245);
  doc.rect(140, 40, 60, 25, "FD");
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice No:", 142, 46);
  doc.text("Invoice Date:", 142, 52);
  doc.text("Issue Date:", 142, 58);
  
  doc.setFont("helvetica", "normal");
  doc.text(data.invoiceNumber, 170, 46);
  doc.text(format(new Date(data.invoiceDate), "dd MMM yyyy"), 170, 52);
  doc.text(format(new Date(data.site.issueDate), "dd MMM yyyy"), 170, 58);
  
  // Customer Details
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 15, 46);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(data.customer.name, 15, 52);
  if (data.customer.contactNo) {
    doc.text(`Contact: ${data.customer.contactNo}`, 15, 58);
  }
  
  // Site Details
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Site:", 15, 64);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.site.siteName}, ${data.site.location}`, 15, 69);
  
  // Shipping Details (if available)
  let yPos = 73;
  if (data.site.vehicleNo || data.site.challanNo) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Shipping:", 15, yPos);
    doc.setFont("helvetica", "normal");
    const shippingInfo = [];
    if (data.site.vehicleNo) shippingInfo.push(`Vehicle: ${data.site.vehicleNo}`);
    if (data.site.challanNo) shippingInfo.push(`Challan: ${data.site.challanNo}`);
    doc.text(shippingInfo.join(" | "), 15, yPos + 4);
    yPos += 8;
  }
  
  // Status Badge
  if (data.isWithinGracePeriod) {
    doc.setFillColor(34, 197, 94);
    doc.roundedRect(15, yPos, 45, 6, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text("Within Grace Period", 17, yPos + 4);
  } else {
    doc.setFillColor(239, 68, 68);
    doc.roundedRect(15, yPos, 45, 6, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`Overdue by ${data.daysOverdue} days`, 17, yPos + 4);
  }
  doc.setTextColor(0, 0, 0);
  
  // Grace Period Note
  yPos += 8;
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(`Note: All materials at this site follow the original issue date (${format(new Date(data.site.issueDate), "dd MMM yyyy")})`, 15, yPos);
  doc.setTextColor(0, 0, 0);
  
  // Materials Details Table
  const materialRows = data.materialBreakdown.map(item => [
    `${item.materialType.name} ${item.materialType.size}`,
    item.initialQuantity.toString(),
    item.quantity.toString(),
    `₹${item.materialType.rentPerDay}`,
  ]);
  
  autoTable(doc, {
    startY: yPos + 10,
    head: [["Material", "Issued", "Held", "Rate/Day"]],
    body: materialRows,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: "center", cellWidth: 30 },
      2: { halign: "center", cellWidth: 30 },
      3: { halign: "right", cellWidth: 40 },
    },
  });
  
  let currentY = (doc as any).lastAutoTable.finalY + 10;
  
  // Financial Breakdown
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Financial Breakdown", 15, currentY);
  currentY += 8;
  
  const breakdown = [
    ["Rent Amount (Based on Grace Period)", `₹${data.rentAmount.toLocaleString("en-IN")}`],
    ["Issue Loading & Unloading Charges", `₹${data.issueLoadingCharges.toLocaleString("en-IN")}`],
  ];
  
  if (data.penaltyAmount > 0) {
    breakdown.push([`Late Penalty (${data.daysOverdue} days overdue)`, `₹${data.penaltyAmount.toLocaleString("en-IN")}`]);
  }
  
  breakdown.push(["Subtotal", `₹${(data.rentAmount + data.issueLoadingCharges + data.penaltyAmount).toLocaleString("en-IN")}`]);
  breakdown.push(["Less: Amount Paid", `-₹${data.site.amountPaid.toLocaleString("en-IN")}`]);
  breakdown.push(["Balance from Grace Period", `₹${Math.max(0, data.rentAmount + data.issueLoadingCharges + data.penaltyAmount - data.site.amountPaid).toLocaleString("en-IN")}`]);
  
  if (data.returnLoadingCharges > 0 || data.lostItemsPenalty > 0) {
    breakdown.push(["", ""]);
    breakdown.push(["Additional Charges:", ""]);
    
    if (data.returnLoadingCharges > 0) {
      breakdown.push(["Return Loading & Unloading Charges", `₹${data.returnLoadingCharges.toLocaleString("en-IN")}`]);
    }
    
    if (data.lostItemsPenalty > 0) {
      breakdown.push(["Lost/Damaged Items Penalty", `₹${data.lostItemsPenalty.toLocaleString("en-IN")}`]);
    }
  }
  
  autoTable(doc, {
    startY: currentY,
    body: breakdown,
    theme: "plain",
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 120, fontStyle: "normal" },
      1: { halign: "right", cellWidth: 60, fontStyle: "bold" },
    },
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 10;
  
  // Total Amount Box
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(1);
  doc.setFillColor(41, 128, 185);
  doc.rect(120, currentY, 75, 12, "FD");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL AMOUNT DUE:", 125, currentY + 8);
  doc.text(`₹${data.remainingDue.toLocaleString("en-IN")}`, 190, currentY + 8, { align: "right" });
  
  doc.setTextColor(0, 0, 0);
  currentY += 20;
  
  // Payment Methods Used
  const paymentMethods = data.site.history
    .filter((h) => h.action === "Payment" && h.paymentMethod)
    .map((h) => h.paymentMethod);
  
  if (paymentMethods.length > 0) {
    const uniqueMethods = Array.from(new Set(paymentMethods));
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Methods Used:", 15, currentY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(uniqueMethods.join(", "), 15, currentY + 5);
    currentY += 12;
  }
  
  // Items Summary
  const totalIssued = data.site.history
    .filter((h) => h.action === "Issued")
    .reduce((sum, h) => sum + (h.quantity || 0), 0);
  
  const totalReturned = data.site.history
    .filter((h) => h.action === "Returned")
    .reduce((sum, h) => sum + (h.quantity || 0), 0);
  
  const currentlyHeld = data.site.materials
    .filter((m) => m.quantity > 0)
    .reduce((sum, m) => sum + m.quantity, 0);
  
  autoTable(doc, {
    startY: currentY,
    head: [["Item Status", "Quantity"]],
    body: [
      ["Total Items Issued", totalIssued.toString()],
      ["Items Returned", totalReturned.toString()],
      ["Items Currently Held", currentlyHeld.toString()],
    ],
    theme: "striped",
    headStyles: { fillColor: [52, 73, 94], textColor: 255 },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { halign: "center", cellWidth: 80 },
    },
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 10;
  
  // Terms & Conditions
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Terms & Conditions:", 15, currentY);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const terms = [
    "• Grace period is based on the ORIGINAL site issue date, not individual materials",
    "• Materials added later follow the same grace period as the original site",
    "• Late payment penalty: ₹10 per item per day after grace period expires",
    "• Returns before full payment do not reduce the amount owed for the grace period",
    "• Lost items are charged at the penalty rate specified per material type",
    "• Loading/Unloading charges apply unless customer provides own labor",
    "• Custom loading charges may apply based on distance and circumstances",
  ];
  
  terms.forEach((term, index) => {
    doc.text(term, 15, currentY + 6 + (index * 4.5));
  });
  
  // Footer
  doc.setDrawColor(200);
  doc.line(15, 280, 195, 280);
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text("Thank you for your business!", 105, 285, { align: "center" });
  doc.text(`Generated on ${format(new Date(), "dd MMM yyyy, hh:mm a")}`, 105, 290, { align: "center" });
  
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
