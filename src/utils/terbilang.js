/**
 * Indonesian Number to Words Converter (Terbilang)
 * Converts numbers into Indonesian spelled-out text (e.g. 2050000 -> # Dua Juta Lima Puluh Ribu Rupiah #)
 */

function terbilangBilangan(n) {
  const bilangan = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 
    'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ];

  n = Math.floor(Math.abs(Number(n) || 0));

  if (n < 12) {
    return bilangan[n];
  } else if (n < 20) {
    return terbilangBilangan(n - 10) + ' Belas';
  } else if (n < 100) {
    return terbilangBilangan(Math.floor(n / 10)) + ' Puluh ' + terbilangBilangan(n % 10);
  } else if (n < 200) {
    return 'Seratus ' + terbilangBilangan(n - 100);
  } else if (n < 1000) {
    return terbilangBilangan(Math.floor(n / 100)) + ' Ratus ' + terbilangBilangan(n % 100);
  } else if (n < 2000) {
    return 'Seribu ' + terbilangBilangan(n - 1000);
  } else if (n < 1000000) {
    return terbilangBilangan(Math.floor(n / 1000)) + ' Ribu ' + terbilangBilangan(n % 1000);
  } else if (n < 1000000000) {
    return terbilangBilangan(Math.floor(n / 1000000)) + ' Juta ' + terbilangBilangan(n % 1000000);
  } else if (n < 1000000000000) {
    return terbilangBilangan(Math.floor(n / 1000000000)) + ' Miliar ' + terbilangBilangan(n % 1000000000);
  } else if (n < 1000000000000000) {
    return terbilangBilangan(Math.floor(n / 1000000000000)) + ' Triliun ' + terbilangBilangan(n % 1000000000000);
  } else {
    return 'Jumlah Terlalu Besar';
  }
}

export function terbilangRupiah(amount, wrapWithHash = true) {
  const cleanAmount = Number(amount) || 0;
  if (cleanAmount === 0) {
    return wrapWithHash ? '# Nol Rupiah #' : 'Nol Rupiah';
  }

  const words = terbilangBilangan(cleanAmount)
    .replace(/\s+/g, ' ')
    .trim();

  const formatted = words.length > 0 ? `${words} Rupiah` : 'Nol Rupiah';

  return wrapWithHash ? `# ${formatted} #` : formatted;
}
