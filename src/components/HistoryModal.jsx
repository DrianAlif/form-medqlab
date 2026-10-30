import React, { useState, useEffect, useMemo } from 'react';
import { X, Trash2, FolderOpen, Clock, AlertCircle, CheckCircle2, Search, Check, FileCheck } from 'lucide-react';
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

function getSignatureSummary(doc) {
  if (!doc || !doc.data) return [];
  let d = doc.data;
  if (typeof d === 'string') {
    try {
      d = JSON.parse(d);
    } catch {
      d = {};
    }
  }
  if (!d || typeof d !== 'object') return [];

  const type = doc.type || 'kosan';

  if (type === 'kosan' || type === 'makan') {
    return [
      { role: 'Pemohon', name: d.pemohonNama, signed: Boolean(d.pemohonSign) },
      { role: 'HOD', name: d.hodNama, signed: Boolean(d.hodSign) },
      { role: 'Direktur', name: d.direkturNama, signed: Boolean(d.direkturSign) }
    ];
  } else if (type === 'lembur' || type === 'akomodasi') {
    return [
      { role: 'Dibuat', name: d.dibuatOlehNama || d.nama, signed: Boolean(d.dibuatOlehSign) },
      { role: 'HOD', name: d.disetujuiOlehNama, signed: Boolean(d.disetujuiOlehSign) },
      { role: 'Diketahui', name: d.diketahuiOlehNama, signed: Boolean(d.diketahuiOlehSign) }
    ];
  } else if (type === 'pembelian') {
    return [
      { role: 'Diajukan', name: d.diajukanOlehNama || d.nama, signed: Boolean(d.diajukanOlehSign) },
      { role: 'Direview', name: d.direviewOlehNama, signed: Boolean(d.direviewOlehSign) },
      { role: 'Disetujui', name: d.disetujuiOlehNama, signed: Boolean(d.disetujuiOlehSign) }
    ];
  } else if (type === 'surat') {
    return [
      { role: 'Pejabat', name: d.pejabatNama, signed: Boolean(d.pejabatSign) },
      { role: 'Personel', name: d.personelNama, signed: Boolean(d.personelSign) }
    ];
  }
  return [];
}

export function HistoryModal({ isOpen, onClose, onLoadDoc, activeDocId = null }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return docs;
    const q = searchQuery.toLowerCase();
    return docs.filter(doc => {
      const titleMatch = (doc.title || '').toLowerCase().includes(q);
      const typeMatch = (doc.type || '').toLowerCase().includes(q);
      return titleMatch || typeMatch;
    });
  }, [docs, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[88vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-600" />
              <span>Riwayat Dokumen & D1 Database</span>
            </h3>
            <p className="text-xs text-slate-500">Pilih draf untuk dibuka dan diedit kembali. Tanda tangan tersimpan permanen.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-5 py-2.5 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari dokumen berdasarkan judul, nama RS, periode..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
          </div>
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
            <div className="text-center py-12 text-xs text-slate-400">Memuat riwayat dokumen dari D1...</div>
          ) : !Array.isArray(filteredDocs) || filteredDocs.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <FolderOpen className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs">
                {searchQuery ? 'Tidak ada dokumen yang cocok dengan pencarian.' : 'Belum ada dokumen yang disimpan.'}
              </p>
              <p className="text-[11px] text-slate-400">Klik "Simpan Draf" di toolbar atas untuk menyimpan ke D1 Database.</p>
            </div>
          ) : (
            filteredDocs.map((doc) => {
              if (!doc) return null;
              const typeLabels = {
                kosan: { label: '1. Uang Kosan', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
                makan: { label: '2. Uang Makan', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                lembur: { label: '3. Uang Lembur', color: 'bg-purple-100 text-purple-800 border-purple-200' },
                akomodasi: { label: '4. Akomodasi', color: 'bg-amber-100 text-amber-800 border-amber-200' },
                pembelian: { label: '5. Pembelian', color: 'bg-rose-100 text-rose-800 border-rose-200' },
                surat: { label: '6. Surat Tugas', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' }
              };
              const tag = typeLabels[doc.type] || { label: doc.type || 'Dokumen', color: 'bg-slate-100 text-slate-800 border-slate-200' };

              const signatures = getSignatureSummary(doc);
              const signedCount = signatures.filter(s => s.signed).length;
              const isAllSigned = signatures.length > 0 && signedCount === signatures.length;
              const isCurrent = activeDocId && activeDocId === doc.id;

              return (
                <div
                  key={doc.id || Math.random()}
                  onClick={() => {
                    onLoadDoc(doc);
                    onClose();
                  }}
                  className={`p-3.5 border rounded-xl cursor-pointer flex flex-col gap-2.5 transition group ${
                    isCurrent
                      ? 'bg-blue-50/60 border-blue-400 ring-2 ring-blue-200 shadow-sm'
                      : 'bg-white hover:bg-blue-50/30 border-slate-200 hover:border-blue-400 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${tag.color}`}>
                          {tag.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-600 text-white flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Sedang Dibuka
                          </span>
                        )}
                        {signatures.length > 0 && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 border ${
                            isAllSigned
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : signedCount > 0
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {isAllSigned ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Lengkap ({signedCount}/{signatures.length} TTD)</span>
                              </>
                            ) : (
                              <span>{signedCount}/{signatures.length} TTD</span>
                            )}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate">
                        {doc.title || 'Dokumen Tanpa Judul'}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleDelete(doc.id, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus Dokumen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Signature slots indicator badges */}
                  {signatures.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100 text-[10px]">
                      <span className="text-slate-400 text-[9px] font-medium">Status TTD:</span>
                      {signatures.map((sig, sIdx) => (
                        <span
                          key={sIdx}
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] border ${
                            sig.signed
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                          title={sig.signed ? `Sudah ditandatangani: ${sig.name || sig.role}` : `Belum ditandatangani: ${sig.role}`}
                        >
                          {sig.signed ? (
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          )}
                          <span>{sig.role}{sig.name ? `: ${sig.name.split(' ')[0]}` : ''}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Metadata Row */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1 text-[10px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{doc.updated_at ? `Diperbarui: ${formatTimestamp(doc.updated_at)}` : formatTimestamp(doc.created_at)}</span>
                    </span>
                    {Number(doc.total_amount) > 0 && (
                      <span className="font-bold text-slate-800 text-[11px]">
                        {formatRupiah(doc.total_amount)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Total {filteredDocs.length} dokumen tersimpan di Cloudflare D1
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
