import React, { useState, Component } from 'react';
import { Header } from './components/Header';
import { KosanForm, getNormalizedParentCategories } from './forms/KosanForm';
import { MakanForm } from './forms/MakanForm';
import { LemburForm } from './forms/LemburForm';
import { KosanPreview } from './templates/KosanPreview';
import { MakanPreview } from './templates/MakanPreview';
import { LemburPreview } from './templates/LemburPreview';
import { SignatureModal } from './components/SignatureModal';
import { HistoryModal } from './components/HistoryModal';
import {
  initialKosanData,
  initialMakanData,
  initialLemburData
} from './utils/sampleData';
import { exportToPdf } from './utils/pdfExport';
import { saveDocument } from './api/client';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('kosan'); // 'kosan', 'makan', 'lembur'
  
  const [kosanData, setKosanData] = useState(initialKosanData);
  const [makanData, setMakanData] = useState(initialMakanData);
  const [lemburData, setLemburData] = useState(initialLemburData);

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
    }
  };

  // Reset to Sample Template Data
  const handleResetSample = () => {
    if (window.confirm('Muat ulang data contoh template untuk kategori ini?')) {
      if (activeTab === 'kosan') setKosanData(initialKosanData);
      if (activeTab === 'makan') setMakanData(initialMakanData);
      if (activeTab === 'lembur') setLemburData(initialLemburData);
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
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans">
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

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onResetSample={handleResetSample}
        onSaveDraft={handleSaveDraft}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onDownloadPdf={handleDownloadPdf}
        onPrint={handlePrint}
        isExporting={isExporting}
      />

      {/* Main Workspace: Split Screen Editor & Live Preview */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Editor (5 cols on xl) */}
        <section className="xl:col-span-5 no-print">
          <div className="sticky top-28 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Editor Data Form
              </h2>
              <span className="text-[11px] text-slate-500">
                Perubahan tersinkron otomatis secara instan
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
          </div>
        </section>

        {/* Right Column: Live PDF Document Preview (7 cols on xl) */}
        <section className="xl:col-span-7 flex flex-col items-center">
          <div className="w-full mb-3 flex items-center justify-between no-print px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-700">
                Live PDF Preview (Ukuran Asli Sesuai Template)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {activeTab === 'lembur' ? 'Format Landscape A4' : 'Format 2 Halaman (Voucher + Rincian)'}
            </span>
          </div>

          {/* Render Active Template Preview */}
          <div className="w-full flex justify-center overflow-x-auto pb-12">
            {activeTab === 'kosan' && <KosanPreview data={kosanData} />}
            {activeTab === 'makan' && <MakanPreview data={makanData} />}
            {activeTab === 'lembur' && <LemburPreview data={lemburData} />}
          </div>
        </section>
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
