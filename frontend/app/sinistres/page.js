'use client';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
  Plus, X, AlertTriangle, Upload, ImageIcon, CheckCircle, 
  Shield, Clock, TrendingUp, FileText, Calendar, 
  AlertCircle, Search, MessageSquare, ArrowLeft, ChevronRight, 
  Car, HeartPulse, Plane, Edit2, File, FileImage, FileText as FilePdf, Trash2
} from 'lucide-react';
import api from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';

const statusConfig = {
  'en attente': { color: 'warning', icon: Clock, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  'en cours':   { color: 'info',    icon: TrendingUp, gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  'approuvé':   { color: 'success', icon: CheckCircle, gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  'refusé':     { color: 'danger',  icon: AlertCircle, gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
};

const contractTypeConfig = {
  'Auto':   { icon: Car,        gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
  'Vie':    { icon: HeartPulse, gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  'Voyage': { icon: Plane,      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
};

// Helper pour déterminer le type de fichier
const getFileType = (filename) => {
  const ext = filename?.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  return 'other';
};

// Composant pour l'aperçu des fichiers existants
const ExistingFilesPreview = ({ files, onRemove, isEditMode = false }) => {
  const [showAll, setShowAll] = useState(false);
  const displayedFiles = showAll ? files : files.slice(0, 4);

  if (!files || files.length === 0) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 10 
      }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
          Fichiers actuels ({files.length})
        </p>
        {files.length > 4 && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            style={{
              fontSize: 11,
              color: 'var(--primary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {showAll ? 'Voir moins' : `+${files.length - 4} autres`}
          </button>
        )}
      </div>
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 12,
        maxHeight: showAll ? 400 : 120,
        overflowY: 'auto',
        padding: '4px 0'
      }}>
        {displayedFiles.map((file, idx) => {
          const fileType = getFileType(file.filename || file);
          const fileUrl = `http://localhost:5000/uploads/${file.filename || file}`;
          const fileName = file.filename || file;
          
          return (
            <div key={idx} style={{ position: 'relative' }}>
              {fileType === 'image' ? (
                <div
                  onClick={() => window.open(fileUrl, '_blank')}
                  style={{
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <img 
                    src={fileUrl}
                    alt={`Fichier ${idx + 1}`}
                    style={{ 
                      width: 80, 
                      height: 80, 
                      objectFit: 'cover', 
                      borderRadius: 10,
                      border: '2px solid var(--border)'
                    }}
                  />
                </div>
              ) : (
                <div
                  onClick={() => window.open(fileUrl, '_blank')}
                  style={{
                    width: 80,
                    height: 80,
                    background: 'var(--surface-2)',
                    borderRadius: 10,
                    border: '2px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  <FilePdf size={28} color="var(--danger)" />
                  <span style={{ fontSize: 10, color: 'var(--text-2)', textAlign: 'center', maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {fileName.length > 15 ? fileName.slice(0, 12) + '...' : fileName}
                  </span>
                </div>
              )}
              
              {isEditMode && onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(file._id || file, idx)}
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    background: 'var(--danger)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Composant pour la sélection de fichiers multiples
const FileUploadZone = ({ files, previews, onFileSelect, onRemoveFile, label, onClearAll }) => {
  const fileInputRef = useRef(null);

  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
        <ImageIcon size={13} style={{ display: 'inline', marginRight: 5 }} />
        {label || "Photos / Documents (optionnel)"}
      </label>
      
      <div style={{ 
        border: `2px dashed ${previews.length > 0 ? 'var(--success)' : 'var(--border)'}`,
        borderRadius: 12,
        padding: '1.5rem',
        textAlign: 'center',
        background: 'var(--surface-2)',
        transition: 'all 0.2s'
      }}>
        <input
          type="file"
          multiple
          accept="image/*,application/pdf"
          style={{ display: 'none' }}
          id={fileInputRef.current?.id || "fileInput"}
          onChange={onFileSelect}
          ref={fileInputRef}
        />
        
        <label 
          htmlFor={fileInputRef.current?.id || "fileInput"}
          className="btn-outline"
          style={{ 
            cursor: 'pointer', 
            display: 'inline-flex', 
            gap: 8, 
            padding: '0.6rem 1.25rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Upload size={14} /> Choisir des fichiers
        </label>
        
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 10 }}>
          Images (JPG, PNG, GIF) ou PDF — max 10MB par fichier
        </p>
        
        <p style={{ fontSize: 11, color: 'var(--primary)', marginTop: 4 }}>
          Vous pouvez sélectionner plusieurs fichiers à la fois
        </p>

        {previews.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 10, 
              justifyContent: 'center',
              maxHeight: 200,
              overflowY: 'auto',
              padding: '8px'
            }}>
              {previews.map((preview, idx) => {
                const isImage = preview.type?.startsWith('image/');
                const fileName = files[idx]?.name || `fichier ${idx + 1}`;
                
                return (
                  <div key={idx} style={{ position: 'relative' }}>
                    {isImage ? (
                      <div style={{ position: 'relative' }}>
                        <img 
                          src={preview.url}
                          alt=""
                          style={{ 
                            width: 80, 
                            height: 80, 
                            objectFit: 'cover', 
                            borderRadius: 10,
                            border: '2px solid var(--border)'
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{
                        width: 80,
                        height: 80,
                        background: 'var(--surface)',
                        borderRadius: 10,
                        border: '2px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}>
                        <FilePdf size={28} color="var(--danger)" />
                        <span style={{ fontSize: 9, color: 'var(--text-2)', textAlign: 'center', maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {fileName.length > 12 ? fileName.slice(0, 9) + '...' : fileName}
                        </span>
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => onRemoveFile(idx)}
                      style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        background: 'var(--danger)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
            
            <button
              type="button"
              onClick={() => {
                if (onClearAll) {
                  onClearAll();
                }
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              style={{
                marginTop: 10,
                fontSize: 11,
                color: 'var(--text-3)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Tout effacer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function SinistresPage() {
  const [claims, setClaims] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ contract: '', description: '' });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [filter, setFilter] = useState('tous');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const [editForm, setEditForm] = useState({ description: '' });
  const [editFiles, setEditFiles] = useState([]);
  const [editPreviews, setEditPreviews] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [filesToRemove, setFilesToRemove] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);

  const openEdit = (claim) => {
    setEditForm({ description: claim.description });
    setEditFiles([]);
    setEditPreviews([]);
    setExistingFiles(claim.images?.map(img => ({ filename: img, _id: img })) || []);
    setFilesToRemove([]);
    setShowEditModal(true);
  };

  const handleEditFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const newPreviews = selected.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type,
      name: file.name
    }));
    setEditFiles(prev => [...prev, ...selected]);
    setEditPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveExistingFile = (fileId, index) => {
    setExistingFiles(prev => prev.filter((_, i) => i !== index));
    setFilesToRemove(prev => [...prev, fileId]);
  };

  const handleRemoveNewFile = (index) => {
    setEditFiles(prev => prev.filter((_, i) => i !== index));
    setEditPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editForm.description) {
      toast.error('La description est obligatoire');
      return;
    }
    
    const formData = new FormData();
    formData.append('description', editForm.description);
    formData.append('filesToRemove', JSON.stringify(filesToRemove));
    editFiles.forEach((f) => formData.append('images', f));
    
    try {
      await api.patch(`/claims/${selectedId}`, formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      toast.success('Sinistre modifié avec succès !');
      setShowEditModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const fetchAll = async () => {
    try {
      const [cl, co] = await Promise.all([api.get('/claims'), api.get('/contracts')]);
      setClaims(cl.data);
      setContracts(co.data.filter(c => c.status === 'active'));
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.contract || !form.description) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    const formData = new FormData();
    formData.append('contract', form.contract);
    formData.append('description', form.description);
    files.forEach((f) => formData.append('images', f));
    
    try {
      await api.post('/claims', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Sinistre déclaré avec succès !');
      setShowForm(false);
      setForm({ contract: '', description: '' });
      setFiles([]); setPreviews([]);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la déclaration');
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const newPreviews = selected.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type,
      name: file.name
    }));
    setFiles(prev => [...prev, ...selected]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const stats = {
    total: claims.length,
    enAttente: claims.filter(c => c.status === 'en attente').length,
    enCours: claims.filter(c => c.status === 'en cours').length,
    approuve: claims.filter(c => c.status === 'approuvé').length,
    refuse: claims.filter(c => c.status === 'refusé').length,
  };

  const filteredClaims = claims.filter(c => {
    if (filter !== 'tous' && c.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return c._id?.toLowerCase().includes(s) || 
             c.contract?.type?.toLowerCase().includes(s) || 
             c.description?.toLowerCase().includes(s);
    }
    return true;
  });

  const selected = claims.find(c => c._id === selectedId);

  // --- DETAIL VIEW ---
  if (selected) {
    const cfg = statusConfig[selected.status] || statusConfig['en attente'];
    const StatusIcon = cfg.icon;
    const contractType = selected.contract?.type || 'Auto';
    const contractCfg = contractTypeConfig[contractType] || contractTypeConfig['Auto'];
    const ContractIcon = contractCfg.icon;
    
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <button
            onClick={() => setSelectedId(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: 0 }}
          >
            <ArrowLeft size={16} /> Retour aux sinistres
          </button>
          {selected.status === 'en attente' && (
            <button
              onClick={() => openEdit(selected)}
              className="btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
            >
              <Edit2 size={14} /> Modifier
            </button>
          )}
        </div>


        {/* Edit Modal */}
        {showEditModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div className="card" style={{ maxWidth: 700, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 3 }}>Modifier le sinistre</h2>
                  <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Vous pouvez modifier votre déclaration tant qu'elle est en attente</p>
                </div>
                <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 6 }}>
                  <X size={18} />
                </button>
              </div>
              
              <form onSubmit={handleEdit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                      Description <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <textarea 
                      required 
                      rows={5} 
                      className="input-field" 
                      placeholder="Décrivez le sinistre : date, lieu, circonstances, dégâts..."
                      value={editForm.description} 
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} 
                      style={{ resize: 'vertical' }} 
                    />
                  </div>
                  
                  {/* Fichiers existants */}
                  {existingFiles.length > 0 && (
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                        Fichiers actuels
                      </label>
                      <ExistingFilesPreview 
                        files={existingFiles} 
                        onRemove={handleRemoveExistingFile}
                        isEditMode={true}
                      />
                    </div>
                  )}
                  
                  {/* Upload nouveaux fichiers */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                      <Upload size={13} style={{ display: 'inline', marginRight: 5 }} />
                      Ajouter des fichiers
                    </label>
                    <div style={{ 
                      border: `2px dashed ${editPreviews.length > 0 ? 'var(--success)' : 'var(--border)'}`,
                      borderRadius: 12,
                      padding: '1.25rem',
                      textAlign: 'center',
                      background: 'var(--surface-2)'
                    }}>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*,application/pdf" 
                        style={{ display: 'none' }} 
                        id="editFileInput" 
                        onChange={handleEditFileChange} 
                      />
                      <label 
                        htmlFor="editFileInput" 
                        className="btn-outline" 
                        style={{ cursor: 'pointer', display: 'inline-flex', gap: 8, padding: '0.6rem 1rem' }}
                      >
                        <Upload size={14} /> Choisir des fichiers
                      </label>
                      <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
        Images ou PDF - 10MB max
                      </p>
                      
                      {editPreviews.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                            {editPreviews.map((p, idx) => (
                              <div key={idx} style={{ position: 'relative' }}>
                                {p.type?.startsWith('image/') ? (
                                  <img 
                                    src={p.url} 
                                    alt="" 
                                    style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} 
                                  />
                                ) : (
                                  <div style={{
                                    width: 64,
                                    height: 64,
                                    background: 'var(--surface)',
                                    borderRadius: 8,
                                    border: '1px solid var(--border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    <FilePdf size={28} color="var(--danger)" />
                                  </div>
                                )}
                                <button 
                                  type="button" 
                                  onClick={() => handleRemoveNewFile(idx)} 
                                  style={{ 
                                    position: 'absolute', 
                                    top: -6, 
                                    right: -6, 
                                    width: 20, 
                                    height: 20, 
                                    borderRadius: 10, 
                                    background: 'var(--danger)', 
                                    color: 'white', 
                                    border: 'none', 
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" className="btn-primary" style={{ flex: 1, gap: 8 }}>
                      <AlertTriangle size={14} /> Enregistrer
                    </button>
                    <button type="button" className="btn-outline" onClick={() => setShowEditModal(false)} style={{ flex: 1 }}>
                      Annuler
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ background: contractCfg.gradient, padding: '1.5rem', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ContractIcon size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Sinistre #{selected._id?.slice(-8).toUpperCase()}</h2>
                  <p style={{ fontSize: 13, opacity: 0.9 }}>Contrat : {contractType}</p>
                </div>
              </div>
              <StatusBadge status={selected.status} size="lg" />
            </div>
          </div>

          <div style={{ padding: '1.5rem' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: 16, 
              marginBottom: 24,
              paddingBottom: 20,
              borderBottom: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Calendar size={16} color="var(--primary)" />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>Date de déclaration</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                    {new Date(selected.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <StatusIcon size={16} color={`var(--${cfg.color})`} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>Statut actuel</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: `var(--${cfg.color})` }}>
                    {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={16} color="var(--primary)" />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>Contrat lié</p>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>{contractType}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertTriangle size={16} color="var(--primary)" />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>Référence sinistre</p>
                  <p style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace' }}>
                    #{selected._id?.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <MessageSquare size={16} color="var(--primary)" />
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description du sinistre</p>
              </div>
              <div style={{ 
                padding: '1.25rem', 
                background: 'var(--surface-2)', 
                borderRadius: 12, 
                border: '1px solid var(--border)'
              }}>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7 }}>{selected.description}</p>
              </div>
            </div>

            {selected.images?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <ImageIcon size={16} color="var(--primary)" />
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Documents joints ({selected.images.length})
                  </p>
                </div>
                <ExistingFilesPreview files={selected.images.map(img => ({ filename: img }))} />
              </div>
            )}

            {selected.adminComment && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Shield size={16} color="var(--info)" />
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--info)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Réponse de l'assureur</p>
                </div>
                <div style={{ 
                  padding: '1.25rem', 
                  background: 'var(--info-light)', 
                  borderRadius: 12, 
                  border: '1px solid rgba(59,130,246,0.2)'
                }}>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7 }}>{selected.adminComment}</p>
                </div>
              </div>
            )}

            {selected.status === 'en attente' && !selected.adminComment && (
              <div style={{ 
                padding: '1rem 1.25rem', 
                background: 'var(--warning-light)', 
                borderRadius: 12, 
                border: '1px solid rgba(245,158,11,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <Clock size={18} color="var(--warning)" />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--warning)', marginBottom: 2 }}>En attente de traitement</p>
                  <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Notre équipe examine votre dossier et vous tiendra informé de l'avancement.</p>
                </div>
              </div>
            )}

            {selected.status === 'en cours' && !selected.adminComment && (
              <div style={{ 
                padding: '1rem 1.25rem', 
                background: 'var(--info-light)', 
                borderRadius: 12, 
                border: '1px solid rgba(59,130,246,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <TrendingUp size={18} color="var(--info)" />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--info)', marginBottom: 2 }}>Traitement en cours</p>
                  <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Votre sinistre est en cours d'analyse par nos experts.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div>
      <div className="animate-fade-up" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={14} color="var(--primary)" />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Déclarations</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.85rem)', marginBottom: 4 }}>Mes Sinistres</h1>
            <p style={{ color: 'var(--text-2)', fontSize: 13 }}>Déclarez et suivez vos sinistres en temps réel</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary" style={{ gap: 8 }}>
            <Plus size={15} /> Déclarer un sinistre
          </button>
        </div>
      </div>

      
      {claims.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total sinistres', value: stats.total, icon: AlertTriangle, color: 'primary' },
            { label: 'En attente', value: stats.enAttente, icon: Clock, color: 'warning' },
            { label: 'Approuvés', value: stats.approuve, icon: CheckCircle, color: 'success' },
            { label: 'Refusés', value: stats.refuse, icon: AlertCircle, color: 'danger' },
          ].map((stat) => (
            <div key={stat.label} style={{ textDecoration: 'none' }}>
              <div className="stat-card" style={{ padding: '1rem', cursor: 'pointer', background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `var(--${stat.color}-light)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <stat.icon size={20} color={`var(--${stat.color})`} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{stat.label}</p>
                    <p style={{ fontSize: 24, fontWeight: 800, color: `var(--${stat.color})` }}>{stat.value}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {claims.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['tous', 'en attente', 'en cours', 'approuvé', 'refusé'].map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{
                padding: '0.4rem 0.875rem', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: `1px solid ${filter === s ? 'var(--primary)' : 'var(--border)'}`,
                background: filter === s ? 'var(--primary)' : 'var(--surface)',
                color: filter === s ? 'white' : 'var(--text-2)',
              }}>
                {s === 'tous' ? 'Tous' : s.charAt(0).toUpperCase() + s.slice(1)}
                <span style={{ marginLeft: 5, opacity: 0.7 }}>({claims.filter(c => s === 'tous' || c.status === s).length})</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.4rem 0.875rem' }}>
            <Search size={14} color="var(--text-3)" />
            <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, width: 150, color: 'var(--text)' }} />
          </div>
        </div>
      )}

      {/* Declaration Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 3 }}>Déclarer un sinistre</h2>
                <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Remplissez les informations pour déclarer votre sinistre</p>
              </div>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 6 }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Contrat concerné <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select required className="input-field" value={form.contract} onChange={(e) => setForm({ ...form, contract: e.target.value })} style={{ cursor: 'pointer' }}>
                    <option value="">-- Sélectionnez un contrat --</option>
                    {contracts.map((c) => (
                      <option key={c._id} value={c._id}>{c.type} — {c.price} DT/an - {c.numeroContrat}</option>
                    ))}
                  </select>
                  {contracts.length === 0 && <p style={{ fontSize: 11, color: 'var(--warning)', marginTop: 5 }}>Aucun contrat actif disponible</p>}
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Description <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <textarea required rows={5} className="input-field" placeholder="Décrivez le sinistre : date, lieu, circonstances, dégâts..."
                    value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
                </div>
                
                <FileUploadZone 
                  files={files}
                  previews={previews}
                  onFileSelect={handleFileChange}
                  onRemoveFile={removeFile}
                  onClearAll={() => { setFiles([]); setPreviews([]); }}
                  label="Photos / Documents justificatifs"
                />
                
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, gap: 8 }}>
                    <AlertTriangle size={14} /> Soumettre
                  </button>
                  <button type="button" className="btn-outline" onClick={() => setShowForm(false)} style={{ flex: 1 }}>
                    Annuler
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner"></div>
        </div>
      ) : claims.length === 0 ? (
        <div className="card empty-state" style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Shield size={32} color="var(--success)" />
          </div>
          <h3 style={{ fontSize: 18, marginBottom: 6 }}>Aucun sinistre déclaré</h3>
          <p style={{ color: 'var(--text-2)', marginBottom: 16, fontSize: 13 }}>Bonne nouvelle ! Vous n'avez aucun sinistre en cours.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary" style={{ gap: 8 }}>
            <Plus size={14} /> Déclarer un sinistre
          </button>
        </div>
      ) : filteredClaims.length === 0 ? (
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <Search size={36} color="var(--text-3)" style={{ marginBottom: 12 }} />
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Aucun sinistre ne correspond à vos critères</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filteredClaims.map((claim, i) => {
            const cfg = statusConfig[claim.status] || statusConfig['en attente'];
            const contractType = claim.contract?.type || 'Auto';
            const contractCfg = contractTypeConfig[contractType] || contractTypeConfig['Auto'];
            const ContractIcon = contractCfg.icon;
            
            return (
              <div
                key={claim._id}
                className="card hover-lift"
                onClick={() => setSelectedId(claim._id)}
                style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', animationDelay: `${i * 0.05}s` }}
              >
                <div style={{ background: contractCfg.gradient, padding: '1.25rem', color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ContractIcon size={22} />
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{contractType}</p>
                      <p style={{ fontSize: 11, opacity: 0.85 }}>Sinistre #{claim._id?.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                  {claim.images?.length > 0 && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 99, padding: '0.25rem 0.75rem', fontSize: 11, fontWeight: 600 }}>
                      <FileText size={11} /> {claim.images.length} document{claim.images.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                <div style={{ padding: '1.125rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <StatusBadge status={claim.status} size="md" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--${cfg.color})` }} />
                      <span style={{ fontSize: 11, color: `var(--${cfg.color})`, fontWeight: 600 }}>
                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {claim.description}
                  </p>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-3)' }}>
                      <Calendar size={13} />
                      {new Date(claim.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {claim.status === 'en attente' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedId(claim._id); setTimeout(() => openEdit(claim), 0); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--warning)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <Edit2 size={12} /> Modifier
                        </button>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                        Voir détails <ChevronRight size={13} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}