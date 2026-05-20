/**
 * generatePaymentPDF.js — SmartAssur
 * Receipt / Quittance de paiement — clean, professional, black & white.
 * Only uses real schema fields: numeroContrat, type, price, paymentMethod,
 * paymentStatus, paidAt, startDate, endDate, user (username, email, phone, address, idType, idNumber)
 */

async function loadJsPDF() {
  if (window.jspdf) return window.jspdf.jsPDF;
  await new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
  return window.jspdf.jsPDF;
}

function safe(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/[àáâãäå]/g,'a').replace(/[ÀÁÂÃÄÅ]/g,'A')
    .replace(/[èéêë]/g,'e').replace(/[ÈÉÊË]/g,'E')
    .replace(/[ìíîï]/g,'i').replace(/[ÌÍÎÏ]/g,'I')
    .replace(/[òóôõö]/g,'o').replace(/[ÒÓÔÕÖ]/g,'O')
    .replace(/[ùúûü]/g,'u').replace(/[ÙÚÛÜ]/g,'U')
    .replace(/ç/g,'c').replace(/Ç/g,'C')
    .replace(/ñ/g,'n').replace(/Ñ/g,'N')
    .replace(/œ/g,'oe').replace(/[^\x00-\x7F]/g,'?');
}

function fmt(v) {
  if (v === null || v === undefined || v === '') return '-';
  return safe(String(v));
}

function fmtDate(v) {
  if (!v) return '-';
  try {
    const iso = String(v).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return iso[1] + '-' + iso[2] + '-' + iso[3];
    const d = new Date(v);
    if (isNaN(d.getTime())) return '-';
    return d.getFullYear() + '-' +
           String(d.getMonth()+1).padStart(2,'0') + '-' +
           String(d.getDate()).padStart(2,'0');
  } catch(e) { return '-'; }
}

function fmtMoney(v) {
  if (v === null || v === undefined || isNaN(Number(v))) return '-';
  const n = Number(v);
  const parts = n.toFixed(3).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return parts.join(',') + ' DT';
}

function blk(doc) { doc.setTextColor(0,0,0); doc.setDrawColor(0,0,0); }

// Horizontal rule
function hr(doc, x, y, w, lw) {
  blk(doc);
  doc.setLineWidth(lw || 0.3);
  doc.line(x, y, x + w, y);
}

// Label : Value row — left label, right value (bold)
function row(doc, label, value, x, y, w) {
  blk(doc);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(safe(label), x, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(fmt(value), x + w, y, { align: 'right' });
  return y + 6;
}

async function fetchAdminSignature() {
  try {
    const token = typeof document !== 'undefined'
      ? document.cookie.split('; ').find(r => r.startsWith('token='))?.split('=')[1]
      : null;
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');
    const res = await fetch(apiUrl + '/signature/admin', {
      headers: token ? { Authorization: 'Bearer ' + token } : {}
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.signature || null;
  } catch { return null; }
}

export async function generatePaymentPDF(contract) {
  const jsPDF = await loadJsPDF();
  const doc   = new jsPDF({ unit: 'mm', format: 'a4', compress: true });

  const adminSigB64 = await fetchAdminSignature();

  const PW = 210;
  // Center a receipt-width column (140mm wide, centered)
  const RW = 150;
  const RL = (PW - RW) / 2; // left edge of receipt
  const u  = contract.user || {};

  const TYPE_LABEL = contract.type === 'Auto' ? 'Automobile'
                   : contract.type === 'Vie'  ? 'Vie'
                   : 'Voyage';

  const METHOD_LABEL = contract.paymentMethod === 'cash'   ? 'Especes (agence)'
                     : contract.paymentMethod === 'online' ? 'Paiement en ligne'
                     : '-';

  let Y = 20;

  // ── COMPANY HEADER ──────────────────────────────────────
  blk(doc);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SmartAssur', PW / 2, Y, { align: 'center' });
  Y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text("Compagnie d'Assurance", PW / 2, Y, { align: 'center' });
  Y += 5;

  hr(doc, RL, Y, RW, 0.5);
  Y += 6;

  // ── DOCUMENT TITLE ──────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  blk(doc);
  doc.text('QUITTANCE DE PAIEMENT', PW / 2, Y, { align: 'center' });
  Y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Recu N. : ' + fmt(contract.numeroContrat), PW / 2, Y, { align: 'center' });
  Y += 8;

  hr(doc, RL, Y, RW, 0.5);
  Y += 8;

  // ── CLIENT INFO BLOCK ───────────────────────────────────
  blk(doc);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('CLIENT', RL, Y);
  Y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  blk(doc);

  // Name
  doc.setFont('helvetica', 'bold');
  doc.text(fmt(u.username), RL, Y);
  doc.setFont('helvetica', 'normal');
  Y += 5;

  if (u.address && u.address !== '') {
    const addrLines = doc.splitTextToSize(safe(u.address), RW);
    doc.text(addrLines, RL, Y);
    Y += addrLines.length * 5;
  }

  // ID
  if (u.idNumber && u.idNumber !== '') {
    const idLabel = u.idType === 'sejour' ? 'N. Sejour' : 'CIN';
    doc.text(idLabel + ' : ' + fmt(u.idNumber), RL, Y);
    Y += 5;
  }

  // Phone & email on same line
  const contactParts = [];
  if (u.phone) contactParts.push(fmt(u.phone));
  if (u.email) contactParts.push(safe(u.email));
  if (contactParts.length) {
    doc.text(contactParts.join('   |   '), RL, Y);
    Y += 5;
  }

  Y += 4;
  hr(doc, RL, Y, RW, 0.3);
  Y += 8;

  // ── CONTRACT SUMMARY BLOCK ──────────────────────────────
  blk(doc);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('CONTRAT', RL, Y);
  Y += 5;

  Y = row(doc, 'Numero de contrat', fmt(contract.numeroContrat), RL, Y, RW);
  Y = row(doc, 'Type d\'assurance', 'Assurance ' + TYPE_LABEL,  RL, Y, RW);
  Y = row(doc, 'Periode de couverture',
    fmtDate(contract.startDate) + '  au  ' + fmtDate(contract.endDate),
    RL, Y, RW);

  Y += 4;
  hr(doc, RL, Y, RW, 0.3);
  Y += 8;

  // ── PAYMENT DETAILS BLOCK ───────────────────────────────
  blk(doc);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('PAIEMENT', RL, Y);
  Y += 5;

  Y = row(doc, 'Mode de paiement', METHOD_LABEL, RL, Y, RW);
  Y = row(doc, 'Date de paiement', fmtDate(contract.paidAt), RL, Y, RW);

  Y += 4;
  hr(doc, RL, Y, RW, 0.5);
  Y += 7;

  // ── AMOUNT — prominent ──────────────────────────────────
  // Outer box
  blk(doc);
  doc.setLineWidth(0.5);
  doc.rect(RL, Y, RW, 18, 'S');

  // Label inside box
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  blk(doc);
  doc.text('Prime annuelle regle', RL + 4, Y + 7);

  // Amount — large, right-aligned
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(fmtMoney(contract.price), RL + RW - 4, Y + 11, { align: 'right' });

  Y += 28;

  // ── ADMIN SIGNATURE ──────────────────────────────────────
  if (adminSigB64) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    blk(doc);
    doc.text('Cachet', RL + RW - 4, Y, { align: 'right' });
    try {
      // Right-align the signature image
      doc.addImage(adminSigB64, 'PNG', RL + RW - 54, Y + 2, 50, 16);
    } catch(e) {}
    Y += 22;
  }

  // ── LEGAL FOOTER ─────────────────────────────────────────
  hr(doc, RL, Y, RW, 0.3);
  Y += 5;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  blk(doc);
  doc.text(
    'Ce document constitue une quittance officielle de paiement. ' +
    'Conservez-le pour vos dossiers.',
    PW / 2, Y, { align: 'center', maxWidth: RW }
  );
  Y += 4;
  doc.text(
    'SmartAssur — Compagnie d\'Assurance agréée en Tunisie.',
    PW / 2, Y, { align: 'center', maxWidth: RW }
  );

  // ── SAVE ─────────────────────────────────────────────────
  doc.save('Quittance_' + fmt(contract.numeroContrat || contract._id) + '.pdf');
}
