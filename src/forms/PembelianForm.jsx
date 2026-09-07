import React from 'react';
import { Plus, Trash2, PenTool, ShoppingBag, Calculator, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatRupiah, parseRupiahInput } from '../utils/currency';
import { formatShortIndoDate } from '../utils/dateUtils';

export function PembelianForm({ data = {}, onChange, onOpenSignatureModal }) {
  const updateField = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleAddItem = () => {
    const newItem = {
      id: `pb-${Date.now()}`,
      namaBarang: '',
      qty: 1,
      hargaSatuan: 0,
      keperluan: 'Pekerjaan',
      keterangan: ''
    };
    updateField('items', [...(data.items || []), newItem]);
  };

  const handleUpdateItem = (index, field, value) => {
    const newItems = [...(data.items || [])];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'qty' || field === 'hargaSatuan' ? (field === 'qty' ? Number(value) || 0 : parseRupiahInput(value)) : value
    };
    updateField('items', newItems);
  };

  const handleRemoveItem = (index) => {
    if ((data.items || []).length <= 1) {
      alert('Minimal harus ada 1 baris barang permintaan.');
      return;
    }
    const newItems = (data.items || []).filter((_, i) => i !== index);
    updateField('items', newItems);
  };

  const grandTotal = (data.items || []).reduce((acc, it) => {
    return acc + ((Number(it.qty) || 0) * (Number(it.hargaSatuan) || 0));
  }, 0);

  return (
    <div className="space-y-6">
      {/* 1. INFORMASI DOKUMEN & PEMOHON */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            A. Informasi Dokumen & Pemohon
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              No. Dokumen (Opsional)
            </label>
            <input
              type="text"
              value={data.nomor || ''}
              onChange={(e) => updateField('nomor', e.target.value)}
              placeholder="Contoh: 001/PPB/VIII/2026 (Boleh kosong)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-semibold text-slate-600">Tanggal Pengajuan</label>
              <span className="text-[10px] text-slate-400 font-mono">
                Format: {formatShortIndoDate(data.tanggal) || '6-Agu-26'}
              </span>
            </div>
            <input
              type="date"
              value={data.tanggal || ''}
              onChange={(e) => updateField('tanggal', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              Departemen (Dept)
            </label>
            <input
              type="text"
              value={data.dept || ''}
              onChange={(e) => updateField('dept', e.target.value)}
              placeholder="Contoh: Developer"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              Nama Pemohon (Pemesan)
            </label>
            <input
              type="text"
              value={data.nama || ''}
              onChange={(e) => {
                const val = e.target.value;
                onChange({
                  ...data,
                  nama: val,
                  diajukanNama: val
                });
              }}
              placeholder="Contoh: Galih Wicaksono"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
            />
          </div>
        </div>
      </div>

      {/* 2. DAFTAR PERMINTAAN PEMBELIAN BARANG */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              B. Daftar Permintaan Pembelian Barang
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rincian item barang, kuantitas (Qty), harga satuan, keperluan, dan keterangan
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Barang</span>
          </button>
        </div>

        {/* Dynamic Items List */}
        <div className="space-y-4">
          {(data.items || []).map((item, idx) => {
            const rowQty = Number(item.qty) || 0;
            const rowPrice = Number(item.hargaSatuan) || 0;
            const rowTotal = rowQty * rowPrice;

            return (
              <div
                key={item.id || idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 relative group"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold text-xs">
                    Barang #{idx + 1}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-600">
                      Total: <span className="font-bold text-slate-900">{formatRupiah(rowTotal)}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded transition"
                      title="Hapus baris ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                  {/* Nama Barang */}
                  <div className="md:col-span-6">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Jenis / Nama Barang
                    </label>
                    <input
                      type="text"
                      value={item.namaBarang || ''}
                      onChange={(e) => handleUpdateItem(idx, 'namaBarang', e.target.value)}
                      placeholder="Contoh: Claude Code"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium"
                    />
                  </div>

                  {/* Qty */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5 text-center">
                      Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.qty ?? 1}
                      onChange={(e) => handleUpdateItem(idx, 'qty', e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-xs text-center font-semibold"
                    />
                  </div>

                  {/* Harga Satuan */}
                  <div className="md:col-span-4">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Harga Satuan (Rp)
                    </label>
                    <input
                      type="text"
                      value={item.hargaSatuan ? formatRupiah(item.hargaSatuan, false) : ''}
                      onChange={(e) => handleUpdateItem(idx, 'hargaSatuan', e.target.value)}
                      placeholder="Contoh: 359.660"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs text-right font-mono"
                    />
                  </div>

                  {/* Keperluan */}
                  <div className="md:col-span-6">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Keperluan
                    </label>
                    <input
                      type="text"
                      value={item.keperluan || ''}
                      onChange={(e) => handleUpdateItem(idx, 'keperluan', e.target.value)}
                      placeholder="Contoh: Pekerjaan"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                    />
                  </div>

                  {/* Keterangan */}
                  <div className="md:col-span-6">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Keterangan (Opsional)
                    </label>
                    <input
                      type="text"
                      value={item.keterangan || ''}
                      onChange={(e) => handleUpdateItem(idx, 'keterangan', e.target.value)}
                      placeholder="Catatan / spesifikasi tambahan"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Grand Total Summary Banner */}
        <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Total Estimasi Pembelian ({ (data.items || []).length } Item)
              </div>
              <div className="text-base font-extrabold text-white">
                {formatRupiah(grandTotal, true)}
              </div>
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-400 hidden sm:block">
            Auto-kalkulasi ke tabel form cetak
          </div>
        </div>
      </div>

      {/* 3. TANDA TANGAN & PERSETUJUAN */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            C. Tanda Tangan & Persetujuan
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Diajukan (Pemesan) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span className="text-[11px] font-bold text-slate-700 block">
              1. Diajukan (Pemesan)
            </span>
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Nama Pemesan</label>
              <input
                type="text"
                value={data.diajukanNama || ''}
                onChange={(e) => updateField('diajukanNama', e.target.value)}
                placeholder="Nama Pemesan"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Jabatan / Role</label>
              <input
                type="text"
                value={data.diajukanRole || 'Pemesan'}
                onChange={(e) => updateField('diajukanRole', e.target.value)}
                placeholder="Pemesan"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
              />
            </div>
            <button
              type="button"
              onClick={() => onOpenSignatureModal('diajukanSign', data.diajukanNama || 'Pemesan')}
              className="w-full flex items-center justify-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 py-1.5 rounded transition font-medium"
            >
              <PenTool className="w-3.5 h-3.5" />
              {data.diajukanSign ? 'Ubah TTD Diajukan' : 'Beri TTD Diajukan'}
            </button>
          </div>

          {/* 2. Direview Oleh */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span className="text-[11px] font-bold text-slate-700 block">
              2. Direview Oleh
            </span>
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Nama Reviewer</label>
              <input
                type="text"
                value={data.direviewNama || ''}
                onChange={(e) => updateField('direviewNama', e.target.value)}
                placeholder="Nama Reviewer (e.g. Enjay Tarigan)"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Jabatan / Role</label>
              <input
                type="text"
                value={data.direviewRole || ''}
                onChange={(e) => updateField('direviewRole', e.target.value)}
                placeholder="Boleh kosong atau e.g. HOD"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
              />
            </div>
            <button
              type="button"
              onClick={() => onOpenSignatureModal('direviewSign', data.direviewNama || 'Reviewer')}
              className="w-full flex items-center justify-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 py-1.5 rounded transition font-medium"
            >
              <PenTool className="w-3.5 h-3.5" />
              {data.direviewSign ? 'Ubah TTD Direview' : 'Beri TTD Direview'}
            </button>
          </div>

          {/* 3. Disetujui Oleh (Direktur) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span className="text-[11px] font-bold text-slate-700 block">
              3. Disetujui Oleh
            </span>
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Nama Pejabat / Direktur</label>
              <input
                type="text"
                value={data.disetujuiNama || ''}
                onChange={(e) => updateField('disetujuiNama', e.target.value)}
                placeholder="Nama Pejabat / Direktur"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Jabatan / Role</label>
              <input
                type="text"
                value={data.disetujuiRole || 'Direktur'}
                onChange={(e) => updateField('disetujuiRole', e.target.value)}
                placeholder="Direktur"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
              />
            </div>
            <button
              type="button"
              onClick={() => onOpenSignatureModal('disetujuiSign', data.disetujuiNama || 'Direktur')}
              className="w-full flex items-center justify-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 py-1.5 rounded transition font-medium"
            >
              <PenTool className="w-3.5 h-3.5" />
              {data.disetujuiSign ? 'Ubah TTD Disetujui' : 'Beri TTD Disetujui'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
