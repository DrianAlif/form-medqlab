import React from 'react';
import { Logo } from '../components/Logo';
import { formatRupiah } from '../utils/currency';

export function AkomodasiPreview({ data }) {
  const items = data.items || [];

  // Compute Column Sums
  const sumBensin = items.reduce((acc, it) => acc + (Number(it.bensin) || 0), 0);
  const sumTolParkir = items.reduce((acc, it) => acc + (Number(it.tolParkir) || 0), 0);
  const sumPjs = items.reduce((acc, it) => acc + (Number(it.pjs) || 0), 0);
  const sumHotel = items.reduce((acc, it) => acc + (Number(it.hotel) || 0), 0);
  const sumEntertaint = items.reduce((acc, it) => acc + (Number(it.entertaint) || 0), 0);
  const sumTiket = items.reduce((acc, it) => acc + (Number(it.tiket) || 0), 0);
  const sumFotocopy = items.reduce((acc, it) => acc + (Number(it.fotocopy) || 0), 0);
  const sumLainLain = items.reduce((acc, it) => acc + (Number(it.lainLain) || 0), 0);

  const totalTerpakai = sumBensin + sumTolParkir + sumPjs + sumHotel + sumEntertaint + sumTiket + sumFotocopy + sumLainLain;

  const totalDiterima1 = Number(data.totalDiterima1) || 0;
  const totalDiterima2 = Number(data.totalDiterima2) || 0;
  const totalDiterimaAll = totalDiterima1 + totalDiterima2;
  const sisaAkomodasi = totalDiterimaAll - totalTerpakai;

  // Minimum 4 table rows for template visual fidelity
  const displayRowsCount = Math.max(items.length, 4);
  const displayRows = Array.from({ length: displayRowsCount }, (_, i) => items[i] || null);

  const attachments = data.attachments || [];

  return (
    <div id="pdf-content" className="w-full flex flex-col items-center gap-8 print:gap-0">
      {/* PAGE 1: FORMULIR LAPORAN AKOMODASI (Landscape 1050px) */}
      <div className="pdf-page-container w-full max-w-[1050px] p-8 text-black font-sans text-[10px] min-h-[640px] flex flex-col justify-between">
        <div>
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-black">
            <div className="flex items-center gap-3">
              <Logo className="h-12" showText={true} />
            </div>
            <div className="flex-1 text-center pr-20">
              <h1 className="text-[19px] font-extrabold tracking-wider text-black uppercase">
                LAPORAN AKOMODASI
              </h1>
            </div>
          </div>

          {/* Employee & Project Metadata Box */}
          <div className="border border-black p-2.5 mb-3 bg-white text-[10px] grid grid-cols-2 gap-x-8 gap-y-1">
            <div className="flex items-baseline">
              <span className="w-24 font-bold">Nama</span>
              <span className="flex-1">: {data.nama || ''}</span>
            </div>
            <div className="flex items-baseline">
              <span className="w-24 font-bold">Department</span>
              <span className="flex-1">: {data.department || ''}</span>
            </div>

            <div className="flex items-baseline">
              <span className="w-24 font-bold">NIK</span>
              <span className="flex-1">: {data.nik || ''}</span>
            </div>
            <div className="flex items-baseline">
              <span className="w-24 font-bold">Customer</span>
              <span className="flex-1">: {data.customer || ''}</span>
            </div>

            <div className="flex items-baseline">
              <span className="w-24 font-bold">Jabatan</span>
              <span className="flex-1">: {data.jabatan || ''}</span>
            </div>
            <div className="flex items-baseline">
              <span className="w-24 font-bold">Periode</span>
              <span className="flex-1">: {data.periode || ''}</span>
            </div>
          </div>

          {/* Main Expense Table */}
          <div className="border border-black overflow-hidden mb-3">
            <table className="w-full border-collapse text-[9.5px]">
              <colgroup>
                <col style={{ width: '28px' }} />
                <col style={{ width: '110px' }} />
                <col style={{ width: '90px' }} />
                <col />
                <col style={{ width: '55px' }} />
                <col style={{ width: '55px' }} />
                <col style={{ width: '55px' }} />
                <col style={{ width: '55px' }} />
                <col style={{ width: '65px' }} />
                <col style={{ width: '55px' }} />
                <col style={{ width: '65px' }} />
                <col style={{ width: '68px' }} />
                <col style={{ width: '72px' }} />
              </colgroup>
              <thead>
                <tr className="bg-slate-100 text-black font-bold text-center border-b border-black text-[9px] leading-tight">
                  <th className="border-r border-black p-1">NO.</th>
                  <th className="border-r border-black p-1">TGL</th>
                  <th className="border-r border-black p-1">Nama Customer</th>
                  <th className="border-r border-black p-1">Tujuan / Keterangan</th>
                  <th className="border-r border-black p-1">Bensin</th>
                  <th className="border-r border-black p-1">Tol /<br />Parkir</th>
                  <th className="border-r border-black p-1">PJS /<br />Hari</th>
                  <th className="border-r border-black p-1">Hotel /<br />Malam</th>
                  <th className="border-r border-black p-1">Entertaint<br />Makan</th>
                  <th className="border-r border-black p-1">Tiket</th>
                  <th className="border-r border-black p-1">Fotocopy<br />Cetakan</th>
                  <th className="border-r border-black p-1">Lain-Lain</th>
                  <th className="p-1">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((item, idx) => {
                  if (!item) {
                    // Empty Spacer Row
                    return (
                      <tr key={`empty-${idx}`} className="border-b border-black h-6">
                        <td className="border-r border-black text-center p-1 font-semibold">{idx + 1}</td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r border-black p-1 text-center">{idx === 1 ? (data.customer || 'RSCM') : ''}</td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r border-black p-1 text-right pr-1"></td>
                        <td className="border-r border-black p-1 text-right pr-1"></td>
                        <td className="border-r border-black p-1 text-right pr-1"></td>
                        <td className="border-r border-black p-1 text-right pr-1"></td>
                        <td className="border-r border-black p-1 text-right pr-1"></td>
                        <td className="border-r border-black p-1 text-right pr-1"></td>
                        <td className="border-r border-black p-1 text-right pr-1"></td>
                        <td className="border-r border-black p-1 text-right pr-1"></td>
                        <td className="p-1 text-center font-semibold">-</td>
                      </tr>
                    );
                  }

                  const rowSum = (Number(item.bensin) || 0) +
                    (Number(item.tolParkir) || 0) +
                    (Number(item.pjs) || 0) +
                    (Number(item.hotel) || 0) +
                    (Number(item.entertaint) || 0) +
                    (Number(item.tiket) || 0) +
                    (Number(item.fotocopy) || 0) +
                    (Number(item.lainLain) || 0);

                  return (
                    <tr key={item.id || idx} className="border-b border-black h-6">
                      <td className="border-r border-black text-center p-1 font-semibold">{idx + 1}</td>
                      <td className="border-r border-black text-center p-1">{item.tanggal || ''}</td>
                      <td className="border-r border-black text-center p-1">{item.customer || data.customer || ''}</td>
                      <td className="border-r border-black p-1 pl-1.5 font-medium">{item.tujuan || ''}</td>
                      <td className="border-r border-black p-1 text-right pr-1">
                        {item.bensin ? formatRupiah(item.bensin, false) : ''}
                      </td>
                      <td className="border-r border-black p-1 text-right pr-1">
                        {item.tolParkir ? formatRupiah(item.tolParkir, false) : ''}
                      </td>
                      <td className="border-r border-black p-1 text-right pr-1">
                        {item.pjs ? formatRupiah(item.pjs, false) : ''}
                      </td>
                      <td className="border-r border-black p-1 text-right pr-1">
                        {item.hotel ? formatRupiah(item.hotel, false) : ''}
                      </td>
                      <td className="border-r border-black p-1 text-right pr-1">
                        {item.entertaint ? formatRupiah(item.entertaint, false) : ''}
                      </td>
                      <td className="border-r border-black p-1 text-right pr-1">
                        {item.tiket ? formatRupiah(item.tiket, false) : ''}
                      </td>
                      <td className="border-r border-black p-1 text-right pr-1">
                        {item.fotocopy ? formatRupiah(item.fotocopy, false) : ''}
                      </td>
                      <td className="border-r border-black p-1 text-right pr-1 font-medium">
                        {item.lainLain ? `Rp ${formatRupiah(item.lainLain, false)}` : ''}
                      </td>
                      <td className="p-1 text-right pr-1 font-bold">
                        {rowSum > 0 ? formatRupiah(rowSum, false) : '-'}
                      </td>
                    </tr>
                  );
                })}

                {/* TOTAL ROW */}
                <tr className="border-b border-black bg-slate-100 font-bold text-[9px]">
                  <td colSpan={4} className="border-r border-black text-center p-1 font-extrabold">
                    TOTAL
                  </td>
                  <td className="border-r border-black p-1 text-right pr-1">
                    {sumBensin > 0 ? `Rp ${formatRupiah(sumBensin, false)}` : 'Rp -'}
                  </td>
                  <td className="border-r border-black p-1 text-right pr-1">
                    {sumTolParkir > 0 ? `Rp ${formatRupiah(sumTolParkir, false)}` : 'Rp -'}
                  </td>
                  <td className="border-r border-black p-1 text-right pr-1">
                    {sumPjs > 0 ? `Rp ${formatRupiah(sumPjs, false)}` : 'Rp -'}
                  </td>
                  <td className="border-r border-black p-1 text-right pr-1">
                    {sumHotel > 0 ? `Rp ${formatRupiah(sumHotel, false)}` : 'Rp -'}
                  </td>
                  <td className="border-r border-black p-1 text-right pr-1">
                    {sumEntertaint > 0 ? `Rp ${formatRupiah(sumEntertaint, false)}` : 'Rp -'}
                  </td>
                  <td className="border-r border-black p-1 text-right pr-1">
                    {sumTiket > 0 ? `Rp ${formatRupiah(sumTiket, false)}` : 'Rp -'}
                  </td>
                  <td className="border-r border-black p-1 text-right pr-1">
                    {sumFotocopy > 0 ? `Rp ${formatRupiah(sumFotocopy, false)}` : 'Rp -'}
                  </td>
                  <td className="border-r border-black p-1 text-right pr-1 font-bold">
                    {sumLainLain > 0 ? `Rp ${formatRupiah(sumLainLain, false)}` : 'Rp -'}
                  </td>
                  <td className="p-1 text-right pr-1 font-extrabold text-slate-900">
                    {totalTerpakai > 0 ? formatRupiah(totalTerpakai, false) : '0'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTTOM SECTION: REKAPITULASI & TANDA TANGAN */}
        <div className="grid grid-cols-12 gap-6 items-start mt-2">
          {/* Left Financial Summary Box */}
          <div className="col-span-5 border border-black bg-slate-100 text-[9.5px]">
            <div className="border-b border-black p-1.5 font-bold flex justify-between">
              <span>Keterangan :</span>
              <span className="font-semibold">{data.keteranganSummary || ''}</span>
            </div>
            <div className="border-b border-black px-2 py-1 flex justify-between font-semibold">
              <span>Total Diterima #1</span>
              <span>{totalDiterima1 > 0 ? `Rp ${formatRupiah(totalDiterima1, false)}` : ''}</span>
            </div>
            <div className="border-b border-black px-2 py-1 flex justify-between font-semibold">
              <span>Total Diterima #2</span>
              <span>{totalDiterima2 > 0 ? `Rp ${formatRupiah(totalDiterima2, false)}` : ''}</span>
            </div>
            <div className="border-b border-black px-2 py-1 flex justify-between font-bold">
              <span>Total Terpakai</span>
              <div className="flex gap-4">
                <span>Rp</span>
                <span>{formatRupiah(totalTerpakai, false)}</span>
              </div>
            </div>
            <div className="px-2 py-1 flex justify-between font-extrabold bg-slate-200">
              <span>Sisa Akomodasi</span>
              <div className="flex gap-4">
                <span>{sisaAkomodasi < 0 ? '-Rp' : 'Rp'}</span>
                <span>{formatRupiah(Math.abs(sisaAkomodasi), false)}</span>
              </div>
            </div>
          </div>

          {/* Right Signature Area */}
          <div className="col-span-7 flex flex-col justify-between min-h-[140px]">
            <div className="text-right text-[10px] font-semibold pr-4 pb-2">
              {data.tanggalDokumen || '31 Agustus 2026'}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              {/* Dibuat Oleh */}
              <div className="flex flex-col items-center justify-between min-h-[110px]">
                <div className="font-semibold text-slate-800">Dibuat oleh,</div>
                <div className="h-14 flex items-center justify-center my-0.5">
                  {data.dibuatOlehSign ? (
                    <img
                      src={data.dibuatOlehSign}
                      alt="Dibuat Oleh"
                      className="max-h-14 max-w-[120px] object-contain"
                    />
                  ) : null}
                </div>
                <div className="w-full border-t border-black pt-1 font-semibold text-[10px]">
                  {data.dibuatOlehNama || data.nama || 'M. Prahmadyan'}
                </div>
              </div>

              {/* Diketahui Oleh */}
              <div className="flex flex-col items-center justify-between min-h-[110px]">
                <div className="font-semibold text-slate-800">Diketahui oleh,</div>
                <div className="h-14 flex items-center justify-center my-0.5">
                  {data.diketahuiOlehSign ? (
                    <img
                      src={data.diketahuiOlehSign}
                      alt="Diketahui Oleh"
                      className="max-h-14 max-w-[120px] object-contain"
                    />
                  ) : null}
                </div>
                <div className="w-full border-t border-black pt-1 font-semibold text-[10px]">
                  {data.diketahuiOlehNama || ''}
                </div>
              </div>

              {/* Disetujui Oleh */}
              <div className="flex flex-col items-center justify-between min-h-[110px]">
                <div className="font-semibold text-slate-800">Disetujui oleh,</div>
                <div className="h-14 flex items-center justify-center my-0.5">
                  {data.disetujuiOlehSign ? (
                    <img
                      src={data.disetujuiOlehSign}
                      alt="Disetujui Oleh"
                      className="max-h-14 max-w-[120px] object-contain"
                    />
                  ) : null}
                </div>
                <div className="w-full border-t border-black pt-1 font-semibold text-[10px]">
                  {data.disetujuiOlehNama || ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 2 AND BEYOND: ATTACHMENT PAGES (LAMPIRAN BUKTI TRANSAKSI) */}
      {attachments.length > 0 && (
        <React.Fragment>
          {/* Page Break */}
          <div className="html2pdf__page-break"></div>

          <div className="pdf-page-container w-full max-w-[1050px] p-8 text-black font-sans text-[11px] min-h-[640px] flex flex-col justify-start">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-black">
              <div className="flex items-center gap-3">
                <Logo className="h-10" showText={true} />
              </div>
              <div className="flex-1 text-center pr-20">
                <h2 className="text-[16px] font-extrabold tracking-wider text-black uppercase">
                  LAMPIRAN BUKTI TRANSAKSI & PEMBAYARAN
                </h2>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  Pegawai: <span className="font-bold">{data.nama || '-'}</span> | Customer: <span className="font-bold">{data.customer || '-'}</span> | Periode: <span className="font-bold">{data.periode || '-'}</span>
                </p>
              </div>
            </div>

            {/* 2x2 Grid of Receipt Attachments */}
            <div className="grid grid-cols-2 gap-4 flex-1">
              {attachments.map((att, idx) => (
                <div
                  key={att.id || idx}
                  className="border border-slate-300 rounded-xl p-3 bg-white flex flex-col items-center justify-between shadow-xs"
                >
                  <div className="w-full flex-1 flex items-center justify-center p-1 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 max-h-[270px]">
                    <img
                      src={att.dataUrl}
                      alt={att.caption || `Bukti ${idx + 1}`}
                      className="max-h-[250px] w-auto max-w-full object-contain rounded"
                    />
                  </div>
                  <div className="mt-2 text-center w-full">
                    <span className="text-[10px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 inline-block">
                      Bukti #{idx + 1}: {att.caption || `Struk Transaksi ${idx + 1}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}
