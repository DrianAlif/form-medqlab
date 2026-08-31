import React from 'react';
import { Logo } from './Logo';
import { Download, Printer, Save, FolderOpen, RotateCcw, Home, Utensils, CalendarDays, Receipt, Cloud } from 'lucide-react';

export function Header({
  activeTab,
  onTabChange,
  onResetSample,
  onSaveDraft,
  onOpenHistory,
  onDownloadPdf,
  onPrint,
  isExporting
}) {
  const tabs = [
    { id: 'kosan', label: '1. Uang Kosan', icon: Home, badge: '2 Halaman' },
    { id: 'makan', label: '2. Uang Makan', icon: Utensils, badge: '2 Halaman' },
    { id: 'lembur', label: '3. Uang Lembur', icon: CalendarDays, badge: 'Landscape' },
    { id: 'akomodasi', label: '4. Laporan Akomodasi', icon: Receipt, badge: 'Landscape / Multi' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm no-print">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        {/* Top Tier: Logo, Title & Global Actions */}
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Logo className="h-10" showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-slate-900">
                  APPLIMETIS FORM GENERATOR
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded-full flex items-center gap-1">
                  <Cloud className="w-3 h-3" /> Cloudflare D1 Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Automasi pembuatan PDF resmi PT. Applimetis Parama Solusi
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onResetSample}
              title="Isi dengan contoh data template"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Contoh Template</span>
            </button>

            <button
              type="button"
              onClick={onOpenHistory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Riwayat D1</span>
            </button>

            <button
              type="button"
              onClick={onSaveDraft}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Draft</span>
            </button>

            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>

            <button
              type="button"
              onClick={onDownloadPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Membuat PDF...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>

        {/* Bottom Tier: Category Tabs */}
        <div className="flex items-center gap-2 py-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
