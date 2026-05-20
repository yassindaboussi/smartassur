/**
 * generateContractPDF.js — SmartAssur
 * Professional single-page contract. ASCII-safe. Type-strict fields only.
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

/* Convert accented chars → ASCII so jsPDF helvetica renders cleanly */
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
    .replace(/œ/g,'oe').replace(/Œ/g,'OE')
    .replace(/[^\x00-\x7F]/g,'?');
}

function fmt(v) {
  if (v === null || v === undefined || v === '') return '-';
  return safe(String(v));
}
function fmtMoney(v) {
  if (v === null || v === undefined || v === '' || isNaN(Number(v))) return '-';
  // Manual formatting to avoid locale symbol issues
  const n = Number(v);
  const parts = n.toFixed(3).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return parts.join(',') + ' DT';
}
function fmtDate(v) {
  if (!v) return '-';
  try {
    // Extract YYYY-MM-DD directly from ISO strings like "2026-04-30T22:02:04.410Z"
    const iso = String(v).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return iso[1] + '-' + iso[2] + '-' + iso[3];
    const d = new Date(v);
    if (isNaN(d.getTime())) return '-';
    return d.getFullYear() + '-' +
           String(d.getMonth()+1).padStart(2,'0') + '-' +
           String(d.getDate()).padStart(2,'0');
  } catch(e) { return '-'; }
}
function fmtBool(v) { return v ? 'Oui' : 'Non'; }

/* ── Drawing helpers ─────────────────────────────────────── */

function blk(doc) { doc.setTextColor(0,0,0); doc.setDrawColor(0,0,0); }

/**
 * Measure how many mm a block of rows will occupy.
 * rows = array of { label, value, labelW, maxW }
 * LINE = line height in mm
 */
const LINE = 5;   // vertical spacing per text line
const PAD  = 3;   // top padding inside box after title bar

/**
 * Draw a titled section box.
 *  x, y, w = position & width
 *  h        = total box height (including 6mm title bar)
 * Returns Y of first content line (after title bar + PAD).
 */
function drawBox(doc, title, x, y, w, h) {
  blk(doc);
  doc.setLineWidth(0.3);
  doc.rect(x, y, w, h, 'S');
  // title bar
  doc.setFillColor(215,215,215);
  doc.rect(x, y, w, 6, 'F');
  blk(doc);
  doc.setLineWidth(0.3);
  doc.rect(x, y, w, 6, 'S');
  doc.setFont('helvetica','bold');
  doc.setFontSize(7.5);
  doc.text(safe(title), x+2, y+4.2);
  return y + 6 + PAD; // first content Y
}

/**
 * Print one "Label : Value" field.
 * Returns the Y after the last line printed.
 */
function fld(doc, label, value, x, y, labelW, maxW) {
  blk(doc);
  const safeVal = fmt(value);
  const lines = doc.splitTextToSize(safeVal, maxW || 55);
  doc.setFont('helvetica','normal');
  doc.setFontSize(7.5);
  doc.text(safe(label), x, y);
  doc.setFont('helvetica','bold');
  doc.setFontSize(7.5);
  doc.text(lines, x + labelW, y);
  return y + lines.length * LINE;
}

async function fetchAdminSignature() {
  try {
    // Token is stored in cookies (js-cookie), not localStorage
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

export async function generateContractPDF(contract) {
  const jsPDF = await loadJsPDF();
  const doc   = new jsPDF({ unit:'mm', format:'a4', compress:true });

  const PW = 210, ML = 10, CW = 190;
  const u  = contract.user || {};
  const TYPE_LABEL = contract.type==='Auto' ? 'Automobile' : contract.type==='Vie' ? 'Vie' : 'Voyage';

  /* ── HEADER ───────────────────────────────────────────── */
  blk(doc);
  doc.setFont('helvetica','bold');   doc.setFontSize(13);
  doc.text('SmartAssur', ML, 13);
  doc.setFont('helvetica','normal'); doc.setFontSize(7);
  doc.text("Compagnie d'Assurance", ML, 17.5);

  // ref box top-right
  doc.setLineWidth(0.3); blk(doc);
  doc.rect(PW-ML-34, 7, 34, 13, 'S');
  doc.setFont('helvetica','bold'); doc.setFontSize(6.5);
  doc.text(fmt(contract.numeroContrat).slice(0,24), PW-ML-33, 12);
  doc.setFont('helvetica','normal'); doc.setFontSize(6);
  doc.text('Emis le ' + fmtDate(contract.createdAt), PW-ML-33, 16.5);

  doc.setFont('helvetica','bold'); doc.setFontSize(9.5); blk(doc);
  doc.text('CONDITIONS PARTICULIERES', PW/2, 14, {align:'center'});
  doc.setFontSize(8.5);
  doc.text('SOUSCRIPTION NOUVELLE AFFAIRE  << ' + fmt(contract.numeroContrat) + ' >>', PW/2, 19.5, {align:'center'});

  doc.setFont('helvetica','normal'); doc.setFontSize(6.8);
  doc.text(
    'Aux conditions generales du contrat d\'assurance ' + TYPE_LABEL +
    ' et aux conditions mentionnees qui suivent, SmartAssur garantit l\'assure(e) dans les conditions decrites ci-apres.',
    ML, 25, {maxWidth: CW}
  );

  let Y = 31;
  const GAP = 2;

  /* ═══════════════════════════════════════════════
     Helper: compute exact box height for a list of
     row descriptors so nothing overflows.
     rows = [ [label, value, labelW, maxW, x], ... ]
     We measure each row's line count, sum them up.
  ═══════════════════════════════════════════════ */
  function calcH(rowGroups) {
    // rowGroups = array of "lines" where each line is an array of fields on same Y
    // We just need the total number of LINE increments
    let total = 0;
    for (const group of rowGroups) {
      // each group is one horizontal row; height = max lines across fields in that row
      let maxLines = 1;
      for (const [,value,,maxW] of group) {
        const lines = doc.splitTextToSize(fmt(value), maxW || 55);
        if (lines.length > maxLines) maxLines = lines.length;
      }
      total += maxLines * LINE;
    }
    return 6 + PAD + total + 3; // titleBar + topPad + content + bottomPad
  }

  /* ── CONTRAT ──────────────────────────────────────────── */
  // Build rows based on type
  const contratRows = [];
  contratRows.push([['Numero du contrat :', contract.numeroContrat, 36, 55, ML+2], ['Agence :', 'SmartAssur Centrale', 16, 60, ML+110]]);
  contratRows.push([['Produit :', 'Assurance ' + TYPE_LABEL, 16, 100, ML+2]]);
  contratRows.push([['Duree du contrat :', 'Renouvelable', 36, 40, ML+2], ['Fractionnement :', 'Annuel', 30, 30, ML+90], ["Date d'effet :", fmtDate(contract.startDate), 22, 30, ML+148]]);
  contratRows.push([['Echeance anniversaire :', fmtDate(contract.endDate), 42, 30, ML+2], ['Date terme :', fmtDate(contract.endDate), 24, 30, ML+110]]);

  if (contract.type === 'Vie' && contract.vieData) {
    const vd = contract.vieData;
    contratRows.push([['Organisme preteur :', vd.organismePreteur, 36, 60, ML+2], ['Capital emprunte :', fmtMoney(vd.capitalEmprunte), 34, 45, ML+110]]);
    contratRows.push([["Taux d'interet :", vd.tauxInteret ? vd.tauxInteret+'%' : null, 32, 20, ML+2], ['Duree remboursement :', vd.dureeRemboursement ? vd.dureeRemboursement+' mois' : null, 38, 30, ML+100]]);
    contratRows.push([['Periodicite :', vd.periodicite, 26, 35, ML+2], ['Periode de franchise :', vd.periodeFranchise ? vd.periodeFranchise+' mois' : null, 38, 25, ML+100]]);
  }

  const contratH = calcH(contratRows);
  let cy = drawBox(doc, 'CONTRAT', ML, Y, CW, contratH);
  for (const group of contratRows) {
    let maxLines = 1;
    for (const [label, value, labelW, maxW, x] of group) {
      const lines = doc.splitTextToSize(fmt(value), maxW || 55);
      if (lines.length > maxLines) maxLines = lines.length;
      fld(doc, label, value, x, cy, labelW, maxW);
    }
    cy += maxLines * LINE;
  }
  Y += contratH + GAP;

  /* ── CONTRACTANT(E) ───────────────────────────────────── */
  const contractantRows = [
    [['Souscripteur :', u.username, 26, 65, ML+2], ['N. Identite (' + (u.idType==='sejour'?'Sejour':'CIN') + ') :', u.idNumber, 44, 40, ML+110]],
    [['Adresse :', u.address, 18, 85, ML+2]],
    [['Telephone :', u.phone, 22, 40, ML+2], ['Email :', u.email, 14, 100, ML+75]],
  ];
  const contractantH = calcH(contractantRows);
  cy = drawBox(doc, 'CONTRACTANT(E)', ML, Y, CW, contractantH);
  for (const group of contractantRows) {
    let maxLines = 1;
    for (const [label, value, labelW, maxW, x] of group) {
      const lines = doc.splitTextToSize(fmt(value), maxW||55);
      if (lines.length > maxLines) maxLines = lines.length;
      fld(doc, label, value, x, cy, labelW, maxW);
    }
    cy += maxLines * LINE;
  }
  Y += contractantH + GAP;

  /* ── ASSURE(E) ────────────────────────────────────────── */
  const assureRows = [];

  if (contract.type === 'Auto') {
    assureRows.push([['Assure :', u.username, 18, 85, ML+2]]);
    assureRows.push([['Date de naissance :', fmtDate(u.dateNaissance), 36, 35, ML+2]]);
    assureRows.push([['Adresse :', u.address, 18, 85, ML+2]]);

  } else if (contract.type === 'Vie' && contract.vieData) {
    const vd = contract.vieData;
    const fullName = (safe(vd.prenomAssure||'') + ' ' + safe(vd.nomAssure||'')).trim();
    assureRows.push([['Assure :', fullName, 18, 85, ML+2]]);
    assureRows.push([['Date de naissance :', fmtDate(vd.dateNaissance), 36, 35, ML+2], ['Age :', vd.age ? vd.age+' ans' : null, 12, 20, ML+110]]);
    assureRows.push([['GSM :', vd.gsm, 12, 40, ML+2], ['Email :', vd.email, 14, 90, ML+60]]);
    assureRows.push([["Etat de sante :", vd.etatSante, 28, 60, ML+2], ['Fumeur :', fmtBool(vd.fumeur), 16, 20, ML+110]]);

  } else if (contract.type === 'Vol' && contract.volData) {
    const vd = contract.volData;
    const fullName = (safe(vd.prenom||'') + ' ' + safe(vd.nom||'')).trim();
    assureRows.push([['Assure :', fullName, 18, 85, ML+2]]);
    assureRows.push([['Date de naissance :', fmtDate(vd.dateNaissance), 36, 35, ML+2]]);
  }

  const assureH = calcH(assureRows);
  cy = drawBox(doc, 'ASSURE(E)', ML, Y, CW, assureH);
  for (const group of assureRows) {
    let maxLines = 1;
    for (const [label, value, labelW, maxW, x] of group) {
      const lines = doc.splitTextToSize(fmt(value), maxW||55);
      if (lines.length > maxLines) maxLines = lines.length;
      fld(doc, label, value, x, cy, labelW, maxW);
    }
    cy += maxLines * LINE;
  }
  Y += assureH + GAP;

  /* ── TYPE-SPECIFIC ────────────────────────────────────── */

  if (contract.type === 'Auto' && contract.autoData) {
    const d = contract.autoData;

    const equip = [
      d.gps          ? 'GPS'               : null,
      d.alarme       ? 'Alarme'            : null,
      d.abs          ? 'ABS'               : null,
      d.airbags      ? 'Airbags'           : null,
      d.radarRecul   ? 'Radar recul'       : null,
      d.cleDouble    ? 'Cle double'        : null,
      d.alarmeCeinture ? 'Alarme ceinture' : null,
    ].filter(Boolean);

    const autoRows = [
      [['Marque/Modele :', d.modele, 28, 55, ML+2], ['Finition :', d.finition, 18, 40, ML+100], ['Boite :', d.boiteVitesse, 14, 30, ML+158]],
      [['Valeur a neuf :', fmtMoney(d.valeurNeuf), 28, 45, ML+2], ['Valeur venale :', fmtMoney(d.valeurVenale), 28, 45, ML+100], ['Nb portes :', d.nbPortes, 20, 15, ML+162]],
      [['Kilometrage :', d.kilometrage ? String(Number(d.kilometrage).toLocaleString('fr-FR')).replace(/[^\d\s]/g,'').trim()+' km' : null, 26, 40, ML+2], ['Stationnement :', d.typeStationnement, 28, 38, ML+95], ['Autre conducteur :', fmtBool(d.autreConduct), 36, 12, ML+152]],
      [['N. Permis :', d.numPermis, 22, 40, ML+2], ['Type permis :', d.typePermis, 26, 28, ML+75], ['Categorie :', d.categoriePermis, 22, 12, ML+130], ['Obtenu le :', fmtDate(d.dateObtentionPermis), 18, 28, ML+156]],
      [['Equipements :', equip.length ? equip.join(', ') : 'Aucun', 26, 155, ML+2]],
    ];

    const vehiculeH = calcH(autoRows);
    cy = drawBox(doc, 'VEHICULE', ML, Y, CW, vehiculeH);
    for (const group of autoRows) {
      let maxLines = 1;
      for (const [label, value, labelW, maxW, x] of group) {
        const lines = doc.splitTextToSize(fmt(value), maxW||55);
        if (lines.length > maxLines) maxLines = lines.length;
        fld(doc, label, value, x, cy, labelW, maxW);
      }
      cy += maxLines * LINE;
    }
    Y += vehiculeH + GAP;

  } else if (contract.type === 'Vie' && contract.vieData) {
    const d = contract.vieData;

    const santeRows = [
      [['Taille :', d.taille ? d.taille+' cm' : null, 14, 18, ML+2], ['Poids :', d.poids ? d.poids+' kg' : null, 14, 18, ML+55], ['Fumeur :', fmtBool(d.fumeur), 16, 16, ML+110], ['Sport a risque :', fmtBool(d.sportRisque), 28, 16, ML+148]],
      [['Maladies chroniques :', fmtBool(d.maladiesChroniques), 38, 16, ML+2], ['Operations chir. :', fmtBool(d.operationsChirurgicales), 32, 16, ML+80], ['Medicaments reguliers :', fmtBool(d.medicamentsRegulier), 40, 16, ML+140]],
      [['Hospitalise :', fmtBool(d.hospitalise), 24, 16, ML+2], ['Suivi specialiste :', fmtBool(d.suiviSpecialiste), 32, 16, ML+80], ['Maladies graves :', fmtBool(d.maladiesGraves), 32, 16, ML+140]],
      [['Maladies hereditaires :', fmtBool(d.maladiesHereditaires), 40, 16, ML+2]],
    ];
    if (d.maladiesChroniques && d.detailsMaladies) {
      santeRows.push([[  'Details maladies :', d.detailsMaladies, 34, 140, ML+2]]);
    }

    const santeH = calcH(santeRows);
    cy = drawBox(doc, 'PROFIL MEDICAL', ML, Y, CW, santeH);
    for (const group of santeRows) {
      let maxLines = 1;
      for (const [label, value, labelW, maxW, x] of group) {
        const lines = doc.splitTextToSize(fmt(value), maxW||55);
        if (lines.length > maxLines) maxLines = lines.length;
        fld(doc, label, value, x, cy, labelW, maxW);
      }
      cy += maxLines * LINE;
    }
    Y += santeH + GAP;

  } else if (contract.type === 'Vol' && contract.volData) {
    const d = contract.volData;

    const volRows = [
      [['Destination :', d.destination, 24, 60, ML+2], ['Type de voyage :', d.typeVoyage, 30, 40, ML+100]],
      [['Voyage avec :', d.voyageAvec, 26, 40, ML+2], ['Type voyageur :', Array.isArray(d.typeVoyageur) ? d.typeVoyageur.join(', ') : d.typeVoyageur, 28, 70, ML+100]],
      [['Date de depart :', fmtDate(d.dateDepart), 30, 35, ML+2], ['Date de retour :', fmtDate(d.dateRetour), 30, 35, ML+100]],
    ];

    const volH = calcH(volRows);
    cy = drawBox(doc, 'INFORMATIONS VOYAGE', ML, Y, CW, volH);
    for (const group of volRows) {
      let maxLines = 1;
      for (const [label, value, labelW, maxW, x] of group) {
        const lines = doc.splitTextToSize(fmt(value), maxW||55);
        if (lines.length > maxLines) maxLines = lines.length;
        fld(doc, label, value, x, cy, labelW, maxW);
      }
      cy += maxLines * LINE;
    }
    Y += volH + GAP;
  }

  /* ── PRIME & PAIEMENT ─────────────────────────────────── */
  const payMode   = contract.paymentMethod==='cash' ? 'Especes' : contract.paymentMethod==='online' ? 'En ligne' : '-';
  const payStatus = contract.paymentStatus==='paid' ? 'Regle' : contract.paymentStatus==='pending_cash' ? 'En attente - Especes' : 'Non regle';
  const cStatus   = contract.status==='active' ? 'ACTIF' : contract.status==='approved' ? 'APPROUVE' : 'EN TRAITEMENT';

  const primeRows = [
    [['Prime annuelle :', fmtMoney(contract.price), 28, 45, ML+2], ['Mode de paiement :', payMode, 34, 30, ML+110]],
    [['Statut paiement :', payStatus, 30, 55, ML+2], ['Statut contrat :', cStatus, 28, 55, ML+110]],
    [["Debut d'effet :", fmtDate(contract.startDate), 28, 30, ML+2], ["Date d'echeance :", fmtDate(contract.endDate), 32, 30, ML+110]],
  ];
  const primeH = calcH(primeRows);
  cy = drawBox(doc, 'PRIME & PAIEMENT', ML, Y, CW, primeH);
  for (const group of primeRows) {
    let maxLines = 1;
    for (const [label, value, labelW, maxW, x] of group) {
      const lines = doc.splitTextToSize(fmt(value), maxW||55);
      if (lines.length > maxLines) maxLines = lines.length;
      fld(doc, label, value, x, cy, labelW, maxW);
    }
    cy += maxLines * LINE;
  }
  Y += primeH + GAP;

  /* ── SIGNATURES ───────────────────────────────────────── */
  // Fetch admin signature
  const adminSigB64 = await fetchAdminSignature();

  const sigH = 38;
  cy = drawBox(doc, 'SIGNATURES', ML, Y, CW, sigH);
  // vertical divider
  doc.setLineWidth(0.3); blk(doc);
  doc.line(ML+CW/2, Y+6, ML+CW/2, Y+sigH);

  doc.setFont('helvetica','normal'); doc.setFontSize(7); blk(doc);

  // Left — client signature
  doc.text('Le Souscripteur', ML+4, cy+2);
  doc.text('(Lu et approuve - Signature)', ML+4, cy+7);
  if (contract.clientSignature) {
    try {
      doc.addImage(contract.clientSignature, 'PNG', ML+4, cy+9, 70, 18);
    } catch(e) {}
  } else {
    doc.setFont('helvetica','italic'); doc.setFontSize(6.5);
    doc.setTextColor(180,180,180);
    doc.text('Non signe', ML+4, cy+20);
    blk(doc);
  }
  if (contract.signedAt) {
    doc.setFont('helvetica','normal'); doc.setFontSize(6); blk(doc);
    const sigDate = new Date(contract.signedAt);
    const sigDateStr = sigDate.getFullYear()+'-'+String(sigDate.getMonth()+1).padStart(2,'0')+'-'+String(sigDate.getDate()).padStart(2,'0');
    doc.text('Signe le : ' + sigDateStr, ML+4, cy+30);
  }

  // Right — admin/company signature
  doc.setFont('helvetica','normal'); doc.setFontSize(7); blk(doc);
  doc.text('SmartAssur - Cachet', ML+CW/2+4, cy+2);
  if (adminSigB64) {
    try {
      doc.addImage(adminSigB64, 'PNG', ML+CW/2+4, cy+9, 70, 18);
    } catch(e) {}
  } else {
    doc.setFont('helvetica','italic'); doc.setFontSize(6.5);
    doc.setTextColor(180,180,180);
    doc.text('Cachet en attente', ML+CW/2+4, cy+20);
    blk(doc);
  }

  Y += sigH + 3;

  /* ── LEGAL FOOTER ─────────────────────────────────────── */
  doc.setFont('helvetica','italic'); doc.setFontSize(6.5); blk(doc);
  doc.text(
    'Ce document est etabli conformement aux dispositions du Code des Assurances tunisien. ' +
    'Toute fausse declaration entraine la nullite du contrat.',
    PW/2, Y, {align:'center', maxWidth: CW}
  );

  doc.save('Contrat_' + TYPE_LABEL + '_' + fmt(contract.numeroContrat || contract._id) + '.pdf');
}