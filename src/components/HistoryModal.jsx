import React, { useState, useEffect } from 'react';
import { X, Trash2, FolderOpen, Clock, AlertCircle } from 'lucide-react';
import { fetchSavedDocuments, deleteSavedDocument } from '../api/client';
import { formatRupiah } from '../utils/currency';

function formatTimestamp(dateStr) {
  if (!dateStr) return '';
  try {
    // Handle both ISO format and SQLite "YYYY-MM-DD HH:MM:SS" format
    const cleanStr = String(dateStr).includes('T') ? dateStr : String(dateStr).replace(' ', 'T');
    const d = new Date(cleanStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return String(dateStr);
  } catch {
    return String(dateStr);
  }
}

export function HistoryModal({ isOpen, onClose, onLoadDoc }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchSavedDocuments();
      setDocs(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error in loadHistory:', err);
      setError('Gagal memuat daftar dokumen');
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Hapus dokumen ini dari riwayat?')) {
      await deleteSavedDocument(id);
      loadHistory();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Riwayat Dokumen & D1 Database</h3>
            <p className="text-xs text-slate-500">Buka kembali draf atau pengajuan yang telah disimpan</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document list */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400">Memuat riwayat dokumen...</div>
          ) : !Array.isArray(docs) || docs.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <FolderOpen className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs">Belum ada dokumen yang disimpan.</p>
              <p className="text-[11px] text-slate-400">Klik "Simpan Draft" di atas untuk menyimpan ke D1 Database.</p>
            </div>
          ) : (
            docs.map((doc) => {
              if (!doc) return null;
              const typeLabels = {
                kosan: { label: 'Uang Kosan', color: 'bg-emerald-100 text-emerald-800' },
                makan: { label: 'Uang Makan', color: 'bg-blue-100 text-blue-800' },
                lembur: { label: 'Uang Lembur', color: 'bg-purple-100 text-purple-800' }
              };
              const tag = typeLabels[doc.type] || { label: doc.type || 'Dokumen', color: 'bg-slate-100 text-slate-800' };

              return (
                <div
                  key={doc.id || Math.random()}
                  onClick={() => {
                    onLoadDoc(doc);
                    onClose();
                  }}
                  className="p-3.5 border border-slate-200 hover:border-blue-500 rounded-xl bg-slate-50/50 hover:bg-blue-50/30 cursor-pointer flex items-center justify-between transition group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tag.color}`}>
                        {tag.label}
                      </span>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600">
                        {doc.title || 'Dokumen Tanpa Judul'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTimestamp(doc.created_at)}
                      </span>
                      {Number(doc.total_amount) > 0 && (
                        <span className="font-semibold text-slate-700">
                          {formatRupiah(doc.total_amount)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(doc.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
