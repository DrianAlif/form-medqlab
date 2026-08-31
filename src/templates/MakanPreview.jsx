import React from 'react';
import { PermintaanUangMukaVoucher } from './VoucherHeader';
import { formatRupiah } from '../utils/currency';

export function MakanPreview({ data }) {
  // Calculate total across all team member consumption items
  const totalAmount = (data.items || []).reduce((acc, item) => {
    return acc + ((Number(item.qty) || 0) * (Number(item.hargaSatuan) || 0));
  }, 0);

  return (
    <div id="pdf-content" className="w-full flex flex-col items-center gap-8 print:gap-0">
      {/* PAGE 1: PERMINTAAN UANG MUKA */}
      <div className="pdf-page-container w-full max-w-[850px] p-8 min-h-[580px] flex flex-col justify-start">
        <PermintaanUangMukaVoucher data={data} totalAmount={totalAmount} />
      </div>

      {/* PAGE BREAK MARKER */}
      <div className="html2pdf__page-break"></div>

      {/* PAGE 2: LAMPIRAN KONSUMSI TIM (Landscape oriented) */}
      <div className="pdf-page-container w-full max-w-[1050px] p-8 text-black font-sans text-[11px]">
        {/* Top Metadata */}
        <div className="flex justify-between items-start mb-3">
          <div className="italic text-[10px] text-slate-700 font-medium">
            {data.rateNote || 'Jawa & Bali : Rp. 75.000 | Luar Jawa & Bali Rp. 90.000'}
          </div>
          <div className="text-[11px] space-y-0.5 min-w-[320px]">
            <div className="flex">
              <span className="w-24 font-medium">Project</span>
              <span className="flex-1">: {data.project || ''}</span>
            </div>
            <div className="flex">
              <span className="w-24 font-medium">Rumah Sakit</span>
              <span className="flex-1">: {data.rumahSakit || ''}</span>
            </div>
            <div className="flex">
              <span className="w-24 font-medium">Periode</span>
              <span className="flex-1">: {data.periode || ''}</span>
            </div>
            <div className="flex">
              <span className="w-24 font-medium">Tahap</span>
              <span className="flex-1">: {data.tahap || ''}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="border border-black overflow-hidden">
          <table className="w-full border-collapse text-[10px]">
            <thead>
              <tr className="bg-[#c6e0b4] text-black font-semibold text-center border-b border-black">
                <th className="border-r border-black p-1.5 w-12">WBS</th>
                <th className="border-r border-black p-1.5 w-44">Tanggal</th>
                <th className="border-r border-black p-1.5 text-left pl-3">Description</th>
                <th className="border-r border-black p-1.5 w-12">Qty</th>
                <th className="border-r border-black p-1.5 w-14">Unit</th>
                <th className="border-r border-black p-1.5 w-32">Harga Satuan (Rp)</th>
                <th className="border-r border-black p-1.5 w-36">Total Biaya (Rp)</th>
                <th className="p-1.5 w-24">TTD</th>
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
                      <div className="h-10 flex items-center justify-center">
                        {item.ttd ? (
                          <img
                            src={item.ttd}
                            alt="Signature"
                            className="max-h-9 max-w-[80px] object-contain"
                          />
                        ) : (
                          <span className="text-slate-300 italic text-[9px]">(Tanda Tangan)</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Subtotal Row */}
              <tr className="bg-[#d9d9d9] font-bold border-b border-black">
                <td colSpan={6} className="border-r border-black text-center p-1.5 font-bold">
                  Jumlah
                </td>
                <td className="border-r border-black p-1.5 text-right pr-2 font-bold">
                  <div className="flex justify-between">
                    <span>Rp</span>
                    <span>{formatRupiah(totalAmount, false)}</span>
                  </div>
                </td>
                <td className="p-1"></td>
              </tr>

              {/* Grand Total Row */}
              <tr className="font-bold border-b border-black">
                <td colSpan={6} className="border-r border-black text-center p-2 text-[12px]">
                  Total Budgeting
                </td>
                <td className="border-r border-black p-2 text-right pr-2 text-[12px] font-bold">
                  <div className="flex justify-between">
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
  );
}
