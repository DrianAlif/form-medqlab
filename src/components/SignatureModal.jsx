import React, { useRef, useState, useEffect } from 'react';
import { X, Eraser, Check, Upload, Sparkles, PenTool } from 'lucide-react';
import { SAMPLE_SIGNATURE_ALIF, SAMPLE_SIGNATURE_FERRY } from '../utils/sampleData';

export function SignatureModal({ isOpen, onClose, onSave, targetTitle }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [activeTab, setActiveTab] = useState('draw'); // 'draw', 'presets', 'upload'
  const [mousePos, setMousePos] = useState(null);

  useEffect(() => {
    if (isOpen && activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasCoords(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
    setMousePos({ x, y });
  };

  const draw = (e) => {
    const { x, y } = getCanvasCoords(e);
    setMousePos({ x, y });

    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSaveDrawn = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  const handleSelectPreset = (dataUrl) => {
    onSave(dataUrl);
    onClose();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onSave(event.target.result);
      onClose();
    };
    reader.readAsDataURL(file);
  };

  const handleClearSignature = () => {
    onSave('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Tanda Tangan Digital</h3>
            <p className="text-xs text-slate-500">{targetTitle || 'Bubuhkan tanda tangan'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('draw')}
            className={`flex-1 py-2.5 text-center border-b-2 transition ${
              activeTab === 'draw'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Gambar Manual
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2.5 text-center border-b-2 transition ${
              activeTab === 'presets'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Preset TTD
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2.5 text-center border-b-2 transition ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Upload Gambar
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col items-center">
          {activeTab === 'draw' && (
            <div className="w-full flex flex-col items-center space-y-3">
              <div className="w-full border-2 border-slate-300 rounded-xl overflow-hidden bg-slate-50 relative signature-canvas-cursor">
                <canvas
                  ref={canvasRef}
                  width={440}
                  height={180}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={() => {
                    stopDrawing();
                    setMousePos(null);
                  }}
                  onMouseEnter={(e) => setMousePos(getCanvasCoords(e))}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={() => {
                    stopDrawing();
                    setMousePos(null);
                  }}
                  className="w-full h-[180px] touch-none signature-canvas-cursor block"
                />

                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
                    Goreskan tanda tangan di sini (Mouse atau Touchscreen)
                  </div>
                )}

                {/* Floating High-Visibility Pen Tip Indicator */}
                {mousePos && (
                  <div
                    className="absolute w-3 h-3 rounded-full bg-blue-600 border-2 border-white pointer-events-none shadow-md transform -translate-x-1/2 -translate-y-1/2 z-10"
                    style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
                  />
                )}
              </div>
              <div className="flex w-full justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100 transition"
                >
                  <Eraser className="w-3.5 h-3.5" /> Hapus Goresan
                </button>
                <button
                  type="button"
                  onClick={handleClearSignature}
                  className="text-rose-500 hover:text-rose-700 px-2 py-1 rounded transition"
                >
                  Kosongkan TTD
                </button>
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="w-full space-y-3">
              <div className="text-xs text-slate-600 mb-2">
                Pilih tanda tangan resmi template yang sudah disiapkan:
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Preset 1: Alif */}
                <div
                  onClick={() => handleSelectPreset(SAMPLE_SIGNATURE_ALIF)}
                  className="p-3 border border-slate-200 hover:border-blue-500 rounded-xl bg-slate-50 hover:bg-blue-50/50 cursor-pointer flex flex-col items-center justify-between transition group"
                >
                  <div className="h-16 flex items-center justify-center">
                    <img src={SAMPLE_SIGNATURE_ALIF} alt="Sign Alif" className="max-h-12" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-600">
                    Alif Drian (Pemohon)
                  </span>
                </div>

                {/* Preset 2: Ferry */}
                <div
                  onClick={() => handleSelectPreset(SAMPLE_SIGNATURE_FERRY)}
                  className="p-3 border border-slate-200 hover:border-blue-500 rounded-xl bg-slate-50 hover:bg-blue-50/50 cursor-pointer flex flex-col items-center justify-between transition group"
                >
                  <div className="h-16 flex items-center justify-center">
                    <img src={SAMPLE_SIGNATURE_FERRY} alt="Sign Ferry" className="max-h-12" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-600">
                    Ferry Lukito (HOD)
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="w-full py-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition">
                <span>Pilih File Gambar (PNG / JPG)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-400 mt-2">
                Disarankan file gambar transparan (PNG)
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            Batal
          </button>
          {activeTab === 'draw' && (
            <button
              type="button"
              onClick={handleSaveDrawn}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <Check className="w-4 h-4" /> Simpan Goresan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
