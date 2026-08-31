// Helper function to convert numeric amount to words (Indian numbering system)
const numberToWords = (num) => {
  if (!num || isNaN(num) || num === 0) return 'Zero Rupees Only';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
  };

  const whole = Math.floor(num);
  const fraction = Math.round((num - whole) * 100);
  let str = inWords(whole) + ' Rupees';
  if (fraction > 0) {
    str += ' and ' + inWords(fraction) + ' Paise';
  }
  return str + ' Only';
};

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
      doc.rect(0, 0, 210, 42, 'F');

      // Top Left Corner Logo Badge (Omri's Home Kitchen)
      doc.setFillColor(15, 12, 10);
      doc.roundedRect(12, 6, 30, 30, 3, 3, 'F');
      doc.setDrawColor(217, 119, 6); // Gold border
      doc.setLineWidth(0.6);
      doc.roundedRect(12, 6, 30, 30, 3, 3, 'S');

      // Logo Icon / Text inside Badge
      doc.setFontSize(11);
      doc.setTextColor(245, 158, 11);
      doc.setFont('times', 'bolditalic');
      doc.text('Omri\'s', 27, 16, { align: 'center' });

      doc.setFontSize(5.5);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('HOME KITCHEN', 27, 21, { align: 'center' });

      doc.setFillColor(217, 119, 6);
      doc.rect(17, 23, 20, 0.4, 'F');

      doc.setFontSize(4.5);
      doc.setTextColor(214, 211, 209);
      doc.setFont('helvetica', 'normal');
      doc.text('Authentic & Homemade', 27, 27, { align: 'center' });
      doc.text('Est. 2022', 27, 31, { align: 'center' });

      // Title & Subtitle Next to Logo
      doc.setFontSize(19);
      doc.setTextColor(245, 158, 11); // Gold
      doc.setFont('helvetica', 'bold');
      doc.text('OMRIS HOME KITCHEN', 47, 17);

      doc.setFontSize(8.5);
      doc.setTextColor(214, 211, 209);
      doc.setFont('helvetica', 'normal');
      doc.text('Authentic Homemade Pickles & Podis', 47, 23);
      doc.text('H.No.2-3-84/1/A, Lalitha Nilyam, Quadribagh, Amberpet, Hyderabad, Telangana - 500013', 47, 28);
      doc.text('Ph: +91 7670851967  |  Email: omrishomekichen@gmail.com', 47, 33);

      // INVOICE Title Badge Right Side
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('TAX INVOICE', 196, 22, { align: 'right' });

      // ── Invoice Meta Row ───────────────────────────────────────────────────
      const orderIdStr = order._id ? `#${order._id.slice(-8).toUpperCase()}` : '#N/A';
      const orderDateStr = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : new Date().toLocaleDateString('en-IN');
      const isPaid = order.isPaid || false;

      doc.setFillColor(245, 240, 220);
      doc.rect(0, 42, 210, 12, 'F');
      doc.setDrawColor(180, 140, 30);
      doc.setLineWidth(0.3);
      doc.line(0, 42, 210, 42);
      doc.line(0, 54, 210, 54);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('Invoice No.', 14, 47);
      doc.text('Invoice Date', 70, 47);
      doc.text('Payment Mode', 125, 47);
      doc.text('Status', 175, 47);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 60, 10);
      doc.text(`INV-${orderIdStr}`, 14, 52);
      doc.text(orderDateStr, 70, 52);
      doc.text(order.paymentMethod || 'PhonePe / UPI', 125, 52);
      if (isPaid) {
        doc.setTextColor(5, 150, 105);
        doc.text('PAID', 175, 52);
      } else {
        doc.setTextColor(180, 90, 0);
        doc.text('PENDING', 175, 52);
      }

      // ── Bill To / Ship To Section ──────────────────────────────────────────
      const customerName = order.user?.name || order.guestInfo?.name || 'Customer';
      const customerPhone = order.user?.phone || order.guestInfo?.phone || order.shippingAddress?.phone || 'N/A';

      const shipAddr = order.shippingAddress || {};
      const shipName = shipAddr.fullName || shipAddr.name || customerName;
      const shipStreet = shipAddr.street || shipAddr.address || '';
      const shipState = shipAddr.state || '';
      const shipPhone = shipAddr.phone || customerPhone;
      const shipLandmark = shipAddr.landmark || shipAddr.remarks || '';

      // Shipping address text
      const shipDetailParts = [shipStreet, shipLandmark].filter(Boolean);
      const shipDetail = shipDetailParts.join(', ');

      // Draw Bill To / Ship To bordered box
      doc.setDrawColor(180, 140, 30);
      doc.setLineWidth(0.4);
      doc.rect(14, 57, 182, 44);
      doc.line(105, 57, 105, 101); // vertical divider

      // Bill To (Left column)
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('Bill To', 17, 64);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 30, 5);
      doc.text(customerName, 17, 70);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textGray);
      doc.text('H.No.2-3-84/1/A, Lalitha Nilyam, Quadribagh,', 17, 76);
      doc.text('Amberpet, Hyderabad, Telangana - 500013', 17, 81);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('Mobile ', 17, 88);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 30, 5);
      doc.text(customerPhone, 33, 88);

      // Ship To (Right column)
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('Ship To', 108, 64);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 30, 5);
      doc.text(shipName, 108, 70);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textGray);
      if (shipDetail) {
        const wrapped = doc.splitTextToSize(shipDetail, 80);
        doc.text(wrapped, 108, 76);
      }
      if (shipState) doc.text(`${shipState},`, 108, 82);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('Mobile ', 108, 88);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 30, 5);
      doc.text(shipPhone, 124, 88);

      // ── Order Items Table ──────────────────────────────────────────────────
      const HSN_CODE = '2001'; // Standard HSN for pickles/condiments

      const tableHeaders = [['No', 'Items', 'HSN No.', 'Qty.', 'MRP', 'Rate', 'Total']];

      const tableBody = (order.orderItems || []).map((item, index) => {
        const rate = Number(item.price || 0);
        const qty = Number(item.quantity || 1);
        const mrp = item.mrp ? Number(item.mrp) : Math.ceil(rate * 1.15);
        const discPct = mrp > rate ? Math.round(((mrp - rate) / mrp) * 100) : 0;
        const mrpDisplay = discPct > 0 ? `${mrp}\n(${discPct}% OFF)` : `${mrp}`;
        const label = `${item.name}${item.weight ? ` ${item.weight}` : ''}${item.packing ? ` ${item.packing}` : ''}`;

        return [
          index + 1,
          label,
          item.hsn || HSN_CODE,
          `${qty} NOS`,
          mrpDisplay,
          rate,
          rate * qty,
        ];
      });

      const totalQty = (order.orderItems || []).reduce((s, i) => s + Number(i.quantity || 1), 0);

      // Subtotal calculated strictly from items sum (e.g. 135)
      const subtotal = (order.orderItems || []).reduce(
        (sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)),
        0
      );

      doc.autoTable({
        head: tableHeaders,
        body: tableBody,
        startY: 106,
        theme: 'grid',
        headStyles: {
          fillColor: [245, 240, 220],
          textColor: [40, 30, 5],
          fontStyle: 'bold',
          fontSize: 8.5,
          lineColor: [180, 140, 30],
          lineWidth: 0.3,
        },
        styles: {
          fontSize: 8.5,
          cellPadding: 3,
          textColor: [31, 41, 55],
          lineColor: [180, 140, 30],
          lineWidth: 0.2,
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 65 },
          2: { cellWidth: 22, halign: 'center' },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 25, halign: 'right' },
          5: { cellWidth: 20, halign: 'right' },
          6: { cellWidth: 20, halign: 'right' },
        },
        foot: [[
          '',
          { content: 'SUBTOTAL', styles: { fontStyle: 'bold', fillColor: [245, 240, 220], textColor: primaryColor } },
          '',
          { content: `${totalQty}`, styles: { fontStyle: 'bold', fillColor: [245, 240, 220], halign: 'center' } },
          '',
          '',
          { content: `Rs. ${subtotal.toFixed(2)}`, styles: { fontStyle: 'bold', fillColor: [245, 240, 220], halign: 'right', textColor: primaryColor } },
        ]],
        footStyles: {
          fillColor: [245, 240, 220],
          textColor: primaryColor,
          fontStyle: 'bold',
          fontSize: 9,
          lineColor: [180, 140, 30],
          lineWidth: 0.3,
        },
      });

      // ── Summary + Terms & Conditions ───────────────────────────────────────
      const finalY = doc.lastAutoTable.finalY + 6;

      // Delivery charge rule: FREE for ₹2000 and above, ₹100 for below ₹2000
      const deliveryCharge = (order.deliveryCharge != null)
        ? Number(order.deliveryCharge)
        : (subtotal >= 2000 ? 0 : 100);

      // Grand Total = Subtotal + Delivery Charges (e.g. 135 + 100 = 235)
      const grandTotal = subtotal + deliveryCharge;

      // Terms & Conditions (Left)
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('Terms & Conditions', 14, finalY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textGray);
      doc.text('1. Goods once sold will not be taken back or exchanged', 14, finalY + 10);
      doc.text('2. All disputes are subject to Hyderabad jurisdiction only', 14, finalY + 15);

      // Right: Subtotal + Delivery Charges + Total Amount
      doc.setDrawColor(180, 140, 30);
      doc.setLineWidth(0.3);
      doc.line(125, finalY + 1, 196, finalY + 1);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textGray);
      doc.text('Subtotal', 127, finalY + 6);
      doc.setTextColor(...primaryColor);
      doc.text(`Rs. ${subtotal.toFixed(2)}`, 196, finalY + 6, { align: 'right' });

      doc.setTextColor(...textGray);
      doc.text('Delivery Charges', 127, finalY + 11);
      if (deliveryCharge > 0) {
        doc.setTextColor(...primaryColor);
        doc.text(`Rs. ${deliveryCharge.toFixed(2)}`, 196, finalY + 11, { align: 'right' });
      } else {
        doc.setTextColor(...successColor);
        doc.text('FREE', 196, finalY + 11, { align: 'right' });
      }

      doc.setDrawColor(180, 140, 30);
      doc.setLineWidth(0.5);
      doc.line(125, finalY + 14, 196, finalY + 14);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('Total Amount', 127, finalY + 21);
      doc.setTextColor(...accentColor);
      doc.text(`Rs. ${grandTotal.toFixed(2)}`, 196, finalY + 21, { align: 'right' });

      doc.setLineWidth(0.5);
      doc.line(125, finalY + 24, 196, finalY + 24);

      // ── Total Amount in Words (Dedicated Row) ────────────────────────────────
      const wordsY = finalY + 29;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Total Amount (in words):', 14, wordsY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(numberToWords(grandTotal), 53, wordsY);

      // ── Payment QR Code & Signature Row ───────────────────────────────────
      const pyY = wordsY + 6;

      // Draw Payment QR Box (Left Side)
      doc.setDrawColor(180, 140, 30);
      doc.setLineWidth(0.35);
      doc.roundedRect(14, pyY, 94, 28, 2, 2);

      // PhonePe QR Code Icon Box (White bg, purple accents, center PhonePe emblem)
      doc.setFillColor(255, 255, 255);
      doc.rect(17, pyY + 3, 22, 22, 'F');
      doc.setDrawColor(95, 37, 159); // PhonePe Purple border
      doc.setLineWidth(0.4);
      doc.rect(17, pyY + 3, 22, 22, 'S');

      // Top corner targets of QR Code
      doc.setFillColor(30, 30, 30);
      doc.rect(18.5, pyY + 4.5, 4.5, 4.5, 'F');
      doc.rect(33, pyY + 4.5, 4.5, 4.5, 'F');
      doc.rect(18.5, pyY + 19, 4.5, 4.5, 'F');

      // Center PhonePe Circle & Text
      doc.setFillColor(95, 37, 159); // #5f259f Purple
      doc.circle(28, pyY + 14, 4.2, 'F');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('पे', 28, pyY + 16.2, { align: 'center' });

      // Title: Payment QR Code
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Payment QR Code', 43, pyY + 7);

      // Colored Payment App Logos Line: PhonePe, GPay, Paytm, UPI
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');

      // PhonePe (Purple)
      doc.setTextColor(95, 37, 159);
      doc.text('PhonePe', 43, pyY + 13);

      // GPay (Google Blue/Multi)
      doc.setTextColor(66, 133, 244);
      doc.text('G', 60, pyY + 13);
      doc.setTextColor(75, 85, 99);
      doc.setFont('helvetica', 'normal');
      doc.text('Pay', 63, pyY + 13);

      // Paytm (Navy & Cyan)
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 46, 110);
      doc.text('pay', 71, pyY + 13);
      doc.setTextColor(0, 186, 242);
      doc.text('tm', 77.5, pyY + 13);

      // UPI (Dark Gray + Tri-color tag)
      doc.setTextColor(75, 85, 99);
      doc.text('UPI', 84, pyY + 13);
      doc.setFillColor(249, 115, 22); // Orange arrow
      doc.rect(91, pyY + 10.5, 1.2, 2.5, 'F');
      doc.setFillColor(34, 197, 94); // Green arrow
      doc.rect(92.5, pyY + 10.5, 1.2, 2.5, 'F');

      // UPI ID Line
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('UPI ID: ', 43, pyY + 20);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text('babuvardhineni@ybl', 55, pyY + 20);

      // Signature Box (Right Side)
      doc.setDrawColor(180, 140, 30);
      doc.setLineWidth(0.4);
      doc.roundedRect(136, pyY, 60, 26, 2, 2);

      doc.setFont('times', 'bolditalic');
      doc.setFontSize(12.5);
      doc.setTextColor(20, 20, 20);
      doc.text('V. Kishor babu', 166, pyY + 11, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Signature', 166, pyY + 17, { align: 'center' });
      doc.setFontSize(7);
      doc.text('Omri\'s Home Kitchen', 166, pyY + 21, { align: 'center' });

      // ── Footer ─────────────────────────────────────────────────────────────
      const footerY = Math.max(pyY + 34, 276);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...textGray);
      doc.text('Thank you for ordering with Omris Home Kitchen! Enjoy fresh & delicious homemade taste.', 105, footerY, { align: 'center' });

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

