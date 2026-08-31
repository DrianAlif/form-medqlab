import React from 'react';
import { Logo } from '../components/Logo';

export function LemburPreview({ data }) {
  // Compute totals
  const totalHari = (data.items || []).reduce((acc, item) => acc + (Number(item.hariCount) || 0), 0);
  const totalJam = (data.items || []).reduce((acc, item) => acc + (Number(item.jamCount) || 0), 0);

  return (
    <div id="pdf-content" className="w-full flex flex-col items-center">
      {/* 1 PAGE LANDSCAPE */}
      <div className="pdf-page-container w-full max-w-[1050px] p-8 text-black font-sans text-[11px] min-h-[640px] flex flex-col justify-between">
        <div>
          {/* Top Header */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-black">
            <div className="flex items-center gap-3">
              <Logo className="h-12" showText={true} />
            </div>
            <div className="flex-1 text-center pr-20">
              <h1 className="text-[20px] font-extrabold tracking-wider text-black">
                KOMPENSASI KERJA
              </h1>
            </div>
          </div>

          {/* Timesheet Table */}
          <div className="border border-black overflow-hidden mb-4">
            <table className="w-full border-collapse text-[10px]">
              <colgroup>
                <col style={{ width: '90px' }} />
                <col style={{ width: '140px' }} />
                <col />
                <col style={{ width: '110px' }} />
                <col style={{ width: '45px' }} />
                <col style={{ width: '45px' }} />
                <col style={{ width: '130px' }} />
              </colgroup>
              <thead>
                <tr className="border-b border-black font-bold text-center bg-slate-50 text-[10px]">
                  <th className="border-r border-black p-1.5 align-middle">
                    TANGGAL
                  </th>
                  <th className="border-r border-black p-1.5 align-middle">
                    HARI
                  </th>
                  <th className="border-r border-black p-1.5 align-middle text-center">
                    KETERANGAN KOMPENSASI KERJA
                  </th>
                  <th className="border-r border-black p-1.5 align-middle">
                    WAKTU/JAM
                  </th>
                  <th colSpan={2} className="border-r border-black p-0 text-center">
                    <div className="border-b border-black py-0.5 font-bold">JUMLAH</div>
                    <div className="grid grid-cols-2 text-[9px]">
                      <div className="border-r border-black py-0.5">HARI</div>
                      <div className="py-0.5">JAM</div>
                    </div>
                  </th>
                  <th className="p-1.5 align-middle">
                    DISETUJUI OLEH HOD
                  </th>
                </tr>
              </thead>
              <tbody>
                {(data.items || []).map((item, idx) => (
                  <tr key={item.id || idx} className="border-b border-black">
                    <td className="border-r border-black text-center p-1 font-medium">{item.tanggal}</td>
                    <td className="border-r border-black text-center p-1">{item.hari}</td>
                    <td className="border-r border-black text-center p-1 font-medium">{item.keterangan}</td>
                    <td className="border-r border-black text-center p-1">{item.waktu}</td>
                    <td className="border-r border-black text-center p-1 font-semibold">{item.hariCount}</td>
                    <td className="border-r border-black text-center p-1 font-semibold">{item.jamCount}</td>
                    <td className="p-0.5 text-center">
                      <div className="h-6 flex items-center justify-center">
                        {item.hodApproved ? (
                          data.disetujuiOlehSign ? (
                            <img
                              src={data.disetujuiOlehSign}
                              alt="HOD Sign"
                              className="max-h-5 max-w-[60px] object-contain"
                            />
                          ) : (
                            <span className="text-slate-700 font-semibold text-[10px]">✓</span>
                          )
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Total Summary Row */}
                <tr className="border-b border-black bg-slate-100 font-bold">
                  <td colSpan={4} className="border-r border-black text-center p-1 font-bold">
                    TOTAL
                  </td>
                  <td className="border-r border-black text-center p-1 text-blue-900 font-bold">
                    {totalHari}
                  </td>
                  <td className="border-r border-black text-center p-1 text-blue-900 font-bold">
                    {totalJam}
                  </td>
                  <td className="p-1"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Employee & Department Metadata Box */}
          <div className="border border-black p-2 mb-4 bg-white text-[11px] grid grid-cols-2 gap-x-8 gap-y-1.5">
            <div className="flex items-baseline">
              <span className="w-20 font-semibold">Nama:</span>
              <span className="flex-1 border-b border-dotted border-black pb-0.5 font-medium">
                {data.nama || ''}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="w-24 font-semibold">NIK:</span>
              <span className="flex-1 border-b border-dotted border-black pb-0.5 font-medium">
                {data.nik || ''}
              </span>
            </div>

            <div className="flex items-baseline">
              <span className="w-20 font-semibold">Jabatan:</span>
              <span className="flex-1 border-b border-dotted border-black pb-0.5 font-medium">
                {data.jabatan || ''}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="w-24 font-semibold">Department:</span>
              <span className="flex-1 border-b border-dotted border-black pb-0.5 font-medium">
                {data.department || ''}
              </span>
            </div>

            <div className="flex items-baseline col-span-2">
              <span className="w-20 font-semibold">Bulan:</span>
              <span className="flex-1 border-b border-dotted border-black pb-0.5 font-medium">
                {data.bulan || ''}
              </span>
            </div>
          </div>
        </div>

        {/* Multi-tier Approval Block */}
        <div className="border border-black grid grid-cols-3 divide-x divide-black bg-white">
          {/* 1. DIBUAT OLEH */}
          <div className="p-2 flex flex-col justify-between text-center min-h-[110px]">
            <div className="font-bold text-[11px] text-left border-b border-slate-200 pb-1">
              DIBUAT OLEH:
            </div>
            <div className="h-12 flex items-center justify-center my-1">
              {data.dibuatOlehSign ? (
                <img
                  src={data.dibuatOlehSign}
                  alt="Dibuat Oleh Signature"
                  className="max-h-12 max-w-[120px] object-contain"
                />
              ) : null}
            </div>
            <div className="border-t border-dotted border-black pt-1 font-semibold text-[11px]">
              {data.dibuatOlehNama || data.nama || ''}
            </div>
          </div>

          {/* 2. DISETUJUI OLEH */}
          <div className="p-2 flex flex-col justify-between text-center min-h-[110px]">
            <div className="font-bold text-[11px] text-left border-b border-slate-200 pb-1">
              DISETUJUI OLEH:
            </div>
            <div className="h-12 flex items-center justify-center my-1">
              {data.disetujuiOlehSign ? (
                <img
                  src={data.disetujuiOlehSign}
                  alt="Disetujui Oleh Signature"
                  className="max-h-12 max-w-[120px] object-contain"
                />
              ) : null}
            </div>
            <div className="border-t border-dotted border-black pt-1 font-semibold text-[11px]">
              {data.disetujuiOlehNama || 'Ferry Lukito'}
            </div>
          </div>

          {/* 3. DIKETAHUI OLEH */}
          <div className="p-2 flex flex-col justify-between text-center min-h-[110px]">
            <div className="font-bold text-[11px] text-left border-b border-slate-200 pb-1">
              DIKETAHUI OLEH:
            </div>
            <div className="h-12 flex items-center justify-center my-1">
              {data.diketahuiOlehSign ? (
                <img
                  src={data.diketahuiOlehSign}
                  alt="Diketahui Oleh Signature"
                  className="max-h-12 max-w-[120px] object-contain"
                />
              ) : null}
            </div>
            <div className="border-t border-dotted border-black pt-1 font-semibold text-[11px]">
              {data.diketahuiOlehNama || ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
