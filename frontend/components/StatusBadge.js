import { CheckCircle, Clock, XCircle, AlertCircle, RefreshCw, Shield, Ban, Hourglass } from 'lucide-react';

const statusConfig = {
  // Success states
  'actif': { class: 'badge-success', icon: CheckCircle, label: 'Actif' },
  'active': { class: 'badge-success', icon: CheckCircle, label: 'Actif' },
  'payé': { class: 'badge-success', icon: CheckCircle, label: 'Payé' },
  'paid': { class: 'badge-success', icon: CheckCircle, label: 'Payé' },
  'approuvé': { class: 'badge-success', icon: CheckCircle, label: 'Approuvé' },
  'approved': { class: 'badge-success', icon: CheckCircle, label: 'Approuvé' },
  'résolu': { class: 'badge-success', icon: CheckCircle, label: 'Résolu' },
  'resolved': { class: 'badge-success', icon: CheckCircle, label: 'Résolu' },
  'validé': { class: 'badge-success', icon: CheckCircle, label: 'Validé' },
  'validated': { class: 'badge-success', icon: CheckCircle, label: 'Validé' },
  
  // Contract workflow statuses
  'draft':     { class: 'badge-gray',    icon: Clock,       label: 'Brouillon' },
  'submitted': { class: 'badge-info',    icon: RefreshCw,   label: 'Soumis' },
  'rejected':  { class: 'badge-danger',  icon: XCircle,     label: 'Rejeté' },
  'en attente': { class: 'badge-warning', icon: Clock, label: 'En attente' },
  'pending': { class: 'badge-warning', icon: Hourglass, label: 'En attente' },
  'en cours': { class: 'badge-info', icon: RefreshCw, label: 'En cours' },
  'processing': { class: 'badge-info', icon: RefreshCw, label: 'En cours' },
  'en vérification': { class: 'badge-info', icon: Shield, label: 'En vérification' },
  
  // Danger states
  'refusé': { class: 'badge-danger', icon: XCircle, label: 'Refusé' },
  'rejected': { class: 'badge-danger', icon: XCircle, label: 'Refusé' },
  'expiré': { class: 'badge-danger', icon: Ban, label: 'Expiré' },
  'expired': { class: 'badge-danger', icon: Ban, label: 'Expiré' },
  'suspendu': { class: 'badge-danger', icon: AlertCircle, label: 'Suspendu' },
  'suspended': { class: 'badge-danger', icon: AlertCircle, label: 'Suspendu' },
  'échoué': { class: 'badge-danger', icon: XCircle, label: 'Échoué' },
  'failed': { class: 'badge-danger', icon: XCircle, label: 'Échoué' },
  'annulé': { class: 'badge-danger', icon: XCircle, label: 'Annulé' },
  'cancelled': { class: 'badge-danger', icon: XCircle, label: 'Annulé' },
};

export default function StatusBadge({ status, size = 'sm', showIcon = true, customLabel }) {
  const config = statusConfig[status?.toLowerCase()] || { 
    class: 'badge-gray', 
    icon: AlertCircle, 
    label: status || 'Inconnu' 
  };
  
  const Icon = config.icon;
  const label = customLabel || config.label;
  
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-[11px] px-2.5 py-1 gap-1.5',
    lg: 'text-xs px-3 py-1.5 gap-2',
  };
  
  return (
    <span className={`badge ${config.class} ${sizeClasses[size]} inline-flex items-center font-medium rounded-full`}>
      {showIcon && <Icon size={size === 'lg' ? 14 : size === 'md' ? 12 : 10} className="flex-shrink-0" />}
      {label}
    </span>
  );
}

// Additional status component for insurance-specific statuses
export function ClaimStatusBadge({ status }) {
  const claimStatusConfig = {
    'déclaré': { class: 'badge-info', icon: Clock, label: 'Déclaré' },
    'declared': { class: 'badge-info', icon: Clock, label: 'Déclaré' },
    'en instruction': { class: 'badge-warning', icon: RefreshCw, label: 'En instruction' },
    'expertise': { class: 'badge-info', icon: Shield, label: 'Expertise' },
    'indemnisé': { class: 'badge-success', icon: CheckCircle, label: 'Indemnisé' },
    'compensated': { class: 'badge-success', icon: CheckCircle, label: 'Indemnisé' },
    'rejeté': { class: 'badge-danger', icon: XCircle, label: 'Rejeté' },
  };
  
  const config = claimStatusConfig[status?.toLowerCase()] || statusConfig[status?.toLowerCase()] || {
    class: 'badge-gray',
    icon: AlertCircle,
    label: status || 'Inconnu'
  };
  
  const Icon = config.icon;
  
  return (
    <span className={`badge ${config.class} text-[11px] px-2.5 py-1 gap-1.5 inline-flex items-center font-medium rounded-full`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

export function PaymentStatusBadge({ status }) {
  const paymentStatusConfig = {
    'payé': { class: 'badge-success', icon: CheckCircle, label: 'Payé' },
    'paid': { class: 'badge-success', icon: CheckCircle, label: 'Payé' },
    'en attente': { class: 'badge-warning', icon: Clock, label: 'En attente' },
    'pending': { class: 'badge-warning', icon: Clock, label: 'En attente' },
    'échoué': { class: 'badge-danger', icon: XCircle, label: 'Échoué' },
    'failed': { class: 'badge-danger', icon: XCircle, label: 'Échoué' },
    'remboursé': { class: 'badge-info', icon: RefreshCw, label: 'Remboursé' },
    'refunded': { class: 'badge-info', icon: RefreshCw, label: 'Remboursé' },
  };
  
  const config = paymentStatusConfig[status?.toLowerCase()] || {
    class: 'badge-gray',
    icon: AlertCircle,
    label: status || 'Inconnu'
  };
  
  const Icon = config.icon;
  
  return (
    <span className={`badge ${config.class} text-[11px] px-2.5 py-1 gap-1.5 inline-flex items-center font-medium rounded-full`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}