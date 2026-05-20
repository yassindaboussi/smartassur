'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, X, Pencil, Trash2, Newspaper, Calendar, Upload, Eye } from 'lucide-react';
import api from '../../../lib/api';

export default function AdminActualites() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ title: '', content: '' });
  const [file, setFile] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  const fetchNews = async () => {
    try { const { data } = await api.get('/news'); setNews(data); } catch {}
    setLoading(false);
  };
  useEffect(() => { fetchNews(); }, []);

  const resetForm = () => { 
    setForm({ title: '', content: '' }); 
    setFile(null); 
    setExistingImage(null);
    setEditItem(null); 
    setShowForm(false); 
  };
  
  const startEdit = (n) => { 
    setEditItem(n._id); 
    setForm({ title: n.title, content: n.content }); 
    setExistingImage(n.image);
    setFile(null);
    setShowForm(true); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('content', form.content);
    if (file) fd.append('image', file);
    try {
      if (editItem) { 
        await api.put(`/news/${editItem}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); 
        toast.success('Actualité mise à jour !'); 
      }
      else { 
        await api.post('/news', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); 
        toast.success('Actualité publiée !'); 
      }
      resetForm(); fetchNews();
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Erreur'); 
    }
  };

  const deleteNews = async (id) => {
    if (!confirm('Supprimer ?')) return;
    try { 
      await api.delete(`/news/${id}`); 
      toast.success('Actualité supprimée'); 
      fetchNews(); 
    } catch { 
      toast.error('Erreur lors de la suppression'); 
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create preview URL
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreviewImageUrl(previewUrl);
    }
  };

  const openPreviewModal = (imageUrl, isExisting = false) => {
    if (isExisting && imageUrl) {
      setPreviewImageUrl(`http://localhost:5000/uploads/${imageUrl}`);
    } else if (!isExisting && previewImageUrl) {
      // Already set from file selection
    }
    setShowPreviewModal(true);
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
  };

  // Cleanup preview URL when modal closes or component unmounts
  useEffect(() => {
    return () => {
      if (previewImageUrl && previewImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewImageUrl);
      }
    };
  }, [previewImageUrl]);

  return (
    <div>
      <div className="animate-fade-up" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Newspaper size={16} color="var(--primary)" />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Contenu</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 8 }}>Actualités</h1>
            <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Gérez les actualités et communications</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className={showForm ? 'btn-ghost' : 'btn-primary'} style={{ gap: 8 }}>
            {showForm ? <><X size={15} />Annuler</> : <><Plus size={15} />Nouvelle actualité</>}
          </button>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showPreviewModal && previewImageUrl && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.9)', 
          backdropFilter: 'blur(8px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 2000, 
          padding: '2rem',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ 
            position: 'relative', 
            maxWidth: '90vw', 
            maxHeight: '90vh',
            backgroundColor: 'transparent'
          }}>
            <button
              onClick={closePreviewModal}
              style={{
                position: 'absolute',
                top: -40,
                right: -40,
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <X size={24} />
            </button>
            <img 
              src={previewImageUrl} 
              alt="Preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '90vh', 
                objectFit: 'contain',
                borderRadius: 12,
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
              }} 
            />
          </div>
        </div>
      )}

      {/* Add/Edit News Modal */}
      {showForm && (
        <div style={{ 
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: 700, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                  {editItem ? "Modifier l'actualité" : 'Nouvelle actualité'}
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
                  {editItem ? 'Modifiez les détails de cette actualité' : 'Créez une nouvelle actualité pour informer vos clients'}
                </p>
              </div>
              <button onClick={resetForm} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 8 }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>
                    Titre <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    className="input-field" 
                    placeholder="Titre de l'actualité"
                    value={form.title} 
                    onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>
                    Contenu <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <textarea 
                    required 
                    rows={6} 
                    className="input-field" 
                    placeholder="Rédigez votre actualité..."
                    value={form.content} 
                    onChange={(e) => setForm({ ...form, content: e.target.value })} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Upload size={13} /> Image (optionnel)
                    </span>
                  </label>
                  
                  {/* Existing Image Display for Edit Mode */}
                  {editItem && existingImage && !file && (
                    <div style={{ 
                      marginBottom: 16,
                      padding: '1rem',
                      background: 'var(--surface-2)',
                      borderRadius: 12,
                      border: '1px solid var(--border)'
                    }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 12 }}>
                        Image actuelle
                      </p>
                      <img 
                        src={`http://localhost:5000/uploads/${existingImage}`} 
                        alt="Current" 
                        style={{ 
                          width: '100%', 
                          height: 150, 
                          objectFit: 'cover',
                          borderRadius: 8,
                          cursor: 'pointer'
                        }}
                        onClick={() => openPreviewModal(existingImage, true)}
                      />
                    </div>
                  )}

                  <div style={{ 
                    border: '2px dashed var(--border)', 
                    borderRadius: 12, 
                    padding: '1.5rem', 
                    textAlign: 'center',
                    background: 'var(--surface-2)',
                    transition: 'all 0.2s ease'
                  }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      id="newsImg"
                      onChange={handleFileChange} 
                    />
                    <label 
                      htmlFor="newsImg" 
                      className="btn-outline" 
                      style={{ cursor: 'pointer', display: 'inline-flex', fontSize: 13, gap: 8, padding: '0.75rem 1.25rem' }}
                    >
                      <Upload size={14} /> Choisir une image
                    </label>
                    
                    {/* New File Preview */}
                    {file && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ 
                          marginBottom: 12,
                          padding: '0.75rem', 
                          background: 'var(--success-light)', 
                          borderRadius: 8, 
                          border: '1px solid rgba(0,168,107,0.2)'
                        }}>
                          <p style={{ fontSize: 12, color: 'var(--success)', fontWeight: 500, marginBottom: 8 }}>
                            <span style={{ marginRight: 6 }}>✓</span> {file.name}
                          </p>
                        </div>
                        <img 
                          src={previewImageUrl} 
                          alt="Preview" 
                          style={{ 
                            width: '100%', 
                            height: 200, 
                            objectFit: 'cover',
                            borderRadius: 8,
                            cursor: 'pointer'
                          }}
                          onClick={() => openPreviewModal(null, false)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ flex: 1, gap: 8 }}
                  >
                    <Newspaper size={16} />
                    {editItem ? 'Mettre à jour' : 'Publier'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-outline" 
                    onClick={resetForm}
                    style={{ flex: 1 }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}><div className="spinner"></div></div>
      ) : news.length === 0 ? (
        <div className="empty-state card">
          <Newspaper size={48} color="var(--text-3)" style={{ marginBottom: 16 }} />
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Aucune actualité publiée</h3>
          <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={15} />Publier la première</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {news.map((n, i) => (
            <div 
              key={n._id} 
              className={`anim-fade-up-${(i % 3) + 1}`}
              style={{
                background: 'var(--surface)',
                borderRadius: 20,
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
              }}
            >
              {/* Image Section avec overlay gradient */}
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                {n.image ? (
                  <>
                    <img 
                      src={`http://localhost:5000/uploads/${n.image}`} 
                      alt={n.title} 
                      style={{ 
                        width: '100%', 
                        height: 160, 
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => openPreviewModal(n.image, true)}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
                      pointerEvents: 'none'
                    }} />
                  </>
                ) : (
                  <div style={{ 
                    height: 160, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    <Newspaper size={56} color="rgba(255,255,255,0.3)" />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)',
                    }} />
                  </div>
                )}
                
                {/* Badge Date */}
                <div style={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  background: 'rgba(0,0,0,0.75)',
                  backdropFilter: 'blur(8px)',
                  padding: '6px 12px',
                  borderRadius: 30,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  zIndex: 2
                }}>
                  <Calendar size={12} color="white" />
                  <span style={{ fontSize: 12, color: 'white', fontWeight: 500 }}>
                    {new Date(n.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div style={{ padding: '16px' }}>
                <h3 style={{
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 700,
                  fontSize: 16,
                  marginBottom: 8,
                  lineHeight: 1.4,
                  color: 'var(--text-1)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {n.title}
                </h3>
                
                <p style={{
                  color: 'var(--text-2)',
                  fontSize: 13,
                  lineHeight: 1.5,
                  marginBottom: 16,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {n.content}
                </p>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: 8,
                  borderTop: '1px solid var(--border)',
                  paddingTop: 12
                }}>
                  <button 
                    onClick={() => startEdit(n)} 
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      background: 'var(--surface-2)',
                      border: 'none',
                      borderRadius: 12,
                      color: 'var(--text-2)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#667eea';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--surface-2)';
                      e.currentTarget.style.color = 'var(--text-2)';
                    }}
                  >
                    <Pencil size={14} />
                    Modifier
                  </button>
                  <button 
                    onClick={() => deleteNews(n._id)} 
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: 'none',
                      borderRadius: 12,
                      color: '#ef4444',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ef4444';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                      e.currentTarget.style.color = '#ef4444';
                    }}
                  >
                    <Trash2 size={14} />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}