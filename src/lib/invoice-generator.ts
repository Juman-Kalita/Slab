import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import type { Customer } from "./rental-store";

interface InvoiceData {
  customer: Customer;
  invoiceNumber: string;
  invoiceDate: string;
  baseAmount: number;
  penaltyAmount: number;
  totalRequired: number;
  amountPaid: number;
  remainingDue: number;
  daysOverdue: number;
  isWithinGracePeriod: boolean;
}

export function generateInvoice(data: InvoiceData): void {
  const doc = new jsPDF();
  
  // Company Header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("SLAB RENTAL INVOICE", 105, 20, { align: "center" });
  
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
  doc.text(format(new Date(data.customer.issueDate), "dd MMM yyyy"), 170, 58);
  
  // Customer Details
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 15, 46);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(data.customer.name, 15, 52);
  doc.text(`Customer ID: ${data.customer.id.substring(0, 8)}`, 15, 58);
  
  // Status Badge
  if (data.isWithinGracePeriod) {
    doc.setFillColor(34, 197, 94);
    doc.roundedRect(15, 62, 45, 6, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text("Within Grace Period", 17, 66);
  } else {
    doc.setFillColor(239, 68, 68);
    doc.roundedRect(15, 62, 45, 6, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`Overdue by ${data.daysOverdue} days`, 17, 66);
  }
  doc.setTextColor(0, 0, 0);
  
  // Slab Details Table
  autoTable(doc, {
    startY: 80,
    head: [["Description", "Quantity", "Rate (₹)", "Amount (₹)"]],
    body: [
      [
        "Slabs Issued (Initial)",
        data.customer.initialSlabs.toString(),
        "1,000",
        data.baseAmount.toLocaleString("en-IN"),
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: "center", cellWidth: 30 },
      2: { halign: "right", cellWidth: 30 },
      3: { halign: "right", cellWidth: 40 },
    },
  });
  
  let currentY = (doc as any).lastAutoTable.finalY + 5;
  
  // Penalty if applicable
  if (data.penaltyAmount > 0) {
    autoTable(doc, {
      startY: currentY,
      body: [
        [
          `Late Payment Penalty (${data.daysOverdue} days × ${data.customer.initialSlabs} slabs × ₹100)`,
          "",
          "",
          data.penaltyAmount.toLocaleString("en-IN"),
        ],
      ],
      theme: "plain",
      styles: { fontSize: 10, textColor: [220, 38, 38] },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { halign: "right", cellWidth: 40, fontStyle: "bold" },
      },
    });
    currentY = (doc as any).lastAutoTable.finalY + 5;
  }
  
  // Slabs Status
  autoTable(doc, {
    startY: currentY,
    head: [["Slab Status", "Quantity"]],
    body: [
      ["Initial Slabs Taken", data.customer.initialSlabs.toString()],
      ["Slabs Returned", data.customer.totalReturned.toString()],
      ["Slabs Currently Held", data.customer.slabsHeld.toString()],
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
  
  // Payment Summary Box
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.5);
  doc.rect(120, currentY, 75, 35);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const summaryY = currentY + 7;
  doc.text("Subtotal:", 125, summaryY);
  doc.text(`₹${data.baseAmount.toLocaleString("en-IN")}`, 190, summaryY, { align: "right" });
  
  if (data.penaltyAmount > 0) {
    doc.setTextColor(220, 38, 38);
    doc.text("Penalty:", 125, summaryY + 6);
    doc.text(`₹${data.penaltyAmount.toLocaleString("en-IN")}`, 190, summaryY + 6, { align: "right" });
    doc.setTextColor(0, 0, 0);
  }
  
  doc.setDrawColor(200);
  doc.line(125, summaryY + 9, 190, summaryY + 9);
  
  doc.setFont("helvetica", "bold");
  doc.text("Total Required:", 125, summaryY + 15);
  doc.text(`₹${data.totalRequired.toLocaleString("en-IN")}`, 190, summaryY + 15, { align: "right" });
  
  doc.setTextColor(34, 197, 94);
  doc.setFont("helvetica", "normal");
  doc.text("Amount Paid:", 125, summaryY + 21);
  doc.text(`₹${data.amountPaid.toLocaleString("en-IN")}`, 190, summaryY + 21, { align: "right" });
  
  doc.setDrawColor(200);
  doc.line(125, summaryY + 23, 190, summaryY + 23);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Balance Due:", 125, summaryY + 29);
  doc.text(`₹${data.remainingDue.toLocaleString("en-IN")}`, 190, summaryY + 29, { align: "right" });
  
  // Terms & Conditions
  currentY = currentY + 45;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Terms & Conditions:", 15, currentY);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const terms = [
    "• Payment must be made within 20 days of slab issue date",
    "• Late payment penalty: ₹100 per slab per day after grace period",
    "• Returns before full payment do not reduce the amount owed",
    "• After full payment, new cycle begins with remaining slabs",
  ];
  
  terms.forEach((term, index) => {
    doc.text(term, 15, currentY + 6 + (index * 5));
  });
  
  // Footer
  doc.setDrawColor(200);
  doc.line(15, 280, 195, 280);
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text("Thank you for your business!", 105, 285, { align: "center" });
  doc.text(`Generated on ${format(new Date(), "dd MMM yyyy, hh:mm a")}`, 105, 290, { align: "center" });
  
  // Save PDF
  const fileName = `Invoice_${data.invoiceNumber}_${data.customer.name.replace(/\s+/g, "_")}.pdf`;
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
