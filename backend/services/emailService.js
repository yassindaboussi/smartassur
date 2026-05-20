const nodemailer = require('nodemailer');

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate a 6-digit verification token
const generateVerificationToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
const sendVerificationEmail = async (email, token) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'SmartAssur - Vérification de votre email',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #0052cc; margin: 0;">SmartAssur</h2>
            <p style="color: #666; margin: 5px 0;">Vérification de votre compte</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h3 style="color: #333; margin-bottom: 20px;">Votre code de vérification</h3>
            <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block; border: 2px solid #0052cc;">
              <span style="font-size: 32px; font-weight: bold; color: #0052cc; letter-spacing: 5px;">${token}</span>
            </div>
                      </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>Important:</strong> Ne partagez jamais ce code avec qui que ce soit. Notre équipe ne vous demandera jamais ce code par téléphone ou email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              Si vous n'avez pas demandé cette vérification, veuillez ignorer cet email.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, token) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'SmartAssur - Réinitialisation de votre mot de passe',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #0052cc; margin: 0;">SmartAssur</h2>
            <p style="color: #666; margin: 5px 0;">Réinitialisation du mot de passe</p>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h3 style="color: #333; margin-bottom: 20px;">Votre code de réinitialisation</h3>
            <p style="color: #666; margin-bottom: 20px;">Ce code est valable pendant <strong>15 minutes</strong>.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block; border: 2px solid #0052cc;">
              <span style="font-size: 32px; font-weight: bold; color: #0052cc; letter-spacing: 5px;">${token}</span>
            </div>
          </div>
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>Important:</strong> Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            </p>
          </div>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

// Send payment success email
const sendPaymentSuccessEmail = async (email, username, payment, contract) => {
  try {
    const amount = payment.amount || contract.price || 0;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'SmartAssur - Confirmation de paiement',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #0052cc; margin: 0;">SmartAssur</h2>
            <p style="color: #666; margin: 5px 0;">Confirmation de paiement</p>
          </div>

          <div style="background: #f0fff4; padding: 25px; border-radius: 10px; border-left: 4px solid #28a745; margin-bottom: 25px;">
            <h3 style="color: #155724; margin: 0 0 10px;">✅ Paiement effectué avec succès !</h3>
            <p style="color: #333; margin: 0;">Bonjour <strong>${username}</strong>, votre paiement a bien été reçu.</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="color: #333; margin: 0 0 15px;">Détails du paiement</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Contrat N°</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${contract.numeroContrat || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Type d'assurance</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${contract.type}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Montant payé</td>
                <td style="padding: 8px 0; color: #0052cc; font-weight: bold; font-size: 18px;">${amount.toFixed(2)} €</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Date</td>
                <td style="padding: 8px 0; color: #333;">${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Statut du contrat</td>
                <td style="padding: 8px 0;"><span style="background: #28a745; color: white; padding: 3px 10px; border-radius: 12px; font-size: 13px;">Actif</span></td>
              </tr>
            </table>
          </div>

          <p style="color: #555; font-size: 14px;">Votre contrat est désormais actif. Vous pouvez consulter les détails dans votre espace client.</p>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; margin: 0; font-size: 12px;">SmartAssur — Votre assurance intelligente</p>
          </div>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending payment success email:', error);
    return false;
  }
};

// Send contract status change email
const sendContractStatusEmail = async (email, username, contract) => {
  try {
    const statusMap = {
      pending:  { label: 'En attente',  color: '#ffc107', bg: '#fff8e1', text: 'Votre dossier est en cours d\'examen par notre équipe.' },
      approved: { label: 'Approuvé',    color: '#28a745', bg: '#f0fff4', text: 'Félicitations ! Votre contrat a été approuvé. Vous pouvez maintenant procéder au paiement.' },
      rejected: { label: 'Rejeté',      color: '#dc3545', bg: '#fff5f5', text: 'Nous sommes désolés, votre contrat a été rejeté. Veuillez contacter notre support pour plus d\'informations.' },
      active:   { label: 'Actif',       color: '#0052cc', bg: '#e8f0fe', text: 'Votre contrat est maintenant actif. Vous êtes couvert(e) !' },
    };
    const s = statusMap[contract.status] || { label: contract.status, color: '#666', bg: '#f8f9fa', text: '' };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `SmartAssur - Statut de votre contrat mis à jour : ${s.label}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #0052cc; margin: 0;">SmartAssur</h2>
            <p style="color: #666; margin: 5px 0;">Mise à jour de votre contrat</p>
          </div>

          <div style="background: ${s.bg}; padding: 25px; border-radius: 10px; border-left: 4px solid ${s.color}; margin-bottom: 25px;">
            <h3 style="color: ${s.color}; margin: 0 0 10px;">Statut mis à jour</h3>
            <p style="color: #333; margin: 0 0 8px;">Bonjour <strong>${username}</strong>,</p>
            <p style="color: #555; margin: 0;">${s.text}</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="color: #333; margin: 0 0 15px;">Détails du contrat</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Contrat N°</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${contract.numeroContrat || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Type d'assurance</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${contract.type}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Nouveau statut</td>
                <td style="padding: 8px 0;"><span style="background: ${s.color}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 13px;">${s.label}</span></td>
              </tr>
              ${contract.adminNote ? `<tr><td style="padding: 8px 0; color: #666; vertical-align: top;">Note de l'admin</td><td style="padding: 8px 0; color: #333;">${contract.adminNote}</td></tr>` : ''}
            </table>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; margin: 0; font-size: 12px;">SmartAssur — Votre assurance intelligente</p>
          </div>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending contract status email:', error);
    return false;
  }
};

// Send sinistre (claim) status change email
const sendClaimStatusEmail = async (email, username, claim) => {
  try {
    const statusMap = {
      'en attente': { label: 'En attente',  color: '#ffc107', bg: '#fff8e1', text: 'Votre sinistre est en attente de traitement.' },
      'en cours':   { label: 'En cours',    color: '#17a2b8', bg: '#e8f7fa', text: 'Votre sinistre est actuellement en cours de traitement par notre équipe.' },
      'approuvé':   { label: 'Approuvé',    color: '#28a745', bg: '#f0fff4', text: 'Bonne nouvelle ! Votre sinistre a été approuvé. Notre équipe vous contactera prochainement.' },
      'refusé':     { label: 'Refusé',      color: '#dc3545', bg: '#fff5f5', text: 'Nous sommes désolés, votre sinistre a été refusé. Veuillez contacter notre support pour plus d\'informations.' },
    };
    const s = statusMap[claim.status] || { label: claim.status, color: '#666', bg: '#f8f9fa', text: '' };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `SmartAssur - Statut de votre sinistre mis à jour : ${s.label}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #0052cc; margin: 0;">SmartAssur</h2>
            <p style="color: #666; margin: 5px 0;">Mise à jour de votre sinistre</p>
          </div>

          <div style="background: ${s.bg}; padding: 25px; border-radius: 10px; border-left: 4px solid ${s.color}; margin-bottom: 25px;">
            <h3 style="color: ${s.color}; margin: 0 0 10px;">Statut du sinistre mis à jour</h3>
            <p style="color: #333; margin: 0 0 8px;">Bonjour <strong>${username}</strong>,</p>
            <p style="color: #555; margin: 0;">${s.text}</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="color: #333; margin: 0 0 15px;">Détails du sinistre</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Nouveau statut</td>
                <td style="padding: 8px 0;"><span style="background: ${s.color}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 13px;">${s.label}</span></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Date de mise à jour</td>
                <td style="padding: 8px 0; color: #333;">${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
              </tr>
              ${claim.adminComment ? `<tr><td style="padding: 8px 0; color: #666; vertical-align: top;">Commentaire admin</td><td style="padding: 8px 0; color: #333;">${claim.adminComment}</td></tr>` : ''}
            </table>
          </div>

          <p style="color: #555; font-size: 14px;">Connectez-vous à votre espace client pour suivre l'évolution de votre dossier.</p>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; margin: 0; font-size: 12px;">SmartAssur — Votre assurance intelligente</p>
          </div>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending claim status email:', error);
    return false;
  }
};

// Send reclamation status change email
const sendReclamationStatusEmail = async (email, username, reclamation) => {
  try {
    const statusMap = {
      'en attente': { label: 'En attente', color: '#ffc107', bg: '#fff8e1', text: 'Votre réclamation est en attente de traitement.' },
      'en cours':   { label: 'En cours',   color: '#17a2b8', bg: '#e8f7fa', text: 'Votre réclamation est en cours de traitement par notre équipe.' },
      'résolu':     { label: 'Résolu',     color: '#28a745', bg: '#f0fff4', text: 'Votre réclamation a été résolue. Merci de votre confiance.' },
    };
    const s = statusMap[reclamation.status] || { label: reclamation.status, color: '#666', bg: '#f8f9fa', text: '' };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `SmartAssur - Statut de votre réclamation mis à jour : ${s.label}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #0052cc; margin: 0;">SmartAssur</h2>
            <p style="color: #666; margin: 5px 0;">Mise à jour de votre réclamation</p>
          </div>

          <div style="background: ${s.bg}; padding: 25px; border-radius: 10px; border-left: 4px solid ${s.color}; margin-bottom: 25px;">
            <h3 style="color: ${s.color}; margin: 0 0 10px;">Statut de la réclamation mis à jour</h3>
            <p style="color: #333; margin: 0 0 8px;">Bonjour <strong>${username}</strong>,</p>
            <p style="color: #555; margin: 0;">${s.text}</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="color: #333; margin: 0 0 15px;">Détails de la réclamation</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Objet</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${reclamation.subject}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Nouveau statut</td>
                <td style="padding: 8px 0;"><span style="background: ${s.color}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 13px;">${s.label}</span></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Date de mise à jour</td>
                <td style="padding: 8px 0; color: #333;">${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
              </tr>
              ${reclamation.adminResponse ? `<tr><td style="padding: 8px 0; color: #666; vertical-align: top;">Réponse de l'admin</td><td style="padding: 8px 0; color: #333;">${reclamation.adminResponse}</td></tr>` : ''}
            </table>
          </div>

          <p style="color: #555; font-size: 14px;">Consultez votre espace client pour plus de détails sur votre réclamation.</p>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; margin: 0; font-size: 12px;">SmartAssur — Votre assurance intelligente</p>
          </div>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending reclamation status email:', error);
    return false;
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPaymentSuccessEmail,
  sendContractStatusEmail,
  sendClaimStatusEmail,
  sendReclamationStatusEmail,
};
