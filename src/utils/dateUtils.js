/**
 * Date utilities for Indonesian business documents
 */

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAYS_ID = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

export function formatIndonesianDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const day = date.getDate();
  const month = MONTHS_ID[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

export function formatSlashDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function getIndonesianDayName(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return DAYS_ID[date.getDay()];
}

export function formatShortIndoDate(dateString) {
  if (!dateString) return '';
  // If already in short format like '6-Agu-26'
  if (/^\d{1,2}-[A-Za-z]{3}-\d{2,4}$/.test(dateString.trim())) {
    return dateString.trim();
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const day = date.getDate();
  const month = shortMonths[date.getMonth()];
  const yearShort = String(date.getFullYear()).slice(-2);

  return `${day}-${month}-${yearShort}`;
}

export function getCurrentDateISO() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}
