import React from 'react';
import { Plus, Trash2, PenTool, Users, Sparkles } from 'lucide-react';
import { formatRupiah } from '../utils/currency';

export function MakanForm({ data, onChange, onOpenSignatureModal }) {
  const updateField = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...(data.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...data, items: newItems });
  };

  const addItem = () => {
    const newIndex = (data.items || []).length + 1;
    const newItems = [
      ...(data.items || []),
      {
        id: `m-${Date.now()}`,
        wbs: String(newIndex),
        tanggal: '01/09/2026 - 30/09/2026',
        description: 'Konsumsi Anggota Tim',
        qty: 30,
        unit: 'Hari',
        hargaSatuan: 50000,
        ttd: ''
      }
    ];
    onChange({ ...data, items: newItems });
  };

  const removeItem = (index) => {
    const newItems = (data.items || []).filter((_, i) => i !== index);
    onChange({ ...data, items: newItems });
  };

  // Quick apply same rate or days to all
  const applyDaysToAll = (days) => {
    const newItems = (data.items || []).map(item => ({ ...item, qty: Number(days) || 0 }));
    onChange({ ...data, items: newItems });
  };

  const applyRateToAll = (rate) => {
    const newItems = (data.items || []).map(item => ({ ...item, hargaSatuan: Number(rate) || 0 }));
    onChange({ ...data, items: newItems });
  };

  return (
    <div className="space-y-6">
      {/* 1. VOUCHER DETAILS */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          Page 1: Data Permintaan Uang Muka
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nomor Dokumen</label>
            <input
              type="text"
              value={data.nomor || ''}
              onChange={(e) => updateField('nomor', e.target.value)}
              placeholder="Contoh: 002/PUM/IX/2026"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Dokumen</label>
            <input
              type="date"
              value={data.tanggal || ''}
              onChange={(e) => updateField('tanggal', e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Dibayarkan Kepada</label>
            <input
              type="text"
              value={data.dibayarkanKepada || ''}
              onChange={(e) => updateField('dibayarkanKepada', e.target.value)}
              placeholder="Contoh: Alif Drian Al Hakim"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan Voucher</label>
            <textarea
              rows={3}
              value={data.keterangan || ''}
              onChange={(e) => updateField('keterangan', e.target.value)}
              placeholder="Pengajuan Uang Makan 1 SEPTEMBER- 30 SEPTEMBER 2026&#10;Rumah Sakti Cipto Mangunkusumo&#10;1 - 30 SEPTEMBER 2026"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Voucher Signatures */}
        <div className="border-t border-slate-100 pt-4">
          <label className="block text-xs font-bold text-slate-700 mb-3">Tanda Tangan & Pejabat Voucher</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pemohon */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="text-[11px] font-bold text-slate-700">1. Dibuat Oleh (Pemohon)</span>
              <input
                type="text"
                value={data.pemohonNama || ''}
                onChange={(e) => updateField('pemohonNama', e.target.value)}
                placeholder="Nama Pemohon"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
              />
              <button
                type="button"
                onClick={() => onOpenSignatureModal('pemohonSign', data.pemohonNama)}
                className="w-full flex items-center justify-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 py-1.5 rounded transition"
              >
                <PenTool className="w-3.5 h-3.5" />
                {data.pemohonSign ? 'Ubah TTD' : 'Beri TTD'}
              </button>
            </div>

            {/* HOD */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="text-[11px] font-bold text-slate-700">2. Disetujui Oleh (HOD)</span>
              <input
                type="text"
                value={data.hodNama || ''}
                onChange={(e) => updateField('hodNama', e.target.value)}
                placeholder="Nama HOD"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
              />
              <button
                type="button"
                onClick={() => onOpenSignatureModal('hodSign', data.hodNama)}
                className="w-full flex items-center justify-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 py-1.5 rounded transition"
              >
                <PenTool className="w-3.5 h-3.5" />
                {data.hodSign ? 'Ubah TTD' : 'Beri TTD'}
              </button>
            </div>

            {/* Direktur */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="text-[11px] font-bold text-slate-700">3. Disetujui Oleh (Direktur)</span>
              <input
                type="text"
                value={data.direkturNama || ''}
                onChange={(e) => updateField('direkturNama', e.target.value)}
                placeholder="Nama Direktur"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
              />
              <button
                type="button"
                onClick={() => onOpenSignatureModal('direkturSign', data.direkturNama)}
                className="w-full flex items-center justify-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 py-1.5 rounded transition"
              >
                <PenTool className="w-3.5 h-3.5" />
                {data.direkturSign ? 'Ubah TTD' : 'Beri TTD'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LAMPIRAN KONSUMSI DETAILS */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            Page 2: Lampiran Konsumsi Tim
          </h3>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Tambah Personil
          </button>
        </div>

        {/* Project Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Project</label>
            <input
              type="text"
              value={data.project || ''}
              onChange={(e) => updateField('project', e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Rumah Sakit</label>
            <input
              type="text"
              value={data.rumahSakit || ''}
              onChange={(e) => updateField('rumahSakit', e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Periode</label>
            <input
              type="text"
              value={data.periode || ''}
              onChange={(e) => updateField('periode', e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Tahap</label>
            <input
              type="text"
              value={data.tahap || ''}
              onChange={(e) => updateField('tahap', e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
            />
          </div>
        </div>

        {/* Bulk Action Helpers */}
        <div className="flex flex-wrap items-center gap-2 p-2.5 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-900">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="font-semibold">Bantuan Cepat:</span>
          <button
            type="button"
            onClick={() => applyDaysToAll(30)}
            className="px-2 py-1 bg-white border border-blue-200 hover:bg-blue-100 rounded text-[11px]"
          >
            Set Semua 30 Hari
          </button>
          <button
            type="button"
            onClick={() => applyRateToAll(50000)}
            className="px-2 py-1 bg-white border border-blue-200 hover:bg-blue-100 rounded text-[11px]"
          >
            Set Rate Rp 50.000 / hari
          </button>
          <button
            type="button"
            onClick={() => applyRateToAll(75000)}
            className="px-2 py-1 bg-white border border-blue-200 hover:bg-blue-100 rounded text-[11px]"
          >
            Set Rate Jawa/Bali Rp 75.000
          </button>
        </div>

        {/* Member list */}
        <div className="space-y-3">
          {(data.items || []).map((item, idx) => (
            <div key={item.id || idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  Personil #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-rose-500 hover:bg-rose-50 p-1 rounded transition"
                  title="Hapus personil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="md:col-span-2">
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                    Nama & Deskripsi Konsumsi
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    placeholder="Contoh: Konsumsi Alif Drian"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                    Rentang Tanggal
                  </label>
                  <input
                    type="text"
                    value={item.tanggal}
                    onChange={(e) => updateItem(idx, 'tanggal', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-end">
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Jumlah Hari (Qty)</label>
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-xs text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Tarif / Hari (Rp)</label>
                  <input
                    type="number"
                    value={item.hargaSatuan}
                    onChange={(e) => updateItem(idx, 'hargaSatuan', e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-xs text-right"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Subtotal</label>
                  <div className="px-2 py-1.5 bg-slate-100 rounded text-xs font-bold text-slate-800 text-right">
                    {formatRupiah((Number(item.qty) || 0) * (Number(item.hargaSatuan) || 0))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">TTD Personil</label>
                  <button
                    type="button"
                    onClick={() => onOpenSignatureModal(`makan_item_${idx}`, item.description)}
                    className="w-full flex items-center justify-center gap-1 text-xs bg-white border border-slate-300 hover:bg-slate-50 py-1.5 rounded transition"
                  >
                    <PenTool className="w-3.5 h-3.5 text-blue-600" />
                    {item.ttd ? '✓ Ubah TTD' : '+ Tanda Tangan'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
