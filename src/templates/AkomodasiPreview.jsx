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

  // Chunk attachments into pages of 4 items each (2x2 grid)
  const attachmentChunks = [];
  for (let i = 0; i < attachments.length; i += 4) {
    attachmentChunks.push(attachments.slice(i, i + 4));
  }

  return (
    <div id="pdf-export-container" className="w-full flex flex-col items-center gap-8 print:gap-0 font-sans">
      {/* LEMBAR 1: FORMULIR LAPORAN AKOMODASI (Landscape A4) */}
      <div className="pdf-sheet pdf-page-landscape text-black text-[9.5px]">
        <div className="page-inner-content flex flex-col justify-between h-full">
          <div>
            {/* Header Bar */}
            <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-black">
              <div className="flex items-center gap-2.5">
                <Logo className="h-9" showText={true} />
              </div>
              <div className="flex-1 text-center pr-16">
                <h1 className="text-[17px] font-extrabold tracking-wider text-black uppercase">
                  LAPORAN AKOMODASI
                </h1>
              </div>
            </div>

            {/* Standardized Employee & Project Metadata Box */}
            <div className="employee-info-box">
              <div className="info-column">
                <div className="info-row">
                  <span className="label">Nama</span>
                  <span className="colon">:</span>
                  <span className="value">{data.nama || ''}</span>
                </div>
                <div className="info-row">
                  <span className="label">NIK</span>
                  <span className="colon">:</span>
                  <span className="value">{data.nik || ''}</span>
                </div>
                <div className="info-row">
                  <span className="label">Jabatan</span>
                  <span className="colon">:</span>
                  <span className="value">{data.jabatan || ''}</span>
                </div>
              </div>

              <div className="info-column">
                <div className="info-row">
                  <span className="label">Department</span>
                  <span className="colon">:</span>
                  <span className="value">{data.department || ''}</span>
                </div>
                <div className="info-row">
                  <span className="label">Customer</span>
                  <span className="colon">:</span>
                  <span className="value">{data.customer || ''}</span>
                </div>
                <div className="info-row">
                  <span className="label">Periode</span>
                  <span className="colon">:</span>
                  <span className="value">{data.periode || ''}</span>
                </div>
              </div>
            </div>

            {/* Main Expense Table (13 Columns, tabular numbers) */}
            <div className="border border-black overflow-hidden mb-2">
              <table className="w-full border-collapse text-[9px]">
                <colgroup>
                  <col style={{ width: '26px' }} />
                  <col style={{ width: '95px' }} />
                  <col style={{ width: '85px' }} />
                  <col />
                  <col style={{ width: '52px' }} />
                  <col style={{ width: '52px' }} />
                  <col style={{ width: '52px' }} />
                  <col style={{ width: '52px' }} />
                  <col style={{ width: '60px' }} />
                  <col style={{ width: '52px' }} />
                  <col style={{ width: '60px' }} />
                  <col style={{ width: '64px' }} />
                  <col style={{ width: '68px' }} />
                </colgroup>
                <thead>
                  <tr className="bg-slate-100 text-black font-bold text-center border-b border-black text-[8.5px] leading-tight">
                    <th className="border-r border-black p-0.5">NO.</th>
                    <th className="border-r border-black p-0.5">TGL</th>
                    <th className="border-r border-black p-0.5">Nama Customer</th>
                    <th className="border-r border-black p-0.5">Tujuan / Keterangan</th>
                    <th className="border-r border-black p-0.5">Bensin</th>
                    <th className="border-r border-black p-0.5">Tol /<br />Parkir</th>
                    <th className="border-r border-black p-0.5">PJS /<br />Hari</th>
                    <th className="border-r border-black p-0.5">Hotel /<br />Malam</th>
                    <th className="border-r border-black p-0.5">Entertaint<br />Makan</th>
                    <th className="border-r border-black p-0.5">Tiket</th>
                    <th className="border-r border-black p-0.5">Fotocopy<br />Cetakan</th>
                    <th className="border-r border-black p-0.5">Lain-Lain</th>
                    <th className="p-0.5">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((item, idx) => {
                    if (!item) {
                      // Empty Spacer Row
                      return (
                        <tr key={`empty-${idx}`} className="border-b border-black h-5">
                          <td className="border-r border-black text-center p-0.5 font-semibold">{idx + 1}</td>
                          <td className="border-r border-black p-0.5"></td>
                          <td className="border-r border-black p-0.5 text-center">{idx === 1 ? (data.customer || 'RSCM') : ''}</td>
                          <td className="border-r border-black p-0.5"></td>
                          <td className="border-r border-black p-0.5 text-right pr-1"></td>
                          <td className="border-r border-black p-0.5 text-right pr-1"></td>
                          <td className="border-r border-black p-0.5 text-right pr-1"></td>
                          <td className="border-r border-black p-0.5 text-right pr-1"></td>
                          <td className="border-r border-black p-0.5 text-right pr-1"></td>
                          <td className="border-r border-black p-0.5 text-right pr-1"></td>
                          <td className="border-r border-black p-0.5 text-right pr-1"></td>
                          <td className="border-r border-black p-0.5 text-right pr-1"></td>
                          <td className="p-0.5 text-center font-semibold">-</td>
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
                      <tr key={item.id || idx} className="border-b border-black h-5">
                        <td className="border-r border-black text-center p-0.5 font-semibold">{idx + 1}</td>
                        <td className="border-r border-black text-center p-0.5">{item.tanggal || ''}</td>
                        <td className="border-r border-black text-center p-0.5">{item.customer || data.customer || ''}</td>
                        <td className="border-r border-black p-0.5 pl-1.5 font-medium">{item.tujuan || ''}</td>
                        <td className="border-r border-black p-0.5 text-right pr-1">
                          {item.bensin ? formatRupiah(item.bensin, false) : ''}
                        </td>
                        <td className="border-r border-black p-0.5 text-right pr-1">
                          {item.tolParkir ? formatRupiah(item.tolParkir, false) : ''}
                        </td>
                        <td className="border-r border-black p-0.5 text-right pr-1">
                          {item.pjs ? formatRupiah(item.pjs, false) : ''}
                        </td>
                        <td className="border-r border-black p-0.5 text-right pr-1">
                          {item.hotel ? formatRupiah(item.hotel, false) : ''}
                        </td>
                        <td className="border-r border-black p-0.5 text-right pr-1">
                          {item.entertaint ? formatRupiah(item.entertaint, false) : ''}
                        </td>
                        <td className="border-r border-black p-0.5 text-right pr-1">
                          {item.tiket ? formatRupiah(item.tiket, false) : ''}
                        </td>
                        <td className="border-r border-black p-0.5 text-right pr-1">
                          {item.fotocopy ? formatRupiah(item.fotocopy, false) : ''}
                        </td>
                        <td className="border-r border-black p-0.5 text-right pr-1 font-medium">
                          {item.lainLain ? `Rp ${formatRupiah(item.lainLain, false)}` : ''}
                        </td>
                        <td className="p-0.5 text-right pr-1 font-bold">
                          {rowSum > 0 ? formatRupiah(rowSum, false) : '-'}
                        </td>
                      </tr>
                    );
                  })}

                  {/* TOTAL ROW */}
                  <tr className="border-b border-black bg-slate-100 font-bold text-[8.5px]">
                    <td colSpan={4} className="border-r border-black text-center p-0.5 font-extrabold">
                      TOTAL
                    </td>
                    <td className="border-r border-black p-0.5 text-right pr-1">
                      {sumBensin > 0 ? `Rp ${formatRupiah(sumBensin, false)}` : 'Rp -'}
                    </td>
                    <td className="border-r border-black p-0.5 text-right pr-1">
                      {sumTolParkir > 0 ? `Rp ${formatRupiah(sumTolParkir, false)}` : 'Rp -'}
                    </td>
                    <td className="border-r border-black p-0.5 text-right pr-1">
                      {sumPjs > 0 ? `Rp ${formatRupiah(sumPjs, false)}` : 'Rp -'}
                    </td>
                    <td className="border-r border-black p-0.5 text-right pr-1">
                      {sumHotel > 0 ? `Rp ${formatRupiah(sumHotel, false)}` : 'Rp -'}
                    </td>
                    <td className="border-r border-black p-0.5 text-right pr-1">
                      {sumEntertaint > 0 ? `Rp ${formatRupiah(sumEntertaint, false)}` : 'Rp -'}
                    </td>
                    <td className="border-r border-black p-0.5 text-right pr-1">
                      {sumTiket > 0 ? `Rp ${formatRupiah(sumTiket, false)}` : 'Rp -'}
                    </td>
                    <td className="border-r border-black p-0.5 text-right pr-1">
                      {sumFotocopy > 0 ? `Rp ${formatRupiah(sumFotocopy, false)}` : 'Rp -'}
                    </td>
                    <td className="border-r border-black p-0.5 text-right pr-1 font-bold">
                      {sumLainLain > 0 ? `Rp ${formatRupiah(sumLainLain, false)}` : 'Rp -'}
                    </td>
                    <td className="p-0.5 text-right pr-1 font-extrabold text-slate-900">
                      {totalTerpakai > 0 ? formatRupiah(totalTerpakai, false) : '0'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* BOTTOM SECTION: REKAPITULASI & TANDA TANGAN */}
          <div className="no-break grid grid-cols-12 gap-5 items-start mt-1">
            {/* Left Financial Summary Box */}
            <div className="col-span-5 border border-black bg-slate-100 text-[9px]">
              <div className="border-b border-black p-1 font-bold flex justify-between">
                <span>Keterangan :</span>
                <span className="font-semibold">{data.keteranganSummary || ''}</span>
              </div>
              <div className="border-b border-black px-1.5 py-0.5 flex justify-between font-semibold">
                <span>Total Diterima #1</span>
                <span>{totalDiterima1 > 0 ? `Rp ${formatRupiah(totalDiterima1, false)}` : ''}</span>
              </div>
              <div className="border-b border-black px-1.5 py-0.5 flex justify-between font-semibold">
                <span>Total Diterima #2</span>
                <span>{totalDiterima2 > 0 ? `Rp ${formatRupiah(totalDiterima2, false)}` : ''}</span>
              </div>
              <div className="border-b border-black px-1.5 py-0.5 flex justify-between font-bold">
                <span>Total Terpakai</span>
                <div className="flex gap-3">
                  <span>Rp</span>
                  <span>{formatRupiah(totalTerpakai, false)}</span>
                </div>
              </div>
              <div className="px-1.5 py-0.5 flex justify-between font-extrabold bg-slate-200">
                <span>Sisa Akomodasi</span>
                <div className="flex gap-3">
                  <span>{sisaAkomodasi < 0 ? '-Rp' : 'Rp'}</span>
                  <span>{formatRupiah(Math.abs(sisaAkomodasi), false)}</span>
                </div>
              </div>
            </div>

            {/* Right Signature Area */}
            <div className="col-span-7 flex flex-col justify-between min-h-[115px] signature-section">
              <div className="text-right text-[9.5px] font-semibold pr-3 pb-1">
                {data.tanggalDokumen || '31 Agustus 2026'}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[9.5px]">
                {/* Dibuat Oleh */}
                <div className="flex flex-col items-center justify-between min-h-[90px]">
                  <div className="font-semibold text-slate-800">Dibuat oleh,</div>
                  <div className="h-10 flex items-center justify-center my-0.5">
                    {data.dibuatOlehSign ? (
                      <img
                        src={data.dibuatOlehSign}
                        alt="Dibuat Oleh"
                        className="max-h-10 max-w-[100px] object-contain"
                      />
                    ) : null}
                  </div>
                  <div className="w-full border-t border-black pt-0.5 font-semibold text-[9.5px]">
                    {data.dibuatOlehNama || data.nama || 'M. Prahmadyan'}
                  </div>
                </div>

                {/* Diketahui Oleh */}
                <div className="flex flex-col items-center justify-between min-h-[90px]">
                  <div className="font-semibold text-slate-800">Diketahui oleh,</div>
                  <div className="h-10 flex items-center justify-center my-0.5">
                    {data.diketahuiOlehSign ? (
                      <img
                        src={data.diketahuiOlehSign}
                        alt="Diketahui Oleh"
                        className="max-h-10 max-w-[100px] object-contain"
                      />
                    ) : null}
                  </div>
                  <div className="w-full border-t border-black pt-0.5 font-semibold text-[9.5px]">
                    {data.diketahuiOlehNama || ''}
                  </div>
                </div>

                {/* Disetujui Oleh */}
                <div className="flex flex-col items-center justify-between min-h-[90px]">
                  <div className="font-semibold text-slate-800">Disetujui oleh,</div>
                  <div className="h-10 flex items-center justify-center my-0.5">
                    {data.disetujuiOlehSign ? (
                      <img
                        src={data.disetujuiOlehSign}
                        alt="Disetujui Oleh"
                        className="max-h-10 max-w-[100px] object-contain"
                      />
                    ) : null}
                  </div>
                  <div className="w-full border-t border-black pt-0.5 font-semibold text-[9.5px]">
                    {data.disetujuiOlehNama || ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LEMBAR 2 DAN SETERUSNYA: ATTACHMENT PAGES (LAMPIRAN BUKTI TRANSAKSI) */}
      {attachmentChunks.map((chunk, pageIndex) => (
        <div key={`att-page-${pageIndex}`} className="pdf-sheet pdf-page-landscape text-black text-[10px]">
          <div className="page-inner-content flex flex-col justify-start h-full">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-black">
              <div className="flex items-center gap-2.5">
                <Logo className="h-8" showText={true} />
              </div>
              <div className="flex-1 text-center pr-16">
                <h2 className="text-[15px] font-extrabold tracking-wider text-black uppercase">
                  LAMPIRAN BUKTI TRANSAKSI & PEMBAYARAN
                </h2>
                <p className="text-[9.5px] text-slate-600 mt-0.5">
                  Pegawai: <span className="font-bold">{data.nama || '-'}</span> | Customer: <span className="font-bold">{data.customer || '-'}</span> | Periode: <span className="font-bold">{data.periode || '-'}</span> {attachmentChunks.length > 1 ? `(Hal. ${pageIndex + 1} dari ${attachmentChunks.length})` : ''}
                </p>
              </div>
            </div>

            {/* 2x2 Grid of Receipt Attachments with Anti-Distortion Styling */}
            <div className="grid grid-cols-2 gap-3.5 flex-1">
              {chunk.map((att, idx) => {
                const globalIndex = pageIndex * 4 + idx + 1;
                return (
                  <div
                    key={att.id || idx}
                    className="no-break border border-slate-300 rounded-xl p-2.5 bg-white flex flex-col items-center justify-between shadow-xs"
                  >
                    <div className="w-full flex-1 flex items-center justify-center p-1 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 max-h-[220px]">
                      <img
                        src={att.dataUrl}
                        alt={att.caption || `Bukti ${globalIndex}`}
                        className="attachment-img max-h-[200px] w-full"
                      />
                    </div>
                    <div className="mt-1.5 text-center w-full">
                      <span className="text-[9.5px] font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 inline-block truncate max-w-full">
                        Bukti #{globalIndex}: {att.caption || `Struk Transaksi ${globalIndex}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
