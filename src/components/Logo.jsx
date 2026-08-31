import React from 'react';
import applimetisLogoImg from '../assets/applimetis-logo.png';

export function Logo({ className = "h-12", showText = true }) {
  return (
    <div className="flex items-center select-none">
      <img
        src={applimetisLogoImg}
        alt="APPLIMETIS"
        className={`object-contain max-h-full ${className}`}
      />
    </div>
  );
}

export function CompanyHeader() {
  return (
    <div className="flex items-center gap-5 pb-1">
      <img
        src={applimetisLogoImg}
        alt="APPLIMETIS"
        className="h-14 w-auto object-contain flex-shrink-0"
      />
      <div className="border-l-2 border-black pl-4 py-0.5">
        <h1 className="text-[13px] font-bold tracking-tight text-black leading-tight">
          PT. APPLIMETIS PARAMA SOLUSI
        </h1>
        <p className="text-[11px] text-black leading-tight mt-0.5">
          JL. Rose Garden 1 No.7 (RRG 1/7) Jakasetia
        </p>
        <p className="text-[11px] text-black leading-tight">
          Bekasi Selatan 17147
        </p>
      </div>
    </div>
  );
}
