import React from 'react';
import { PenTool, Lock, AlertCircle, CheckCircle2, Link2, Smartphone } from 'lucide-react';
import { useHRIS } from '../context/EmployeeContext';
import { getSignaturePermissionInfo } from '../utils/signaturePermission';

export function SignatureActionButton({
  targetField,
  assignedName = '',
  slotType = 'general',
  existingSignature = null,
  onOpenSignatureModal,
  onOpenShareLink,
  title = '',
  buttonLabel = null,
  showStatusBadge = true,
  className = ''
}) {
  const { currentUser } = useHRIS();
  const perm = getSignaturePermissionInfo(currentUser, assignedName, slotType);

  const displayLabel = buttonLabel || (existingSignature ? 'Ubah TTD' : 'Beri TTD');

  const targetLabel = assignedName 
    || title 
    || (slotType === 'hod' ? 'HOD' : slotType === 'direktur' ? 'Direktur' : slotType === 'pemohon' ? 'Pemohon' : 'Pejabat');

  if (!perm.allowed) {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <button
          type="button"
          disabled
          className="w-full flex items-center justify-center gap-1.5 text-xs bg-slate-100 text-slate-400 border border-slate-200 py-1.5 px-3 rounded-lg cursor-not-allowed font-medium select-none shadow-2xs transition-colors"
          title={perm.reason}
        >
          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{existingSignature ? 'TTD Terkunci' : 'Beri TTD (Terkunci)'}</span>
        </button>

        {showStatusBadge && (
          <div className="p-1.5 rounded-md bg-rose-50/80 border border-rose-200 text-[10px] text-rose-800 flex items-start gap-1.5 leading-snug animate-in fade-in">
            <AlertCircle className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <span>Hanya <strong>Admin</strong> atau <strong>{targetLabel}</strong> yang dapat menandatangani.</span>
            </div>
          </div>
        )}

        {/* Share Link button: Staff/User can ask HOD, Direktur, or any official to sign via WhatsApp link */}
        {onOpenShareLink && (
          <button
            type="button"
            onClick={() => onOpenShareLink(targetField, title || targetLabel, assignedName)}
            className="w-full flex items-center justify-center gap-1.5 text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 py-1 px-2.5 rounded-lg transition font-semibold active:scale-95 shadow-2xs"
            title="Kirim link tanda tangan berbatas waktu 1 jam ke WhatsApp"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Kirim Link TTD ke {targetLabel} via WA</span>
          </button>
        )}
      </div>
    );
  }

  // Allowed
  return (
    <div className={`space-y-1.5 ${className}`}>
      <button
        type="button"
        onClick={() => onOpenSignatureModal && onOpenSignatureModal(targetField, title || assignedName, slotType, assignedName)}
        className="w-full flex items-center justify-center gap-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 border border-blue-200 py-1.5 px-3 rounded-lg transition-all font-semibold active:scale-95 shadow-2xs"
        title="Klik untuk membuka kanvas atau memilih tanda tangan"
      >
        <PenTool className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span>{displayLabel}</span>
      </button>

      {/* Share Link option even if allowed (e.g. sign from phone or share to colleague) */}
      {onOpenShareLink && (
        <button
          type="button"
          onClick={() => onOpenShareLink(targetField, title || targetLabel, assignedName)}
          className="w-full flex items-center justify-center gap-1.5 text-[10px] bg-slate-50 hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800 border border-slate-200 hover:border-indigo-200 py-1 px-2 rounded-md transition font-medium active:scale-95 shadow-2xs"
          title="Buat link publik yang kedaluwarsa dalam 1 jam atau setelah ditandatangani"
        >
          <Link2 className="w-3 h-3 text-indigo-600 shrink-0" />
          <span>Kirim Link TTD ke {targetLabel} via WA</span>
        </button>
      )}

      {showStatusBadge && (
        <div className="flex items-center justify-between gap-1 px-0.5 pt-0.5 text-[10px]">
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-bold ${perm.badgeColor}`}>
            {perm.badgeText}
          </span>
          {existingSignature && (
            <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-0.5 shrink-0">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
              <span>Ada TTD</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
