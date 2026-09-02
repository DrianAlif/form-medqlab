/**
 * Indonesian Date & Period Utility Helpers
 * Computes exact month days, calendar ranges (e.g. 01/09/2026 - 30/09/2026),
 * and custom date ranges.
 */

export const INDO_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function getMonthPeriodInfo(yearMonthStr) {
  if (!yearMonthStr) return null;
  const [yStr, mStr] = yearMonthStr.split('-');
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  if (!year || !month) return null;

  const daysInMonth = new Date(year, month, 0).getDate();
  const pad = (n) => String(n).padStart(2, '0');

  const startDateStr = `01/${pad(month)}/${year}`;
  const endDateStr = `${pad(daysInMonth)}/${pad(month)}/${year}`;
  const monthName = INDO_MONTHS[month - 1] || '';

  return {
    year,
    month,
    daysInMonth,
    startDateStr,
    endDateStr,
    monthName,
    rangeFormatted: `${startDateStr} - ${endDateStr}`,
    periodeTitle: `1 - ${daysInMonth} ${monthName.toUpperCase()} ${year}`
  };
}

export function getCustomRangeInfo(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return null;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);

  const pad = (n) => String(n).padStart(2, '0');
  const sDay = pad(start.getDate());
  const sMonth = pad(start.getMonth() + 1);
  const sYear = start.getFullYear();

  const eDay = pad(end.getDate());
  const eMonth = pad(end.getMonth() + 1);
  const eYear = end.getFullYear();

  const sMonthName = INDO_MONTHS[start.getMonth()] || '';
  const eMonthName = INDO_MONTHS[end.getMonth()] || '';

  let readableTitle = `${sDay}/${sMonth}/${sYear} - ${eDay}/${eMonth}/${eYear}`;
  if (sYear === eYear && sMonth === eMonth) {
    readableTitle = `${parseInt(sDay, 10)} - ${parseInt(eDay, 10)} ${sMonthName.toUpperCase()} ${sYear}`;
  } else if (sYear === eYear) {
    readableTitle = `${parseInt(sDay, 10)} ${sMonthName} - ${parseInt(eDay, 10)} ${eMonthName} ${sYear}`;
  }

  return {
    daysCount: diffDays,
    rangeFormatted: `${sDay}/${sMonth}/${sYear} - ${eDay}/${eMonth}/${eYear}`,
    periodeTitle: readableTitle
  };
}
