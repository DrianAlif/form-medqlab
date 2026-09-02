import React, { useState } from 'react';
import { Plus, Trash2, PenTool, Users, Sparkles, Calendar, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { formatRupiah } from '../utils/currency';

const INDO_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function getMonthPeriodInfo(yearMonthStr) {
  if (!yearMonthStr) return null;
  const [yStr, mStr] = yearMonthStr.split('-');
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  if (!year || !month) return null;

  const daysInMonth = new Date(year, month, 0).getDate();
  const pad = (n) => String(n).padStart(2, '0');

  const startDateStr = `01/${pad(month)}/${year}`;
  const endDateStr = `${pad(daysInMonth)}/${pad(month)}/${year}`;
  const monthName = INDO_MONTHS[month - 1] || '';

  return {
    year,
    month,
    daysInMonth,
    startDateStr,
    endDateStr,
    monthName,
    rangeFormatted: `${startDateStr} - ${endDateStr}`,
    periodeTitle: `1 - ${daysInMonth} ${monthName.toUpperCase()} ${year}`
  };
}

export function getCustomRangeInfo(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return null;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);

  const pad = (n) => String(n).padStart(2, '0');
  const sDay = pad(start.getDate());
  const sMonth = pad(start.getMonth() + 1);
  const sYear = start.getFullYear();

  const eDay = pad(end.getDate());
  const eMonth = pad(end.getMonth() + 1);
  const eYear = end.getFullYear();

  return {
    daysCount: diffDays,
    rangeFormatted: `${sDay}/${sMonth}/${sYear} - ${eDay}/${eMonth}/${eYear}`,
    periodeTitle: `${sDay}/${sMonth}/${sYear} - ${eDay}/${eMonth}/${eYear}`
  };
}

export function MakanForm({ data, onChange, onOpenSignatureModal }) {
  const updateField = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...(data.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...data, items: newItems });
  };

  // Helper to extract initial year-month from items or data
  const getInitialMonth = () => {
    if (data.items && data.items.length > 0 && data.items[0].tanggal) {
      const match = data.items[0].tanggal.match(/\/(\d{2})\/(\d{4})/);
      if (match) {
        return `${match[2]}-${match[1]}`;
      }
    }
    if (data.tanggal) {
      return data.tanggal.slice(0, 7);
    }
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const [periodMode, setPeriodMode] = useState('month'); // 'month' | 'custom'
  const [selectedMonth, setSelectedMonth] = useState(getInitialMonth);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [syncVoucherDesc, setSyncVoucherDesc] = useState(true);
  const [lastAppliedFeedback, setLastAppliedFeedback] = useState(null);

  const currentMonthInfo = getMonthPeriodInfo(selectedMonth);

  // Quick month navigation (prev/next month)
  const changeMonthBy = (offset) => {
    const [yStr, mStr] = selectedMonth.split('-');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) + offset;
    if (m > 12) {
      y += Math.floor((m - 1) / 12);
      m = ((m - 1) % 12) + 1;
    } else if (m < 1) {
      y += Math.floor((m - 1) / 12);
      m = 12 + ((m) % 12);
    }
    const newMonth = `${y}-${String(m).padStart(2, '0')}`;
    setSelectedMonth(newMonth);
  };

  // Apply Month Period to All Items and Metadata
  const applyMonthToAll = (targetMonthInfo = currentMonthInfo) => {
    if (!targetMonthInfo) return;
    const { rangeFormatted, daysInMonth, periodeTitle } = targetMonthInfo;

    const newItems = (data.items || []).map(item => ({
      ...item,
      tanggal: rangeFormatted,
      qty: daysInMonth
    }));

    const updatePayload = {
      ...data,
      periode: periodeTitle,
      items: newItems
    };

    if (syncVoucherDesc) {
      updatePayload.keterangan = `Pengajuan Uang Makan ${periodeTitle}\n${data.rumahSakit || 'Rumah Sakit'}\n${periodeTitle}`;
    }

    onChange(updatePayload);
    setLastAppliedFeedback(`Periode "${periodeTitle}" (${rangeFormatted} • ${daysInMonth} Hari) berhasil diterapkan ke semua personil!`);
    setTimeout(() => setLastAppliedFeedback(null), 4000);
  };

  // Apply Custom Range to All
  const applyCustomRangeToAll = () => {
    const rangeInfo = getCustomRangeInfo(customStart, customEnd);
    if (!rangeInfo) {
      alert('Silakan pilih Tanggal Mulai dan Tanggal Selesai yang valid.');
      return;
    }
    const { rangeFormatted, daysCount, periodeTitle } = rangeInfo;

    const newItems = (data.items || []).map(item => ({
      ...item,
      tanggal: rangeFormatted,
      qty: daysCount
    }));

    const updatePayload = {
      ...data,
      periode: periodeTitle,
      items: newItems
    };

    if (syncVoucherDesc) {
      updatePayload.keterangan = `Pengajuan Uang Makan ${periodeTitle}\n${data.rumahSakit || 'Rumah Sakit'}\n${periodeTitle}`;
    }

    onChange(updatePayload);
    setLastAppliedFeedback(`Rentang "${rangeFormatted}" (${daysCount} Hari) berhasil diterapkan ke semua personil!`);
    setTimeout(() => setLastAppliedFeedback(null), 4000);
  };

  // Apply period to a single row
  const applyMonthToSingleItem = (index) => {
    if (!currentMonthInfo) return;
    const { rangeFormatted, daysInMonth } = currentMonthInfo;
    const newItems = [...(data.items || [])];
    newItems[index] = {
      ...newItems[index],
      tanggal: rangeFormatted,
      qty: daysInMonth
    };
    onChange({ ...data, items: newItems });
  };

  const addItem = () => {
    const newIndex = (data.items || []).length + 1;
    const defaultTanggal = currentMonthInfo ? currentMonthInfo.rangeFormatted : '01/09/2026 - 30/09/2026';
    const defaultQty = currentMonthInfo ? currentMonthInfo.daysInMonth : 30;

    const newItems = [
      ...(data.items || []),
      {
        id: `m-${Date.now()}`,
        wbs: String(newIndex),
        tanggal: defaultTanggal,
        description: 'Konsumsi Anggota Tim',
        qty: defaultQty,
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
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Dokumen</label>
            <input
              type="date"
              value={data.tanggal || ''}
              onChange={(e) => updateField('tanggal', e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Dibayarkan Kepada</label>
            <input
              type="text"
              value={data.dibayarkanKepada || ''}
              onChange={(e) => updateField('dibayarkanKepada', e.target.value)}
              placeholder="Contoh: Alif Drian Al Hakim"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan Voucher</label>
            <textarea
              rows={3}
              value={data.keterangan || ''}
              onChange={(e) => updateField('keterangan', e.target.value)}
              placeholder="Pengajuan Uang Makan 1 SEPTEMBER- 30 SEPTEMBER 2026&#10;Rumah Sakti Cipto Mangunkusumo&#10;1 - 30 SEPTEMBER 2026"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
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

        {/* SMART PERIOD & MONTH GENERATOR WIDGET */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50/40 to-slate-50 border-2 border-blue-200 rounded-xl p-4 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600 text-white rounded-lg shadow-xs">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-blue-950">
                  Generator Periode & Rentang Tanggal Otomatis (1 Bulan Penuh)
                </h4>
                <p className="text-[11px] text-blue-700">
                  Otomatis menghitung jumlah hari (28/29/30/31 hari) dan tanggal awal hingga akhir bulan.
                </p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-white p-0.5 border border-blue-200 rounded-lg self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setPeriodMode('month')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                  periodMode === 'month'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📅 1 Bulan Penuh
              </button>
              <button
                type="button"
                onClick={() => setPeriodMode('custom')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                  periodMode === 'custom'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📆 Rentang Kustom
              </button>
            </div>
          </div>

          {/* Mode 1: Month Selector */}
          {periodMode === 'month' && currentMonthInfo && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => changeMonthBy(-1)}
                    className="p-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 transition"
                    title="Bulan sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800 shadow-2xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => changeMonthBy(1)}
                    className="p-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 transition"
                    title="Bulan berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Auto Calculated Summary Tags */}
                <div className="sm:col-span-7 flex flex-wrap items-center gap-2 text-xs">
                  <div className="bg-white border border-blue-200 px-2.5 py-1.5 rounded-lg shadow-2xs">
                    <span className="text-slate-500 text-[10px] block">Rentang Tanggal</span>
                    <span className="font-bold text-blue-900 font-mono text-[11px]">{currentMonthInfo.rangeFormatted}</span>
                  </div>
                  <div className="bg-white border border-blue-200 px-2.5 py-1.5 rounded-lg shadow-2xs">
                    <span className="text-slate-500 text-[10px] block">Total Hari (Qty)</span>
                    <span className="font-bold text-emerald-700 text-[11px]">{currentMonthInfo.daysInMonth} Hari</span>
                  </div>
                  <div className="bg-white border border-blue-200 px-2.5 py-1.5 rounded-lg shadow-2xs">
                    <span className="text-slate-500 text-[10px] block">Nama Periode</span>
                    <span className="font-bold text-slate-800 text-[11px]">{currentMonthInfo.periodeTitle}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => applyMonthToAll(currentMonthInfo)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition active:scale-[0.99]"
                >
                  <Sparkles className="w-4 h-4" />
                  Terapkan Otomatis ke Semua Personil ({currentMonthInfo.rangeFormatted} • {currentMonthInfo.daysInMonth} Hari)
                </button>

                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={syncVoucherDesc}
                    onChange={(e) => setSyncVoucherDesc(e.target.checked)}
                    className="rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span>Sinkronkan juga ke teks Voucher Page 1</span>
                </label>
              </div>
            </div>
          )}

          {/* Mode 2: Custom Date Range */}
          {periodMode === 'custom' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={applyCustomRangeToAll}
                    disabled={!customStart || !customEnd}
                    className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg transition shadow-xs"
                  >
                    Terapkan Rentang Ini
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Feedback banner */}
          {lastAppliedFeedback && (
            <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{lastAppliedFeedback}</span>
            </div>
          )}
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
            <div className="flex justify-between items-center mb-0.5">
              <label className="block text-[11px] font-semibold text-slate-600">Periode</label>
              {currentMonthInfo && (
                <button
                  type="button"
                  onClick={() => updateField('periode', currentMonthInfo.periodeTitle)}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold underline"
                >
                  ⚡ Gunakan {currentMonthInfo.periodeTitle}
                </button>
              )}
            </div>
            <input
              type="text"
              value={data.periode || ''}
              onChange={(e) => updateField('periode', e.target.value)}
              placeholder="Contoh: 1 - 30 SEPTEMBER 2026"
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white font-medium"
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

        {/* Quick Rate & Days Helper */}
        <div className="flex flex-wrap items-center gap-2 p-2.5 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-900">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="font-semibold">Bantuan Cepat Tarif:</span>
          <button
            type="button"
            onClick={() => applyRateToAll(50000)}
            className="px-2.5 py-1 bg-white border border-blue-200 hover:bg-blue-100 rounded text-[11px] font-semibold"
          >
            Set Tarif Rp 50.000 / hari
          </button>
          <button
            type="button"
            onClick={() => applyRateToAll(75000)}
            className="px-2.5 py-1 bg-white border border-blue-200 hover:bg-blue-100 rounded text-[11px] font-semibold"
          >
            Set Tarif Jawa/Bali Rp 75.000 / hari
          </button>
          <button
            type="button"
            onClick={() => applyRateToAll(90000)}
            className="px-2.5 py-1 bg-white border border-blue-200 hover:bg-blue-100 rounded text-[11px] font-semibold"
          >
            Set Tarif Luar Jawa/Bali Rp 90.000 / hari
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
                  <div className="flex justify-between items-center mb-0.5">
                    <label className="block text-[10px] text-slate-500 font-semibold">
                      Rentang Tanggal
                    </label>
                    {currentMonthInfo && (
                      <button
                        type="button"
                        onClick={() => applyMonthToSingleItem(idx)}
                        className="text-[9.5px] text-blue-600 hover:text-blue-800 font-semibold underline"
                        title="Samakan rentang tanggal & qty dengan bulan aktif"
                      >
                        ⚡ 1 Bulan Ini
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={item.tanggal}
                    onChange={(e) => updateItem(idx, 'tanggal', e.target.value)}
                    placeholder="DD/MM/YYYY - DD/MM/YYYY"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-mono"
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
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-xs text-center font-bold text-slate-800"
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
