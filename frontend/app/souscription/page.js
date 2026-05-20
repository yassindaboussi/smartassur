'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Car, HeartPulse, Plane, ArrowLeft, ArrowRight, CheckCircle,
  Shield, ChevronRight, AlertCircle, Save, Calculator, Info, XCircle
} from 'lucide-react';
import api from '../../lib/api';

const CAR_MODELS = [
  // Volkswagen
  'Volkswagen Golf', 'Volkswagen Polo', 'Volkswagen Passat', 'Volkswagen T-Roc', 'Volkswagen Tiguan', 'Volkswagen Touareg', 'Volkswagen T-Cross', 'Volkswagen Arteon',
  'Volkswagen ID.3', 'Volkswagen ID.4', 'Volkswagen ID.5', 'Volkswagen ID.Buzz', 'Volkswagen Taigo', 'Volkswagen Up!',
  // Renault
  'Renault Symbol', 'Renault Clio', 'Renault Megane', 'Renault Logan', 'Renault Captur', 'Renault Kadjar', 'Renault Koleos', 'Renault Scenic', 'Renault Austral', 'Renault Duster',
  'Renault Zoe', 'Renault Twingo', 'Renault Talisman', 'Renault Espace', 'Renault Arkana', 'Renault Megane E-Tech',
  // Peugeot
  'Peugeot 208', 'Peugeot 301', 'Peugeot 308', 'Peugeot 2008', 'Peugeot 3008', 'Peugeot 5008', 'Peugeot 408', 'Peugeot 508',
  'Peugeot 108', 'Peugeot 107', 'Peugeot 1007', 'Peugeot Rifter', 'Peugeot Partner', 'Peugeot 508 SW',
  // Toyota
  'Toyota Yaris', 'Toyota Corolla', 'Toyota Rav4', 'Toyota Hilux', 'Toyota Land Cruiser', 'Toyota C-HR', 'Toyota Fortuner',
  'Toyota Aygo', 'Toyota Supra', 'Toyota GR86', 'Toyota Yaris Cross', 'Toyota Highlander', 'Toyota Prius', 'Toyota Camry',
  // Hyundai
  'Hyundai i10', 'Hyundai i20', 'Hyundai Accent', 'Hyundai Elantra', 'Hyundai Tucson', 'Hyundai Santa Fe', 'Hyundai Creta', 'Hyundai Kona',
  'Hyundai i30', 'Hyundai Bayon', 'Hyundai Santa Cruz', 'Hyundai Palisade', 'Hyundai Nexo', 'Hyundai Ioniq 5', 'Hyundai Ioniq 6',
  // Kia
  'Kia Picanto', 'Kia Rio', 'Kia Cerato', 'Kia Sportage', 'Kia Sorento', 'Kia Stonic', 'Kia Seltos',
  'Kia Ceed', 'Kia ProCeed', 'Kia XCeed', 'Kia Niro', 'Kia EV6', 'Kia Soul', 'Kia Carnival', 'Kia Telluride',
  // Ford
  'Ford Fiesta', 'Ford Focus', 'Ford Mondeo', 'Ford Puma', 'Ford Kuga', 'Ford Ranger', 'Ford Escape',
  'Ford Mustang Mach-E', 'Ford Transit', 'Ford Tourneo', 'Ford Bronco', 'Ford Explorer', 'Ford Mustang', 'Ford Edge',
  // Dacia
  'Dacia Sandero', 'Dacia Logan', 'Dacia Duster', 'Dacia Jogger', 'Dacia Spring',
  'Dacia Dokker', 'Dacia Lodgy', 'Dacia Solenza',
  // Fiat
  'Fiat Punto', 'Fiat Tipo', 'Fiat 500', 'Fiat Panda', 'Fiat Doblo', 'Fiat 500X',
  'Fiat 500L', 'Fiat Ducato', 'Fiat Bravo', 'Fiat Barchetta', 'Fiat Freemont', 'Fiat 500E',
  // Seat
  'Seat Ibiza', 'Seat Leon', 'Seat Ateca', 'Seat Arona', 'Seat Tarraco',
  'Seat Mii', 'Seat Toledo', 'Seat Alhambra', 'Seat Exeo',
  // Skoda
  'Skoda Fabia', 'Skoda Octavia', 'Skoda Superb', 'Skoda Karoq', 'Skoda Kodiaq', 'Skoda Kamiq',
  'Skoda Scala', 'Skoda Enyaq iV', 'Skoda Rapid', 'Skoda Yeti', 'Skoda Citigo', 'Skoda Roomster',
  // Citroën
  'Citroën C3', 'Citroën C4', 'Citroën C5', 'Citroën C3 Aircross', 'Citroën C5 Aircross', 'Citroën C4 Cactus',
  'Citroën C1', 'Citroën C2', 'Citroën C6', 'Citroën DS3', 'Citroën DS4', 'Citroën DS5', 'Citroën Berlingo',
  // Mercedes
  'Mercedes Classe A', 'Mercedes Classe B', 'Mercedes Classe C', 'Mercedes Classe E', 'Mercedes GLA', 'Mercedes GLC', 'Mercedes GLB',
  'Mercedes Classe S', 'Mercedes GLE', 'Mercedes GLS', 'Mercedes EQC', 'Mercedes EQE', 'Mercedes EQS', 'Mercedes Vito', 'Mercedes Sprinter',
  // BMW
  'BMW Série 1', 'BMW Série 2', 'BMW Série 3', 'BMW Série 5', 'BMW X1', 'BMW X3', 'BMW X5', 'BMW X2',
  'BMW Série 4', 'BMW Série 6', 'BMW Série 7', 'BMW X4', 'BMW X6', 'BMW X7', 'BMW i3', 'BMW i4', 'BMW iX', 'BMW iX3', 'BMW Z4', 'BMW M2', 'BMW M3', 'BMW M4',
  // Audi
  'Audi A1', 'Audi A3', 'Audi A4', 'Audi A6', 'Audi Q2', 'Audi Q3', 'Audi Q5', 'Audi Q7',
  'Audi A5', 'Audi A7', 'Audi A8', 'Audi Q8', 'Audi e-tron', 'Audi e-tron GT', 'Audi RS3', 'Audi RS5', 'Audi RS6', 'Audi RS7',
  // Nissan
  'Nissan Micra', 'Nissan Sunny', 'Nissan Qashqai', 'Nissan Juke', 'Nissan X-Trail', 'Nissan Navara', 'Nissan Patrol',
  'Nissan Leaf', 'Nissan Ariya', 'Nissan Note', 'Nissan Pulsar', 'Nissan GT-R', 'Nissan 370Z',
  // Chevrolet
  'Chevrolet Spark', 'Chevrolet Aveo', 'Chevrolet Cruze', 'Chevrolet Captiva',
  'Chevrolet Onix', 'Chevrolet Malibu', 'Chevrolet Camaro', 'Chevrolet Corvette', 'Chevrolet Equinox', 'Chevrolet Trailblazer', 'Chevrolet Silverado',
  // Suzuki
  'Suzuki Swift', 'Suzuki Celerio', 'Suzuki Baleno', 'Suzuki Vitara', 'Suzuki Ertiga', 'Suzuki Jimny',
  'Suzuki Ignis', 'Suzuki S-Cross', 'Suzuki Grand Vitara', 'Suzuki Alto', 'Suzuki Wagon R',
  // Honda
  'Honda Jazz', 'Honda Civic', 'Honda Accord', 'Honda CR-V', 'Honda HR-V',
  'Honda e', 'Honda NSX', 'Honda S2000', 'Honda Pilot', 'Honda Ridgeline', 'Honda Odyssey',
  // Mazda
  'Mazda 2', 'Mazda 3', 'Mazda 6', 'Mazda CX-3', 'Mazda CX-5', 'Mazda CX-30',
  'Mazda MX-5', 'Mazda CX-60', 'Mazda CX-90', 'Mazda RX-8', 'Mazda BT-50',
  // Mitsubishi
  'Mitsubishi Mirage', 'Mitsubishi ASX', 'Mitsubishi Outlander', 'Mitsubishi Pajero', 'Mitsubishi L200',
  'Mitsubishi Colt', 'Mitsubishi Eclipse Cross', 'Mitsubishi Space Star', 'Mitsubishi Grandis', 'Mitsubishi i-MiEV',
  // Opel
  'Opel Corsa', 'Opel Astra', 'Opel Insignia', 'Opel Crossland', 'Opel Grandland',
  'Opel Mokka', 'Opel Zafira', 'Opel Adam', 'Opel Karl', 'Opel Ampera-e', 'Opel Combo', 'Opel Vivaro',
  // Jeep
  'Jeep Renegade', 'Jeep Compass', 'Jeep Cherokee', 'Jeep Wrangler',
  'Jeep Grand Cherokee', 'Jeep Gladiator', 'Jeep Avenger', 'Jeep Commander',
  // Land Rover
  'Range Rover Evoque', 'Range Rover Sport', 'Land Rover Discovery', 'Range Rover Velar',
  'Range Rover', 'Land Rover Defender', 'Land Rover Discovery Sport', 'Range Rover PHEV',
  // Chinese brands (important for modern markets)
  'Chery Tiggo 2', 'Chery Tiggo 7', 'Chery Tiggo 8', 'Geely GX3', 'Geely Coolray', 'Geely Geometry', 'MG ZS', 'MG RX5', 'MG HS', 'BYD Atto 3', 'Changan CS35', 'Haval H6',
  'BYD Dolphin', 'BYD Seal', 'BYD Han', 'MG 4', 'MG5', 'Nio ES6', 'Nio ET5', 'XPeng P7', 'XPeng G3', 'Lynk & Co 01', 'Lynk & Co 03', 'Great Wall Ora', 'Great Wall Tank 300',
  // Luxury / Premium
  'Porsche Cayenne', 'Porsche Macan', 'Tesla Model 3', 'Tesla Model Y', 'Volvo XC40', 'Volvo XC60',
  'Porsche 911', 'Porsche Taycan', 'Porsche Panamera', 'Porsche Boxster', 'Porsche Cayman', 'Tesla Model S', 'Tesla Model X', 'Tesla Cybertruck', 'Volvo XC90', 'Volvo S60', 'Volvo S90', 'Volvo V60', 'Volvo V90', 'Volvo C40 Recharge', 'Lexus RX', 'Lexus NX', 'Lexus UX', 'Lexus ES', 'Lexus LC', 'Lexus LS', 'Lexus LX',
  // Others
  'Autre',
];

const TUNISIAN_BANKS = [
  'Banque Nationale Agricole (BNA)',
  'Société Tunisienne de Banque (STB)',
  'Banque de l\'Habitat (BH)',
  'Banque Internationale Arabe de Tunisie (BIAT)',
  'Attijari Bank Tunisie',
  'Amen Bank',
  'Arab Tunisian Bank (ATB)',
  'Banque de Tunisie (BT)',
  'Union Internationale de Banques (UIB)',
  'Union Bancaire pour le Commerce et l\'Industrie (UBCI)',
  'Banque de Tunisie et des Émirats (BTE)',
  'Banque Tuniso-Koweïtienne (BTK)',
  'QNB Tunisie',
  'Zitouna Bank',
  'Al Baraka Bank Tunisie',
  'Wifak International Bank',
  'Enda Tamweel',
  'Banque Postale',
  'Citi Bank Tunisie',
  'Crédit Agricole Indosuez Tunisie',
  'Société Générale Tunisie',
  'Tunisian Saudi Bank (TSB)',
  'Autre',
];

const COUNTRIES = [
  // Afrique du Nord
  'Tunisie','Algérie','Maroc','Libye','Égypte',
  // Afrique Subsaharienne
  'Sénégal','Côte d\'Ivoire','Mali','Burkina Faso','Cameroun','Gabon','Ghana','Nigeria',
  // Europe
  'France','Allemagne','Espagne','Italie','Belgique','Suisse','Royaume-Uni','Portugal','Pays-Bas','Autriche','Grèce','Suède','Danemark','Norvège','Finlande','Pologne',
  // Moyen-Orient
  'Turquie','Arabie Saoudite','Émirats Arabes Unis','Qatar','Koweït','Bahreïn','Oman','Jordanie','Liban',
  // Amérique
  'Canada','États-Unis','Mexique','Brésil','Argentine',
  // Asie
  'Chine','Japon','Corée du Sud','Inde','Thaïlande','Malaisie','Indonésie','Vietnam','Singapour',
  // Autres
  'Australie','Afrique du Sud','Russie','Autre',
];

// ─── CARTES D'ASSURANCE (STYLE MIS À JOUR) ──────────────────────────────────
const ASSURANCE_TYPES = [
  {
    id: 'Auto',
    title: 'Assurance Automobile',
    icon: Car,
    description: 'Protection adaptée à votre véhicule',
    color: 'primary'
  },
  {
    id: 'Vie',
    title: 'Assurance Vie',
    icon: HeartPulse,
    description: 'Préservez votre avenir financier',
    color: 'success'
  },
  {
    id: 'Vol',
    title: 'Assurance Voyage',
    icon: Plane,
    description: 'Voyagez en toute tranquillité',
    color: 'accent'
  },
];

// ─── HELPERS ──────────────────────────────────────────────────
function Toggle({ checked, onChange, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
      <span style={{ fontSize: 14, color: 'var(--text-2)' }}>{label}</span>
      <button type="button" onClick={() => onChange(!checked)} style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: checked ? 'var(--primary)' : 'var(--border)',
        position: 'relative', transition: 'all 0.2s', flexShrink: 0,
      }}>
        <span style={{
          position: 'absolute', top: 2, left: checked ? 22 : 2,
          width: 20, height: 20, borderRadius: 10,
          background: 'white', transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
        }} />
      </button>
    </div>
  );
}

function SectionHeader({ number, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '24px 0 16px' }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{number}</div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{title}</h3>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}

// Field with inline error display
function Field({ label, required, children, hint, error }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: error ? 'var(--danger)' : 'var(--text-2)', marginBottom: 6 }}>
        {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        {children}
      </div>
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
          <XCircle size={12} color="var(--danger)" />
          <p style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 500 }}>{error}</p>
        </div>
      )}
      {!error && hint && <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

// Returns border style based on error state
function inputStyle(error) {
  return error ? { borderColor: 'var(--danger)', background: 'rgba(255,86,48,0.04)' } : {};
}

// ─── AUTO FORM ────────────────────────────────────────────────
function AutoForm({ data, onChange, errors = {} }) {
  const set = (key, val) => onChange({ ...data, [key]: val });
  return (
    <div>
      <SectionHeader number="1" title="Valeur du véhicule" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <Field label="Modèle" required error={errors.modele}>
          <select className="input-field" style={inputStyle(errors.modele)} value={data.modele || ''} onChange={e => set('modele', e.target.value)}>
            <option value="">Sélectionner un modèle</option>
            {CAR_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="Finition" required error={errors.finition}>
          <select className="input-field" style={inputStyle(errors.finition)} value={data.finition || ''} onChange={e => set('finition', e.target.value)}>
            <option value="">Sélectionner</option>
            <option>Basique</option><option>Intermédiaire</option><option>Haut de gamme</option>
          </select>
        </Field>
        <Field label="Valeur vénale (DT)" required hint="Valeur marchande actuelle" error={errors.valeurVenale}>
          <input type="number" className="input-field" style={inputStyle(errors.valeurVenale)} placeholder="Ex: 35000" min="0" value={data.valeurVenale || ''} onChange={e => set('valeurVenale', e.target.value)} />
        </Field>
        <Field label="Valeur à neuf (DT)" required error={errors.valeurNeuf}>
          <input type="number" className="input-field" style={inputStyle(errors.valeurNeuf)} placeholder="Ex: 45000" min="0" value={data.valeurNeuf || ''} onChange={e => set('valeurNeuf', e.target.value)} />
        </Field>
        <Field label="Numéro / Référence photo" required error={errors.refPhoto}>
          <input type="text" className="input-field" style={inputStyle(errors.refPhoto)} placeholder="Ex: REF-2024-001" value={data.refPhoto || ''} onChange={e => set('refPhoto', e.target.value)} />
        </Field>
      </div>

      <SectionHeader number="2" title="Caractéristiques du véhicule" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <Field label="Kilométrage" required error={errors.kilometrage}>
          <input type="number" className="input-field" style={inputStyle(errors.kilometrage)} placeholder="Ex: 45000" min="0" value={data.kilometrage || ''} onChange={e => set('kilometrage', e.target.value)} />
        </Field>
        <Field label="Boîte de vitesse" required error={errors.boiteVitesse}>
          <select className="input-field" style={inputStyle(errors.boiteVitesse)} value={data.boiteVitesse || ''} onChange={e => set('boiteVitesse', e.target.value)}>
            <option value="">Sélectionner</option>
            <option>Automatique</option><option>Manuelle</option>
          </select>
        </Field>
        <Field label="Nombre de portes" required error={errors.nbPortes}>
          <input type="number" className="input-field" style={inputStyle(errors.nbPortes)} placeholder="Ex: 5" min="2" value={data.nbPortes || ''} onChange={e => set('nbPortes', e.target.value)} />
        </Field>
      </div>

      <SectionHeader number="3" title="Équipements du véhicule" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 0, background: 'var(--surface)', borderRadius: 12, padding: '0 16px', border: '1px solid var(--border)' }}>
        {[
          ['radarRecul','Radar de recul'],['alarme','Système d\'alarme'],
          ['alarmeCeinture','Alarme de ceinture'],['gps','GPS'],
          ['abs','ABS'],['airbags','Airbags'],
        ].map(([key, label]) => (
          <Toggle key={key} checked={!!data[key]} onChange={v => set(key, v)} label={label} />
        ))}
      </div>

      <SectionHeader number="4" title="Stationnement du véhicule" />
      <div style={{ background: 'var(--surface)', borderRadius: 12, padding: '0 16px', border: `1px solid ${errors.typeStationnement ? 'var(--danger)' : 'var(--border)'}`, marginBottom: 16 }}>
        <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: errors.typeStationnement ? 'var(--danger)' : 'var(--text-2)', display: 'block', marginBottom: 8 }}>
            Type de stationnement <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: 12 }}>
            {['Garage', 'Place de parking'].map(opt => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                <input type="radio" name="stationnement" value={opt} checked={data.typeStationnement === opt} onChange={() => set('typeStationnement', opt)} />
                {opt}
              </label>
            ))}
          </div>
          {errors.typeStationnement && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
              <XCircle size={12} color="var(--danger)" />
              <p style={{ fontSize: 11, color: 'var(--danger)' }}>{errors.typeStationnement}</p>
            </div>
          )}
        </div>
        <Toggle checked={!!data.cleDouble} onChange={v => set('cleDouble', v)} label="Avez-vous une clé double du véhicule ?" />
        <Toggle checked={!!data.autreConduct} onChange={v => set('autreConduct', v)} label="Ce véhicule admet-il un autre conducteur ?" />
      </div>

      <SectionHeader number="5" title="Informations permis de conduire" />
      <div style={{ background: 'var(--surface)', borderRadius: 12, padding: '0 16px', border: '1px solid var(--border)', marginBottom: 16 }}>
        <Toggle checked={!!data.permisAppartientAssure} onChange={v => set('permisAppartientAssure', v)} label="Le permis appartient-il à l'assuré ?" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <Field label="Type de permis" required error={errors.typePermis}>
          <select className="input-field" style={inputStyle(errors.typePermis)} value={data.typePermis || ''} onChange={e => set('typePermis', e.target.value)}>
            <option value="">Sélectionner</option>
            <option>Tunisien</option><option>Étranger</option>
          </select>
        </Field>
        <Field label="Catégorie du permis" required error={errors.categoriePermis}>
          <select className="input-field" style={inputStyle(errors.categoriePermis)} value={data.categoriePermis || ''} onChange={e => set('categoriePermis', e.target.value)}>
            <option value="">Sélectionner</option>
            <option>B</option><option>C</option><option>C+E</option><option>D</option><option>D1</option>
          </select>
        </Field>
        <Field label="Numéro du permis" required error={errors.numPermis}>
          <input type="text" className="input-field" style={inputStyle(errors.numPermis)} placeholder="Ex: 12345678" value={data.numPermis || ''} onChange={e => set('numPermis', e.target.value)} />
        </Field>
        <Field label="Date d'obtention du permis" required error={errors.dateObtentionPermis}>
          <input type="date" className="input-field" style={inputStyle(errors.dateObtentionPermis)} value={data.dateObtentionPermis || ''} onChange={e => set('dateObtentionPermis', e.target.value)} />
        </Field>
      </div>
    </div>
  );
}

// ─── VIE FORM ─────────────────────────────────────────────────
function VieForm({ data, onChange, errors = {} }) {
  const set = (key, val) => onChange({ ...data, [key]: val });
  const capital = parseFloat(data.capitalEmprunte) || 0;
  const needAnalyse = capital >= 30000000;

  return (
    <div>
      <SectionHeader number="1" title="Informations du prêt" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        <Field label="Nom de l'assuré" required error={errors.nomAssure}>
          <input type="text" className="input-field" style={inputStyle(errors.nomAssure)} placeholder="Nom" value={data.nomAssure || ''} onChange={e => set('nomAssure', e.target.value)} />
        </Field>
        <Field label="Prénom de l'assuré" required error={errors.prenomAssure}>
          <input type="text" className="input-field" style={inputStyle(errors.prenomAssure)} placeholder="Prénom" value={data.prenomAssure || ''} onChange={e => set('prenomAssure', e.target.value)} />
        </Field>
        <Field label="Date de naissance" required error={errors.dateNaissance}>
          <input type="date" className="input-field" style={inputStyle(errors.dateNaissance)} value={data.dateNaissance || ''} onChange={e => {
            const dob = e.target.value;
            const calcAge = dob ? Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000)) : '';
            onChange({ ...data, dateNaissance: dob, age: calcAge });
          }} />
        </Field>
        <Field label="GSM" required error={errors.gsm} hint="Format: +216 XX XXX XXX">
          <input type="tel" className="input-field" style={inputStyle(errors.gsm)} placeholder="+216 XX XXX XXX" value={data.gsm || ''} onChange={e => set('gsm', e.target.value)} />
        </Field>
        <Field label="E-mail" required error={errors.email}>
          <input type="email" className="input-field" style={inputStyle(errors.email)} placeholder="email@exemple.com" value={data.email || ''} onChange={e => set('email', e.target.value)} />
        </Field>
        <Field label="Capital emprunté (DT)" required error={errors.capitalEmprunte}>
          <input type="number" className="input-field" style={inputStyle(errors.capitalEmprunte)} placeholder="Ex: 50000" min="0" value={data.capitalEmprunte || ''} onChange={e => set('capitalEmprunte', e.target.value)} />
        </Field>
        <Field label="Taux d'intérêt (%)" required hint="Peut être 0" error={errors.tauxInteret}>
          <input type="number" className="input-field" style={inputStyle(errors.tauxInteret)} placeholder="Ex: 7.5" step="0.1" min="0" max="100" value={data.tauxInteret ?? ''} onChange={e => set('tauxInteret', e.target.value)} />
        </Field>
        <Field label="Durée de remboursement (mois)" required error={errors.dureeRemboursement}>
          <input type="number" className="input-field" style={inputStyle(errors.dureeRemboursement)} placeholder="1 à 12 mois" min="1" max="12" value={data.dureeRemboursement || ''} onChange={e => set('dureeRemboursement', e.target.value)} />
        </Field>
        <Field label="Période de franchise (mois)" required error={errors.periodeFranchise}>
          <input type="number" className="input-field" style={inputStyle(errors.periodeFranchise)} placeholder="0 à 12 mois" min="0" max="12" value={data.periodeFranchise || ''} onChange={e => set('periodeFranchise', e.target.value)} />
        </Field>
        <Field label="Périodicité de paiement" required error={errors.periodicite}>
          <select className="input-field" style={inputStyle(errors.periodicite)} value={data.periodicite || ''} onChange={e => set('periodicite', e.target.value)}>
            <option value="">Sélectionner</option>
            <option value="mensuelle">Mensuelle</option>
            <option value="trimestrielle">Trimestrielle</option>
            <option value="semestrielle">Semestrielle</option>
            <option value="annuelle">Annuelle</option>
          </select>
        </Field>
        <Field label="Organisme prêteur" required error={errors.organismePreteur}>
          <select className="input-field" style={inputStyle(errors.organismePreteur)} value={data.organismePreteur || ''} onChange={e => set('organismePreteur', e.target.value)}>
            <option value="">Sélectionner une banque</option>
            {TUNISIAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="Date de début d'effet" required error={errors.dateDebutEffet}>
          <input type="date" className="input-field" style={inputStyle(errors.dateDebutEffet)} value={data.dateDebutEffet || ''} onChange={e => set('dateDebutEffet', e.target.value)} />
        </Field>
      </div>

      {needAnalyse && (
        <div style={{ margin: '16px 0', padding: 16, background: 'rgba(255,171,0,0.1)', border: '1px solid var(--warning)', borderRadius: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <AlertCircle size={18} color="var(--warning)" style={{ flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 700, color: 'var(--warning)', marginBottom: 4 }}>Capital ≥ 30 000 000 DT</p>
              <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Un bilan médical complet sera requis lors du dépôt des documents.</p>
            </div>
          </div>
        </div>
      )}

      <SectionHeader number="2" title="Informations générales de santé" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        <Field label="Âge" error={errors.age} hint="Calculé automatiquement depuis la date de naissance">
          <input type="number" className="input-field" value={data.age || ''} readOnly
            style={{ background: 'var(--surface)', color: data.age ? 'var(--text)' : 'var(--text-3)', cursor: 'not-allowed', opacity: 0.75, ...(errors.age ? { borderColor: 'var(--danger)' } : {}) }} />
        </Field>
        <Field label="Taille (cm)" required error={errors.taille}>
          <input type="number" className="input-field" style={inputStyle(errors.taille)} placeholder="Ex: 175" min="100" max="220" value={data.taille || ''} onChange={e => set('taille', e.target.value)} />
        </Field>
        <Field label="Poids (kg)" required error={errors.poids}>
          <input type="number" className="input-field" style={inputStyle(errors.poids)} placeholder="Ex: 75" min="30" max="300" value={data.poids || ''} onChange={e => set('poids', e.target.value)} />
        </Field>
        <Field label="État de santé général" required error={errors.etatSante}>
          <select className="input-field" style={inputStyle(errors.etatSante)} value={data.etatSante || ''} onChange={e => set('etatSante', e.target.value)}>
            <option value="">Sélectionner</option>
            <option>Excellent</option><option>Bon</option><option>Moyen</option><option>Mauvais</option>
          </select>
        </Field>
      </div>
      <div style={{ background: 'var(--surface)', borderRadius: 12, padding: '0 16px', border: '1px solid var(--border)', marginTop: 12 }}>
        <Toggle checked={!!data.fumeur} onChange={v => set('fumeur', v)} label="Fumez-vous ?" />
        <Toggle checked={!!data.sportRisque} onChange={v => set('sportRisque', v)} label="Pratiquez-vous un sport à risque ?" />
        <Toggle checked={!!data.maladiesChroniques} onChange={v => set('maladiesChroniques', v)} label="Avez-vous des maladies chroniques ? (diabète, tension, cœur...)" />
        <Toggle checked={!!data.operationsChirurgicales} onChange={v => set('operationsChirurgicales', v)} label="Avez-vous déjà subi des opérations chirurgicales ?" />
        <Toggle checked={!!data.medicamentsRegulier} onChange={v => set('medicamentsRegulier', v)} label="Prenez-vous des médicaments de façon régulière ?" />
      </div>
      {data.maladiesChroniques && (
        <div style={{ marginTop: 12 }}>
          <Field label="Détails des maladies chroniques" error={errors.detailsMaladies}>
            <textarea className="input-field" style={{...inputStyle(errors.detailsMaladies), resize: 'vertical'}} rows={2} placeholder="Précisez..." value={data.detailsMaladies || ''} onChange={e => set('detailsMaladies', e.target.value)} />
          </Field>
        </div>
      )}

      <SectionHeader number="3" title="Antécédents médicaux" />
      <div style={{ background: 'var(--surface)', borderRadius: 12, padding: '0 16px', border: '1px solid var(--border)' }}>
        <Toggle checked={!!data.maladiesGraves} onChange={v => set('maladiesGraves', v)} label="Avez-vous eu des maladies graves ? (cancer, problèmes cardiaques...)" />
        <Toggle checked={!!data.hospitalise} onChange={v => set('hospitalise', v)} label="Avez-vous déjà été hospitalisé ?" />
        <Toggle checked={!!data.suiviSpecialiste} onChange={v => set('suiviSpecialiste', v)} label="Êtes-vous suivi par un médecin spécialiste ?" />
      </div>

      <SectionHeader number="4" title="Antécédents familiaux" />
      <div style={{ background: 'var(--surface)', borderRadius: 12, padding: '0 16px', border: '1px solid var(--border)' }}>
        <Toggle checked={!!data.maladiesHereditaires} onChange={v => set('maladiesHereditaires', v)} label="Y a-t-il des maladies héréditaires dans la famille ? (diabète, maladies cardiaques, cancer)" />
      </div>
      {data.maladiesHereditaires && (
        <div style={{ marginTop: 12 }}>
          <Field label="Détails des antécédents familiaux" error={errors.detailsHereditaires}>
            <textarea className="input-field" rows={2} placeholder="Précisez..." value={data.detailsHereditaires || ''} onChange={e => set('detailsHereditaires', e.target.value)} style={{ resize: 'vertical' }} />
          </Field>
        </div>
      )}
    </div>
  );
}

// ─── VOL FORM ─────────────────────────────────────────────────
function VolForm({ data, onChange, errors = {} }) {
  const set = (key, val) => onChange({ ...data, [key]: val });
  return (
    <div>
      <SectionHeader number="1" title="Informations du voyageur" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <Field label="Nom" required error={errors.nom}>
          <input type="text" className="input-field" style={inputStyle(errors.nom)} placeholder="Nom" value={data.nom || ''} onChange={e => set('nom', e.target.value)} />
        </Field>
        <Field label="Prénom" required error={errors.prenom}>
          <input type="text" className="input-field" style={inputStyle(errors.prenom)} placeholder="Prénom" value={data.prenom || ''} onChange={e => set('prenom', e.target.value)} />
        </Field>
        <Field label="Date de naissance" required error={errors.dateNaissance}>
          <input type="date" className="input-field" style={inputStyle(errors.dateNaissance)} value={data.dateNaissance || ''} onChange={e => set('dateNaissance', e.target.value)} />
        </Field>
      </div>

      <SectionHeader number="2" title="Informations du voyage" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <Field label="Date d'effet du contrat" required error={errors.dateEffet}>
          <input type="date" className="input-field" style={inputStyle(errors.dateEffet)} value={data.dateEffet || ''} onChange={e => set('dateEffet', e.target.value)} />
        </Field>
        <Field label="Date de fin du contrat" required error={errors.dateFin}>
          <input type="date" className="input-field" style={inputStyle(errors.dateFin)} value={data.dateFin || ''} onChange={e => set('dateFin', e.target.value)} />
        </Field>
        <Field label="Type de voyage" required error={errors.typeVoyage}>
          <select className="input-field" style={inputStyle(errors.typeVoyage)} value={data.typeVoyage || ''} onChange={e => set('typeVoyage', e.target.value)}>
            <option value="">Sélectionner</option>
            <option>Loisirs</option><option>Études</option><option>Business</option>
          </select>
        </Field>
        <Field label="Voyagez-vous ?" required error={errors.voyageAvec}>
          <select className="input-field" style={inputStyle(errors.voyageAvec)} value={data.voyageAvec || ''} onChange={e => set('voyageAvec', e.target.value)}>
            <option value="">Sélectionner</option>
            <option>Seul</option><option>Accompagné</option>
          </select>
        </Field>
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: errors.typeVoyageur ? 'var(--danger)' : 'var(--text-2)', display: 'block', marginBottom: 8 }}>
          Type de voyageur <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <div style={{ display: 'flex', gap: 16 }}>
          {['Adulte', 'Enfant'].map(type => (
            <label key={type} onClick={() => set('typeVoyageur', type)} style={{
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14,
              padding: '10px 20px',
              background: data.typeVoyageur === type ? 'var(--primary-light)' : 'var(--surface)',
              border: `2px solid ${errors.typeVoyageur ? 'var(--danger)' : data.typeVoyageur === type ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 10, fontWeight: data.typeVoyageur === type ? 700 : 400,
              color: data.typeVoyageur === type ? 'var(--primary)' : 'var(--text-2)',
              transition: 'all 0.15s',
            }}>
              <div style={{
                width: 16, height: 16, borderRadius: 8,
                border: `2px solid ${data.typeVoyageur === type ? 'var(--primary)' : errors.typeVoyageur ? 'var(--danger)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {data.typeVoyageur === type && <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--primary)' }} />}
              </div>
              {type}
            </label>
          ))}
        </div>
        {errors.typeVoyageur && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
            <XCircle size={12} color="var(--danger)" />
            <p style={{ fontSize: 11, color: 'var(--danger)' }}>{errors.typeVoyageur}</p>
          </div>
        )}
      </div>

      <SectionHeader number="3" title="Détails sur le voyage" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <Field label="Date de départ" required error={errors.dateDepart}>
          <input type="date" className="input-field" style={inputStyle(errors.dateDepart)} value={data.dateDepart || ''} onChange={e => set('dateDepart', e.target.value)} />
        </Field>
        <Field label="Date de retour" required error={errors.dateRetour}>
          <input type="date" className="input-field" style={inputStyle(errors.dateRetour)} value={data.dateRetour || ''} onChange={e => set('dateRetour', e.target.value)} />
        </Field>
        <Field label="Destination" required error={errors.destination}>
          <select className="input-field" style={inputStyle(errors.destination)} value={data.destination || ''} onChange={e => set('destination', e.target.value)}>
            <option value="">Sélectionner un pays</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>
    </div>
  );
}

// ─── DEVIS MODAL ──────────────────────────────────────────────
function DevisModal({ price, type, onConfirm, onCancel, loading }) {
  const typeLabel = type === 'Auto' ? 'Automobile' : type === 'Vie' ? 'Vie' : 'Voyage';
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div className="card" style={{ maxWidth: 460, width: '100%', padding: 32, textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: 24, background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Calculator size={36} color="var(--success)" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Votre devis</h2>
        <p style={{ color: 'var(--text-2)', marginBottom: 24, fontSize: 14 }}>Assurance {typeLabel} — Prime annuelle estimée</p>
        <div style={{ background: 'var(--primary-light)', borderRadius: 16, padding: '20px 32px', marginBottom: 24 }}>
          <p style={{ fontSize: 48, fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>{price.toLocaleString('fr-TN', { minimumFractionDigits: 2 })}</p>
          <p style={{ fontSize: 18, color: 'var(--primary)', fontWeight: 600 }}>DT / an</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: 12, background: 'var(--surface)', borderRadius: 10, marginBottom: 24, textAlign: 'left' }}>
          <Info size={16} color="var(--text-3)" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
            Estimation basée sur les informations fournies. Le prix définitif sera confirmé après validation de vos documents.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-outline" onClick={onCancel} style={{ flex: 1 }}>Modifier</button>
          <button className="btn-primary" onClick={onConfirm} disabled={loading} style={{ flex: 1, gap: 8 }}>
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <CheckCircle size={16} />}
            Soumettre
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── VALIDATION RULES ─────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];

function validateAuto(d) {
  const e = {};
  if (!d.modele) e.modele = 'Veuillez sélectionner un modèle';
  if (!d.finition) e.finition = 'Veuillez sélectionner une finition';
  if (!d.valeurVenale || d.valeurVenale <= 0) e.valeurVenale = 'Valeur vénale invalide (doit être > 0)';
  if (!d.valeurNeuf || d.valeurNeuf <= 0) e.valeurNeuf = 'Valeur à neuf invalide (doit être > 0)';
  if (d.valeurVenale && d.valeurNeuf && parseFloat(d.valeurVenale) > parseFloat(d.valeurNeuf))
    e.valeurVenale = 'La valeur vénale ne peut pas dépasser la valeur à neuf';
  if (!d.refPhoto || !d.refPhoto.trim()) e.refPhoto = 'Numéro / Référence photo requis';
  if (!d.kilometrage || d.kilometrage < 0) e.kilometrage = 'Kilométrage requis (≥ 0)';
  if (!d.boiteVitesse) e.boiteVitesse = 'Veuillez sélectionner une boîte de vitesse';
  if (!d.nbPortes || d.nbPortes < 2) e.nbPortes = 'Nombre de portes requis (minimum 2)';
  if (!d.typeStationnement) e.typeStationnement = 'Veuillez choisir un type de stationnement';
  if (!d.typePermis) e.typePermis = 'Type de permis requis';
  if (!d.categoriePermis) e.categoriePermis = 'Catégorie du permis requise';
  if (!d.numPermis || !d.numPermis.trim()) e.numPermis = 'Numéro de permis requis';
  if (!d.dateObtentionPermis) e.dateObtentionPermis = 'Date d\'obtention du permis requise';
  else if (d.dateObtentionPermis > today()) e.dateObtentionPermis = 'La date ne peut pas être dans le futur';
  return e;
}

function validateVie(d) {
  const e = {};
  if (!d.nomAssure || !d.nomAssure.trim()) e.nomAssure = 'Nom requis';
  if (!d.prenomAssure || !d.prenomAssure.trim()) e.prenomAssure = 'Prénom requis';
  if (!d.dateNaissance) e.dateNaissance = 'Date de naissance requise';
  else {
    const age = new Date().getFullYear() - new Date(d.dateNaissance).getFullYear();
    if (age < 18) e.dateNaissance = 'L\'assuré doit avoir au moins 18 ans';
    if (age > 75) e.dateNaissance = 'L\'assuré ne peut pas avoir plus de 75 ans';
  }
  if (!d.gsm || !/^\+?[0-9\s\-\(\)]{7,15}$/.test(d.gsm.replace(/[\s\-\(\)]/g, '')))
    e.gsm = 'Numéro GSM invalide';
  if (!d.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))
    e.email = 'Adresse e-mail invalide';
  if (!d.capitalEmprunte || parseFloat(d.capitalEmprunte) <= 0)
    e.capitalEmprunte = 'Capital emprunté requis (doit être > 0)';
  if (d.tauxInteret === '' || d.tauxInteret === undefined || d.tauxInteret === null)
    e.tauxInteret = 'Taux d\'intérêt requis (entrez 0 si nul)';
  else if (parseFloat(d.tauxInteret) < 0 || parseFloat(d.tauxInteret) > 100)
    e.tauxInteret = 'Taux entre 0 et 100 %';
  if (!d.dureeRemboursement || d.dureeRemboursement < 1 || d.dureeRemboursement > 12)
    e.dureeRemboursement = 'Durée entre 1 et 12 mois';
  if (!d.periodeFranchise && d.periodeFranchise !== 0) e.periodeFranchise = 'Période de franchise requise';
  else if (d.periodeFranchise !== '' && d.periodeFranchise !== undefined) {
    const pf = parseInt(d.periodeFranchise);
    if (pf < 0 || pf > 12) e.periodeFranchise = 'Période entre 0 et 12 mois';
  }
  if (!d.periodicite) e.periodicite = 'Périodicité de paiement requise';
  if (!d.organismePreteur) e.organismePreteur = 'Organisme prêteur requis';
  if (!d.dateDebutEffet) e.dateDebutEffet = 'Date de début d\'effet requise';
  else if (d.dateDebutEffet < today()) e.dateDebutEffet = 'La date de début doit être aujourd\'hui ou dans le futur';
  if (!d.taille || d.taille < 100 || d.taille > 220) e.taille = 'Taille entre 100 et 220 cm';
  if (!d.poids || d.poids < 30 || d.poids > 300) e.poids = 'Poids entre 30 et 300 kg';
  if (!d.etatSante) e.etatSante = 'Veuillez sélectionner l\'état de santé général';
  if (d.maladiesChroniques && !d.detailsMaladies?.trim())
    e.detailsMaladies = 'Veuillez préciser les maladies chroniques';
  return e;
}

function validateVol(d) {
  const e = {};
  if (!d.nom || !d.nom.trim()) e.nom = 'Nom requis';
  if (!d.prenom || !d.prenom.trim()) e.prenom = 'Prénom requis';
  if (!d.dateNaissance) e.dateNaissance = 'Date de naissance requise';
  else if (d.dateNaissance > today()) e.dateNaissance = 'La date ne peut pas être dans le futur';
  if (!d.typeVoyageur) e.typeVoyageur = 'Veuillez sélectionner Adulte ou Enfant';
  if (!d.dateEffet) e.dateEffet = 'Date d\'effet requise';
  else if (d.dateEffet < today()) e.dateEffet = 'La date d\'effet doit être aujourd\'hui ou dans le futur';
  if (!d.dateFin) e.dateFin = 'Date de fin requise';
  else if (d.dateFin && d.dateEffet && d.dateFin < d.dateEffet) e.dateFin = 'La date de fin doit être après la date d\'effet';
  if (!d.typeVoyage) e.typeVoyage = 'Type de voyage requis';
  if (!d.voyageAvec) e.voyageAvec = 'Veuillez indiquer si vous voyagez seul ou accompagné';
  if (!d.dateDepart) e.dateDepart = 'Date de départ requise';
  else if (d.dateDepart < today()) e.dateDepart = 'La date de départ doit être aujourd\'hui ou dans le futur';
  if (!d.dateRetour) e.dateRetour = 'Date de retour requise';
  else if (d.dateRetour && d.dateDepart && d.dateRetour < d.dateDepart)
    e.dateRetour = 'La date de retour doit être après la date de départ';
  if (!d.destination) e.destination = 'Destination requise';
  return e;
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function SouscriptionPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [autoData, setAutoData] = useState({});
  const [vieData, setVieData] = useState({});
  const [volData, setVolData] = useState({});
  const [errors, setErrors] = useState({});
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [showDevis, setShowDevis] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Auto-save draft
  useEffect(() => {
    if (selectedType) {
      localStorage.setItem('souscription_draft', JSON.stringify({ selectedType, autoData, vieData, volData }));
    }
  }, [selectedType, autoData, vieData, volData]);

  // Restore draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem('souscription_draft');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.selectedType) {
          setSelectedType(d.selectedType);
          setAutoData(d.autoData || {});
          setVieData(d.vieData || {});
          setVolData(d.volData || {});
          setStep(1);
        }
      }
    } catch {}
  }, []);

  // Clear errors for a field on change
  const clearError = (key) => {
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const wraponChange = (setter) => (val) => {
    setter(val);
    // Clear errors for any key that now has a value
    Object.keys(val).forEach(k => {
      if (val[k] && errors[k]) clearError(k);
    });
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setErrors({});
    setStep(1);
  };

  const runValidation = () => {
    let e = {};
    if (selectedType === 'Auto') e = validateAuto(autoData);
    if (selectedType === 'Vie') e = validateVie(vieData);
    if (selectedType === 'Vol') e = validateVol(volData);
    setErrors(e);
    return e;
  };

  const handleCalculate = async () => {
    const e = runValidation();
    if (Object.keys(e).length > 0) {
      const count = Object.keys(e).length;
      toast.error(`${count} champ${count > 1 ? 's' : ''} incorrect${count > 1 ? 's' : ''} — veuillez corriger les erreurs`, { duration: 4000 });
      // Scroll to first error
      setTimeout(() => {
        const el = document.querySelector('[data-error="true"]');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }
    try {
      const data = selectedType === 'Auto' ? autoData : selectedType === 'Vie' ? vieData : volData;
      const { data: result } = await api.post('/contracts/calculate', { type: selectedType, data });
      setCalculatedPrice(result.price);
      setShowDevis(true);
    } catch {
      toast.error('Erreur lors du calcul du devis');
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        type: selectedType,
        autoData: selectedType === 'Auto' ? autoData : undefined,
        vieData: selectedType === 'Vie' ? vieData : undefined,
        volData: selectedType === 'Vol' ? volData : undefined,
      };
      const { data } = await api.post('/contracts', payload);
      localStorage.removeItem('souscription_draft');
      toast.success('Contrat créé avec succès !');
      setShowDevis(false);
      router.push(`/contrats/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la souscription');
    } finally {
      setSubmitting(false);
    }
  };

  const errorCount = Object.keys(errors).length;

  return (
    <div>
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={16} color="var(--primary)" />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Nouvelle souscription</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 8 }}>Souscription</h1>
            <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Choisissez votre assurance et remplissez le formulaire</p>
          </div>
          {step > 0 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Save size={14} color="var(--text-3)" />
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Brouillon sauvegardé</span>
            </div>
          )}
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
        {['Choix', 'Formulaire', 'Devis'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step >= i ? 'var(--primary)' : 'var(--surface)',
              border: `2px solid ${step >= i ? 'var(--primary)' : 'var(--border)'}`,
              fontSize: 13, fontWeight: 700, color: step >= i ? 'white' : 'var(--text-3)',
              transition: 'all 0.2s',
            }}>
              {step > i ? <CheckCircle size={16} /> : i + 1}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: step >= i ? 'var(--text)' : 'var(--text-3)' }}>{s}</span>
            {i < 2 && <ChevronRight size={16} color="var(--border)" />}
          </div>
        ))}
      </div>

      {/* Step 0: Type selection - NOUVEAU STYLE HORIZONTAL SANS FEATURES */}
      {step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {ASSURANCE_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <div
                key={type.id}
                onClick={() => handleTypeSelect(type.id)}
                className="card hover-lift"
                style={{
                  cursor: 'pointer',
                  padding: 0,
                  position: 'relative',
                  display: 'flex',
                  height: '120px',
                  overflow: 'hidden'
                }}
              >
                {/* Left Color Strip */}
                <div style={{
                  width: '6px',
                  height: '100%',
                  background: `var(--${type.color})`,
                  flexShrink: 0
                }} />
                
                {/* Main Content */}
                <div style={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center',
                  padding: '0 2rem',
                  gap: '2rem'
                }}>
                  {/* Icon Circle */}
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: `var(--${type.color}-light)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: `2px solid var(--${type.color})`
                  }}>
                    <Icon size={32} color={`var(--${type.color})`} />
                  </div>
                  
                  {/* Text Content */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 700, 
                      marginBottom: '0.5rem',
                      color: 'var(--text)'
                    }}>
                      {type.title}
                    </h3>
                    <p style={{ 
                      fontSize: '0.875rem', 
                      color: 'var(--text-2)', 
                      lineHeight: 1.4,
                      margin: 0
                    }}>
                      {type.description}
                    </p>
                  </div>
                  
                  {/* Arrow Indicator */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    transition: 'all 0.3s ease',
                    flexShrink: 0
                  }}>
                    <ArrowRight size={20} color="var(--text-2)" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Step 1: Form */}
      {step === 1 && selectedType && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {(() => {
                const t = ASSURANCE_TYPES.find(t => t.id === selectedType);
                const Icon = t.icon;
                return (
                  <>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `var(--${t.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={22} color="white" />
                    </div>
                    <div>
                      <p style={{ fontSize: 17, fontWeight: 700 }}>{t.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Remplissez le formulaire ci-dessous</p>
                    </div>
                  </>
                );
              })()}
            </div>
            <button onClick={() => { setStep(0); setSelectedType(null); setErrors({}); localStorage.removeItem('souscription_draft'); }}
              className="btn-outline" style={{ gap: 6, fontSize: 13 }}>
              <ArrowLeft size={14} /> Changer
            </button>
          </div>

          {/* Error summary banner */}
          {errorCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 12, marginBottom: 20 }}>
              <AlertCircle size={18} color="var(--danger)" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)', marginBottom: 2 }}>
                  {errorCount} erreur{errorCount > 1 ? 's' : ''} à corriger
                </p>
                <p style={{ fontSize: 12, color: 'var(--danger)', opacity: 0.8 }}>
                  Veuillez corriger les champs surlignés en rouge avant de continuer.
                </p>
              </div>
            </div>
          )}

          {selectedType === 'Auto' && (
            <AutoForm data={autoData} onChange={wraponChange(setAutoData)} errors={errors} />
          )}
          {selectedType === 'Vie' && (
            <VieForm data={vieData} onChange={wraponChange(setVieData)} errors={errors} />
          )}
          {selectedType === 'Vol' && (
            <VolForm data={volData} onChange={wraponChange(setVolData)} errors={errors} />
          )}

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', gap: 12 }}>
            <button className="btn-outline" onClick={() => setStep(0)} style={{ gap: 6 }}>
              <ArrowLeft size={14} /> Retour
            </button>
            <button className="btn-primary" onClick={handleCalculate} style={{ flex: 1, gap: 8 }}>
              <Calculator size={16} /> Calculer mon devis <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Devis Modal */}
      {showDevis && (
        <DevisModal
          price={calculatedPrice}
          type={selectedType}
          onConfirm={handleSubmit}
          onCancel={() => setShowDevis(false)}
          loading={submitting}
        />
      )}
    </div>
  );
}