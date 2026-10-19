import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  Link2, 
  Copy, 
  Check, 
  Clock, 
  ShieldCheck, 
  Send, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { createPublicSignToken, getPublicSignSession } from '../services/publicSignService';

export function ShareSignLinkModal({
  isOpen,
  onClose,
  slotField = 'sign',
  slotTitle = 'Tanda Tangan',
  assignedName = 'Pejabat Terkait',
  formCategory = 'Dokumen Resmi',
  docTitle = 'Formulir Dokumen Resmi',
  totalAmount = 0,
  docDetails = {},
  onSignatureReceived
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shareData, setShareData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [pollStatus, setPollStatus] = useState('waiting'); // 'waiting' | 'signed' | 'expired'
  const [receivedSig, setReceivedSig] = useState(null);

  const pollIntervalRef = useRef(null);

  const currentUrl = useMemo(() => {
    if (!shareData) return '';
    return shareData.shareUrl;
  }, [shareData]);

  // Auto-generate token on open
  useEffect(() => {
    if (isOpen) {
      handleGenerate();
    } else {
      setShareData(null);
      setPollStatus('waiting');
      setReceivedSig(null);
      setError(null);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }
  }, [isOpen, slotField, assignedName]);

  // Polling listener when waiting for signature
  useEffect(() => {
    if (isOpen && shareData?.token && pollStatus === 'waiting') {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await getPublicSignSession(shareData.token);
          if (res.ok && res.session) {
            if (res.session.status === 'signed' && res.session.signature) {
              setPollStatus('signed');
              setReceivedSig(res.session.signature);
              clearInterval(pollIntervalRef.current);
              if (onSignatureReceived) {
                onSignatureReceived(res.session.signature, res.session.signerName, res.session.slotField || slotField, shareData.token);
              }
            } else if (res.session.status === 'expired') {
              setPollStatus('expired');
              clearInterval(pollIntervalRef.current);
            }
          }
        } catch (e) {
          console.warn('Poll error:', e);
        }
      }, 3000);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, shareData, pollStatus]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setCopied(false);
    setPollStatus('waiting');

    try {
      const res = await createPublicSignToken({
        slotField,
        slotTitle,
        assignedName,
        formCategory,
        docTitle,
        totalAmount,
        docDetails,
        durationMs: 3600000 // 1 hour
      });
      setShareData(res);
    } catch (err) {
      setError(err.message || 'Gagal membuat link tanda tangan.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!currentUrl) return;
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    if (!currentUrl) return;
    const recipient = assignedName ? `Bapak/Ibu ${assignedName}` : 'Bapak/Ibu';
    const message = `Halo ${recipient}, mohon kesediaannya untuk menandatangani dokumen *${docTitle}* (${formCategory}) melalui tautan resmi berikut:\n\n🔗 ${currentUrl}\n\n⏳ *Catatan:* Tautan ini memiliki masa berlaku *1 jam* dan akan otomatis hangus setelah ditandatangani. Terima kasih!`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Link2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Public Link Tanda Tangan</h3>
              <p className="text-[11px] text-indigo-200/80">
                Kedaluwarsa dalam 1 Jam atau setelah ditandatangani
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Target Info Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-semibold text-slate-500">Slot Persetujuan:</span>
              <span className="font-bold text-slate-800">{slotTitle}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-semibold text-slate-500">Penerima Ditugaskan:</span>
              <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {assignedName || 'Pejabat Terkait'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-semibold text-slate-500">Dokumen:</span>
              <span className="font-medium text-slate-700 truncate max-w-[240px]">{docTitle}</span>
            </div>
          </div>

          {/* Security Rules Banner */}
          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-snug">
              <span className="font-bold block">Fitur Tanda Tangan Guest Tanpa Login:</span>
              <span>Penerima tidak perlu login. Cukup buka link di HP & goreskan tanda tangan. Link otomatis <strong>hangus dalam 1 jam</strong> atau <strong>detik itu juga setelah ditandatangani</strong>.</span>
            </div>
          </div>

          {/* Loading or Error State */}
          {loading && (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="text-xs font-medium">Membuat link tanda tangan unik...</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Generated Link Display */}
          {shareData && !loading && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Tautan Publik (Bisa Dibuka di HP):</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    ⏱️ Aktif 60 Menit
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl bg-slate-100/80 text-slate-700 select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shrink-0 ${
                      copied 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'bg-slate-800 hover:bg-slate-900 text-white'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Disalin!' : 'Salin'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim via WhatsApp</span>
                </button>

                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Buka di Tab Baru (Tes)</span>
                </a>
              </div>

              {/* Live Real-time Status Card */}
              <div className="p-3 rounded-xl border border-slate-200 transition-all duration-300 mt-2">
                {pollStatus === 'waiting' && (
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <span className="w-3 h-3 rounded-full bg-indigo-600 animate-ping absolute"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 relative"></span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Menunggu Tanda Tangan dari HP Penerima...
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Saat penerima menandatangani dari link WhatsApp, tanda tangan akan otomatis masuk ke form ini.
                      </p>
                    </div>
                  </div>
                )}

                {pollStatus === 'signed' && (
                  <div className="flex items-center gap-3 bg-emerald-50 -m-3 p-3 rounded-xl border border-emerald-300">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-emerald-900">
                        🎉 Tanda Tangan Berhasil Diterima!
                      </p>
                      <p className="text-[10px] text-emerald-700">
                        Link publik otomatis hangus. Tanda tangan telah diterapkan ke formulir.
                      </p>
                    </div>
                    {receivedSig && (
                      <div className="w-14 h-9 bg-white border border-emerald-300 rounded flex items-center justify-center p-1 shrink-0">
                        <img src={receivedSig} alt="TTD Diterima" className="max-h-full max-w-full object-contain" />
                      </div>
                    )}
                  </div>
                )}

                {pollStatus === 'expired' && (
                  <div className="flex items-center gap-2 text-rose-700">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-semibold">Link ini telah kedaluwarsa (1 jam).</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">
            One-time Guest Signature • PT Applimetis Parama Solusi
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
