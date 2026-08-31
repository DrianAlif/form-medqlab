import React, { useRef, useState, useEffect } from 'react';
import { X, Eraser, Check, Upload, Sparkles, PenTool, CheckCircle2 } from 'lucide-react';
import {
  SAMPLE_SIGNATURE_ALIF,
  SAMPLE_SIGNATURE_TRI,
  SAMPLE_SIGNATURE_IKHSAN,
  SAMPLE_SIGNATURE_FERRY
} from '../utils/sampleData';

const PRESET_SIGNATURES = [
  {
    id: 'alif',
    name: 'Alif Drian (Pemohon)',
    role: 'Pemohon',
    dataUrl: SAMPLE_SIGNATURE_ALIF
  },
  {
    id: 'tri',
    name: 'Tri Achmadi (Pemohon / Terkait)',
    role: 'Pemohon / Terkait',
    dataUrl: SAMPLE_SIGNATURE_TRI
  },
  {
    id: 'ikhsan',
    name: 'Ikhsan',
    role: 'Tim Proyek',
    dataUrl: SAMPLE_SIGNATURE_IKHSAN
  },
  {
    id: 'ferry',
    name: 'Ferry Lukito (HOD)',
    role: 'HOD',
    dataUrl: SAMPLE_SIGNATURE_FERRY
  }
];

export function SignatureModal({ isOpen, onClose, onSave, targetTitle }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [activeTab, setActiveTab] = useState('draw'); // 'draw', 'presets', 'upload'
  const [mousePos, setMousePos] = useState(null);
  const [selectedPresetId, setSelectedPresetId] = useState(null);

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

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    onSave(preset.dataUrl);
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
        <div className="p-5 flex-1 flex flex-col items-center max-h-[70vh] overflow-y-auto">
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
              <div className="text-xs text-slate-600 mb-1 font-medium">
                Pilih tanda tangan resmi template yang sudah disiapkan:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_SIGNATURES.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3.5 border-2 rounded-xl bg-white hover:bg-blue-50/40 cursor-pointer flex flex-col items-center justify-between transition-all duration-200 group shadow-xs ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-200'
                          : 'border-slate-200 hover:border-blue-500 hover:shadow-md'
                      }`}
                    >
                      {/* Image Preview Box */}
                      <div className="h-20 w-full flex items-center justify-center bg-slate-50 rounded-lg p-2 group-hover:bg-white transition border border-slate-100 relative">
                        <img
                          src={preset.dataUrl}
                          alt={preset.name}
                          className="max-h-16 max-w-full object-contain filter drop-shadow-xs"
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 text-blue-600">
                            <CheckCircle2 className="w-4 h-4 fill-blue-600 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Label & Role */}
                      <div className="mt-2 text-center w-full">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 block truncate">
                          {preset.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
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
