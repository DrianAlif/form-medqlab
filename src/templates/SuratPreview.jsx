import React from 'react';
import { CompanyHeader } from '../components/Logo';
import { formatIndonesianDate, getTodayDateString } from '../utils/dateUtils';

export function SuratPreview({ data }) {
  const formattedDate = formatIndonesianDate(data.tanggalSurat || getTodayDateString());
  const formattedStart = formatIndonesianDate(data.tanggalBerangkat || '2026-09-20');
  const formattedEnd = formatIndonesianDate(data.tanggalKembali || '2026-09-25');

  const getDocTitle = () => {
    switch (data.templateType) {
      case 'surat-tugas':
        return 'SURAT TUGAS PENUGASAN LAPANGAN';
      case 'spk':
        return 'SURAT PERINTAH KERJA (SPK)';
      case 'sppd':
      default:
        return 'SURAT PERINTAH PERJALANAN DINAS (SPPD)';
    }
  };

  return (
    <div id="pdf-export-container" className="w-full flex flex-col items-center gap-8 print:gap-0 font-sans">
      <div className="pdf-sheet pdf-page-portrait text-black text-[11px] leading-normal bg-white">
        <div className="page-inner-content flex flex-col justify-start p-2 sm:p-4">
          
          {/* 1. Official Letterhead (Kop Surat Resmi) */}
          <div className="border-b-2 border-black pb-2.5 mb-2">
            <CompanyHeader />
          </div>

          {/* 2. Document Title & Number */}
          <div className="text-center my-2 space-y-0.5">
            <h2 className="text-[14px] font-black tracking-wide uppercase underline">
              {getDocTitle()}
            </h2>
            <p className="text-[11px] font-bold font-mono text-slate-800">
              Nomor: {data.nomorSurat || '014/APS-DIR/SPPD/IX/2026'}
            </p>
          </div>

          {/* 3. Opening Clause */}
          <p className="text-[10.5px] text-justify leading-relaxed mb-2.5">
            Berdasarkan kebutuhan operasional dan penugasan proyek PT. Applimetis Parama Solusi, Pejabat yang bertanda tangan di bawah ini memberikan perintah tugas kedinasan kepada:
          </p>

          {/* 4. Table 1: Assigned Personnel Information */}
          <div className="border border-black mb-3">
            <table className="w-full border-collapse text-[10.5px]">
              <tbody>
                <tr className="border-b border-black">
                  <td className="w-8 p-1.5 font-bold text-center border-r border-black bg-slate-50">1.</td>
                  <td className="w-48 p-1.5 font-semibold border-r border-black">Nama Pegawai yang Ditugaskan</td>
                  <td className="p-1.5 font-bold uppercase">{data.personelNama || '-'}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="w-8 p-1.5 font-bold text-center border-r border-black bg-slate-50">2.</td>
                  <td className="p-1.5 font-semibold border-r border-black">Nomor Induk Pegawai (NIP / NIK)</td>
                  <td className="p-1.5 font-mono font-semibold">{data.personelNik || '-'}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="w-8 p-1.5 font-bold text-center border-r border-black bg-slate-50">3.</td>
                  <td className="p-1.5 font-semibold border-r border-black">Pangkat / Jabatan</td>
                  <td className="p-1.5">{data.personelJabatan || '-'}</td>
                </tr>
                <tr>
                  <td className="w-8 p-1.5 font-bold text-center border-r border-black bg-slate-50">4.</td>
                  <td className="p-1.5 font-semibold border-r border-black">Departemen / Divisi</td>
                  <td className="p-1.5">{data.personelDepartment || 'Operasional'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 5. Table 2: Assignment & Travel Specification */}
          <div className="border border-black mb-3">
            <table className="w-full border-collapse text-[10.5px]">
              <tbody>
                <tr className="border-b border-black">
                  <td className="w-8 p-1.5 font-bold text-center border-r border-black bg-slate-50">5.</td>
                  <td className="w-48 p-1.5 font-semibold border-r border-black">Maksud Perjalanan / Penugasan</td>
                  <td className="p-1.5 font-medium leading-relaxed">{data.maksudTugas || '-'}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="w-8 p-1.5 font-bold text-center border-r border-black bg-slate-50">6.</td>
                  <td className="p-1.5 font-semibold border-r border-black">Alat Angkutan / Transportasi</td>
                  <td className="p-1.5">{data.alatTransportasi || '-'}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="w-8 p-1.5 font-bold text-center border-r border-black bg-slate-50">7.</td>
                  <td className="p-1.5 font-semibold border-r border-black">Tempat Berangkat & Tujuan</td>
                  <td className="p-1.5">
                    Dari: <strong>{data.kotaAsal || 'Bandung'}</strong> → Ke: <strong className="text-black">{data.lokasiTujuan || '-'}</strong>
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="w-8 p-1.5 font-bold text-center border-r border-black bg-slate-50">8.</td>
                  <td className="p-1.5 font-semibold border-r border-black">Lamanya Perjalanan Dinas</td>
                  <td className="p-1.5 font-semibold">
                    {data.lamaHari || '6 Hari'} ({formattedStart} s.d {formattedEnd})
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="w-8 p-1.5 font-bold text-center border-r border-black bg-slate-50">9.</td>
                  <td className="p-1.5 font-semibold border-r border-black">Pembebanan Anggaran</td>
                  <td className="p-1.5">{data.bebanAnggaran || '-'}</td>
                </tr>
                <tr>
                  <td className="w-8 p-1.5 font-bold text-center border-r border-black bg-slate-50">10.</td>
                  <td className="p-1.5 font-semibold border-r border-black">Keterangan Tambahan</td>
                  <td className="p-1.5 italic text-slate-700">{data.keteranganLain || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 6. Closing Statement */}
          <p className="text-[10.5px] text-justify leading-relaxed mb-4">
            Demikian Surat Perintah Perjalanan Dinas ini dikeluarkan untuk dapat dipergunakan sebagaimana mestinya dan dilaksanakan dengan penuh rasa tanggung jawab, serta memberikan laporan tertulis setelah selesainya pelaksanaan tugas.
          </p>

          {/* 7. Signatures Section */}
          <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-black text-center text-[10.5px]">
            {/* Personel yang Ditugaskan */}
            <div className="flex flex-col items-center justify-between min-h-[120px]">
              <div>
                <p className="font-semibold text-slate-600">Pegawai yang Menerima Perintah,</p>
              </div>

              <div className="my-1 h-14 flex items-center justify-center">
                {data.personelSign ? (
                  <img
                    src={data.personelSign}
                    alt="TTD Personel"
                    className="max-h-12 max-w-[140px] object-contain"
                  />
                ) : (
                  <div className="w-28 border-b border-dashed border-slate-300 h-10" />
                )}
              </div>

              <div>
                <p className="font-bold underline uppercase">{data.personelNama || '(Nama Pegawai)'}</p>
                <p className="text-[9.5px] text-slate-600 font-mono">NIP: {data.personelNik || '-'}</p>
              </div>
            </div>

            {/* Pejabat yang Mengesahkan */}
            <div className="flex flex-col items-center justify-between min-h-[120px]">
              <div>
                <p className="text-[10px] text-slate-600">
                  Dikeluarkan di: {data.kotaDikeluarkan || 'Jakarta'}, {formattedDate}
                </p>
                <p className="font-bold text-black uppercase">
                  PT. APPLIMETIS PARAMA SOLUSI
                </p>
                <p className="font-semibold text-[10px] text-slate-700">
                  {data.pejabatJabatan || 'Direktur Operasional'}
                </p>
              </div>

              <div className="my-1 h-14 flex items-center justify-center">
                {data.pejabatSign ? (
                  <img
                    src={data.pejabatSign}
                    alt="TTD Pejabat"
                    className="max-h-12 max-w-[140px] object-contain"
                  />
                ) : (
                  <div className="w-28 border-b border-dashed border-slate-300 h-10" />
                )}
              </div>

              <div>
                <p className="font-bold underline uppercase">{data.pejabatNama || '(Nama Pejabat)'}</p>
                <p className="text-[9.5px] text-slate-600 font-mono">NIP: {data.pejabatNip || '-'}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
