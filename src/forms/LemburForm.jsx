import React, { useState } from 'react';
import { Plus, Trash2, PenTool, Calendar, Sparkles, Clock, CheckCircle, Wand2, CalendarRange, Filter } from 'lucide-react';
import { formatSlashDate, getIndonesianDayName } from '../utils/dateUtils';
import { generateOvertimeEntries, getHolidayInfo, MONTH_NAMES_ID } from '../utils/holidays';

export function LemburForm({ data, onChange, onOpenSignatureModal }) {
  // Batch Generator State
  const now = new Date();
  const defaultYear = now.getFullYear();
  const defaultMonth = now.getMonth(); // 0-indexed

  const [genMode, setGenMode] = useState('month'); // 'month' or 'range'
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(7); // August (0-indexed = 7)
  const [rangeStart, setRangeStart] = useState('2026-07-18');
  const [rangeEnd, setRangeEnd] = useState('2026-08-17');

  const [includeSaturday, setIncludeSaturday] = useState(true);
  const [includeSunday, setIncludeSunday] = useState(true);
  const [includeHolidays, setIncludeHolidays] = useState(true);

  const [batchKeterangan, setBatchKeterangan] = useState('Support RSCM');
  const [batchWaktu, setBatchWaktu] = useState('09.00 - 17.00');
  const [batchJam, setBatchJam] = useState(8);

  // Single Quick Add
  const [quickDate, setQuickDate] = useState('');
  const [quickKeterangan, setQuickKeterangan] = useState('Support RSCM');

  const updateField = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...(data.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...data, items: newItems });
  };

  const addItem = () => {
    const newItems = [
      ...(data.items || []),
      {
        id: `l-${Date.now()}`,
        tanggal: '18/07/2026',
        hari: 'Sabtu',
        keterangan: 'Support RSCM',
        waktu: '09.00 - 17.00',
        hariCount: 1,
        jamCount: 8,
        hodApproved: true
      }
    ];
    onChange({ ...data, items: newItems });
  };

  const removeItem = (index) => {
    const newItems = (data.items || []).filter((_, i) => i !== index);
    onChange({ ...data, items: newItems });
  };

  // Run Batch Generation
  const handleRunBatchGenerate = (mode = 'replace') => {
    let startStr = '';
    let endStr = '';
    let bulanLabel = '';

    if (genMode === 'month') {
      const firstDay = new Date(selectedYear, selectedMonth, 1);
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0);

      const mStr = String(selectedMonth + 1).padStart(2, '0');
      startStr = `${selectedYear}-${mStr}-01`;
      endStr = `${selectedYear}-${mStr}-${String(lastDay.getDate()).padStart(2, '0')}`;
      bulanLabel = `${MONTH_NAMES_ID[selectedMonth]} ${selectedYear}`;
    } else {
      startStr = rangeStart;
      endStr = rangeEnd;
      const sD = new Date(rangeStart);
      const eD = new Date(rangeEnd);
      if (!isNaN(sD.getTime()) && !isNaN(eD.getTime())) {
        if (sD.getMonth() === eD.getMonth() && sD.getFullYear() === eD.getFullYear()) {
          bulanLabel = `${MONTH_NAMES_ID[sD.getMonth()]} ${sD.getFullYear()}`;
        } else {
          bulanLabel = `${MONTH_NAMES_ID[sD.getMonth()]} - ${MONTH_NAMES_ID[eD.getMonth()]} ${eD.getFullYear()}`;
        }
      }
    }

    const generated = generateOvertimeEntries({
      startDateStr: startStr,
      endDateStr: endStr,
      includeSaturday,
      includeSunday,
      includeHolidays,
      keterangan: batchKeterangan,
      waktu: batchWaktu,
      hariCount: 1,
      jamCount: batchJam
    });

    if (generated.length === 0) {
      alert('Tidak ada tanggal Sabtu/Minggu/Libur Nasional yang ditemukan pada rentang tersebut.');
      return;
    }

    const finalItems = mode === 'replace' ? generated : [...(data.items || []), ...generated];
    onChange({
      ...data,
      items: finalItems,
      bulan: data.bulan || bulanLabel
    });
  };

  // Add single item with date picker
  const handleAddWithDatePicker = (e) => {
    const dateVal = e.target.value;
    if (!dateVal) return;

    const formattedDate = formatSlashDate(dateVal);
    const dateObj = new Date(dateVal);
    let dayName = getIndonesianDayName(dateVal);

    const holiday = getHolidayInfo(dateObj);
    if (holiday) {
      dayName = `${dayName} (${holiday})`;
    }

    const newItems = [
      ...(data.items || []),
      {
        id: `l-${Date.now()}`,
        tanggal: formattedDate,
        hari: dayName,
        keterangan: quickKeterangan || 'Support RSCM',
        waktu: '09.00 - 17.00',
        hariCount: 1,
        jamCount: 8,
        hodApproved: true
      }
    ];
    onChange({ ...data, items: newItems });
    setQuickDate('');
  };

  return (
    <div className="space-y-6">
      {/* 1. SMART BATCH GENERATOR (Sabtu, Minggu & Hari Libur Nasional) */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-slate-50 rounded-xl shadow-sm border-2 border-blue-200 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-blue-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 text-white rounded-lg">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-950">
                Auto-Generate Log Lembur (Sabtu, Minggu & Hari Libur Nasional)
              </h3>
              <p className="text-xs text-blue-700">
                Pilih periode sebulan atau rentang tanggal untuk mengisi tanggal merah & weekend otomatis
              </p>
            </div>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="space-y-3">
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={() => setGenMode('month')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                genMode === 'month'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              📅 Pilih 1 Bulan Penuh
            </button>
            <button
              type="button"
              onClick={() => setGenMode('range')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                genMode === 'range'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              🗓️ Pilih Rentang Tanggal (Contoh: 18 Juli - 17 Agustus)
            </button>
          </div>

          {/* Month / Year picker */}
          {genMode === 'month' ? (
            <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bulan</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white font-medium"
                >
                  {MONTH_NAMES_ID.map((name, idx) => (
                    <option key={idx} value={idx}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tahun</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white font-medium"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Dari Tanggal Mulai</label>
                <input
                  type="date"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sampai Tanggal Akhir</label>
                <input
                  type="date"
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                />
              </div>
            </div>
          )}

          {/* Filter Options */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 block">Kriteria Hari yang Dimasukkan:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <label className="flex items-center gap-2 text-slate-800 cursor-pointer bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200 hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={includeSaturday}
                  onChange={(e) => setIncludeSaturday(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold">Hari Sabtu</span>
              </label>

              <label className="flex items-center gap-2 text-slate-800 cursor-pointer bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200 hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={includeSunday}
                  onChange={(e) => setIncludeSunday(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold">Hari Minggu</span>
              </label>

              <label className="flex items-center gap-2 text-slate-800 cursor-pointer bg-red-50 text-red-900 px-2.5 py-1.5 rounded border border-red-200 hover:bg-red-100">
                <input
                  type="checkbox"
                  checked={includeHolidays}
                  onChange={(e) => setIncludeHolidays(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span className="font-semibold">Hari Libur Nasional</span>
              </label>
            </div>
          </div>

          {/* Default values */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">Keterangan Default</label>
              <input
                type="text"
                value={batchKeterangan}
                onChange={(e) => setBatchKeterangan(e.target.value)}
                placeholder="Support RSCM"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">Waktu / Jam Default</label>
              <input
                type="text"
                value={batchWaktu}
                onChange={(e) => setBatchWaktu(e.target.value)}
                placeholder="09.00 - 17.00"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">Jumlah Jam per Hari</label>
              <input
                type="number"
                value={batchJam}
                onChange={(e) => setBatchJam(Number(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs text-center"
              />
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleRunBatchGenerate('replace')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate & Isi Tabel Otomatis</span>
            </button>

            <button
              type="button"
              onClick={() => handleRunBatchGenerate('append')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg transition"
            >
              <span>+ Tambahkan ke Tabel yang Ada</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. EMPLOYEE & PROJECT INFO */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          Informasi Pegawai & Department
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Pegawai</label>
            <input
              type="text"
              value={data.nama || ''}
              onChange={(e) => updateField('nama', e.target.value)}
              placeholder="Contoh: Alif"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">NIK</label>
            <input
              type="text"
              value={data.nik || ''}
              onChange={(e) => updateField('nik', e.target.value)}
              placeholder="Contoh: NPP-0033"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Jabatan</label>
            <input
              type="text"
              value={data.jabatan || ''}
              onChange={(e) => updateField('jabatan', e.target.value)}
              placeholder="Contoh: Implementator"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
            <input
              type="text"
              value={data.department || ''}
              onChange={(e) => updateField('department', e.target.value)}
              placeholder="Contoh: Project"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Bulan Periode Lembur</label>
            <input
              type="text"
              value={data.bulan || ''}
              onChange={(e) => updateField('bulan', e.target.value)}
              placeholder="Contoh: Juli - Agustus 2026"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Approvals Signatures */}
        <div className="border-t border-slate-100 pt-4">
          <label className="block text-xs font-bold text-slate-700 mb-3">Tanda Tangan Pengesahan (Bawah)</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dibuat Oleh */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="text-[11px] font-bold text-slate-700">1. Dibuat Oleh</span>
              <input
                type="text"
                value={data.dibuatOlehNama || data.nama || ''}
                onChange={(e) => updateField('dibuatOlehNama', e.target.value)}
                placeholder="Nama Pemohon"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
              />
              <button
                type="button"
                onClick={() => onOpenSignatureModal('dibuatOlehSign', data.dibuatOlehNama || data.nama)}
                className="w-full flex items-center justify-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 py-1.5 rounded transition"
              >
                <PenTool className="w-3.5 h-3.5" />
                {data.dibuatOlehSign ? 'Ubah TTD' : 'Beri TTD'}
              </button>
            </div>

            {/* Disetujui Oleh */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="text-[11px] font-bold text-slate-700">2. Disetujui Oleh (HOD)</span>
              <input
                type="text"
                value={data.disetujuiOlehNama || ''}
                onChange={(e) => updateField('disetujuiOlehNama', e.target.value)}
                placeholder="Nama HOD"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
              />
              <button
                type="button"
                onClick={() => onOpenSignatureModal('disetujuiOlehSign', data.disetujuiOlehNama)}
                className="w-full flex items-center justify-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 py-1.5 rounded transition"
              >
                <PenTool className="w-3.5 h-3.5" />
                {data.disetujuiOlehSign ? 'Ubah TTD' : 'Beri TTD'}
              </button>
            </div>

            {/* Diketahui Oleh */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="text-[11px] font-bold text-slate-700">3. Diketahui Oleh</span>
              <input
                type="text"
                value={data.diketahuiOlehNama || ''}
                onChange={(e) => updateField('diketahuiOlehNama', e.target.value)}
                placeholder="Nama Pejabat"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
              />
              <button
                type="button"
                onClick={() => onOpenSignatureModal('diketahuiOlehSign', data.diketahuiOlehNama)}
                className="w-full flex items-center justify-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 py-1.5 rounded transition"
              >
                <PenTool className="w-3.5 h-3.5" />
                {data.diketahuiOlehSign ? 'Ubah TTD' : 'Beri TTD'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. OVERTIME LOG ENTRIES LIST */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              Daftar Log Kompensasi Kerja (Lembur)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Total {(data.items || []).length} hari kerja lembur tercatat
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> Tambah Baris Manual
            </button>
          </div>
        </div>

        {/* Smart Date Picker Single Quick Add */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Tambah Tanggal Tertentu (Auto-Detect Nama Hari & Libur Nasional):</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">Pilih Tanggal</label>
              <input
                type="date"
                value={quickDate}
                onChange={handleAddWithDatePicker}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">Default Keterangan</label>
              <input
                type="text"
                value={quickKeterangan}
                onChange={(e) => setQuickKeterangan(e.target.value)}
                placeholder="Support RSCM"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
            </div>
          </div>
        </div>

        {/* Row List */}
        <div className="space-y-3">
          {(data.items || []).map((item, idx) => (
            <div
              key={item.id || idx}
              className={`p-3.5 rounded-xl space-y-2 text-xs border ${
                item.isHoliday || (item.hari && item.hari.includes('('))
                  ? 'bg-red-50/60 border-red-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    item.isHoliday || (item.hari && item.hari.includes('('))
                      ? 'bg-red-200 text-red-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {idx + 1}
                  </span>
                  Baris #{idx + 1}
                  {(item.isHoliday || (item.hari && item.hari.includes('('))) && (
                    <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-800 rounded font-semibold">
                      Tanggal Merah / Libur Nasional
                    </span>
                  )}
                </span>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.hodApproved ?? true}
                      onChange={(e) => updateItem(idx, 'hodApproved', e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Disetujui HOD</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-rose-500 hover:bg-rose-50 p-1 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Tanggal</label>
                  <input
                    type="text"
                    value={item.tanggal}
                    onChange={(e) => updateItem(idx, 'tanggal', e.target.value)}
                    placeholder="18/07/2026"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Hari</label>
                  <input
                    type="text"
                    value={item.hari}
                    onChange={(e) => updateItem(idx, 'hari', e.target.value)}
                    placeholder="Sabtu / Minggu / Senin (Hari Kemerdekaan)"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Keterangan Kompensasi</label>
                  <input
                    type="text"
                    value={item.keterangan}
                    onChange={(e) => updateItem(idx, 'keterangan', e.target.value)}
                    placeholder="Support RSCM"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Waktu / Jam</label>
                  <input
                    type="text"
                    value={item.waktu}
                    onChange={(e) => updateItem(idx, 'waktu', e.target.value)}
                    placeholder="09.00 - 17.00"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Jumlah Hari</label>
                  <input
                    type="number"
                    value={item.hariCount}
                    onChange={(e) => updateItem(idx, 'hariCount', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Jumlah Jam</label>
                  <input
                    type="number"
                    value={item.jamCount}
                    onChange={(e) => updateItem(idx, 'jamCount', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs text-center"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
