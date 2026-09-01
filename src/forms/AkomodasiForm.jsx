import React, { useState } from 'react';
import { Plus, Trash2, PenTool, Upload, Image as ImageIcon, ArrowUp, ArrowDown, Calculator, FileText, Loader2, FileCheck } from 'lucide-react';
import { formatRupiah } from '../utils/currency';
import { processUploadedFile } from '../utils/fileUploadHelper';

export function AkomodasiForm({ data, onChange, onOpenSignatureModal }) {
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const updateField = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  // --- Row Operations ---
  const handleAddItem = () => {
    const newItem = {
      id: `ak-${Date.now()}`,
      tanggal: data.periode || '',
      customer: data.customer || '',
      tujuan: '',
      bensin: 0,
      tolParkir: 0,
      pjs: 0,
      hotel: 0,
      entertaint: 0,
      tiket: 0,
      fotocopy: 0,
      lainLain: 0
    };
    updateField('items', [...(data.items || []), newItem]);
  };

  const handleUpdateItem = (index, field, value) => {
    const newItems = [...(data.items || [])];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'tanggal' || field === 'customer' || field === 'tujuan' ? value : Number(value) || 0
    };
    updateField('items', newItems);
  };

  const handleRemoveItem = (index) => {
    if ((data.items || []).length <= 1) {
      alert('Minimal harus ada 1 baris pengeluaran.');
      return;
    }
    const newItems = (data.items || []).filter((_, i) => i !== index);
    updateField('items', newItems);
  };

  // --- Multi-file Attachment Operations (PNG/JPG/PDF Supported) ---
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsProcessingFile(true);
    try {
      let newlyAdded = [];
      for (const file of files) {
        const processedItems = await processUploadedFile(file);
        newlyAdded = newlyAdded.concat(processedItems);
      }

      onChange(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...newlyAdded]
      }));
    } catch (err) {
      console.error('File upload/conversion error:', err);
      alert('Gagal memproses file yang diunggah. Pastikan format PNG, JPG, atau PDF valid.');
    } finally {
      setIsProcessingFile(false);
      e.target.value = '';
    }
  };

  const handleUpdateCaption = (index, caption) => {
    const newAtts = [...(data.attachments || [])];
    newAtts[index] = { ...newAtts[index], caption };
    updateField('attachments', newAtts);
  };

  const handleRemoveAttachment = (index) => {
    const newAtts = (data.attachments || []).filter((_, i) => i !== index);
    updateField('attachments', newAtts);
  };

  const handleMoveAttachment = (index, direction) => {
    const newAtts = [...(data.attachments || [])];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newAtts.length) return;
    const temp = newAtts[index];
    newAtts[index] = newAtts[targetIdx];
    newAtts[targetIdx] = temp;
    updateField('attachments', newAtts);
  };

  // --- Financial Calculations ---
  const totalTerpakai = (data.items || []).reduce((acc, it) => {
    const rowSum = (Number(it.bensin) || 0) +
      (Number(it.tolParkir) || 0) +
      (Number(it.pjs) || 0) +
      (Number(it.hotel) || 0) +
      (Number(it.entertaint) || 0) +
      (Number(it.tiket) || 0) +
      (Number(it.fotocopy) || 0) +
      (Number(it.lainLain) || 0);
    return acc + rowSum;
  }, 0);

  const totalDiterima1 = Number(data.totalDiterima1) || 0;
  const totalDiterima2 = Number(data.totalDiterima2) || 0;
  const totalDiterimaAll = totalDiterima1 + totalDiterima2;
  const sisaAkomodasi = totalDiterimaAll - totalTerpakai;

  return (
    <div className="space-y-6">
      {/* 1. INFORMASI PEGAWAI & LOKASI */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          A. Informasi Pegawai & Project
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Nama Pegawai</label>
            <input
              type="text"
              value={data.nama || ''}
              onChange={(e) => updateField('nama', e.target.value)}
              placeholder="Contoh: M. Prahmadyan"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">NIK</label>
            <input
              type="text"
              value={data.nik || ''}
              onChange={(e) => updateField('nik', e.target.value)}
              placeholder="Contoh: NPP-0021"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Jabatan</label>
            <input
              type="text"
              value={data.jabatan || ''}
              onChange={(e) => updateField('jabatan', e.target.value)}
              placeholder="Contoh: Implementator"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Department</label>
            <input
              type="text"
              value={data.department || ''}
              onChange={(e) => updateField('department', e.target.value)}
              placeholder="Contoh: Project"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Nama Customer / RS</label>
            <input
              type="text"
              value={data.customer || ''}
              onChange={(e) => updateField('customer', e.target.value)}
              placeholder="Contoh: RSCM"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Periode Tanggal</label>
            <input
              type="text"
              value={data.periode || ''}
              onChange={(e) => updateField('periode', e.target.value)}
              placeholder="Contoh: 19 Mei - 03 Juni 2025"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-slate-600 mb-1">Tanggal Dokumen / Pengajuan</label>
            <input
              type="text"
              value={data.tanggalDokumen || ''}
              onChange={(e) => updateField('tanggalDokumen', e.target.value)}
              placeholder="Contoh: 31 Agustus 2026"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. TABEL PENGELUARAN AKOMODASI (DYNAMIC ROWS) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              B. Rincian Pengeluaran Akomodasi
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Isi komponen pengeluaran sesuai struk atau bukti transaksi
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Baris</span>
          </button>
        </div>

        <div className="space-y-4">
          {(data.items || []).map((item, idx) => {
            const rowSum = (Number(item.bensin) || 0) +
              (Number(item.tolParkir) || 0) +
              (Number(item.pjs) || 0) +
              (Number(item.hotel) || 0) +
              (Number(item.entertaint) || 0) +
              (Number(item.tiket) || 0) +
              (Number(item.fotocopy) || 0) +
              (Number(item.lainLain) || 0);

            return (
              <div
                key={item.id || idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold text-xs">
                    Baris #{idx + 1}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-600">
                      Total Baris: <span className="font-bold text-slate-900">{formatRupiah(rowSum)}</span>
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

                {/* Primary Row Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Tanggal / Periode
                    </label>
                    <input
                      type="text"
                      value={item.tanggal || ''}
                      onChange={(e) => handleUpdateItem(idx, 'tanggal', e.target.value)}
                      placeholder="19 Mei - 03 Juni 2025"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Nama Customer / RS
                    </label>
                    <input
                      type="text"
                      value={item.customer || ''}
                      onChange={(e) => handleUpdateItem(idx, 'customer', e.target.value)}
                      placeholder="RSCM"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Tujuan / Keterangan
                    </label>
                    <input
                      type="text"
                      value={item.tujuan || ''}
                      onChange={(e) => handleUpdateItem(idx, 'tujuan', e.target.value)}
                      placeholder="Transportasi / Konsumsi"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Expense Categories Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Bensin (Rp)</label>
                    <input
                      type="number"
                      value={item.bensin || ''}
                      onChange={(e) => handleUpdateItem(idx, 'bensin', e.target.value)}
                      placeholder="0"
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-right text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Tol / Parkir (Rp)</label>
                    <input
                      type="number"
                      value={item.tolParkir || ''}
                      onChange={(e) => handleUpdateItem(idx, 'tolParkir', e.target.value)}
                      placeholder="0"
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-right text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">PJS / Hari (Rp)</label>
                    <input
                      type="number"
                      value={item.pjs || ''}
                      onChange={(e) => handleUpdateItem(idx, 'pjs', e.target.value)}
                      placeholder="0"
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-right text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Hotel / Malam (Rp)</label>
                    <input
                      type="number"
                      value={item.hotel || ''}
                      onChange={(e) => handleUpdateItem(idx, 'hotel', e.target.value)}
                      placeholder="0"
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-right text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Entertaint / Makan (Rp)</label>
                    <input
                      type="number"
                      value={item.entertaint || ''}
                      onChange={(e) => handleUpdateItem(idx, 'entertaint', e.target.value)}
                      placeholder="0"
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-right text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Tiket (Rp)</label>
                    <input
                      type="number"
                      value={item.tiket || ''}
                      onChange={(e) => handleUpdateItem(idx, 'tiket', e.target.value)}
                      placeholder="0"
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-right text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Fotocopy / Cetakan (Rp)</label>
                    <input
                      type="number"
                      value={item.fotocopy || ''}
                      onChange={(e) => handleUpdateItem(idx, 'fotocopy', e.target.value)}
                      placeholder="0"
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-right text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5 font-bold text-emerald-700">Lain-Lain (Rp)</label>
                    <input
                      type="number"
                      value={item.lainLain || ''}
                      onChange={(e) => handleUpdateItem(idx, 'lainLain', e.target.value)}
                      placeholder="0"
                      className="w-full px-2 py-1 border border-emerald-300 bg-emerald-50/40 rounded text-right text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. REKAPITULASI KEUANGAN (SUMMARY BOX) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
          C. Rekapitulasi Keuangan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Total Diterima #1 (Uang Muka 1)</label>
            <input
              type="number"
              value={data.totalDiterima1 || ''}
              onChange={(e) => updateField('totalDiterima1', Number(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-right"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Total Diterima #2 (Uang Muka 2)</label>
            <input
              type="number"
              value={data.totalDiterima2 || ''}
              onChange={(e) => updateField('totalDiterima2', Number(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-right"
            />
          </div>

          {/* Real-time calculated cards */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-slate-500">Total Terpakai (Biaya Riil)</span>
            <div className="text-base font-extrabold text-slate-900">
              {formatRupiah(totalTerpakai)}
            </div>
          </div>

          <div className={`p-3 rounded-xl border space-y-1 ${
            sisaAkomodasi < 0
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <span className="text-[11px] font-semibold opacity-80">
              {sisaAkomodasi < 0 ? 'Sisa Akomodasi (Lebih Bayar / Reimburse)' : 'Sisa Akomodasi (Pengembalian)'}
            </span>
            <div className="text-base font-extrabold">
              {sisaAkomodasi < 0
                ? `-Rp ${formatRupiah(Math.abs(sisaAkomodasi), false)}`
                : formatRupiah(sisaAkomodasi)}
            </div>
          </div>
        </div>
      </div>

      {/* 4. UPLOAD BUKTI TRANSAKSI (PNG, JPG, PDF ATTACHMENTS) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              D. Lampiran Bukti Transaksi & Pembayaran
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload struk Gojek/Grab, KRL, Tiket, Invoice, Struk Bensin/Hotel (Format: <span className="font-bold text-slate-700">PNG, JPG, PDF</span>)
            </p>
          </div>

          <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition ${isProcessingFile ? 'opacity-60 pointer-events-none' : ''}`}>
            {isProcessingFile ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses File...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>+ Upload Bukti (PNG / PDF)</span>
              </>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf,.pdf"
              multiple
              onChange={handleFileUpload}
              disabled={isProcessingFile}
              className="hidden"
            />
          </label>
        </div>

        {/* Uploaded attachments grid */}
        {(data.attachments || []).length === 0 ? (
          <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400 bg-slate-50/50">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <span>Belum ada file bukti/struk diunggah. Klik tombol di atas untuk mengunggah file <strong>PNG, JPG, atau PDF</strong>.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {(data.attachments || []).map((att, idx) => (
              <div
                key={att.id || idx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-3 items-center group relative shadow-xs"
              >
                <div className="w-20 h-20 bg-white border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={att.dataUrl}
                    alt={att.caption || 'Bukti'}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                    <span className="truncate">Bukti #{idx + 1}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-semibold">
                      {att.name?.toLowerCase().endsWith('.pdf') ? 'PDF Page' : 'Image'}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={att.caption || ''}
                    onChange={(e) => handleUpdateCaption(idx, e.target.value)}
                    placeholder="Contoh: Tiket Kereta / GoRide RSCM"
                    className="w-full px-2.5 py-1 border border-slate-300 rounded bg-white text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveAttachment(idx, -1)}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200"
                    title="Pindah ke atas"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveAttachment(idx, 1)}
                    disabled={idx === (data.attachments || []).length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200"
                    title="Pindah ke bawah"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(idx)}
                    className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                    title="Hapus bukti ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. TANDA TANGAN & PERSETUJUAN */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          E. Tanda Tangan & Persetujuan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Dibuat Oleh */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span className="text-[11px] font-bold text-slate-700">1. Dibuat Oleh (Pemohon)</span>
            <input
              type="text"
              value={data.dibuatOlehNama || ''}
              onChange={(e) => updateField('dibuatOlehNama', e.target.value)}
              placeholder="M. Prahmadyan"
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
            />
            <button
              type="button"
              onClick={() => onOpenSignatureModal('dibuatOlehSign', data.dibuatOlehNama || 'M. Prahmadyan')}
              className="w-full flex items-center justify-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 py-1.5 rounded transition"
            >
              <PenTool className="w-3.5 h-3.5" />
              {data.dibuatOlehSign ? 'Ubah TTD' : 'Beri TTD'}
            </button>
          </div>

          {/* Diketahui Oleh */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span className="text-[11px] font-bold text-slate-700">2. Diketahui Oleh</span>
            <input
              type="text"
              value={data.diketahuiOlehNama || ''}
              onChange={(e) => updateField('diketahuiOlehNama', e.target.value)}
              placeholder="Nama Pejabat Terkait"
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
            />
            <button
              type="button"
              onClick={() => onOpenSignatureModal('diketahuiOlehSign', data.diketahuiOlehNama || 'Pejabat')}
              className="w-full flex items-center justify-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 py-1.5 rounded transition"
            >
              <PenTool className="w-3.5 h-3.5" />
              {data.diketahuiOlehSign ? 'Ubah TTD' : 'Beri TTD'}
            </button>
          </div>

          {/* Disetujui Oleh */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span className="text-[11px] font-bold text-slate-700">3. Disetujui Oleh (HOD)</span>
            <input
              type="text"
              value={data.disetujuiOlehNama || ''}
              onChange={(e) => updateField('disetujuiOlehNama', e.target.value)}
              placeholder="Nama Pejabat / HOD"
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
            />
            <button
              type="button"
              onClick={() => onOpenSignatureModal('disetujuiOlehSign', data.disetujuiOlehNama || 'Disetujui Oleh')}
              className="w-full flex items-center justify-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 py-1.5 rounded transition"
            >
              <PenTool className="w-3.5 h-3.5" />
              {data.disetujuiOlehSign ? 'Ubah TTD' : 'Beri TTD'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
