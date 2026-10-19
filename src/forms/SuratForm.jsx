import React from 'react';
import {
  FileText,
  UserCheck,
  Calendar,
  MapPin,
  Briefcase,
  PenTool,
  Upload,
  Sparkles,
  Layers,
  Building,
  Plane,
  Clock,
  ShieldCheck,
  Lock,
  AlertCircle,
  CheckCircle2,
  Smartphone,
  Link2
} from 'lucide-react';
import { useHRIS } from '../context/EmployeeContext';
import { getSignaturePermissionInfo } from '../utils/signaturePermission';
import { AssignEmployeeButton } from '../components/AssignEmployeeButton';
import { getTodayDateString } from '../utils/dateUtils';

export function SuratForm({ data, onChange, onOpenSignatureModal, onOpenShareLink }) {
  const { employees, currentUser } = useHRIS();
  const permPejabat = getSignaturePermissionInfo(currentUser, data.pejabatNama, 'pejabat');
  const permPersonel = getSignaturePermissionInfo(currentUser, data.personelNama, 'personel');

  const updateField = (field, value) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const handleSelectEmployee = (empId) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;
    onChange({
      ...data,
      personelNama: emp.name,
      personelNik: emp.nik,
      personelJabatan: emp.position,
      personelDepartment: emp.department
    });
  };

  const handleSelectSigner = (empId) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;
    onChange({
      ...data,
      pejabatNama: emp.name,
      pejabatJabatan: emp.position || (emp.role === 'admin' ? 'HR Administrator' : 'Manager Operasional'),
      pejabatNip: emp.nik
    });
  };

  const handleUploadSignature = (field, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      updateField(field, evt.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner: Multi-Template Concept */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-brand-500/10 border border-purple-200 shadow-2xs">
        <div className="flex items-center gap-2 text-purple-900 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Satu Formulir Terpadu — Multi-Template Surat Resmi</span>
        </div>
        <p className="text-[11px] text-slate-600 mt-1">
          Cukup isi data penugasan sekali, lalu pilih jenis template di bawah. Dokumen resmi beserta kop surat, nomor, dan klausul akan ter-generate otomatis secara real-time.
        </p>
      </div>

      {/* 1. SELEKTOR TEMPLATE UTAMA */}
      <div className="bg-white rounded-xl shadow-xs border border-purple-200 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <span>Pilih Jenis Template Surat *</span>
          </label>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
            Aktif: {data.templateType === 'sppd' ? 'SPPD Resmi' : data.templateType === 'surat-tugas' ? 'Surat Tugas Proyek' : 'SPK Kerja'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => updateField('templateType', 'sppd')}
            className={`p-3 rounded-xl border text-left transition-all ${
              data.templateType === 'sppd'
                ? 'border-purple-600 bg-purple-50/80 text-purple-950 ring-2 ring-purple-500/20 shadow-xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="font-bold text-xs flex items-center gap-1.5">
              <span>📋 Template SPPD</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Surat Perintah Perjalanan Dinas formal lengkap dengan 9 butir ketentuan perjalanan & rincian transportasi.
            </p>
          </button>

          <button
            type="button"
            onClick={() => updateField('templateType', 'surat-tugas')}
            className={`p-3 rounded-xl border text-left transition-all ${
              data.templateType === 'surat-tugas'
                ? 'border-purple-600 bg-purple-50/80 text-purple-950 ring-2 ring-purple-500/20 shadow-xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="font-bold text-xs flex items-center gap-1.5">
              <span>📌 Surat Tugas Proyek</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Surat penugasan resmi personel ke lokasi mitra / klien (on-site) dengan penegasan mandat tugas & tanggung jawab.
            </p>
          </button>

          <button
            type="button"
            onClick={() => updateField('templateType', 'spk')}
            className={`p-3 rounded-xl border text-left transition-all ${
              data.templateType === 'spk'
                ? 'border-purple-600 bg-purple-50/80 text-purple-950 ring-2 ring-purple-500/20 shadow-xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="font-bold text-xs flex items-center gap-1.5">
              <span>⚙️ Surat Perintah Kerja (SPK)</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Surat instruksi teknis internal untuk pengerjaan modul, instalasi server, atau implementasi lapangan.
            </p>
          </button>
        </div>
      </div>

      {/* 2. METADATA SURAT */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span>Nomor & Tanggal Surat Resmi</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nomor Surat *</label>
            <input
              type="text"
              value={data.nomorSurat || ''}
              onChange={(e) => updateField('nomorSurat', e.target.value)}
              placeholder="Contoh: 014/APS-DIR/SPPD/IX/2026"
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tanggal Surat *</label>
            <input
              type="date"
              value={data.tanggalSurat || getTodayDateString()}
              onChange={(e) => updateField('tanggalSurat', e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kota Dikeluarkan</label>
            <input
              type="text"
              value={data.kotaDikeluarkan || ''}
              onChange={(e) => updateField('kotaDikeluarkan', e.target.value)}
              placeholder="Contoh: Jakarta"
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. ASSIGN PERSONEL (YANG MELAKUKAN PERJALANAN / DITUGASKAN) */}
      <div className="bg-white rounded-xl shadow-xs border border-emerald-200 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Personel yang Ditugaskan / Melakukan Perjalanan (Assign)</span>
          </h3>
          <div className="flex items-center gap-2">
            <AssignEmployeeButton
              currentValue={data.personelNama}
              slotTitle="Personel Ditugaskan"
              onSelect={(emp) => {
                onChange({
                  ...data,
                  personelNama: emp.name,
                  personelNik: emp.nik || '',
                  personelJabatan: emp.position || '',
                  personelDepartment: emp.department || ''
                });
              }}
              onClear={() => {
                onChange({
                  ...data,
                  personelNama: '',
                  personelNik: '',
                  personelJabatan: '',
                  personelDepartment: ''
                });
              }}
            />
            <select
              onChange={(e) => handleSelectEmployee(e.target.value)}
              defaultValue=""
              className="text-[11px] px-2 py-1 rounded border border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold focus:outline-none"
            >
              <option value="" disabled>-- Atau Pilih dari List --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.position})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Pegawai yang Ditugaskan *</label>
            <input
              type="text"
              value={data.personelNama || ''}
              onChange={(e) => updateField('personelNama', e.target.value)}
              placeholder="Contoh: Alif Drian"
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">NIP / NIK *</label>
            <input
              type="text"
              value={data.personelNik || ''}
              onChange={(e) => updateField('personelNik', e.target.value)}
              placeholder="Contoh: APS-2026002"
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pangkat / Jabatan *</label>
            <input
              type="text"
              value={data.personelJabatan || ''}
              onChange={(e) => updateField('personelJabatan', e.target.value)}
              placeholder="Contoh: Technical Support Officer (TSO)"
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Departemen / Divisi</label>
            <input
              type="text"
              value={data.personelDepartment || ''}
              onChange={(e) => updateField('personelDepartment', e.target.value)}
              placeholder="Contoh: Operasional / TSO"
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. RINCIAN PERJALANAN / TUGAS LAPANGAN */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <MapPin className="w-4 h-4 text-rose-600" />
          <span>Rincian Maksud Perjalanan & Tempat Tujuan</span>
        </h3>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Maksud & Tujuan Perjalanan Dinas *</label>
          <textarea
            rows="2"
            value={data.maksudTugas || ''}
            onChange={(e) => updateField('maksudTugas', e.target.value)}
            placeholder="Contoh: Melaksanakan instalasi on-site, pendampingan implementasi Sistem LIS MedQLab..."
            className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tempat Berangkat</label>
            <input
              type="text"
              value={data.kotaAsal || ''}
              onChange={(e) => updateField('kotaAsal', e.target.value)}
              placeholder="Contoh: Bandung / Kantor Operasional"
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tempat Tujuan *</label>
            <input
              type="text"
              value={data.lokasiTujuan || ''}
              onChange={(e) => updateField('lokasiTujuan', e.target.value)}
              placeholder="Contoh: RSUP Nasional Dr. Cipto Mangunkusumo, Jakarta Pusat"
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Alat Angkutan / Transportasi</label>
            <input
              type="text"
              value={data.alatTransportasi || ''}
              onChange={(e) => updateField('alatTransportasi', e.target.value)}
              placeholder="Contoh: Kereta Cepat Whoosh / Mobil Operasional / Pesawat"
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Lamanya Perjalanan</label>
            <input
              type="text"
              value={data.lamaHari || ''}
              onChange={(e) => updateField('lamaHari', e.target.value)}
              placeholder="Contoh: 6 (Enam) Hari"
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tanggal Berangkat</label>
            <input
              type="date"
              value={data.tanggalBerangkat || ''}
              onChange={(e) => updateField('tanggalBerangkat', e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tanggal Harus Kembali</label>
            <input
              type="date"
              value={data.tanggalKembali || ''}
              onChange={(e) => updateField('tanggalKembali', e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pembebanan Anggaran</label>
            <input
              type="text"
              value={data.bebanAnggaran || ''}
              onChange={(e) => updateField('bebanAnggaran', e.target.value)}
              placeholder="Contoh: Anggaran Proyek Implementasi RSCM - PT Applimetis Parama Solusi"
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium"
            />
          </div>
        </div>
      </div>

      {/* 5. PEJABAT PENANDATANGAN & TANDA TANGAN */}
      <div className="bg-white rounded-xl shadow-xs border border-indigo-200 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Pejabat Penandatangan & Tanda Tangan Resmi (Yang TTD)</span>
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500">Pilih Pejabat:</span>
            <select
              onChange={(e) => handleSelectSigner(e.target.value)}
              defaultValue=""
              className="text-[11px] px-2 py-1 rounded border border-indigo-300 bg-indigo-50 text-indigo-900 font-semibold focus:outline-none"
            >
              <option value="" disabled>-- Pilih Pejabat --</option>
              {employees.filter(e => e.role === 'admin' || e.role === 'manager' || e.role === 'director').map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.position})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Kolom Pejabat Penandatangan */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold text-xs text-indigo-900 block">
                1. Pejabat yang Memberi Perintah / TTD
              </span>
              <AssignEmployeeButton
                currentValue={data.pejabatNama}
                slotTitle="Pejabat Penandatangan"
                onSelect={(emp) => {
                  onChange({
                    ...data,
                    pejabatNama: emp.name,
                    pejabatJabatan: emp.position || data.pejabatJabatan || 'Direktur / Project Lead'
                  });
                }}
                onClear={() => {
                  onChange({
                    ...data,
                    pejabatNama: '',
                    pejabatJabatan: ''
                  });
                }}
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">Nama Lengkap & Gelar</label>
              <input
                type="text"
                value={data.pejabatNama || ''}
                onChange={(e) => updateField('pejabatNama', e.target.value)}
                placeholder="Contoh: Tri Prasetyo, S.Kom"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">Jabatan Pejabat</label>
              <input
                type="text"
                value={data.pejabatJabatan || ''}
                onChange={(e) => updateField('pejabatJabatan', e.target.value)}
                placeholder="Contoh: Direktur Operasional / Project Lead"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
            </div>

            {/* Tanda Tangan Pejabat */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {data.pejabatSign ? (
                    <div className="w-16 h-10 bg-white border border-slate-300 rounded flex items-center justify-center p-1">
                      <img src={data.pejabatSign} alt="TTD Pejabat" className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">Belum ada TTD</span>
                  )}
                </div>

                {permPejabat.allowed ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenSignatureModal('pejabatSign', data.pejabatNama, 'pejabat', data.pejabatNama)}
                      className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[11px] font-bold border border-indigo-200 flex items-center gap-1 active:scale-95 transition"
                    >
                      <PenTool className="w-3 h-3" />
                      <span>{data.pejabatSign ? 'Ubah' : 'Buat TTD'}</span>
                    </button>

                    <label className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-medium border border-slate-300 flex items-center gap-1 cursor-pointer active:scale-95 transition">
                      <Upload className="w-3 h-3" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUploadSignature('pejabatSign', e)}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled
                      className="px-2.5 py-1 rounded bg-slate-100 text-slate-400 text-[11px] font-bold border border-slate-200 flex items-center gap-1 cursor-not-allowed select-none"
                      title={permPejabat.reason}
                    >
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>Terkunci</span>
                    </button>
                    <span
                      className="px-2.5 py-1 rounded bg-slate-100 text-slate-400 text-[11px] font-medium border border-slate-200 flex items-center gap-1 cursor-not-allowed select-none"
                      title={permPejabat.reason}
                    >
                      <Upload className="w-3 h-3 text-slate-400" />
                      <span>Upload</span>
                    </span>
                  </div>
                )}
              </div>

              {!permPejabat.allowed ? (
                <div className="p-1.5 rounded-md bg-rose-50/80 border border-rose-200 text-[10px] text-rose-800 flex items-start gap-1 leading-snug">
                  <AlertCircle className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                  <span>Hanya <strong>Admin</strong> atau <strong>{data.pejabatNama || 'Pejabat Penandatangan'}</strong> yang dapat menandatangani.</span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[10px]">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-bold ${permPejabat.badgeColor}`}>
                    {permPejabat.badgeText}
                  </span>
                  {data.pejabatSign && (
                    <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Ada TTD</span>
                    </span>
                  )}
                </div>
              )}

              {onOpenShareLink && !data.pejabatSign && (
                <button
                  type="button"
                  onClick={() => onOpenShareLink('pejabatSign', 'Pejabat Penandatangan', data.pejabatNama)}
                  className="w-full flex items-center justify-center gap-1.5 text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 py-1.5 px-2 rounded-lg transition font-semibold active:scale-95 shadow-2xs mt-1"
                >
                  <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Kirim Link TTD ke {data.pejabatNama || 'Pejabat'} via WA</span>
                </button>
              )}
            </div>
          </div>

          {/* Kolom Tanda Tangan Personel yang Ditugaskan */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold text-xs text-emerald-900 block">
                2. Pegawai yang Menerima Perintah Tugas
              </span>
              <AssignEmployeeButton
                currentValue={data.personelNama}
                slotTitle="Pegawai Ditugaskan"
                onSelect={(emp) => {
                  onChange({
                    ...data,
                    personelNama: emp.name,
                    personelNik: emp.nik || '',
                    personelJabatan: emp.position || '',
                    personelDepartment: emp.department || ''
                  });
                }}
                onClear={() => {
                  onChange({
                    ...data,
                    personelNama: '',
                    personelNik: '',
                    personelJabatan: '',
                    personelDepartment: ''
                  });
                }}
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">Nama Pegawai</label>
              <input
                type="text"
                value={data.personelNama || ''}
                readOnly
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-100 text-slate-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">Jabatan Pegawai</label>
              <input
                type="text"
                value={data.personelJabatan || ''}
                readOnly
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-100 text-slate-600"
              />
            </div>

            {/* Tanda Tangan Pegawai */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {data.personelSign ? (
                    <div className="w-16 h-10 bg-white border border-slate-300 rounded flex items-center justify-center p-1">
                      <img src={data.personelSign} alt="TTD Personel" className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">Belum ada TTD</span>
                  )}
                </div>

                {permPersonel.allowed ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenSignatureModal('personelSign', data.personelNama, 'personel', data.personelNama)}
                      className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold border border-emerald-200 flex items-center gap-1 active:scale-95 transition"
                    >
                      <PenTool className="w-3 h-3" />
                      <span>{data.personelSign ? 'Ubah' : 'Buat TTD'}</span>
                    </button>

                    <label className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-medium border border-slate-300 flex items-center gap-1 cursor-pointer active:scale-95 transition">
                      <Upload className="w-3 h-3" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUploadSignature('personelSign', e)}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled
                      className="px-2.5 py-1 rounded bg-slate-100 text-slate-400 text-[11px] font-bold border border-slate-200 flex items-center gap-1 cursor-not-allowed select-none"
                      title={permPersonel.reason}
                    >
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>Terkunci</span>
                    </button>
                    <span
                      className="px-2.5 py-1 rounded bg-slate-100 text-slate-400 text-[11px] font-medium border border-slate-200 flex items-center gap-1 cursor-not-allowed select-none"
                      title={permPersonel.reason}
                    >
                      <Upload className="w-3 h-3 text-slate-400" />
                      <span>Upload</span>
                    </span>
                  </div>
                )}
              </div>

              {!permPersonel.allowed ? (
                <div className="p-1.5 rounded-md bg-rose-50/80 border border-rose-200 text-[10px] text-rose-800 flex items-start gap-1 leading-snug">
                  <AlertCircle className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                  <span>Hanya <strong>Admin</strong> atau <strong>{data.personelNama || 'Pegawai yang Ditugaskan'}</strong> yang dapat menandatangani.</span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[10px]">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-bold ${permPersonel.badgeColor}`}>
                    {permPersonel.badgeText}
                  </span>
                  {data.personelSign && (
                    <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Ada TTD</span>
                    </span>
                  )}
                </div>
              )}

              {onOpenShareLink && !data.personelSign && (
                <button
                  type="button"
                  onClick={() => onOpenShareLink('personelSign', 'Pegawai yang Ditugaskan', data.personelNama)}
                  className="w-full flex items-center justify-center gap-1.5 text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-1.5 px-2 rounded-lg transition font-semibold active:scale-95 shadow-2xs mt-1"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kirim Link TTD ke {data.personelNama || 'Pegawai'} via WA</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
