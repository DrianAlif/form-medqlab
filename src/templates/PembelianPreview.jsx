import React from 'react';
import { Logo } from '../components/Logo';
import { formatRupiah } from '../utils/currency';
import { formatShortIndoDate } from '../utils/dateUtils';

export function PembelianPreview({ data = {} }) {
  const items = data.items || [];
  const displayDate = formatShortIndoDate(data.tanggal) || data.tanggal || '';

  return (
    <div id="pdf-export-container" className="w-full flex flex-col items-center font-sans">
      {/* LEMBAR 1: FORM PERMINTAAN PEMBELIAN BARANG (A4 Landscape) */}
      <div className="pdf-sheet pdf-page-landscape text-black text-[10px] leading-tight">
        <div className="page-inner-content flex flex-col justify-between h-full">
          <div>
            {/* Top Header Section */}
            <div className="flex items-start justify-between pb-3 mb-2">
              {/* Left: Company Logo & Address */}
              <div className="flex items-start gap-3">
                <Logo className="h-10" showText={true} />
                <div className="text-[9.5px] leading-tight text-slate-800 space-y-0.5">
                  <div className="font-bold text-[10px] text-black">PT. Applimetis Parama Solusi</div>
                  <div>Jl. Rose Garden 1 No.7 (RRG1 No.7)</div>
                  <div>Kel. Jakasetia, Kec. Bekasi Selatan</div>
                  <div>Kota Bekasi 17147</div>
                </div>
              </div>

              {/* Right: Document Metadata (No, Tanggal, Dept, Nama) */}
              <div className="w-[300px] text-[10px]">
                <table className="w-full text-[10px] border-collapse">
                  <tbody>
                    <tr>
                      <td className="w-16 py-0.5 font-normal text-black">No</td>
                      <td className="w-3 py-0.5 text-center">:</td>
                      <td className="py-0.5 font-medium text-black">{data.nomor || ''}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 font-normal text-black">Tanggal</td>
                      <td className="py-0.5 text-center">:</td>
                      <td className="py-0.5 font-medium text-black">{displayDate}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 font-normal text-black">Dept</td>
                      <td className="py-0.5 text-center">:</td>
                      <td className="py-0.5 font-medium text-black">{data.dept || 'Developer'}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 font-normal text-black">Nama</td>
                      <td className="py-0.5 text-center">:</td>
                      <td className="py-0.5 font-medium text-black">{data.nama || 'Galih Wicaksono'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center my-4">
              <h1 className="text-[13px] font-extrabold uppercase tracking-wide underline underline-offset-4 text-black inline-block">
                FORM PERMINTAAN PEMBELIAN BARANG
              </h1>
            </div>

            {/* Unified Table: Items + Signatures in One Continuous Grid */}
            <div className="border border-black mb-4">
              <table className="w-full border-collapse text-[9.5px]">
                <colgroup>
                  <col style={{ width: '38px' }} />
                  <col />
                  <col style={{ width: '48px' }} />
                  <col style={{ width: '95px' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: '135px' }} />
                  <col style={{ width: '145px' }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-black text-center font-bold text-[9.5px]">
                    <th rowSpan={2} className="border-r border-black p-1.5 align-middle">
                      No
                    </th>
                    <th rowSpan={2} className="border-r border-black p-1.5 align-middle text-center">
                      Jenis/ Nama Barang
                    </th>
                    <th rowSpan={2} className="border-r border-black p-1.5 align-middle">
                      Qty
                    </th>
                    <th colSpan={2} className="border-r border-b border-black p-1 text-center font-bold">
                      Harga
                    </th>
                    <th rowSpan={2} className="border-r border-black p-1.5 align-middle text-center">
                      keperluan
                    </th>
                    <th rowSpan={2} className="p-1.5 align-middle text-center">
                      Keterangan
                    </th>
                  </tr>
                  <tr className="border-b border-black text-center font-bold text-[9px]">
                    <th className="border-r border-black p-1">
                      Satuan
                    </th>
                    <th className="border-r border-black p-1">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const rowQty = Number(item.qty) || 0;
                    const rowPrice = Number(item.hargaSatuan) || 0;
                    const rowTotal = rowQty * rowPrice;

                    return (
                      <tr key={item.id || idx} className="border-b border-black h-6">
                        <td className="border-r border-black text-center p-1 font-normal">
                          {idx + 1}
                        </td>
                        <td className="border-r border-black text-left px-2 p-1 font-medium">
                          {item.namaBarang}
                        </td>
                        <td className="border-r border-black text-center p-1">
                          {item.qty}
                        </td>
                        <td className="border-r border-black text-center p-1">
                          {formatRupiah(item.hargaSatuan, false)}
                        </td>
                        <td className="border-r border-black text-center p-1 font-medium">
                          {formatRupiah(rowTotal, false)}
                        </td>
                        <td className="border-r border-black text-left px-2 p-1">
                          {item.keperluan}
                        </td>
                        <td className="p-1 text-left px-2">
                          {item.keterangan || ''}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Empty buffer row directly connecting items and signatures */}
                  <tr className="border-b border-black h-5">
                    <td className="border-r border-black">&nbsp;</td>
                    <td className="border-r border-black">&nbsp;</td>
                    <td className="border-r border-black">&nbsp;</td>
                    <td className="border-r border-black">&nbsp;</td>
                    <td className="border-r border-black">&nbsp;</td>
                    <td className="border-r border-black">&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>

                  {/* Unified Signatures Header Row */}
                  <tr className="border-b border-black font-bold text-[9.5px] bg-slate-50/30">
                    <td colSpan={2} className="border-r border-black p-1.5 text-left px-2.5">
                      Diajukan :
                    </td>
                    <td colSpan={3} className="border-r border-black p-1.5 text-left px-2.5">
                      Direview Oleh :
                    </td>
                    <td colSpan={2} className="p-1.5 text-left px-2.5">
                      Disetujui Oleh :
                    </td>
                  </tr>

                  {/* Unified Signatures Body Row (TTD & Names) */}
                  <tr className="border-b border-black">
                    {/* 1. Diajukan (Pemesan) - Spans colSpan 2 (No + Jenis Barang) */}
                    <td colSpan={2} className="border-r border-black p-2 align-bottom text-center">
                      <div className="h-16 flex items-center justify-center mb-1">
                        {data.diajukanSign ? (
                          <img
                            src={data.diajukanSign}
                            alt="Signature Diajukan"
                            className="max-h-14 max-w-[130px] object-contain"
                          />
                        ) : (
                          <div className="h-12" />
                        )}
                      </div>
                      <div className="font-semibold text-black underline underline-offset-4 pb-0.5 min-h-[20px]">
                        {data.diajukanNama || 'Galih Wicaksono'}
                      </div>
                    </td>

                    {/* 2. Direview Oleh - Spans colSpan 3 (Qty + Satuan + Total) */}
                    <td colSpan={3} className="border-r border-black p-2 align-bottom text-center">
                      <div className="h-16 flex items-center justify-center mb-1">
                        {data.direviewSign ? (
                          <img
                            src={data.direviewSign}
                            alt="Signature Direview"
                            className="max-h-14 max-w-[130px] object-contain"
                          />
                        ) : (
                          <div className="h-12" />
                        )}
                      </div>
                      <div className="font-semibold text-black underline underline-offset-4 pb-0.5 min-h-[20px]">
                        {data.direviewNama || 'Enjay Tarigan'}
                      </div>
                    </td>

                    {/* 3. Disetujui Oleh (Direktur) - Spans colSpan 2 (Keperluan + Keterangan) */}
                    <td colSpan={2} className="p-2 align-bottom text-center">
                      <div className="h-16 flex items-center justify-center mb-1">
                        {data.disetujuiSign ? (
                          <img
                            src={data.disetujuiSign}
                            alt="Signature Disetujui"
                            className="max-h-14 max-w-[130px] object-contain"
                          />
                        ) : (
                          <div className="h-12" />
                        )}
                      </div>
                      <div className="font-semibold text-black underline underline-offset-4 pb-0.5 min-h-[20px]">
                        {data.disetujuiNama || ''}
                      </div>
                    </td>
                  </tr>

                  {/* Unified Signatures Bottom Roles Row */}
                  <tr className="text-[9.5px] text-center font-normal border-t border-black bg-slate-50/20">
                    <td colSpan={2} className="border-r border-black py-1 px-2" style={{ borderRight: '1px solid black' }}>
                      {data.diajukanRole || 'Pemesan'}
                    </td>
                    <td colSpan={3} className="border-r border-black py-1 px-2" style={{ borderRight: '1px solid black' }}>
                      {data.direviewRole || ''}
                    </td>
                    <td colSpan={2} className="py-1 px-2">
                      {data.disetujuiRole || 'Direktur'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
