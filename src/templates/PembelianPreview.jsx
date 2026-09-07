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
            <div className="text-center my-5">
              <h1 className="text-[13px] font-extrabold uppercase tracking-wide underline underline-offset-4 text-black inline-block">
                FORM PERMINTAAN PEMBELIAN BARANG
              </h1>
            </div>

            {/* Main Items Table */}
            <div className="border border-black overflow-hidden mb-5">
              <table className="w-full border-collapse text-[9.5px]">
                <thead>
                  <tr className="border-b border-black text-center font-bold text-[9.5px]">
                    <th rowSpan={2} className="border-r border-black p-1.5 w-10 align-middle">
                      No
                    </th>
                    <th rowSpan={2} className="border-r border-black p-1.5 align-middle text-center">
                      Jenis/ Nama Barang
                    </th>
                    <th rowSpan={2} className="border-r border-black p-1.5 w-12 align-middle">
                      Qty
                    </th>
                    <th colSpan={2} className="border-r border-b border-black p-1 text-center font-bold">
                      Harga
                    </th>
                    <th rowSpan={2} className="border-r border-black p-1.5 w-36 align-middle text-center">
                      keperluan
                    </th>
                    <th rowSpan={2} className="p-1.5 w-44 align-middle text-center">
                      Keterangan
                    </th>
                  </tr>
                  <tr className="border-b border-black text-center font-bold text-[9px]">
                    <th className="border-r border-black p-1 w-24">
                      Satuan
                    </th>
                    <th className="border-r border-black p-1 w-24">
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

                  {/* Empty filler rows if table is small */}
                  {items.length === 0 && (
                    <tr className="border-b border-black h-8">
                      <td colSpan={7} className="text-center text-slate-400 italic">
                        Belum ada item barang yang dimasukkan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 3-Column Signatures Block (Diajukan, Direview, Disetujui) */}
            <div className="w-full max-w-[620px] border border-black overflow-hidden text-[9.5px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-black font-bold">
                    <th className="border-r border-black p-1 text-left px-2 w-1/3">
                      Diajukan :
                    </th>
                    <th className="border-r border-black p-1 text-left px-2 w-1/3">
                      Direview Oleh :
                    </th>
                    <th className="p-1 text-left px-2 w-1/3">
                      Disetujui Oleh :
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {/* 1. Diajukan (Pemesan) */}
                    <td className="border-r border-black p-2 align-bottom text-center">
                      <div className="h-14 flex items-center justify-center mb-1">
                        {data.diajukanSign ? (
                          <img
                            src={data.diajukanSign}
                            alt="Signature Diajukan"
                            className="max-h-12 max-w-[120px] object-contain"
                          />
                        ) : (
                          <div className="h-10" />
                        )}
                      </div>
                      <div className="font-semibold text-black underline underline-offset-2">
                        {data.diajukanNama || 'Galih Wicaksono'}
                      </div>
                    </td>

                    {/* 2. Direview Oleh */}
                    <td className="border-r border-black p-2 align-bottom text-center">
                      <div className="h-14 flex items-center justify-center mb-1">
                        {data.direviewSign ? (
                          <img
                            src={data.direviewSign}
                            alt="Signature Direview"
                            className="max-h-12 max-w-[120px] object-contain"
                          />
                        ) : (
                          <div className="h-10" />
                        )}
                      </div>
                      <div className="font-semibold text-black underline underline-offset-2">
                        {data.direviewNama || 'Enjay Tarigan'}
                      </div>
                    </td>

                    {/* 3. Disetujui Oleh (Direktur) */}
                    <td className="p-2 align-bottom text-center">
                      <div className="h-14 flex items-center justify-center mb-1">
                        {data.disetujuiSign ? (
                          <img
                            src={data.disetujuiSign}
                            alt="Signature Disetujui"
                            className="max-h-12 max-w-[120px] object-contain"
                          />
                        ) : (
                          <div className="h-10" />
                        )}
                      </div>
                      <div className="font-semibold text-black underline underline-offset-2 min-h-[16px]">
                        {data.disetujuiNama || ''}
                      </div>
                    </td>
                  </tr>

                  {/* Roles / Bottom Label Row */}
                  <tr className="border-t border-black text-[9px] text-center font-normal">
                    <td className="border-r border-black py-0.5">
                      {data.diajukanRole || 'Pemesan'}
                    </td>
                    <td className="border-r border-black py-0.5">
                      {data.direviewRole || ''}
                    </td>
                    <td className="py-0.5">
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
