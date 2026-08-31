import React from 'react';
import { PermintaanUangMukaVoucher } from './VoucherHeader';
import { formatRupiah } from '../utils/currency';
import { getNormalizedParentCategories } from '../forms/KosanForm';

export function KosanPreview({ data }) {
  const parentCategories = getNormalizedParentCategories(data);

  // Compute Grand Total across all dynamic parent categories & subcategories
  const grandTotal = parentCategories.reduce((accP, parent) => {
    const parentTotal = (parent.subCategories || []).reduce((accS, sub) => {
      const subTotal = (sub.items || []).reduce((accI, it) => {
        return accI + ((Number(it.qty) || 0) * (Number(it.hargaSatuan) || 0));
      }, 0);
      return accS + subTotal;
    }, 0);
    return accP + parentTotal;
  }, 0);

  return (
    <div id="pdf-content" className="w-full flex flex-col items-center gap-8 print:gap-0">
      {/* PAGE 1: PERMINTAAN UANG MUKA */}
      <div className="pdf-page-container w-full max-w-[850px] p-8 min-h-[580px] flex flex-col justify-start">
        <PermintaanUangMukaVoucher data={data} totalAmount={grandTotal} />
      </div>

      {/* PAGE BREAK MARKER */}
      <div className="html2pdf__page-break"></div>

      {/* PAGE 2: LAMPIRAN BUDGETING DINAMIS (Landscape oriented) */}
      <div className="pdf-page-container w-full max-w-[1050px] p-8 text-black font-sans text-[11px]">
        {/* Top Info Metadata */}
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

        {/* Budgeting Table */}
        <div className="border border-black overflow-hidden">
          <table className="w-full border-collapse text-[10px]">
            <colgroup>
              <col style={{ width: '40px' }} />
              <col style={{ width: '160px' }} />
              <col />
              <col style={{ width: '40px' }} />
              <col style={{ width: '55px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '125px' }} />
              <col style={{ width: '90px' }} />
            </colgroup>
            <thead>
              <tr className="bg-[#c6e0b4] text-black font-semibold text-center border-b border-black">
                <th className="border-r border-black p-1.5">WBS</th>
                <th className="border-r border-black p-1.5">Tanggal</th>
                <th className="border-r border-black p-1.5 text-left pl-2">Description</th>
                <th className="border-r border-black p-1.5">Qty</th>
                <th className="border-r border-black p-1.5">Unit</th>
                <th className="border-r border-black p-1.5">Harga Satuan (Rp)</th>
                <th className="border-r border-black p-1.5">Total Biaya (Rp)</th>
                <th className="p-1.5">Informasi</th>
              </tr>
            </thead>
            <tbody>
              {parentCategories.map((parent, pIdx) => {
                // Compute Parent Total
                const parentTotal = (parent.subCategories || []).reduce((accS, sub) => {
                  const subTotal = (sub.items || []).reduce((accI, it) => {
                    return accI + ((Number(it.qty) || 0) * (Number(it.hargaSatuan) || 0));
                  }, 0);
                  return accS + subTotal;
                }, 0);

                return (
                  <React.Fragment key={parent.id || pIdx}>
                    {/* Parent Header Row */}
                    <tr className="border-b border-black font-semibold bg-slate-50/50">
                      <td className="border-r border-black text-center p-1 font-bold">{pIdx + 1}</td>
                      <td className="border-r border-black p-1"></td>
                      <td className="border-r border-black p-1 pl-2 font-bold">{parent.title || `Kategori ${pIdx + 1}`}</td>
                      <td className="border-r border-black p-1"></td>
                      <td className="border-r border-black p-1"></td>
                      <td className="border-r border-black p-1"></td>
                      <td className="border-r border-black p-1"></td>
                      <td className="p-1"></td>
                    </tr>

                    {/* Sub-Categories & Item Rows */}
                    {(parent.subCategories || []).map((sub, sIdx) => (
                      <React.Fragment key={sub.id || sIdx}>
                        {(sub.items || []).map((item, itemIdx) => {
                          const itemTotal = (Number(item.qty) || 0) * (Number(item.hargaSatuan) || 0);

                          return (
                            <tr key={item.id || itemIdx} className="border-b border-black">
                              <td className="border-r border-black text-center p-1"></td>
                              <td className="border-r border-black text-center p-1">{item.rentangTanggal ?? item.tanggal ?? ''}</td>
                              <td className="border-r border-black p-1 pl-2">{item.deskripsi ?? item.description ?? ''}</td>
                              <td className="border-r border-black text-center p-1">{item.qty}</td>
                              <td className="border-r border-black text-center p-1">{item.unit}</td>
                              <td className="border-r border-black p-1 text-right pr-2">
                                <div className="flex justify-between">
                                  <span>Rp</span>
                                  <span>{formatRupiah(item.hargaSatuan, false)}</span>
                                </div>
                              </td>
                              <td className="border-r border-black p-1 text-right pr-2">
                                <div className="flex justify-between">
                                  <span>Rp</span>
                                  <span>{formatRupiah(itemTotal, false)}</span>
                                </div>
                              </td>
                              <td className="p-1 text-center">{item.informasi || ''}</td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}

                    {/* Parent Spacer Rows for Template Authenticity */}
                    <tr className="border-b border-black">
                      <td className="border-r border-black p-1"></td>
                      <td className="border-r border-black p-1"></td>
                      <td className="border-r border-black p-1"></td>
                      <td className="border-r border-black p-1"></td>
                      <td className="border-r border-black p-1"></td>
                      <td className="border-r border-black p-1"></td>
                      <td className="border-r border-black p-1 text-right pr-2">
                        <div className="flex justify-between"><span>Rp</span><span>-</span></div>
                      </td>
                      <td className="p-1"></td>
                    </tr>

                    {/* Parent Subtotal Row */}
                    <tr className="bg-[#d9d9d9] font-bold border-b border-black">
                      <td colSpan={5} className="border-r border-black text-center p-1">
                        Jumlah
                      </td>
                      <td className="border-r border-black p-1"></td>
                      <td className="border-r border-black p-1 text-right pr-2">
                        <div className="flex justify-between">
                          <span>Rp</span>
                          <span>{formatRupiah(parentTotal, false)}</span>
                        </div>
                      </td>
                      <td className="p-1"></td>
                    </tr>
                  </React.Fragment>
                );
              })}

              {/* Intermediate Blank Spacing Row */}
              <tr className="border-b border-black">
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1 text-right pr-2">
                  <div className="flex justify-between"><span>Rp</span><span>-</span></div>
                </td>
                <td className="p-1"></td>
              </tr>

              <tr className="bg-[#d9d9d9] font-bold border-b border-black">
                <td colSpan={5} className="border-r border-black text-center p-1">
                  Jumlah
                </td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1 text-right pr-2">
                  <div className="flex justify-between">
                    <span>Rp</span>
                    <span>-</span>
                  </div>
                </td>
                <td className="p-1"></td>
              </tr>

              {/* GRAND TOTAL ROW */}
              <tr className="font-bold border-b border-black">
                <td colSpan={6} className="border-r border-black text-center p-2 text-[12px]">
                  Total Budgeting
                </td>
                <td className="border-r border-black bg-[#c00000] text-white p-2 text-right pr-2 text-[12px]">
                  <div className="flex justify-between font-bold">
                    <span>Rp</span>
                    <span>{formatRupiah(grandTotal, false)}</span>
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
