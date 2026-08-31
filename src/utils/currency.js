/**
 * Indonesian Rupiah formatters
 */

export function formatRupiah(amount, withPrefix = true) {
  if (amount === undefined || amount === null || isNaN(amount) || amount === '') {
    return withPrefix ? 'Rp -' : '-';
  }
  
  const num = Number(amount);
  if (num === 0) {
    return withPrefix ? 'Rp -' : '-';
  }

  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0
  }).format(num);

  return withPrefix ? `Rp ${formatted}` : formatted;
}

export function parseRupiahInput(value) {
  if (!value) return 0;
  // Remove non-digits
  const clean = String(value).replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : 0;
}
