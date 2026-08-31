import React from 'react';
import { Logo } from './Logo';
import { Download, Printer, Save, FolderOpen, RotateCcw, Home, Utensils, CalendarDays, Receipt, Cloud, Edit3, Eye } from 'lucide-react';

export function Header({
  activeTab,
  onTabChange,
  viewMode,
  onViewModeChange,
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
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-[1700px] mx-auto px-3 sm:px-5">
        {/* Top Tier: Logo, Title & Global Actions */}
        <div className="flex items-center justify-between py-2.5 border-b border-slate-100 gap-2">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Logo className="h-8 sm:h-9 shrink-0" showText={false} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-xs sm:text-sm tracking-tight text-slate-900 truncate">
                  APPLIMETIS FORM GENERATOR
                </span>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[9px] font-bold bg-blue-100 text-blue-800 rounded-full items-center gap-1">
                  <Cloud className="w-2.5 h-2.5" /> D1 Ready
                </span>
              </div>
              <p className="hidden md:block text-[10px] text-slate-500 truncate">
                Automasi pembuatan PDF resmi PT. Applimetis Parama Solusi
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Tablet/Mobile View Mode Switcher (Visible on < lg) */}
            <div className="lg:hidden flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 mr-1">
              <button
                type="button"
                onClick={() => onViewModeChange('form')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition ${
                  viewMode === 'form'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Edit Form Data"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Form</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('preview')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition ${
                  viewMode === 'preview'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Lihat Live Preview PDF"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onResetSample}
              title="Isi dengan contoh data template"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Contoh</span>
            </button>

            <button
              type="button"
              onClick={onOpenHistory}
              title="Buka riwayat draft database Cloudflare D1"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Riwayat D1</span>
            </button>

            <button
              type="button"
              onClick={onSaveDraft}
              title="Simpan draft ke database"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Simpan</span>
            </button>

            <button
              type="button"
              onClick={onPrint}
              title="Cetak langsung ke printer"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>

            <button
              type="button"
              onClick={onDownloadPdf}
              disabled={isExporting}
              title="Download dokumen sebagai PDF"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Proses...' : 'PDF'}</span>
            </button>
          </div>
        </div>

        {/* Bottom Tier: Category Tabs (Smooth touch scrolling on mobile) */}
        <div className="flex items-center gap-1.5 py-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">{tab.label}</span>
                <span
                  className={`hidden sm:inline text-[9px] px-1.5 py-0.2 rounded ${
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
