import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  PenTool, 
  RotateCcw, 
  Building2, 
  Loader2, 
  Lock,
  Eraser,
  Trash2
} from 'lucide-react';
import { getPublicSignSession, submitPublicSignature } from '../services/publicSignService';
import { formatRupiah } from '../utils/currency';

export function PublicSigningPage({ token }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Canvas refs and state
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [mousePos, setMousePos] = useState(null);

  // Fetch session on load
  useEffect(() => {
    async function loadData() {
      if (!token) {
        setError('Token tanda tangan tidak ditemukan pada tautan.');
        setLoading(false);
        return;
      }
      try {
        const res = await getPublicSignSession(token);
        if (!res.ok) {
          setError(res.error || 'Tautan tidak valid.');
        } else {
          setSession(res.session);
          setSecondsRemaining(res.timeRemainingSeconds || 0);
          if (res.session.status === 'signed') {
            setSubmitSuccess(true);
          }
        }
      } catch (e) {
        setError('Terjadi kendala saat memuat dokumen.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  // Live countdown timer
  useEffect(() => {
    if (!session || session.status !== 'pending' || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSession((s) => ({ ...s, status: 'expired' }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, secondsRemaining]);

  // Canvas drawing handlers (mouse & touch)
  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, uiX: 0, uiY: 0, isTouch: false };
    const rect = canvas.getBoundingClientRect();
    const isTouch = Boolean(e.touches && e.touches.length > 0);
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      uiX: clientX - rect.left,
      uiY: clientY - rect.top,
      isTouch
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pos = getCanvasPos(e);

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    isDrawingRef.current = true;
    setHasDrawn(true);

    if (!pos.isTouch) {
      setMousePos({ x: pos.uiX, y: pos.uiY });
    }
  };

  const draw = (e) => {
    const pos = getCanvasPos(e);
    if (!pos.isTouch) {
      setMousePos({ x: pos.uiX, y: pos.uiY });
    }

    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e3a8a'; // Corporate dark blue ink
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const handleMouseEnter = (e) => {
    const pos = getCanvasPos(e);
    if (!pos.isTouch) {
      setMousePos({ x: pos.uiX, y: pos.uiY });
    }
  };

  const stopDrawing = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
    }
  };

  const handleMouseLeave = (e) => {
    stopDrawing(e);
    setMousePos(null);
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSubmitSignature = async () => {
    if (!hasDrawn) {
      alert('Silakan goreskan tanda tangan Anda pada kotak terlebih dahulu.');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Export signature as PNG data URL
    const signatureDataUrl = canvas.toDataURL('image/png');

    setIsSubmitting(true);
    try {
      const res = await submitPublicSignature(token, signatureDataUrl, session?.assignedName);
      if (res.ok) {
        setSubmitSuccess(true);
        setSession((s) => ({ ...s, status: 'signed', signature: signatureDataUrl }));
      } else {
        alert(res.error || 'Gagal menyimpan tanda tangan.');
      }
    } catch (e) {
      alert(e.message || 'Terjadi kesalahan saat mengirim tanda tangan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format timer MM:SS
  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-3" />
        <p className="text-sm font-semibold">Memuat dokumen tanda tangan...</p>
      </div>
    );
  }

  // 2. Error / Not Found State
  if (error || !session) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Tautan Tidak Valid</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {error || 'Dokumen atau token tanda tangan tidak ditemukan di sistem.'}
          </p>
          <p className="text-[11px] text-slate-400">
            Pastikan tautan yang Anda buka dari WhatsApp lengkap dan tidak terpotong.
          </p>
        </div>
      </div>
    );
  }

  // 3. Expired State (> 1 Hour)
  if (session.status === 'expired' || secondsRemaining <= 0) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-7 h-7 text-amber-600" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Kedaluwarsa
            </span>
            <h2 className="text-base font-bold text-slate-900 pt-1">Tautan Tanda Tangan Hangus</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Masa aktif tautan penandatanganan ini adalah <strong>1 jam</strong> dan telah berakhir. Demi keamanan dokumen resmi, tautan tidak dapat digunakan lagi.
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1">
            <div className="text-slate-500">Dokumen: <strong className="text-slate-800">{session.docTitle}</strong></div>
            <div className="text-slate-500">Tujuan: <strong className="text-slate-800">{session.assignedName}</strong></div>
          </div>
          <p className="text-[11px] text-slate-500">
            Silakan minta pemohon untuk menerbitkan tautan baru melalui aplikasi.
          </p>
        </div>
      </div>
    );
  }

  // 4. Already Signed State
  if (session.status === 'signed' || submitSuccess) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-emerald-200 p-6 max-w-md w-full text-center space-y-4 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-9 h-9 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
              Sukses Ditandatangani
            </span>
            <h2 className="text-base font-bold text-slate-900 pt-1">Dokumen Berhasil Ditandatangani!</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Terima kasih, tanda tangan Anda sebagai <strong>{session.assignedName}</strong> telah berhasil dicatat dan menempel pada dokumen resmi.
          </p>

          {/* Signature Preview & Burn Notice */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            {session.signature && (
              <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                <img src={session.signature} alt="Tanda Tangan Anda" className="h-16 object-contain" />
              </div>
            )}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Tautan sekali pakai ini telah <strong>hangus & nonaktif</strong>.</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            PT Applimetis Parama Solusi • Sistem Verifikasi Dokumen
          </div>
        </div>
      </div>
    );
  }

  // 5. Active Signing Form (Mobile-Optimized)
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start p-3 sm:p-6 font-sans">
      <div className="max-w-md w-full space-y-4">
        {/* Brand Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 rounded-2xl p-4 text-white shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Building2 className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h1 className="text-xs font-bold tracking-wide">PT. APPLIMETIS PARAMA SOLUSI</h1>
              <p className="text-[10px] text-indigo-200/80">Persetujuan & Tanda Tangan Dokumen</p>
            </div>
          </div>
          <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30 flex items-center gap-1 text-[10px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Resmi</span>
          </div>
        </div>

        {/* 1-Hour Countdown Ticker Banner */}
        <div className="bg-white rounded-xl p-3 shadow-xs border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-900">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            <div>
              <span className="text-[10px] text-amber-700 block font-semibold">Masa Aktif Tautan:</span>
              <span className="text-xs font-bold font-mono text-amber-950">
                {formatTimer(secondsRemaining)} tersisa
              </span>
            </div>
          </div>
          <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-1 rounded-md font-semibold border border-amber-200">
            Hangus setelah 1 jam / ditandatangani
          </span>
        </div>

        {/* Document Overview Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {session.formCategory}
              </span>
              <h2 className="text-sm font-bold text-slate-900 mt-1">{session.docTitle}</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Posisi / Slot TTD:</span>
              <span className="font-bold text-slate-800">{session.slotTitle}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Nama Penerima:</span>
              <span className="font-bold text-indigo-700">{session.assignedName}</span>
            </div>
          </div>

          {session.totalAmount > 0 && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
              <span className="font-medium text-emerald-800">Total Nominal Dokumen:</span>
              <span className="font-bold text-emerald-950 text-sm">
                {formatRupiah(session.totalAmount)}
              </span>
            </div>
          )}
        </div>

        {/* Signature Canvas Box */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <PenTool className="w-4 h-4 text-indigo-600" />
              <span>Goreskan Tanda Tangan Anda</span>
            </div>
            {hasDrawn && (
              <button
                type="button"
                onClick={handleClearCanvas}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 active:scale-95 transition shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Hapus / Ulangi</span>
              </button>
            )}
          </div>

          {/* Canvas */}
          <div className="relative border-2 border-dashed border-indigo-300 rounded-xl bg-slate-50/70 overflow-hidden touch-none shadow-inner">
            <canvas
              ref={canvasRef}
              width={480}
              height={220}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={() => {
                stopDrawing();
                setMousePos(null);
              }}
              className="w-full h-48 bg-white block cursor-crosshair"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 space-y-1">
                <PenTool className="w-6 h-6 text-slate-300" />
                <span className="text-xs font-medium">Goreskan tanda tangan dengan Mouse atau Jari</span>
              </div>
            )}

            {/* High-visibility Dynamic Cursor / Pen Tip Indicator */}
            {mousePos && (
              <div
                className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-md block"></span>
                <span className="w-6 h-6 rounded-full border border-blue-400/60 animate-ping absolute"></span>
              </div>
            )}
          </div>

          {/* Canvas Toolbar Below Canvas */}
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-[11px] text-slate-500 font-medium">
              {hasDrawn ? '✓ Tanda tangan sudah digoreskan' : 'Area kanvas masih kosong'}
            </span>
            <button
              type="button"
              onClick={handleClearCanvas}
              disabled={!hasDrawn}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition active:scale-95 ${
                hasDrawn 
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-xs cursor-pointer' 
                  : 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed opacity-60'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Hapus Coretan</span>
            </button>
          </div>

          <p className="text-[10px] text-slate-500 text-center leading-snug pt-1">
            Dengan menandatangani, Anda menyetujui keabsahan dokumen <strong>{session.docTitle}</strong> sebagai <strong>{session.assignedName}</strong>.
          </p>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={handleClearCanvas}
              disabled={!hasDrawn || isSubmitting}
              className={`sm:col-span-1 py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition active:scale-98 ${
                hasDrawn && !isSubmitting
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 shadow-xs cursor-pointer'
                  : 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus (Ulangi)</span>
            </button>

            <button
              type="button"
              disabled={!hasDrawn || isSubmitting}
              onClick={handleSubmitSignature}
              className={`sm:col-span-2 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 ${
                hasDrawn && !isSubmitting
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/20 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Dokumen...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kirim Tanda Tangan & Selesai</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="text-center text-[10px] text-slate-400 pb-6 space-y-1">
          <div>PT Applimetis Parama Solusi • Secure One-Time Signature</div>
          <div className="text-slate-400/80">Tautan akan otomatis hangus setelah tombol di atas ditekan.</div>
        </div>
      </div>
    </div>
  );
}
