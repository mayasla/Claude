import Papa from 'papaparse';
import { guessCategory } from './categories';

const COLUMN_MAPPINGS = {
  date: ['date', 'transaction date', 'trans date', 'posted date', 'booking date', 'value date', 'transaction_date'],
  description: ['description', 'memo', 'narration', 'details', 'transaction', 'merchant', 'payee', 'name', 'transaction description'],
  amount: ['amount', 'sum', 'value', 'transaction amount'],
  income: ['credit', 'income', 'deposit', 'credits', 'money in'],
  expense: ['debit', 'expense', 'withdrawal', 'debits', 'money out', 'charge'],
  category: ['category', 'type', 'category name', 'transaction type'],
};

function findColumn(headers, mappingKey) {
  const candidates = COLUMN_MAPPINGS[mappingKey];
  const normalized = headers.map(h => h.toLowerCase().trim());
  for (const candidate of candidates) {
    const idx = normalized.indexOf(candidate);
    if (idx !== -1) return headers[idx];
  }
  return null;
}

function parseAmount(value) {
  if (value == null || value === '') return null;
  const cleaned = String(value).replace(/[^0-9.\-+,]/g, '').replace(',', '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseDate(value) {
  if (!value) return null;
  const str = String(value).trim();

  // Try ISO format first
  let d = new Date(str);
  if (!isNaN(d.getTime())) return d;

  // Try DD/MM/YYYY or DD-MM-YYYY
  const dmy = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (dmy) {
    const year = dmy[3].length === 2 ? 2000 + parseInt(dmy[3]) : parseInt(dmy[3]);
    // Try both DD/MM and MM/DD - prefer DD/MM if day > 12
    if (parseInt(dmy[1]) > 12) {
      d = new Date(year, parseInt(dmy[2]) - 1, parseInt(dmy[1]));
    } else {
      d = new Date(year, parseInt(dmy[1]) - 1, parseInt(dmy[2]));
    }
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        try {
          const headers = results.meta.fields || [];
          const dateCol = findColumn(headers, 'date');
          const descCol = findColumn(headers, 'description');
          const amountCol = findColumn(headers, 'amount');
          const incomeCol = findColumn(headers, 'income');
          const expenseCol = findColumn(headers, 'expense');
          const categoryCol = findColumn(headers, 'category');

          if (!dateCol) {
            reject(new Error('Could not find a date column. Expected columns like: Date, Transaction Date, Posted Date'));
            return;
          }

          const transactions = [];
          for (let i = 0; i < results.data.length; i++) {
            const row = results.data[i];
            const date = parseDate(row[dateCol]);
            if (!date) continue;

            let amount;
            if (amountCol) {
              amount = parseAmount(row[amountCol]);
            } else if (incomeCol && expenseCol) {
              const credit = parseAmount(row[incomeCol]);
              const debit = parseAmount(row[expenseCol]);
              if (credit && credit !== 0) {
                amount = Math.abs(credit);
              } else if (debit && debit !== 0) {
                amount = -Math.abs(debit);
              }
            } else if (incomeCol) {
              amount = Math.abs(parseAmount(row[incomeCol]) || 0);
            } else if (expenseCol) {
              amount = -Math.abs(parseAmount(row[expenseCol]) || 0);
            }

            if (amount == null || amount === 0) continue;

            const description = row[descCol] || '';
            const existingCategory = categoryCol ? row[categoryCol]?.trim() : null;

            transactions.push({
              id: crypto.randomUUID(),
              date: date.toISOString(),
              description,
              amount,
              category: existingCategory || guessCategory(description, amount),
              originalCategory: existingCategory || null,
              note: '',
            });
          }

          transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
          resolve({ transactions, headers, rowCount: results.data.length });
        } catch (err) {
          reject(err);
        }
      },
      error(err) {
        reject(err);
      },
    });
  });
}
