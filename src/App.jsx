import React, { useState, Component, useEffect } from 'react';
import { Header } from './components/Header';
import { KosanForm, getNormalizedParentCategories } from './forms/KosanForm';
import { MakanForm } from './forms/MakanForm';
import { LemburForm } from './forms/LemburForm';
import { AkomodasiForm } from './forms/AkomodasiForm';
import { PembelianForm } from './forms/PembelianForm';
import { SuratForm } from './forms/SuratForm';
import { KosanPreview } from './templates/KosanPreview';
import { MakanPreview } from './templates/MakanPreview';
import { LemburPreview } from './templates/LemburPreview';
import { AkomodasiPreview } from './templates/AkomodasiPreview';
import { PembelianPreview } from './templates/PembelianPreview';
import { SuratPreview } from './templates/SuratPreview';
import { SignatureModal } from './components/SignatureModal';
import { HistoryModal } from './components/HistoryModal';
import { PublicSigningPage } from './components/PublicSigningPage';
import { ShareSignLinkModal } from './components/ShareSignLinkModal';
import { EmployeeProvider, useHRIS } from './context/EmployeeContext';
import { canSignSlot } from './utils/signaturePermission';
import { getRecentSignTokens } from './services/publicSignService';
import {
  initialKosanData,
  initialMakanData,
  initialLemburData,
  initialAkomodasiData,
  initialPembelianData,
  initialSuratData
} from './utils/sampleData';
import { handleDownloadPDF, handlePrintDocument } from './utils/pdfExport';
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
  // Check if opened via Public Guest Signing Link (from WhatsApp or external link)
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const signToken = urlParams?.get('signToken');

  if (signToken) {
    return <PublicSigningPage token={signToken} />;
  }

  const { currentUser } = useHRIS();

  const [activeTab, setActiveTab] = useState('kosan'); // 'kosan' | 'makan' | 'lembur' | 'akomodasi' | 'pembelian' | 'surat'
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'preview' (For mobile/tablet < lg)
  
  // Track active draft document ID per category so edits can update in-place without losing signatures
  const [activeDocs, setActiveDocs] = useState({
    kosan: null,
    makan: null,
    lembur: null,
    akomodasi: null,
    pembelian: null,
    surat: null
  });
  const activeDocsRef = React.useRef(activeDocs);
  useEffect(() => {
    activeDocsRef.current = activeDocs;
  }, [activeDocs]);

  const [kosanData, setKosanData] = useState(initialKosanData);
  const [makanData, setMakanData] = useState(initialMakanData);
  const [lemburData, setLemburData] = useState(initialLemburData);
  const [akomodasiData, setAkomodasiData] = useState(initialAkomodasiData);
  const [pembelianData, setPembelianData] = useState(initialPembelianData);
  const [suratData, setSuratData] = useState(initialSuratData);

  // Responsive default Zoom Level
  const [zoomLevel, setZoomLevel] = useState(0.85);

  useEffect(() => {
    // Detect mobile viewport width and set appropriate initial zoom
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 640;
      const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;
      const isLandscape = activeTab === 'lembur' || activeTab === 'akomodasi' || activeTab === 'pembelian';
      if (isMobile) {
        setZoomLevel(isLandscape ? 0.35 : 0.45);
      } else if (isTablet) {
        setZoomLevel(isLandscape ? 0.65 : 0.75);
      } else {
        setZoomLevel(isLandscape ? 0.85 : 0.95);
      }
    }
  }, [activeTab, viewMode]);

  // Modal States
  const [sigModal, setSigModal] = useState({
    isOpen: false,
    targetField: '',
    title: ''
  });

  const [shareSignModal, setShareSignModal] = useState({
    isOpen: false,
    slotField: '',
    slotTitle: 'Tanda Tangan',
    assignedName: '',
    formCategory: '',
    docTitle: '',
    totalAmount: 0,
    docDetails: {}
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
  const handleResetZoom = () => setZoomLevel((activeTab === 'lembur' || activeTab === 'akomodasi' || activeTab === 'pembelian') ? 0.85 : 0.95);
  const handleFitPage = () => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 640;
      const isLandscape = activeTab === 'lembur' || activeTab === 'akomodasi' || activeTab === 'pembelian';
      setZoomLevel(isMobile ? (isLandscape ? 0.35 : 0.45) : (isLandscape ? 0.75 : 0.85));
    }
  };

  // Open Signature Modal with Role & Assignment Guard
  const handleOpenSignature = (targetField, title = '', slotType = 'general', assignedName = '') => {
    if (slotType && slotType !== 'general') {
      if (!canSignSlot(currentUser, assignedName, slotType)) {
        alert(`Akses Terkunci: Hanya Admin atau ${assignedName ? `"${assignedName}"` : 'pejabat yang di-assign'} yang memiliki wewenang menandatangani.`);
        return;
      }
    }
    setSigModal({
      isOpen: true,
      targetField,
      title
    });
  };

  // Helper to extract document metadata (title & total) for draft persistence
  const getDocMeta = (tab, data) => {
    let title = 'Dokumen Resmi';
    let total = 0;
    if (!data) return { title, total };

    if (tab === 'kosan') {
      title = `Kosan - ${data.rumahSakit || 'RSCM'} (${data.periode || 'Periode'})`;
      const pCats = getNormalizedParentCategories(data);
      total = pCats.reduce((accP, p) => {
        const pTot = (p.subCategories || []).reduce((accS, s) => {
          return accS + (s.items || []).reduce((accI, it) => accI + ((Number(it.qty) || 0) * (Number(it.hargaSatuan) || 0)), 0);
        }, 0);
        return accP + pTot;
      }, 0);
    } else if (tab === 'makan') {
      title = `Uang Makan - ${data.dibayarkanKepada || 'Tim'} (${data.periode || ''})`;
      total = (data.items || []).reduce((a, b) => a + ((Number(b.qty || b.porsi) || 0) * (Number(b.hargaSatuan) || 0)), 0);
    } else if (tab === 'lembur') {
      title = `Kompensasi Kerja - ${data.nama || ''} (${data.bulan || ''})`;
      total = (data.items || []).reduce((a, b) => a + (Number(b.jamCount) || 0), 0);
    } else if (tab === 'akomodasi') {
      title = `Laporan Akomodasi - ${data.nama || 'Pegawai'} (${data.customer || 'Project'})`;
      total = (data.items || []).reduce((acc, it) => {
        return acc + (Number(it.bensin) || 0) +
          (Number(it.tolParkir) || 0) +
          (Number(it.pjs) || 0) +
          (Number(it.hotel) || 0) +
          (Number(it.entertaint) || 0) +
          (Number(it.tiket) || 0) +
          (Number(it.fotocopy) || 0) +
          (Number(it.lainLain) || 0);
      }, 0);
    } else if (tab === 'pembelian') {
      title = `Pembelian Barang - ${data.nama || 'Galih'} (${data.dept || 'Developer'})`;
      total = (data.items || []).reduce((acc, it) => acc + ((Number(it.qty) || 0) * (Number(it.hargaSatuan) || 0)), 0);
    } else if (tab === 'surat') {
      title = `Surat Tugas - ${data.personelNama || 'Personel'} (${data.nomorSurat || 'SPPD'})`;
      total = 0;
    }
    return { title, total };
  };

  const getCurrentFormData = (tab) => {
    switch (tab) {
      case 'kosan': return kosanData;
      case 'makan': return makanData;
      case 'lembur': return lemburData;
      case 'akomodasi': return akomodasiData;
      case 'pembelian': return pembelianData;
      case 'surat': return suratData;
      default: return kosanData;
    }
  };

  // Immediate Auto-Save to Cloudflare D1 whenever any signature is applied or received
  const autoSaveSignature = async (targetTab, updatedData, slotLabel = '') => {
    try {
      const { title, total } = getDocMeta(targetTab, updatedData);
      const activeDoc = activeDocsRef.current[targetTab];
      const targetDocId = activeDoc?.id || null;

      const res = await saveDocument(targetTab, title, updatedData, total, targetDocId);
      if (res && res.success && res.doc) {
        setActiveDocs(prev => ({
          ...prev,
          [targetTab]: {
            id: res.doc.id,
            title: res.doc.title || title,
            created_at: res.doc.created_at,
            updated_at: res.doc.updated_at
          }
        }));
        showToast(`Tanda tangan ${slotLabel ? `"${slotLabel}" ` : ''}tersimpan otomatis ke D1!`, 'success');
      }
    } catch (err) {
      console.warn('Auto-save signature failed:', err);
    }
  };

  // Save Signature callback from Canvas Modal
  const handleSaveSignature = (dataUrl) => {
    const { targetField, title } = sigModal;
    if (!targetField) return;

    let updatedData = null;
    if (activeTab === 'kosan') {
      updatedData = { ...kosanData, [targetField]: dataUrl };
      setKosanData(updatedData);
    } else if (activeTab === 'makan') {
      if (targetField.startsWith('makan_item_')) {
        const itemIdx = parseInt(targetField.replace('makan_item_', ''), 10);
        const newItems = [...(makanData.items || [])];
        if (newItems[itemIdx]) {
          newItems[itemIdx] = { ...newItems[itemIdx], ttd: dataUrl };
          updatedData = { ...makanData, items: newItems };
          setMakanData(updatedData);
        }
      } else {
        updatedData = { ...makanData, [targetField]: dataUrl };
        setMakanData(updatedData);
      }
    } else if (activeTab === 'lembur') {
      updatedData = { ...lemburData, [targetField]: dataUrl };
      setLemburData(updatedData);
    } else if (activeTab === 'akomodasi') {
      updatedData = { ...akomodasiData, [targetField]: dataUrl };
      setAkomodasiData(updatedData);
    } else if (activeTab === 'pembelian') {
      updatedData = { ...pembelianData, [targetField]: dataUrl };
      setPembelianData(updatedData);
    } else if (activeTab === 'surat') {
      updatedData = { ...suratData, [targetField]: dataUrl };
      setSuratData(updatedData);
    }

    if (updatedData) {
      autoSaveSignature(activeTab, updatedData, title || targetField);
    }
  };

  // Open 1-Hour Guest Signing Link Modal (WhatsApp Sharing)
  const handleOpenShareSign = (slotField, slotTitle, assignedName) => {
    let cat = 'Dokumen Resmi';
    let title = 'Pengajuan Dokumen';
    let total = 0;
    let details = {};

    if (activeTab === 'kosan') {
      cat = 'Uang Kosan';
      title = `Pengajuan Kosan - ${kosanData.rumahSakit || 'RSCM'}`;
      const pCats = getNormalizedParentCategories(kosanData);
      total = pCats.reduce((accP, p) => accP + (p.subCategories || []).reduce((accS, s) => accS + (s.items || []).reduce((accI, it) => accI + ((Number(it.qty) || 0) * (Number(it.hargaSatuan) || 0)), 0), 0), 0);
      details = kosanData;
    } else if (activeTab === 'makan') {
      cat = 'Uang Makan';
      title = `Pengajuan Makan - ${makanData.dibayarkanKepada || 'Tim'}`;
      total = (makanData.items || []).reduce((acc, it) => acc + ((Number(it.qty || it.porsi) || 0) * (Number(it.hargaSatuan) || 0)), 0);
      details = makanData;
    } else if (activeTab === 'lembur') {
      cat = 'Uang Lembur';
      title = `Lembur - ${lemburData.nama || 'Pegawai'}`;
      total = (lemburData.items || []).reduce((acc, it) => acc + (Number(it.jamCount) || 0), 0);
      details = lemburData;
    } else if (activeTab === 'akomodasi') {
      cat = 'Laporan Akomodasi';
      title = `Akomodasi - ${akomodasiData.nama || 'Pegawai'} (${akomodasiData.customer || 'Project'})`;
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
      details = akomodasiData;
    } else if (activeTab === 'pembelian') {
      cat = 'Pembelian Barang';
      title = `Pembelian Barang - ${pembelianData.nama || 'Pemesan'}`;
      total = (pembelianData.items || []).reduce((acc, it) => acc + ((Number(it.qty) || 0) * (Number(it.hargaSatuan) || 0)), 0);
      details = pembelianData;
    } else if (activeTab === 'surat') {
      cat = 'Surat Tugas & SPPD';
      title = `Surat Tugas - ${suratData.personelNama || 'Personel'}`;
      details = suratData;
    }

    setShareSignModal({
      isOpen: true,
      slotField,
      slotTitle: slotTitle || 'Tanda Tangan',
      assignedName: assignedName || '',
      formCategory: cat,
      docTitle: title,
      totalAmount: total,
      docDetails: details
    });
  };

  // Immediate callback when public signature received from modal's live listener
  const handleSignatureReceivedFromShare = (signature, signerName, slotFieldParam) => {
    const slotField = slotFieldParam || shareSignModal.slotField;
    if (!slotField) return;

    let updatedData = null;
    if (activeTab === 'kosan') {
      updatedData = { ...kosanData, [slotField]: signature };
      if (signerName) {
        const nameField = slotField.replace('Sign', 'Nama');
        if (!updatedData[nameField]) updatedData[nameField] = signerName;
      }
      setKosanData(updatedData);
    } else if (activeTab === 'makan') {
      updatedData = { ...makanData, [slotField]: signature };
      if (signerName) {
        const nameField = slotField.replace('Sign', 'Nama');
        if (!updatedData[nameField]) updatedData[nameField] = signerName;
      }
      setMakanData(updatedData);
    } else if (activeTab === 'lembur') {
      updatedData = { ...lemburData, [slotField]: signature };
      if (signerName) {
        const nameField = slotField.replace('Sign', 'Nama');
        if (!updatedData[nameField]) updatedData[nameField] = signerName;
      }
      setLemburData(updatedData);
    } else if (activeTab === 'akomodasi') {
      updatedData = { ...akomodasiData, [slotField]: signature };
      if (signerName) {
        const nameField = slotField.replace('Sign', 'Nama');
        if (!updatedData[nameField]) updatedData[nameField] = signerName;
      }
      setAkomodasiData(updatedData);
    } else if (activeTab === 'pembelian') {
      updatedData = { ...pembelianData, [slotField]: signature };
      if (signerName) {
        const nameField = slotField.replace('Sign', 'Nama');
        if (!updatedData[nameField]) updatedData[nameField] = signerName;
      }
      setPembelianData(updatedData);
    } else if (activeTab === 'surat') {
      updatedData = { ...suratData, [slotField]: signature };
      if (signerName) {
        const nameField = slotField.replace('Sign', 'Nama');
        if (!updatedData[nameField]) updatedData[nameField] = signerName;
      }
      setSuratData(updatedData);
    }

    if (updatedData) {
      autoSaveSignature(activeTab, updatedData, shareSignModal.slotTitle || slotField);
    }

    showToast(`Tanda tangan untuk ${shareSignModal.slotTitle || slotField} berhasil diterima dari WhatsApp!`, 'success');
  };

  // Background Auto-Sync: Polls server every 3s for signatures submitted via WhatsApp/Mobile
  const syncIncomingSignatures = async () => {
    try {
      const recentTokens = await getRecentSignTokens();
      if (!Array.isArray(recentTokens) || recentTokens.length === 0) return;

      recentTokens.forEach(t => {
        if (t.status === 'signed' && t.signature && t.slotField) {
          const cat = (t.formCategory || '').toLowerCase();
          const slot = t.slotField;
          const sig = t.signature;
          const signer = t.signerName || t.assignedName;

          if (cat.includes('kosan') || cat.includes('kos')) {
            setKosanData(prev => {
              if (prev && prev[slot] !== sig) {
                const nameField = slot.replace('Sign', 'Nama');
                const next = { ...prev, [slot]: sig, [nameField]: prev[nameField] || signer || prev[nameField] };
                autoSaveSignature('kosan', next, t.slotTitle || slot);
                return next;
              }
              return prev;
            });
          } else if (cat.includes('makan') || cat.includes('konsumsi')) {
            setMakanData(prev => {
              if (prev && prev[slot] !== sig) {
                const nameField = slot.replace('Sign', 'Nama');
                const next = { ...prev, [slot]: sig, [nameField]: prev[nameField] || signer || prev[nameField] };
                autoSaveSignature('makan', next, t.slotTitle || slot);
                return next;
              }
              return prev;
            });
          } else if (cat.includes('lembur')) {
            setLemburData(prev => {
              if (prev && prev[slot] !== sig) {
                const nameField = slot.replace('Sign', 'Nama');
                const next = { ...prev, [slot]: sig, [nameField]: prev[nameField] || signer || prev[nameField] };
                autoSaveSignature('lembur', next, t.slotTitle || slot);
                return next;
              }
              return prev;
            });
          } else if (cat.includes('akomodasi') || cat.includes('dinas')) {
            setAkomodasiData(prev => {
              if (prev && prev[slot] !== sig) {
                const nameField = slot.replace('Sign', 'Nama');
                const next = { ...prev, [slot]: sig, [nameField]: prev[nameField] || signer || prev[nameField] };
                autoSaveSignature('akomodasi', next, t.slotTitle || slot);
                return next;
              }
              return prev;
            });
          } else if (cat.includes('pembelian') || cat.includes('barang')) {
            setPembelianData(prev => {
              if (prev && prev[slot] !== sig) {
                const nameField = slot.replace('Sign', 'Nama');
                const next = { ...prev, [slot]: sig, [nameField]: prev[nameField] || signer || prev[nameField] };
                autoSaveSignature('pembelian', next, t.slotTitle || slot);
                return next;
              }
              return prev;
            });
          } else if (cat.includes('surat') || cat.includes('tugas') || cat.includes('sppd')) {
            setSuratData(prev => {
              if (prev && prev[slot] !== sig) {
                const nameField = slot.replace('Sign', 'Nama');
                const next = { ...prev, [slot]: sig, [nameField]: prev[nameField] || signer || prev[nameField] };
                autoSaveSignature('surat', next, t.slotTitle || slot);
                return next;
              }
              return prev;
            });
          }
        }
      });
    } catch (e) {
      console.warn('Error syncing signatures:', e);
    }
  };

  useEffect(() => {
    syncIncomingSignatures();
    const interval = setInterval(() => {
      syncIncomingSignatures();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Reset to Sample Template Data (Detaches active draft ID)
  const handleResetSample = () => {
    if (window.confirm('Muat ulang data contoh template untuk kategori ini? Status draf aktif saat ini akan dilepas.')) {
      if (activeTab === 'kosan') setKosanData(initialKosanData);
      if (activeTab === 'makan') setMakanData(initialMakanData);
      if (activeTab === 'lembur') setLemburData(initialLemburData);
      if (activeTab === 'akomodasi') setAkomodasiData(initialAkomodasiData);
      if (activeTab === 'pembelian') setPembelianData(initialPembelianData);
      if (activeTab === 'surat') setSuratData(initialSuratData);

      setActiveDocs(prev => ({
        ...prev,
        [activeTab]: null
      }));
      showToast('Data contoh template berhasil dimuat!');
    }
  };

  // Start fresh new draft (detaches current active draft ID)
  const handleNewDoc = () => {
    setActiveDocs(prev => ({
      ...prev,
      [activeTab]: null
    }));
    showToast(`Draf dilepas. Simpan berikutnya akan menjadi Draf Baru.`);
  };

  // Save / Update Draft to Cloudflare D1
  const handleSaveDraft = async (forceNew = false) => {
    const currentData = getCurrentFormData(activeTab);
    const { title, total } = getDocMeta(activeTab, currentData);
    const existingDoc = activeDocsRef.current[activeTab];
    const targetDocId = (!forceNew && existingDoc) ? existingDoc.id : null;

    const res = await saveDocument(activeTab, title, currentData, total, targetDocId);
    if (res && res.success && res.doc) {
      setActiveDocs(prev => ({
        ...prev,
        [activeTab]: {
          id: res.doc.id,
          title: res.doc.title || title,
          created_at: res.doc.created_at,
          updated_at: res.doc.updated_at
        }
      }));
      if (targetDocId) {
        showToast(`Draf "${title}" berhasil diperbarui di D1!`);
      } else {
        showToast(`Draf baru "${title}" berhasil disimpan ke D1!`);
      }
    } else {
      showToast('Gagal menyimpan draf', 'error');
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
    } else if (targetType === 'pembelian') {
      setPembelianData({ ...initialPembelianData, ...parsedData });
    } else if (targetType === 'surat') {
      setSuratData({ ...initialSuratData, ...parsedData });
    }

    setActiveDocs(prev => ({
      ...prev,
      [targetType]: {
        id: doc.id,
        title: doc.title,
        created_at: doc.created_at,
        updated_at: doc.updated_at
      }
    }));

    showToast(`Dokumen "${doc.title || 'Draft'}" berhasil dimuat!`);
  };

  // Export PDF with Multi-Page Sequential Canvas Engine
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
    } else if (activeTab === 'pembelian') {
      filename = `Permintaan_Pembelian_Barang_${pembelianData.nama || 'Staff'}_${pembelianData.tanggal || '2026'}.pdf`;
      orientation = 'landscape';
    } else if (activeTab === 'surat') {
      filename = `Surat_Tugas_${suratData.personelNama || 'Personel'}_${suratData.nomorSurat || 'SPPD'}.pdf`;
      orientation = 'portrait';
    }

    try {
      await handleDownloadPDF({
        containerId: 'pdf-export-container',
        orientation,
        filename
      });
      showToast('PDF berhasil di-download!');
    } catch (e) {
      console.error(e);
      showToast('Gagal export PDF, mencoba cetak langsung...', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Browser Print with Auto-Orientation Lock
  const handlePrint = () => {
    const orientation = (activeTab === 'lembur' || activeTab === 'akomodasi' || activeTab === 'pembelian') ? 'landscape' : 'portrait';
    handlePrintDocument(orientation);
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-100 font-sans print:h-auto print:w-full print:bg-white print:overflow-visible">
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
          onNewDoc={handleNewDoc}
          activeDoc={activeDocs[activeTab]}
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
            <div className="flex items-center justify-between py-2 border-b border-slate-200 mb-2">
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
                onOpenShareLink={handleOpenShareSign}
              />
            )}

            {activeTab === 'makan' && (
              <MakanForm
                data={makanData}
                onChange={setMakanData}
                onOpenSignatureModal={handleOpenSignature}
                onOpenShareLink={handleOpenShareSign}
              />
            )}

            {activeTab === 'lembur' && (
              <LemburForm
                data={lemburData}
                onChange={setLemburData}
                onOpenSignatureModal={handleOpenSignature}
                onOpenShareLink={handleOpenShareSign}
              />
            )}

            {activeTab === 'akomodasi' && (
              <AkomodasiForm
                data={akomodasiData}
                onChange={setAkomodasiData}
                onOpenSignatureModal={handleOpenSignature}
                onOpenShareLink={handleOpenShareSign}
              />
            )}

            {activeTab === 'pembelian' && (
              <PembelianForm
                data={pembelianData}
                onChange={setPembelianData}
                onOpenSignatureModal={handleOpenSignature}
                onOpenShareLink={handleOpenShareSign}
              />
            )}

            {activeTab === 'surat' && (
              <SuratForm
                data={suratData}
                onChange={setSuratData}
                onOpenSignatureModal={handleOpenSignature}
                onOpenShareLink={handleOpenShareSign}
              />
            )}
          </div>
        </section>

        {/* Right Column: Live PDF Document Preview (Visible on Desktop OR when viewMode === 'preview' on mobile) */}
        <section
          className={`flex-1 h-full overflow-y-auto bg-slate-200/80 flex flex-col relative min-h-0 print:bg-white print:p-0 print:m-0 print:overflow-visible print:h-auto print:flex ${
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
                  : activeTab === 'pembelian'
                  ? 'Landscape (1 Halaman)'
                  : activeTab === 'surat'
                  ? 'Portrait (1 Halaman)'
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
          <div className="flex-1 p-2 sm:p-6 flex justify-center items-start overflow-x-auto min-h-0 print:p-0 print:m-0 print:overflow-visible print:bg-white">
            <div
              id="pdf-zoom-container"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out'
              }}
              className="pb-28 lg:pb-20 print:p-0 print:m-0 print:!transform-none print:bg-white"
            >
              {activeTab === 'kosan' && <KosanPreview data={kosanData} />}
              {activeTab === 'makan' && <MakanPreview data={makanData} />}
              {activeTab === 'lembur' && <LemburPreview data={lemburData} />}
              {activeTab === 'akomodasi' && <AkomodasiPreview data={akomodasiData} />}
              {activeTab === 'pembelian' && <PembelianPreview data={pembelianData} />}
              {activeTab === 'surat' && <SuratPreview data={suratData} />}
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
        activeDocId={activeDocs[activeTab]?.id}
      />

      {/* Public 1-Hour Guest Signing Link Modal (WhatsApp Sharing) */}
      <ShareSignLinkModal
        isOpen={shareSignModal.isOpen}
        onClose={() => setShareSignModal(prev => ({ ...prev, isOpen: false }))}
        slotField={shareSignModal.slotField}
        slotTitle={shareSignModal.slotTitle}
        assignedName={shareSignModal.assignedName}
        formCategory={shareSignModal.formCategory}
        docTitle={shareSignModal.docTitle}
        totalAmount={shareSignModal.totalAmount}
        docDetails={shareSignModal.docDetails}
        onSignatureReceived={handleSignatureReceivedFromShare}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <EmployeeProvider>
        <MainApp />
      </EmployeeProvider>
    </ErrorBoundary>
  );
}
