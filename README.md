# 🛡️ SmartAssur

> Une plateforme complète de gestion d'assurance permettant aux clients de souscrire des contrats, gérer leurs sinistres, suivre leurs paiements et communiquer avec leur assureur — le tout en un seul endroit.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?logo=mongodb&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-integrated-635BFF?logo=stripe&logoColor=white)

---

## 📖 Présentation

SmartAssur est une application web d'assurance conçue pour le marché tunisien. Elle prend en charge trois types de couverture — **Auto**, **Vie** et **Vol (Voyage)** — avec des espaces dédiés aux clients et aux administrateurs. Les clients souscrivent en ligne, téléversent leurs documents, signent leurs contrats numériquement et règlent par carte ou en espèces. Les administrateurs supervisent l'intégralité du cycle de vie de chaque contrat, sinistre et réclamation.

---

## ⚡ Stack Technique

| 🗂️ Couche | 🛠️ Technologie |
|---|---|
| 🎨 Frontend | Next.js 14, React 18, Tailwind CSS |
| ⚙️ Backend | Node.js, Express.js |
| 🗄️ Base de données | MongoDB |
| 💳 Paiements | Stripe |
| 📧 Email | Nodemailer (Gmail SMTP) |
| 📚 Documentation API | Swagger UI |

---

## ✨ Fonctionnalités

### 👤 Espace Client
- 📝 **Inscription & Vérification email** — création de compte avec confirmation par code OTP
- 📄 **Souscription de contrat** — formulaire guidé pour les contrats Auto, Vie et Vol
- 📎 **Téléversement de documents** — joindre les pièces justificatives requises par contrat
- ✍️ **Signature numérique** — signer les contrats directement depuis le navigateur
- 💳 **Paiements** — régler en ligne via Stripe ou déclarer un paiement en espèces
- 📥 **Reçus PDF** — télécharger les récapitulatifs de contrat et de paiement en PDF
- 🚨 **Sinistres** — déclarer et suivre des sinistres avec pièces jointes photo
- 🗣️ **Réclamations** — soumettre une réclamation et suivre sa résolution
- 📰 **Actualités** — consulter les annonces publiées par l'équipe administrative
- 👤 **Profil** — mettre à jour ses informations personnelles et sa photo de profil

### 🔧 Tableau de Bord Administrateur
- 📊 **Statistiques** — vue d'ensemble visuelle des utilisateurs, contrats, paiements et sinistres
- 👥 **Gestion des utilisateurs** — consulter et inspecter tous les comptes inscrits
- 📑 **Gestion des contrats** — examiner, approuver ou rejeter les contrats, définir les tarifs et laisser des notes
- ⚠️ **Gestion des sinistres** — mettre à jour le statut des sinistres avec commentaires
- 🧾 **Gestion des réclamations** — répondre aux réclamations clients et les clôturer
- 🗞️ **Gestion des actualités** — publier et gérer les articles d'information
- 🖊️ **Signature admin** — téléverser une signature utilisée dans les PDFs générés

---

## 🚀 Installation

### 📋 Prérequis

- ✅ Node.js ≥ 18
- ✅ MongoDB (local ou Atlas)
- ✅ Un compte Stripe
- ✅ Un compte Gmail avec un mot de passe d'application

### 🔧 Mise en place

```bash
# 📦 Installer les dépendances du backend
cd backend && npm install

# 📦 Installer les dépendances du frontend
cd ../frontend && npm install
```

Configurez vos variables d'environnement (voir ci-dessous), puis créez le compte administrateur :

```bash
cd backend && npm run create-admin
```

### ▶️ Lancement

```bash
# 🖥️ Backend (http://localhost:5000)
cd backend && npm run dev

# 🌐 Frontend (http://localhost:3000)
cd frontend && npm run dev
```

La documentation de l'API est disponible sur `http://localhost:5000/api-docs` 📚

---

## 🔑 Variables d'Environnement

### 🖥️ Backend — `backend/.env`

| 🔧 Variable | 📄 Description |
|---|---|
| `PORT` | 🌐 Port du serveur |
| `MONGODB_URI` | 🗄️ Chaîne de connexion MongoDB |
| `JWT_SECRET` | 🔒 Clé secrète pour les tokens d'authentification |
| `ADMIN_EMAIL` | 📧 Email du compte administrateur (utilisé par le script de seed) |
| `ADMIN_PASSWORD` | 🔑 Mot de passe du compte administrateur |
| `EMAIL_USER` | 📬 Adresse Gmail pour l'envoi des emails |
| `EMAIL_PASS` | 🔐 Mot de passe d'application Gmail |
| `STRIPE_SECRET_KEY` | 💳 Clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | 🪝 Secret de signature du webhook Stripe |
| `FRONTEND_URL` | 🔗 URL du frontend utilisée dans les redirections Stripe |

### 🌐 Frontend — `frontend/.env`

| 🔧 Variable | 📄 Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | 🔗 URL de base de l'API backend |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 💳 Clé publique Stripe |

> 💡 Un fichier `.env.example` est disponible à la racine du backend comme point de départ.

---

## 🗄️ Modèles de Données

L'application repose sur six modèles principaux : 👤 **User**, 📄 **Contract**, 🚨 **Claim**, 💳 **Payment**, 🗣️ **Reclamation** et 📰 **News**.

---

## 💳 Flux de Paiement

Les clients peuvent régler leurs contrats approuvés de deux façons :

- 🌐 **En ligne** — redirigé vers la page de paiement Stripe ; le contrat est activé automatiquement après confirmation du paiement.
- 💵 **En espèces** — le client déclare son intention en ligne, puis se rend en agence pour régler. L'administrateur confirme le paiement manuellement depuis le tableau de bord.

> 📧 Dans les deux cas, un email de confirmation est envoyé au client une fois le paiement validé.

---

## 📧 Notifications Email

Des emails automatiques sont envoyés aux clients pour les événements suivants :

| 🔔 Déclencheur | 📨 Contenu |
|---|---|
| 🆕 Inscription | Code OTP de vérification email |
| 🔁 Réinitialisation du mot de passe | Code de réinitialisation (valable 15 minutes) |
| 📄 Mise à jour du statut du contrat | Nouveau statut et note de l'administrateur |
| ✅ Paiement confirmé | Récapitulatif du paiement |
| 🚨 Mise à jour du statut du sinistre | Nouveau statut et commentaire administrateur |
| 🗣️ Réclamation résolue | Statut de résolution et réponse de l'administrateur |
