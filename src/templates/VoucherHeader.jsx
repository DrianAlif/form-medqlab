import React from 'react';
import { CompanyHeader } from '../components/Logo';
import { formatRupiah } from '../utils/currency';
import { terbilangRupiah } from '../utils/terbilang';
import { formatIndonesianDate } from '../utils/dateUtils';

export function PermintaanUangMukaVoucher({ data, totalAmount }) {
  const amount = totalAmount !== undefined ? totalAmount : (data.jumlah || 0);
  const formattedAmount = formatRupiah(amount, false);
  const terbilangText = terbilangRupiah(amount, true);
  const formattedDate = formatIndonesianDate(data.tanggal);

  // Split keterangan into lines
  const keteranganLines = (data.keterangan || '').split('\n');

  return (
    <div className="w-full bg-white text-black font-sans text-[12px] leading-normal p-6 border-2 border-black">
      {/* 1. Letterhead */}
      <div className="border-b-2 border-black pb-3">
        <CompanyHeader />
      </div>

      {/* 2. Title & Metadata Bar */}
      <div className="flex items-center justify-between py-2 border-b-2 border-black">
        <div className="font-bold text-[14px] tracking-wide">
          PERMINTAAN UANG MUKA
        </div>
        <div className="text-[12px] space-y-1 text-right min-w-[220px]">
          <div className="flex justify-between">
            <span className="font-medium">Nomor</span>
            <span className="w-36 text-left">: {data.nomor || ''}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Tanggal</span>
            <span className="w-36 text-left">: {formattedDate}</span>
          </div>
        </div>
      </div>

      {/* 3. Main Form Content Area */}
      <div className="border-b-2 border-black py-4 space-y-3">
        {/* Dibayarkan Kepada */}
        <div className="flex items-baseline">
          <div className="w-40 font-medium flex justify-between pr-2">
            <span>Dibayarkan Kepada</span>
            <span>:</span>
          </div>
          <div className="flex-1 border-b border-dotted border-black pb-0.5 font-semibold text-[13px] min-h-[22px]">
            {data.dibayarkanKepada || ''}
          </div>
        </div>

        {/* Jumlah */}
        <div className="flex items-baseline">
          <div className="w-40 font-medium flex justify-between pr-2">
            <span>Jumlah</span>
            <span>:</span>
          </div>
          <div className="flex-1 border-b border-dotted border-black pb-0.5 flex justify-between items-baseline min-h-[22px]">
            <span className="font-bold text-[13px]">Rp</span>
            <span className="font-bold text-[14px] tracking-wide">{formattedAmount !== '-' ? formattedAmount : ''}</span>
          </div>
        </div>

        {/* Dengan Huruf (Highlighted strip) */}
        <div className="flex items-center">
          <div className="w-40 font-medium flex justify-between pr-2">
            <span>Dengan Huruf</span>
            <span>:</span>
          </div>
          <div className="flex-1 bg-slate-300 bg-opacity-80 px-2 py-1 border border-slate-400 font-medium text-[12px] italic tracking-wide">
            {terbilangText}
          </div>
        </div>

        {/* Keterangan */}
        <div className="flex items-start pt-1">
          <div className="w-40 font-medium flex justify-between pr-2 pt-0.5">
            <span>Keterangan</span>
            <span>:</span>
          </div>
          <div className="flex-1 space-y-1">
            <div className="border-b border-dotted border-black pb-0.5 min-h-[20px] font-medium">
              {keteranganLines[0] || ''}
            </div>
            <div className="border-b border-dotted border-black pb-0.5 min-h-[20px] font-medium">
              {keteranganLines[1] || ''}
            </div>
            <div className="border-b border-dotted border-black pb-0.5 min-h-[20px] font-medium">
              {keteranganLines[2] || ''}
            </div>
            <div className="border-b border-dotted border-black pb-0.5 min-h-[20px]">
              {keteranganLines[3] || ''}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Signature Block (3 Columns) */}
      <div className="grid grid-cols-3 pt-3">
        {/* Column 1: Pemohon */}
        <div className="flex flex-col items-center justify-between text-center min-h-[140px] px-2">
          <div className="text-[12px] font-medium">Dibuat Oleh :</div>
          <div className="h-16 flex items-center justify-center my-1 w-full">
            {data.pemohonSign ? (
              <img
                src={data.pemohonSign}
                alt="Signature Pemohon"
                className="max-h-16 max-w-[140px] object-contain"
              />
            ) : (
              <div className="h-12 w-full"></div>
            )}
          </div>
          <div className="w-full">
            <div className="font-semibold text-[12px]">{data.pemohonNama || 'Alif Drian'}</div>
            <div className="border-t border-dotted border-black mt-1 pt-0.5 text-[11px] italic">
              {data.pemohonRole || 'Pemohon'}
            </div>
          </div>
        </div>

        {/* Column 2: HOD */}
        <div className="flex flex-col items-center justify-between text-center min-h-[140px] px-2">
          <div className="text-[12px] font-medium">Disetujui Oleh :</div>
          <div className="h-16 flex items-center justify-center my-1 w-full">
            {data.hodSign ? (
              <img
                src={data.hodSign}
                alt="Signature HOD"
                className="max-h-16 max-w-[140px] object-contain"
              />
            ) : (
              <div className="h-12 w-full"></div>
            )}
          </div>
          <div className="w-full">
            <div className="font-semibold text-[12px]">{data.hodNama || 'Ferry Lukito'}</div>
            <div className="border-t border-dotted border-black mt-1 pt-0.5 text-[11px] italic">
              {data.hodRole || 'HOD'}
            </div>
          </div>
        </div>

        {/* Column 3: Direktur */}
        <div className="flex flex-col items-center justify-between text-center min-h-[140px] px-2">
          <div className="text-[12px] font-medium">Disetujui Oleh :</div>
          <div className="h-16 flex items-center justify-center my-1 w-full">
            {data.direkturSign ? (
              <img
                src={data.direkturSign}
                alt="Signature Direktur"
                className="max-h-16 max-w-[140px] object-contain"
              />
            ) : (
              <div className="h-12 w-full"></div>
            )}
          </div>
          <div className="w-full">
            <div className="font-semibold text-[12px]">{data.direkturNama || ''}</div>
            <div className="border-t border-dotted border-black mt-1 pt-0.5 text-[11px] italic">
              {data.direkturRole || 'Direktur'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
