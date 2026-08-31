/**
 * Indonesian National Holidays Database & Overtime Date Generator
 * Covers Indonesian fixed and lunar/religious national holidays for 2025, 2026, and 2027
 */

export const HOLIDAYS_DB = {
  // 2025
  '2025-01-01': 'Tahun Baru 2025 Masehi',
  '2025-01-27': 'Isra Mi\'raj Nabi Muhammad SAW',
  '2025-01-29': 'Tahun Baru Imlek 2576 Kongzili',
  '2025-03-29': 'Hari Suci Nyepi (Tahun Baru Saka 1947)',
  '2025-03-31': 'Hari Raya Idul Fitri 1446 H (Hari 1)',
  '2025-04-01': 'Hari Raya Idul Fitri 1446 H (Hari 2)',
  '2025-04-18': 'Wafat Yesus Kristus',
  '2025-04-20': 'Kebangkitan Yesus Kristus (Paskah)',
  '2025-05-01': 'Hari Buruh Internasional',
  '2025-05-12': 'Hari Raya Waisak 2569 BE',
  '2025-05-29': 'Kenaikan Yesus Kristus',
  '2025-06-01': 'Hari Lahir Pancasila',
  '2025-06-07': 'Hari Raya Idul Adha 1446 H',
  '2025-06-27': '1 Muharam Tahun Baru Islam 1447 H',
  '2025-08-17': 'Hari Kemerdekaan RI',
  '2025-09-05': 'Maulid Nabi Muhammad SAW',
  '2025-12-25': 'Hari Raya Natal',

  // 2026
  '2026-01-01': 'Tahun Baru 2026 Masehi',
  '2026-01-16': 'Isra Mi\'raj Nabi Muhammad SAW',
  '2026-02-17': 'Tahun Baru Imlek 2577 Kongzili',
  '2026-03-19': 'Hari Suci Nyepi (Tahun Baru Saka 1948)',
  '2026-03-20': 'Hari Raya Idul Fitri 1447 H (Hari 1)',
  '2026-03-21': 'Hari Raya Idul Fitri 1447 H (Hari 2)',
  '2026-04-03': 'Wafat Yesus Kristus',
  '2026-04-05': 'Kebangkitan Yesus Kristus (Paskah)',
  '2026-05-01': 'Hari Buruh Internasional',
  '2026-05-14': 'Kenaikan Yesus Kristus',
  '2026-05-31': 'Hari Raya Waisak 2570 BE',
  '2026-06-01': 'Hari Lahir Pancasila',
  '2026-05-27': 'Hari Raya Idul Adha 1447 H',
  '2026-06-16': '1 Muharam Tahun Baru Islam 1448 H',
  '2026-08-17': 'Hari Kemerdekaan',
  '2026-08-25': 'Maulid Nabi Muhammad SAW',
  '2026-12-25': 'Hari Raya Natal',

  // 2027
  '2027-01-01': 'Tahun Baru 2027 Masehi',
  '2027-02-06': 'Tahun Baru Imlek 2578 Kongzili',
  '2027-03-09': 'Hari Raya Idul Fitri 1448 H (Hari 1)',
  '2027-03-10': 'Hari Raya Idul Fitri 1448 H (Hari 2)',
  '2027-03-26': 'Wafat Yesus Kristus',
  '2027-05-01': 'Hari Buruh Internasional',
  '2027-05-06': 'Kenaikan Yesus Kristus',
  '2027-05-20': 'Hari Raya Waisak 2571 BE',
  '2027-06-01': 'Hari Lahir Pancasila',
  '2027-06-16': 'Hari Raya Idul Adha 1448 H',
  '2027-07-06': '1 Muharam Tahun Baru Islam 1449 H',
  '2027-08-17': 'Hari Kemerdekaan RI',
  '2027-09-14': 'Maulid Nabi Muhammad SAW',
  '2027-12-25': 'Hari Raya Natal'
};

const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function getHolidayInfo(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  const key = `${y}-${m}-${d}`;
  return HOLIDAYS_DB[key] || null;
}

/**
 * Generates overtime dates for a given month range with weekend and holiday filter
 */
export function generateOvertimeEntries({
  startDateStr, // 'YYYY-MM-DD'
  endDateStr,   // 'YYYY-MM-DD'
  includeSaturday = true,
  includeSunday = true,
  includeHolidays = true,
  keterangan = 'Support RSCM',
  waktu = '09.00 - 17.00',
  hariCount = 1,
  jamCount = 8
}) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return [];
  }

  const entries = [];
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay(); // 0 = Minggu, 6 = Sabtu
    const isSaturday = dayOfWeek === 6;
    const isSunday = dayOfWeek === 0;
    const holidayName = getHolidayInfo(current);
    const isHoliday = !!holidayName;

    // Check if this date qualifies
    const shouldInclude = 
      (includeSaturday && isSaturday) ||
      (includeSunday && isSunday) ||
      (includeHolidays && isHoliday);

    if (shouldInclude) {
      const dd = String(current.getDate()).padStart(2, '0');
      const mm = String(current.getMonth() + 1).padStart(2, '0');
      const yyyy = current.getFullYear();
      const formattedTanggal = `${dd}/${mm}/${yyyy}`;

      let dayLabel = INDONESIAN_DAYS[dayOfWeek];
      if (isHoliday) {
        dayLabel = `${dayLabel} (${holidayName})`;
      }

      entries.push({
        id: `l-${Date.now()}-${entries.length}`,
        tanggal: formattedTanggal,
        hari: dayLabel,
        keterangan: keterangan || 'Support RSCM',
        waktu: waktu || '09.00 - 17.00',
        hariCount: Number(hariCount) || 1,
        jamCount: Number(jamCount) || 8,
        hodApproved: true,
        isHoliday,
        isWeekend: isSaturday || isSunday
      });
    }

    // Move to next day
    current.setDate(current.getDate() + 1);
  }

  return entries;
}
