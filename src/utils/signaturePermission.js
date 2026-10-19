/**
 * Signature Permission Utility for Form Generator
 * 
 * Rules:
 * 1. Admin ('admin') has SUPERUSER permission and can sign ANY slot.
 * 2. Director ('director') can sign Direktur, Pejabat, Approval, HOD, and their own slots.
 * 3. Manager ('manager') can sign HOD, Reviewer, and their own slots.
 * 4. Assigned Person: If the assigned name matches currentUser.name, they CAN sign!
 * 5. Regular Employee ('employee'):
 *    - CAN sign their own slot (Pemohon / Dibuat Oleh / Personel yang ditugaskan).
 *    - CANNOT sign HOD, Direktur, Reviewer, or Pejabat Penyetuju slots unless their name is specifically assigned.
 */

export function canSignSlot(currentUser, assignedName = '', slotType = 'general') {
  if (!currentUser) return true; // If no user auth is active, default to allowing

  // 1. Admin always has full access
  if (currentUser.role === 'admin') {
    return true;
  }

  const currentName = (currentUser.name || '').trim().toLowerCase();
  const targetName = (assignedName || '').trim().toLowerCase();

  // 2. Direct name match (Assigned person)
  if (targetName && currentName && (
    targetName === currentName ||
    targetName.includes(currentName) ||
    currentName.includes(targetName)
  )) {
    return true;
  }

  // 3. Role-based authority for upper management
  if (currentUser.role === 'director') {
    if (['direktur', 'director', 'approval', 'hod', 'pejabat'].includes(slotType.toLowerCase())) {
      return true;
    }
  }

  if (currentUser.role === 'manager') {
    if (['hod', 'review', 'reviewer', 'diketahui'].includes(slotType.toLowerCase())) {
      return true;
    }
  }

  // 4. Initial empty slot for requester/creator
  if (['pemohon', 'dibuat', 'diajukan', 'personel'].includes(slotType.toLowerCase())) {
    if (!targetName) return true;
  }

  // Otherwise, regular employee cannot sign HOD/Direktur or another person's slot
  return false;
}

export function getSignaturePermissionInfo(currentUser, assignedName = '', slotType = 'general') {
  const isAllowed = canSignSlot(currentUser, assignedName, slotType);
  const isAdmin = currentUser?.role === 'admin';
  const currentName = (currentUser?.name || '').trim().toLowerCase();
  const targetName = (assignedName || '').trim().toLowerCase();
  const isDirectAssign = targetName && currentName && (
    targetName === currentName ||
    targetName.includes(currentName) ||
    currentName.includes(targetName)
  );

  let roleLabel = 'Pejabat Terkait';
  const st = slotType.toLowerCase();
  if (st.includes('hod')) roleLabel = 'HOD / Manager';
  else if (st.includes('direktur') || st.includes('director')) roleLabel = 'Direktur';
  else if (st.includes('pejabat')) roleLabel = 'Pejabat Penandatangan';
  else if (st.includes('review')) roleLabel = 'Reviewer';
  else if (st.includes('pemohon') || st.includes('dibuat') || st.includes('diajukan')) roleLabel = 'Pemohon';
  else if (st.includes('personel')) roleLabel = 'Pegawai yang Ditugaskan';

  if (isAllowed) {
    if (isAdmin) {
      return {
        allowed: true,
        badgeText: '👑 Akses Penuh Admin',
        badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
        reason: 'Sebagai Admin, Anda memiliki wewenang penuh untuk menandatangani semua dokumen.'
      };
    }
    if (isDirectAssign) {
      return {
        allowed: true,
        badgeText: `✓ Anda Ditugaskan (${currentUser?.name})`,
        badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        reason: `Nama Anda cocok sebagai ${roleLabel} yang ditugaskan.`
      };
    }
    return {
      allowed: true,
      badgeText: `✓ Berwenang (${currentUser?.role || 'Staff'})`,
      badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
      reason: `Wewenang role Anda mengizinkan penandatanganan bagian ini.`
    };
  }

  // Not allowed
  return {
    allowed: false,
    badgeText: `🔒 Terkunci (${roleLabel})`,
    badgeColor: 'text-rose-700 bg-rose-50 border-rose-200',
    reason: `Hanya Admin atau ${assignedName ? `"${assignedName}"` : roleLabel} yang berhak menandatangani bagian ini.`
  };
}
