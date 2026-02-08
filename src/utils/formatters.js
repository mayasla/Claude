import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval, subMonths } from 'date-fns';

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));
}

export function formatDate(dateStr) {
  return format(parseISO(dateStr), 'MMM d, yyyy');
}

export function formatMonth(dateStr) {
  return format(parseISO(dateStr), 'MMM yyyy');
}

export function getMonthRange(date) {
  return { start: startOfMonth(date), end: endOfMonth(date) };
}

export function getWeekRange(date) {
  return { start: startOfWeek(date), end: endOfWeek(date) };
}

export function filterByDateRange(transactions, start, end) {
  return transactions.filter(t => {
    const d = parseISO(t.date);
    return isWithinInterval(d, { start, end });
  });
}

export function getAvailableMonths(transactions) {
  const months = new Set();
  transactions.forEach(t => {
    months.add(format(parseISO(t.date), 'yyyy-MM'));
  });
  return Array.from(months).sort().reverse();
}

export function getMonthLabel(yyyymm) {
  const [year, month] = yyyymm.split('-');
  return format(new Date(parseInt(year), parseInt(month) - 1), 'MMMM yyyy');
}

export function getLast6Months() {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(new Date(), i);
    months.push(format(d, 'yyyy-MM'));
  }
  return months;
}
