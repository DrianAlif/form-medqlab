import React, { useState, Component, useEffect } from 'react';
import { Header } from './components/Header';
import { KosanForm, getNormalizedParentCategories } from './forms/KosanForm';
import { MakanForm } from './forms/MakanForm';
import { LemburForm } from './forms/LemburForm';
import { AkomodasiForm } from './forms/AkomodasiForm';
import { KosanPreview } from './templates/KosanPreview';
import { MakanPreview } from './templates/MakanPreview';
import { LemburPreview } from './templates/LemburPreview';
import { AkomodasiPreview } from './templates/AkomodasiPreview';
import { SignatureModal } from './components/SignatureModal';
import { HistoryModal } from './components/HistoryModal';
import {
  initialKosanData,
  initialMakanData,
  initialLemburData,
  initialAkomodasiData
} from './utils/sampleData';
import { exportToPdf } from './utils/pdfExport';
import { saveDocument } from './api/client';
import { CheckCircle2, AlertCircle, RefreshCw, ZoomIn, ZoomOut, RotateCcw, Eye, Edit3, Download, Save } from 'lucide-react';

// Error Boundary to prevent any blank screen crash
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl text-center space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-800">Terjadi Kesalahan Tampilan</h2>
            <p className="text-xs text-slate-500">
              {this.state.error?.message || 'Aplikasi mengalami kendala rendering.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <RefreshCw className="w-4 h-4" /> Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const [activeTab, setActiveTab] = useState('kosan'); // 'kosan', 'makan', 'lembur', 'akomodasi'
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'preview' (For mobile/tablet < lg)
  
  const [kosanData, setKosanData] = useState(initialKosanData);
  const [makanData, setMakanData] = useState(initialMakanData);
  const [lemburData, setLemburData] = useState(initialLemburData);
  const [akomodasiData, setAkomodasiData] = useState(initialAkomodasiData);

  // Responsive default Zoom Level
  const [zoomLevel, setZoomLevel] = useState(0.85);

  useEffect(() => {
    // Detect mobile viewport width and set appropriate initial zoom
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 640;
      const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;
      if (isMobile) {
        setZoomLevel(activeTab === 'lembur' || activeTab === 'akomodasi' ? 0.35 : 0.45);
      } else if (isTablet) {
        setZoomLevel(activeTab === 'lembur' || activeTab === 'akomodasi' ? 0.65 : 0.75);
      } else {
        setZoomLevel(activeTab === 'lembur' || activeTab === 'akomodasi' ? 0.85 : 0.95);
      }
    }
  }, [activeTab, viewMode]);

  // Modal States
  const [sigModal, setSigModal] = useState({
    isOpen: false,
    targetField: '',
    title: ''
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Zoom Controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(1.4, Math.round((prev + 0.1) * 10) / 10));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(0.3, Math.round((prev - 0.1) * 10) / 10));
  const handleResetZoom = () => setZoomLevel(activeTab === 'lembur' || activeTab === 'akomodasi' ? 0.85 : 0.95);
  const handleFitPage = () => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 640;
      setZoomLevel(isMobile ? (activeTab === 'lembur' || activeTab === 'akomodasi' ? 0.35 : 0.45) : (activeTab === 'lembur' || activeTab === 'akomodasi' ? 0.75 : 0.85));
    }
  };

  // Open Signature Modal
  const handleOpenSignature = (targetField, title = '') => {
    setSigModal({
      isOpen: true,
      targetField,
      title
    });
  };

  // Save Signature callback
  const handleSaveSignature = (dataUrl) => {
    const { targetField } = sigModal;
    if (!targetField) return;

    if (activeTab === 'kosan') {
      setKosanData(prev => ({ ...prev, [targetField]: dataUrl }));
    } else if (activeTab === 'makan') {
      if (targetField.startsWith('makan_item_')) {
        const itemIdx = parseInt(targetField.replace('makan_item_', ''), 10);
        const newItems = [...(makanData.items || [])];
        if (newItems[itemIdx]) {
          newItems[itemIdx] = { ...newItems[itemIdx], ttd: dataUrl };
          setMakanData(prev => ({ ...prev, items: newItems }));
        }
      } else {
        setMakanData(prev => ({ ...prev, [targetField]: dataUrl }));
      }
    } else if (activeTab === 'lembur') {
      setLemburData(prev => ({ ...prev, [targetField]: dataUrl }));
    } else if (activeTab === 'akomodasi') {
      setAkomodasiData(prev => ({ ...prev, [targetField]: dataUrl }));
    }
  };

  // Reset to Sample Template Data
  const handleResetSample = () => {
    if (window.confirm('Muat ulang data contoh template untuk kategori ini?')) {
      if (activeTab === 'kosan') setKosanData(initialKosanData);
      if (activeTab === 'makan') setMakanData(initialMakanData);
      if (activeTab === 'lembur') setLemburData(initialLemburData);
      if (activeTab === 'akomodasi') setAkomodasiData(initialAkomodasiData);
      showToast('Data contoh template berhasil dimuat!');
    }
  };

  // Save Draft to Cloudflare D1 / Storage
  const handleSaveDraft = async () => {
    let currentData = kosanData;
    let title = 'Pengajuan Uang Kosan';
    let total = 0;

    if (activeTab === 'kosan') {
      currentData = kosanData;
      title = `Kosan - ${kosanData.rumahSakit || 'RSCM'} (${kosanData.periode || 'Periode'})`;
      const pCats = getNormalizedParentCategories(kosanData);
      total = pCats.reduce((accP, p) => {
        const pTot = (p.subCategories || []).reduce((accS, s) => {
          return accS + (s.items || []).reduce((accI, it) => accI + ((Number(it.qty) || 0) * (Number(it.hargaSatuan) || 0)), 0);
        }, 0);
        return accP + pTot;
      }, 0);
    } else if (activeTab === 'makan') {
      currentData = makanData;
      title = `Uang Makan - ${makanData.dibayarkanKepada || 'Tim'} (${makanData.periode || ''})`;
      total = (makanData.items || []).reduce((a, b) => a + ((Number(b.qty) || 0) * (Number(b.hargaSatuan) || 0)), 0);
    } else if (activeTab === 'lembur') {
      currentData = lemburData;
      title = `Kompensasi Kerja - ${lemburData.nama || ''} (${lemburData.bulan || ''})`;
      total = (lemburData.items || []).reduce((a, b) => a + (Number(b.jamCount) || 0), 0);
    } else if (activeTab === 'akomodasi') {
      currentData = akomodasiData;
      title = `Laporan Akomodasi - ${akomodasiData.nama || 'Pegawai'} (${akomodasiData.customer || 'Project'})`;
      total = (akomodasiData.items || []).reduce((acc, it) => {
        return acc + (Number(it.bensin) || 0) +
          (Number(it.tolParkir) || 0) +
          (Number(it.pjs) || 0) +
          (Number(it.hotel) || 0) +
          (Number(it.entertaint) || 0) +
          (Number(it.tiket) || 0) +
          (Number(it.fotocopy) || 0) +
          (Number(it.lainLain) || 0);
      }, 0);
    }

    const res = await saveDocument(activeTab, title, currentData, total);
    if (res.success) {
      showToast('Draft berhasil disimpan ke database!');
    } else {
      showToast('Gagal menyimpan draft', 'error');
    }
  };

  // Load Past Document from History safely
  const handleLoadDocument = (doc) => {
    if (!doc) return;
    const targetType = doc.type || 'kosan';
    setActiveTab(targetType);

    let parsedData = doc.data;
    if (typeof parsedData === 'string') {
      try {
        parsedData = JSON.parse(parsedData);
      } catch {
        parsedData = {};
      }
    }

    if (!parsedData || typeof parsedData !== 'object') {
      parsedData = {};
    }

    if (targetType === 'kosan') {
      setKosanData({ ...initialKosanData, ...parsedData });
    } else if (targetType === 'makan') {
      setMakanData({ ...initialMakanData, ...parsedData });
    } else if (targetType === 'lembur') {
      setLemburData({ ...initialLemburData, ...parsedData });
    } else if (targetType === 'akomodasi') {
      setAkomodasiData({ ...initialAkomodasiData, ...parsedData });
    }

    showToast(`Dokumen "${doc.title || 'Draft'}" berhasil dimuat!`);
  };

  // Export PDF
  const handleDownloadPdf = async () => {
    setIsExporting(true);
    let filename = 'dokumen.pdf';
    let orientation = 'portrait';

    if (activeTab === 'kosan') {
      filename = `Permintaan_Uang_Kosan_${kosanData.tanggal || '2026'}.pdf`;
      orientation = 'portrait';
    } else if (activeTab === 'makan') {
      filename = `Permintaan_Uang_Makan_${makanData.tanggal || '2026'}.pdf`;
      orientation = 'portrait';
    } else if (activeTab === 'lembur') {
      filename = `Kompensasi_Kerja_Lembur_${lemburData.nama || 'Staff'}.pdf`;
      orientation = 'landscape';
    } else if (activeTab === 'akomodasi') {
      filename = `Laporan_Akomodasi_${akomodasiData.nama || 'Pegawai'}_${akomodasiData.customer || 'Project'}.pdf`;
      orientation = 'landscape';
    }

    try {
      await exportToPdf('pdf-content', filename, orientation);
      showToast('PDF berhasil di-download!');
    } catch (e) {
      console.error(e);
      showToast('Gagal export PDF, mencoba cetak langsung...', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Native Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-100 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg bg-slate-900 text-white text-xs font-medium animate-bounce">
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header (Fixed Height, non-scrollable) */}
      <div className="shrink-0">
        <Header
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
          }}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onResetSample={handleResetSample}
          onSaveDraft={handleSaveDraft}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onDownloadPdf={handleDownloadPdf}
          onPrint={handlePrint}
          isExporting={isExporting}
        />
      </div>

      {/* Main Workspace: Independent Dual-Pane Scroll (Desktop) & Responsive Switcher (Mobile/Tablet) */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 relative">
        {/* Left Column: Form Editor (Visible on Desktop OR when viewMode === 'form' on mobile) */}
        <section
          className={`w-full lg:w-[46%] xl:w-[44%] 2xl:w-[42%] h-full overflow-y-auto bg-slate-50/70 border-r border-slate-200 p-3 sm:p-5 no-print shrink-0 ${
            viewMode === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="max-w-2xl mx-auto space-y-4 pb-24 lg:pb-16">
            <div className="flex items-center justify-between sticky top-0 bg-slate-50/95 backdrop-blur-xs py-2 z-10 border-b border-slate-200 mb-2">
              <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                Editor Data Form
              </h2>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                Auto-sync ke Preview & D1
              </span>
            </div>

            {activeTab === 'kosan' && (
              <KosanForm
                data={kosanData}
                onChange={setKosanData}
                onOpenSignatureModal={handleOpenSignature}
              />
            )}

            {activeTab === 'makan' && (
              <MakanForm
                data={makanData}
                onChange={setMakanData}
                onOpenSignatureModal={handleOpenSignature}
              />
            )}

            {activeTab === 'lembur' && (
              <LemburForm
                data={lemburData}
                onChange={setLemburData}
                onOpenSignatureModal={handleOpenSignature}
              />
            )}

            {activeTab === 'akomodasi' && (
              <AkomodasiForm
                data={akomodasiData}
                onChange={setAkomodasiData}
                onOpenSignatureModal={handleOpenSignature}
              />
            )}
          </div>
        </section>

        {/* Right Column: Live PDF Document Preview (Visible on Desktop OR when viewMode === 'preview' on mobile) */}
        <section
          className={`flex-1 h-full overflow-y-auto bg-slate-200/80 flex flex-col relative min-h-0 ${
            viewMode === 'form' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Sticky Preview Header / Toolbar */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-4 py-2 flex items-center justify-between no-print shadow-xs shrink-0 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span className="text-xs font-bold text-slate-800 truncate">
                Live PDF Preview
              </span>
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600 border border-slate-200 truncate">
                {activeTab === 'lembur'
                  ? 'Landscape (1 Halaman)'
                  : activeTab === 'akomodasi'
                  ? 'Landscape (Multi-Halaman)'
                  : 'Portrait (2 Halaman)'}
              </span>
            </div>

            {/* Zoom & Viewport Controls */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 sm:p-1 rounded-lg border border-slate-200 text-xs shrink-0">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-200 transition"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 font-bold text-[10px] sm:text-[11px] text-slate-700 min-w-[36px] sm:min-w-[42px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-200 transition"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleFitPage}
                className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition border-l border-slate-200"
                title="Fit to screen"
              >
                Fit
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition"
                title="Reset zoom"
              >
                100%
              </button>
            </div>
          </div>

          {/* Document Preview Canvas with Smooth Zoom Scaling */}
          <div className="flex-1 p-2 sm:p-6 flex justify-center items-start overflow-x-auto min-h-0">
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out'
              }}
              className="pb-28 lg:pb-20"
            >
              {activeTab === 'kosan' && <KosanPreview data={kosanData} />}
              {activeTab === 'makan' && <MakanPreview data={makanData} />}
              {activeTab === 'lembur' && <LemburPreview data={lemburData} />}
              {activeTab === 'akomodasi' && <AkomodasiPreview data={akomodasiData} />}
            </div>
          </div>
        </section>

        {/* Mobile / Tablet Floating Action Bar (Sticky Bottom on < lg) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-lg gap-2 no-print">
          {viewMode === 'form' ? (
            <>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                <Eye className="w-4 h-4" />
                <span>Lihat Preview PDF</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExporting}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Proses...' : 'Download'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setViewMode('form')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                <Edit3 className="w-4 h-4" />
                <span>Kembali ke Edit Form</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExporting}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Proses...' : 'Download PDF'}</span>
              </button>
            </>
          )}
        </div>
      </main>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={sigModal.isOpen}
        onClose={() => setSigModal(prev => ({ ...prev, isOpen: false }))}
        onSave={handleSaveSignature}
        targetTitle={sigModal.title}
      />

      {/* D1 History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLoadDoc={handleLoadDocument}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
