/**
 * Utility to generate and download a professional PDF Invoice for Omris Home Kitchen.
 * Uses jsPDF and autoTable loaded dynamically via CDN if not present on window.
 */
export const generateInvoicePDF = (order) => {
  if (!order) return alert('Order details missing');

  const executePDFGeneration = () => {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4'); // Portrait mode

      const primaryColor = [28, 25, 23];    // #1c1917 Dark Stone
      const accentColor = [217, 119, 6];    // #d97706 Amber/Gold
      const successColor = [16, 185, 129];  // #10b981 Emerald
      const textGray = [107, 114, 128];     // #6b7280

      // ── Header Band ────────────────────────────────────────────────────────
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 36, 'F');

      // Title & Subtitle
      doc.setFontSize(20);
      doc.setTextColor(245, 158, 11); // Gold
      doc.setFont('helvetica', 'bold');
      doc.text('OMRIS HOME KITCHEN', 14, 18);

      doc.setFontSize(9);
      doc.setTextColor(214, 211, 209);
      doc.setFont('helvetica', 'normal');
      doc.text('Authentic Homemade Pickles & Podis', 14, 25);
      doc.text('Amberpet, Hyderabad, Telangana - 500013 | Ph: +91 7670851967', 14, 30);

      // INVOICE Title Badge Right Side
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('TAX INVOICE', 196, 20, { align: 'right' });

      // ── Invoice & Customer Info Grid ───────────────────────────────────────
      const orderIdStr = order._id ? `#${order._id.slice(-8).toUpperCase()}` : '#N/A';
      const orderDateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN');
      const isPaid = order.isPaid || false;
      const customerName = order.user?.name || order.guestInfo?.name || 'Customer';
      const customerEmail = order.user?.email || order.guestInfo?.email || 'N/A';
      const customerPhone = order.user?.phone || order.guestInfo?.phone || 'N/A';

      // Bill To Column (Left)
      doc.setFontSize(10);
      doc.setTextColor(...accentColor);
      doc.setFont('helvetica', 'bold');
      doc.text('BILLED TO:', 14, 46);

      doc.setFontSize(9);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(customerName, 14, 52);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textGray);
      doc.text(`Email: ${customerEmail}`, 14, 57);
      doc.text(`Phone: ${customerPhone}`, 14, 62);

      // Invoice Info Column (Right)
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text(`Invoice No: INV-${orderIdStr}`, 196, 46, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textGray);
      doc.text(`Date: ${orderDateStr}`, 196, 51, { align: 'right' });
      doc.text(`Payment Mode: ${order.paymentMethod || 'PhonePe / UPI'}`, 196, 56, { align: 'right' });

      // Payment Status Pill (Right)
      doc.setFont('helvetica', 'bold');
      if (isPaid) {
        doc.setFillColor(209, 250, 229); // Light emerald
        doc.setTextColor(...successColor);
        doc.rect(156, 60, 40, 7, 'F');
        doc.text('PAYMENT PAID', 176, 65, { align: 'center' });
      } else {
        doc.setFillColor(254, 243, 199); // Light amber
        doc.setTextColor(217, 119, 6);
        doc.rect(156, 60, 40, 7, 'F');
        doc.text('PAYMENT PENDING', 176, 65, { align: 'center' });
      }

      // ── Order Items Table ──────────────────────────────────────────────────
      const tableHeaders = [['S.No', 'Product & Variant', 'Qty', 'Price (INR)', 'Total (INR)']];
      const tableBody = (order.orderItems || []).map((item, index) => [
        index + 1,
        `${item.name}${item.weight ? ` (${item.weight})` : ''}`,
        item.quantity || 1,
        `Rs. ${Number(item.price || 0).toFixed(2)}`,
        `Rs. ${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}`,
      ]);

      doc.autoTable({
        head: tableHeaders,
        body: tableBody,
        startY: 72,
        theme: 'grid',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
        },
        styles: {
          fontSize: 8.5,
          cellPadding: 4,
          textColor: [31, 41, 55],
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 95 },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 30, halign: 'right' },
        },
      });

      // ── Summary Box ────────────────────────────────────────────────────────
      const finalY = doc.lastAutoTable.finalY + 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textGray);
      doc.text('Subtotal:', 140, finalY);
      doc.text(`Rs. ${Number(order.totalPrice || 0).toFixed(2)}`, 196, finalY, { align: 'right' });

      doc.text('Delivery Charges:', 140, finalY + 5);
      doc.setTextColor(...successColor);
      doc.text('FREE', 196, finalY + 5, { align: 'right' });

      doc.setLineWidth(0.5);
      doc.setDrawColor(229, 231, 235);
      doc.line(140, finalY + 8, 196, finalY + 8);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('Grand Total:', 140, finalY + 15);
      doc.setTextColor(217, 119, 6);
      doc.text(`Rs. ${Number(order.totalPrice || 0).toFixed(2)}`, 196, finalY + 15, { align: 'right' });

      // ── Footer ─────────────────────────────────────────────────────────────
      const footerY = Math.max(finalY + 35, 255);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...textGray);
      doc.text('Thank you for ordering with Omris Home Kitchen! Enjoy fresh & delicious homemade taste.', 105, footerY, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.text('For Omris Home Kitchen (Authorized Signatory)', 196, footerY + 10, { align: 'right' });

      doc.save(`Invoice_${orderIdStr}_Omris_Kitchen.pdf`);
    } catch (err) {
      console.error('Error generating Invoice PDF:', err);
      alert('Error generating invoice PDF. Please try again.');
    }
  };

  // Load jsPDF CDN scripts dynamically if not present
  if (window.jspdf && window.jspdf.jsPDF) {
    executePDFGeneration();
  } else {
    const script1 = document.createElement('script');
    script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script1.onload = () => {
      const script2 = document.createElement('script');
      script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js';
      script2.onload = executePDFGeneration;
      document.body.appendChild(script2);
    };
    document.body.appendChild(script1);
  }
};

export default generateInvoicePDF;
