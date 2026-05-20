/**
 * signatureController.js
 * Admin uploads their signature once → stored as a file on disk.
 * GET  /api/signature/admin  → returns base64 of the signature image (any user can fetch it to embed in PDF)
 * POST /api/signature/admin  → admin uploads a new signature image (replaces old one)
 */

const path = require('path');
const fs   = require('fs');

const SIG_PATH = path.join(__dirname, '../uploads/admin-signature.png');

// GET — return admin signature as base64 (used by frontend PDF generator)
const getAdminSignature = (req, res) => {
  try {
    if (!fs.existsSync(SIG_PATH)) {
      return res.json({ signature: null });
    }
    const data = fs.readFileSync(SIG_PATH);
    const b64  = 'data:image/png;base64,' + data.toString('base64');
    res.json({ signature: b64 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST — admin uploads new signature (multipart, field name: "file")
const uploadAdminSignature = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu' });

    // multer already saved the file; rename/move it to the fixed SIG_PATH
    fs.renameSync(req.file.path, SIG_PATH);

    // Return it as base64 immediately
    const data = fs.readFileSync(SIG_PATH);
    const b64  = 'data:image/png;base64,' + data.toString('base64');
    res.json({ message: 'Signature admin enregistrée', signature: b64 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAdminSignature, uploadAdminSignature };
