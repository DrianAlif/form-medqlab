import React from 'react';
import { PermintaanUangMukaVoucher } from './VoucherHeader';
import { formatRupiah } from '../utils/currency';

export function MakanPreview({ data }) {
  // Calculate total across all team member consumption items
  const totalAmount = (data.items || []).reduce((acc, item) => {
    return acc + ((Number(item.qty) || 0) * (Number(item.hargaSatuan) || 0));
  }, 0);

  return (
    <div id="pdf-export-container" className="w-full flex flex-col items-center gap-8 print:gap-0 font-sans">
      {/* LEMBAR 1: PERMINTAAN UANG MUKA (Portrait A4) */}
      <div className="pdf-sheet pdf-page-portrait">
        <div className="page-inner-content flex flex-col justify-start">
          <PermintaanUangMukaVoucher data={data} totalAmount={totalAmount} />
        </div>
      </div>

      {/* LEMBAR 2: LAMPIRAN KONSUMSI TIM (Portrait A4) */}
      <div className="pdf-sheet pdf-page-portrait text-black text-[10px]">
        <div className="page-inner-content flex flex-col justify-start">
          {/* Top Metadata */}
          <div className="flex justify-between items-start mb-3">
            <div className="italic text-[9.5px] text-slate-700 font-medium">
              {data.rateNote || 'Jawa & Bali : Rp. 75.000 | Luar Jawa & Bali Rp. 90.000'}
            </div>
            <div className="text-[10px] space-y-0.5 min-w-[280px]">
              <div className="flex">
                <span className="w-20 font-semibold">Project</span>
                <span className="flex-1">: {data.project || ''}</span>
              </div>
              <div className="flex">
                <span className="w-20 font-semibold">Rumah Sakit</span>
                <span className="flex-1">: {data.rumahSakit || ''}</span>
              </div>
              <div className="flex">
                <span className="w-20 font-semibold">Periode</span>
                <span className="flex-1">: {data.periode || ''}</span>
              </div>
              <div className="flex">
                <span className="w-20 font-semibold">Tahap</span>
                <span className="flex-1">: {data.tahap || ''}</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="border border-black overflow-hidden">
            <table className="w-full border-collapse text-[9.5px]">
              <thead>
                <tr className="bg-[#c6e0b4] text-black font-semibold text-center border-b border-black">
                  <th className="border-r border-black p-1.5 w-10">WBS</th>
                  <th className="border-r border-black p-1.5 w-36">Tanggal</th>
                  <th className="border-r border-black p-1.5 text-left pl-3">Description</th>
                  <th className="border-r border-black p-1.5 w-10">Qty</th>
                  <th className="border-r border-black p-1.5 w-12">Unit</th>
                  <th className="border-r border-black p-1.5 w-28">Harga Satuan (Rp)</th>
                  <th className="border-r border-black p-1.5 w-32">Total Biaya (Rp)</th>
                  <th className="p-1.5 w-20">TTD</th>
                </tr>
              </thead>
              <tbody>
                {/* Category subheader */}
                <tr className="border-b border-black font-semibold">
                  <td className="border-r border-black text-center p-1"></td>
                  <td className="border-r border-black p-1"></td>
                  <td className="border-r border-black p-1 pl-3 font-bold">{data.sectionTitle || 'Akomodasi'}</td>
                  <td className="border-r border-black p-1"></td>
                  <td className="border-r border-black p-1"></td>
                  <td className="border-r border-black p-1"></td>
                  <td className="border-r border-black p-1"></td>
                  <td className="p-1"></td>
                </tr>

                {/* Dynamic Person Rows */}
                {(data.items || []).map((item, idx) => {
                  const totalItem = (Number(item.qty) || 0) * (Number(item.hargaSatuan) || 0);
                  return (
                    <tr key={item.id || idx} className="border-b border-black">
                      <td className="border-r border-black text-center p-1 font-semibold">{item.wbs || (idx + 1)}</td>
                      <td className="border-r border-black text-center p-1">{item.tanggal}</td>
                      <td className="border-r border-black p-1 pl-3">{item.description}</td>
                      <td className="border-r border-black text-center p-1">{item.qty}</td>
                      <td className="border-r border-black text-center p-1">{item.unit}</td>
                      <td className="border-r border-black p-1 text-right pr-2">
                        <div className="flex justify-between">
                          <span>Rp</span>
                          <span>{formatRupiah(item.hargaSatuan, false)}</span>
                        </div>
                      </td>
                      <td className="border-r border-black p-1 text-right pr-2 font-medium">
                        <div className="flex justify-between">
                          <span>Rp</span>
                          <span>{formatRupiah(totalItem, false)}</span>
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className="h-8 flex items-center justify-center">
                          {item.ttd ? (
                            <img
                              src={item.ttd}
                              alt="TTD"
                              className="max-h-7 max-w-[55px] object-contain"
                            />
                          ) : (
                            <span className="text-slate-300 text-[9px]">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* GRAND TOTAL ROW */}
                <tr className="font-bold border-b border-black bg-slate-50">
                  <td colSpan={6} className="border-r border-black text-center p-2 text-[11px]">
                    Total Biaya Makan
                  </td>
                  <td className="border-r border-black bg-[#c00000] text-white p-2 text-right pr-2 text-[11px]">
                    <div className="flex justify-between font-bold">
                      <span>Rp</span>
                      <span>{formatRupiah(totalAmount, false)}</span>
                    </div>
                  </td>
                  <td className="p-1"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
