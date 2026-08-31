import React from 'react';
import { Plus, Trash2, PenTool, Layers, FolderPlus, FilePlus2, Sparkles } from 'lucide-react';
import { formatRupiah } from '../utils/currency';

// Helper to normalize data structure to 3-level
export function getNormalizedParentCategories(data) {
  if (Array.isArray(data.parentCategories) && data.parentCategories.length > 0) {
    return data.parentCategories;
  }

  // Fallback / conversion from legacy flat section1/section2 structure
  const p1Items = (data.section1Items || []).map(item => ({
    id: item.id || `k-item-${Math.random()}`,
    deskripsi: item.deskripsi || item.description || 'Kosan 1 Kamar Per Bulan',
    rentangTanggal: item.rentangTanggal || item.tanggal || '09/09/2026 - 09/10/2026',
    qty: Number(item.qty) || 1,
    unit: item.unit || 'Kamar',
    hargaSatuan: Number(item.hargaSatuan) || 1800000,
    informasi: item.informasi || ''
  }));

  const p2Items = (data.section2Items || []).map(item => ({
    id: item.id || `k-item-${Math.random()}`,
    deskripsi: item.deskripsi || item.description || 'Listrik untuk 1 Kamar',
    rentangTanggal: item.rentangTanggal || item.tanggal || '09/09/2026 - 09/10/2026',
    qty: Number(item.qty) || 1,
    unit: item.unit || 'Kamar',
    hargaSatuan: Number(item.hargaSatuan) || 250000,
    informasi: item.informasi || ''
  }));

  return [
    {
      id: 'p-1',
      title: data.section1Title || 'Akomodasi',
      subCategories: [
        {
          id: 'sub-1-1',
          title: 'Kosan',
          items: p1Items.length > 0 ? p1Items : [
            {
              id: 'k-item-1',
              deskripsi: 'Kosan 1 Kamar Per Bulan',
              rentangTanggal: '09/09/2026 - 09/10/2026',
              qty: 1,
              unit: 'Kamar',
              hargaSatuan: 1800000,
              informasi: ''
            }
          ]
        }
      ]
    },
    {
      id: 'p-2',
      title: data.section2Title || 'Perjalanan',
      subCategories: [
        {
          id: 'sub-2-1',
          title: 'Listrik',
          items: p2Items.length > 0 ? p2Items : [
            {
              id: 'k-item-2',
              deskripsi: 'Listrik untuk 1 Kamar',
              rentangTanggal: '09/09/2026 - 09/10/2026',
              qty: 1,
              unit: 'Kamar',
              hargaSatuan: 250000,
              informasi: ''
            }
          ]
        }
      ]
    }
  ];
}

export function KosanForm({ data, onChange, onOpenSignatureModal }) {
  const updateField = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const parentCategories = getNormalizedParentCategories(data);

  const updateParentCategories = (newCategories) => {
    onChange({
      ...data,
      parentCategories: newCategories
    });
  };

  // --- 1. Parent Category Operations (Level 1) ---
  const addParentCategory = () => {
    const newPIndex = parentCategories.length + 1;
    const newParent = {
      id: `p-${Date.now()}`,
      title: `Kategori ${newPIndex}`,
      subCategories: [
        {
          id: `sub-${Date.now()}-1`,
          title: 'Sub Kategori 1',
          items: [
            {
              id: `item-${Date.now()}-1`,
              deskripsi: 'Deskripsi Item Baru',
              rentangTanggal: '09/09/2026 - 09/10/2026',
              qty: 1,
              unit: 'Bulan',
              hargaSatuan: 1000000,
              informasi: ''
            }
          ]
        }
      ]
    };
    updateParentCategories([...parentCategories, newParent]);
  };

  const updateParentTitle = (pIndex, newTitle) => {
    const updated = [...parentCategories];
    updated[pIndex] = { ...updated[pIndex], title: newTitle };
    updateParentCategories(updated);
  };

  const removeParentCategory = (pIndex) => {
    if (parentCategories.length <= 1) {
      alert('Minimal harus ada 1 Kategori Parent.');
      return;
    }
    const updated = parentCategories.filter((_, i) => i !== pIndex);
    updateParentCategories(updated);
  };

  // --- 2. Sub-Category Operations (Level 2) ---
  const addSubCategory = (pIndex) => {
    const updated = [...parentCategories];
    const parent = updated[pIndex];
    const newSubIndex = (parent.subCategories || []).length + 1;

    const newSub = {
      id: `sub-${Date.now()}-${newSubIndex}`,
      title: `Sub Kategori ${newSubIndex}`,
      items: [
        {
          id: `item-${Date.now()}`,
          deskripsi: 'Item Baru',
          rentangTanggal: '09/09/2026 - 09/10/2026',
          qty: 1,
          unit: 'Kamar',
          hargaSatuan: 500000,
          informasi: ''
        }
      ]
    };

    updated[pIndex] = {
      ...parent,
      subCategories: [...(parent.subCategories || []), newSub]
    };
    updateParentCategories(updated);
  };

  const updateSubTitle = (pIndex, sIndex, newTitle) => {
    const updated = [...parentCategories];
    const subCategories = [...(updated[pIndex].subCategories || [])];
    subCategories[sIndex] = { ...subCategories[sIndex], title: newTitle };
    updated[pIndex] = { ...updated[pIndex], subCategories };
    updateParentCategories(updated);
  };

  const removeSubCategory = (pIndex, sIndex) => {
    const updated = [...parentCategories];
    const subCategories = (updated[pIndex].subCategories || []).filter((_, i) => i !== sIndex);
    if (subCategories.length === 0) {
      alert('Minimal harus ada 1 Sub-Kategori di dalam Parent.');
      return;
    }
    updated[pIndex] = { ...updated[pIndex], subCategories };
    updateParentCategories(updated);
  };

  // --- 3. Item Operations (Level 3) ---
  const addItem = (pIndex, sIndex) => {
    const updated = [...parentCategories];
    const parent = updated[pIndex];
    const subCategories = [...(parent.subCategories || [])];
    const sub = subCategories[sIndex];

    const newItem = {
      id: `item-${Date.now()}`,
      deskripsi: 'Item Baru',
      rentangTanggal: '09/09/2026 - 09/10/2026',
      qty: 1,
      unit: 'Kamar',
      hargaSatuan: 100000,
      informasi: ''
    };

    subCategories[sIndex] = {
      ...sub,
      items: [...(sub.items || []), newItem]
    };
    updated[pIndex] = { ...parent, subCategories };
    updateParentCategories(updated);
  };

  const updateItem = (pIndex, sIndex, itemIndex, field, value) => {
    const updated = [...parentCategories];
    const parent = updated[pIndex];
    const subCategories = [...(parent.subCategories || [])];
    const sub = subCategories[sIndex];
    const items = [...(sub.items || [])];

    items[itemIndex] = { ...items[itemIndex], [field]: value };
    subCategories[sIndex] = { ...sub, items };
    updated[pIndex] = { ...parent, subCategories };
    updateParentCategories(updated);
  };

  const removeItem = (pIndex, sIndex, itemIndex) => {
    const updated = [...parentCategories];
    const parent = updated[pIndex];
    const subCategories = [...(parent.subCategories || [])];
    const sub = subCategories[sIndex];
    const items = (sub.items || []).filter((_, i) => i !== itemIndex);

    if (items.length === 0) {
      alert('Minimal harus ada 1 baris item di dalam Sub-Kategori.');
      return;
    }

    subCategories[sIndex] = { ...sub, items };
    updated[pIndex] = { ...parent, subCategories };
    updateParentCategories(updated);
  };

  return (
    <div className="space-y-6">
      {/* 1. VOUCHER DETAILS (PAGE 1) */}
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
              placeholder="Contoh: 001/PUM/IX/2026 (Boleh kosong)"
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
              placeholder="Nama penerima / pemohon"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan Voucher</label>
            <textarea
              rows={3}
              value={data.keterangan || ''}
              onChange={(e) => updateField('keterangan', e.target.value)}
              placeholder="Pengajuan Kosan untuk RSCM&#10;periode 09 SEPTEMBER 2026 - 9 OKTOBER 2026"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Signatures for Voucher */}
        <div className="border-t border-slate-100 pt-4">
          <label className="block text-xs font-bold text-slate-700 mb-3">Tanda Tangan & Pejabat</label>
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

      {/* 2. DYNAMIC 3-LEVEL BUDGETING ATTACHMENT (PAGE 2) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              Page 2: Lampiran Budgeting Dinamis (3-Level)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Parent Category &rarr; Sub-Kategori &rarr; Poin Baris Item
            </p>
          </div>

          <button
            type="button"
            onClick={addParentCategory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Tambah Kategori Parent</span>
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

        {/* 3-LEVEL DYNAMIC CATEGORIES LIST */}
        <div className="space-y-6">
          {parentCategories.map((parent, pIndex) => {
            // Compute Parent Total
            const parentTotal = (parent.subCategories || []).reduce((accSub, sub) => {
              const subTotal = (sub.items || []).reduce((accItem, it) => {
                return accItem + ((Number(it.qty) || 0) * (Number(it.hargaSatuan) || 0));
              }, 0);
              return accSub + subTotal;
            }, 0);

            return (
              <div
                key={parent.id || pIndex}
                className="p-4 rounded-xl border-2 border-emerald-300 bg-emerald-50/30 space-y-4 shadow-sm"
              >
                {/* LEVEL 1: PARENT HEADER */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {pIndex + 1}
                    </span>
                    <div className="flex-1">
                      <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                        Judul Kategori Parent #{pIndex + 1}
                      </label>
                      <input
                        type="text"
                        value={parent.title || ''}
                        onChange={(e) => updateParentTitle(pIndex, e.target.value)}
                        placeholder="Contoh: Akomodasi / Perjalanan / Utilitas"
                        className="w-full text-xs font-bold text-slate-900 px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-bold">
                      Total: {formatRupiah(parentTotal)}
                    </div>

                    <button
                      type="button"
                      onClick={() => addSubCategory(pIndex)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1.5 rounded-lg transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> + Tambah Sub
                    </button>

                    <button
                      type="button"
                      onClick={() => removeParentCategory(pIndex)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus Kategori Parent ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* LEVEL 2: SUB-CATEGORIES LIST */}
                <div className="space-y-4 pl-2 sm:pl-4 border-l-2 border-emerald-200">
                  {(parent.subCategories || []).map((sub, sIndex) => {
                    // Compute Sub-Category Total
                    const subTotal = (sub.items || []).reduce((acc, it) => {
                      return acc + ((Number(it.qty) || 0) * (Number(it.hargaSatuan) || 0));
                    }, 0);

                    return (
                      <div
                        key={sub.id || sIndex}
                        className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs"
                      >
                        {/* Sub-Category Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
                                {pIndex + 1}.{sIndex + 1}
                              </span>
                              Sub-Kategori:
                            </span>
                            <input
                              type="text"
                              value={sub.title || ''}
                              onChange={(e) => updateSubTitle(pIndex, sIndex, e.target.value)}
                              placeholder="Contoh: Kosan / Listrik / Air"
                              className="text-xs font-semibold text-slate-800 px-2.5 py-1 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-600">
                              Subtotal: <span className="font-bold text-slate-900">{formatRupiah(subTotal)}</span>
                            </span>

                            <button
                              type="button"
                              onClick={() => addItem(pIndex, sIndex)}
                              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded transition border border-emerald-200"
                            >
                              <Plus className="w-3.5 h-3.5" /> + Tambah Baris
                            </button>

                            <button
                              type="button"
                              onClick={() => removeSubCategory(pIndex, sIndex)}
                              className="p-1 text-rose-500 hover:bg-rose-50 rounded transition"
                              title="Hapus Sub-Kategori ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* LEVEL 3: ITEM ROWS LIST */}
                        <div className="space-y-2.5">
                          {(sub.items || []).map((item, itemIdx) => {
                            const itemTotal = (Number(item.qty) || 0) * (Number(item.hargaSatuan) || 0);

                            return (
                              <div
                                key={item.id || itemIdx}
                                className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                  <div className="md:col-span-2">
                                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                                      Deskripsi Item
                                    </label>
                                    <input
                                      type="text"
                                      value={item.deskripsi ?? item.description ?? ''}
                                      onChange={(e) => updateItem(pIndex, sIndex, itemIdx, 'deskripsi', e.target.value)}
                                      placeholder="Contoh: Kosan 1 Kamar Per Bulan"
                                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                                      Rentang Tanggal
                                    </label>
                                    <input
                                      type="text"
                                      value={item.rentangTanggal ?? item.tanggal ?? ''}
                                      onChange={(e) => updateItem(pIndex, sIndex, itemIdx, 'rentangTanggal', e.target.value)}
                                      placeholder="09/09/2026 - 09/10/2026"
                                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-end">
                                  <div>
                                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                                      Qty
                                    </label>
                                    <input
                                      type="number"
                                      value={item.qty}
                                      onChange={(e) => updateItem(pIndex, sIndex, itemIdx, 'qty', e.target.value)}
                                      className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-xs text-center"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                                      Unit
                                    </label>
                                    <input
                                      type="text"
                                      value={item.unit}
                                      onChange={(e) => updateItem(pIndex, sIndex, itemIdx, 'unit', e.target.value)}
                                      placeholder="Kamar / Bulan"
                                      className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-xs text-center"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                                      Harga Satuan (Rp)
                                    </label>
                                    <input
                                      type="number"
                                      value={item.hargaSatuan}
                                      onChange={(e) => updateItem(pIndex, sIndex, itemIdx, 'hargaSatuan', e.target.value)}
                                      className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-xs text-right"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2 justify-end">
                                    <div className="text-right">
                                      <span className="text-[10px] text-slate-400 block">Subtotal</span>
                                      <span className="font-bold text-slate-800">
                                        {formatRupiah(itemTotal)}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeItem(pIndex, sIndex, itemIdx)}
                                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition"
                                      title="Hapus baris item"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
