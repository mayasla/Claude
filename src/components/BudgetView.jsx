import { useMemo, useState } from 'react';
import { parseISO, format, startOfMonth, endOfMonth } from 'date-fns';
import { useApp } from '../context/AppContext';
import { formatCurrency, getAvailableMonths, getMonthLabel } from '../utils/formatters';
import Icon from './Icon';

export default function BudgetView() {
  const { state } = useApp();
  const { transactions, categories, currency } = state;
  const months = useMemo(() => getAvailableMonths(transactions), [transactions]);
  const [selectedMonth, setSelectedMonth] = useState(months[0] || '');
  const [compareMonth, setCompareMonth] = useState(months[1] || '');

  function getTxnsForMonth(ym) {
    if (!ym) return [];
    const [y, m] = ym.split('-').map(Number);
    const start = startOfMonth(new Date(y, m - 1));
    const end = endOfMonth(new Date(y, m - 1));
    return transactions.filter(t => {
      const d = parseISO(t.date);
      return d >= start && d <= end;
    });
  }

  const currentTxns = useMemo(() => getTxnsForMonth(selectedMonth), [selectedMonth, transactions]);
  const compareTxns = useMemo(() => getTxnsForMonth(compareMonth), [compareMonth, transactions]);

  const comparison = useMemo(() => {
    const catMap = {};
    const expenseCats = categories.filter(c => c.type === 'expense');

    expenseCats.forEach(cat => {
      const current = currentTxns
        .filter(t => t.category === cat.id && t.amount < 0)
        .reduce((s, t) => s + Math.abs(t.amount), 0);
      const compare = compareTxns
        .filter(t => t.category === cat.id && t.amount < 0)
        .reduce((s, t) => s + Math.abs(t.amount), 0);

      if (current > 0 || compare > 0) {
        catMap[cat.id] = { ...cat, current, compare, diff: current - compare };
      }
    });

    return Object.values(catMap).sort((a, b) => b.current - a.current);
  }, [currentTxns, compareTxns, categories]);

  const totalCurrent = comparison.reduce((s, c) => s + c.current, 0);
  const totalCompare = comparison.reduce((s, c) => s + c.compare, 0);

  if (transactions.length === 0) {
    return <div className="empty-state"><p>Upload transactions to compare spending across months.</p></div>;
  }

  return (
    <div className="budget-view">
      <div className="dash-header">
        <h2>Month Comparison</h2>
        <div className="month-selectors">
          <select className="month-select" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
            {months.map(m => <option key={m} value={m}>{getMonthLabel(m)}</option>)}
          </select>
          <span className="vs-label">vs</span>
          <select className="month-select" value={compareMonth} onChange={e => setCompareMonth(e.target.value)}>
            <option value="">None</option>
            {months.map(m => <option key={m} value={m}>{getMonthLabel(m)}</option>)}
          </select>
        </div>
      </div>

      <div className="comparison-table">
        <div className="comp-header">
          <span>Category</span>
          <span className="text-right">{selectedMonth ? getMonthLabel(selectedMonth).split(' ')[0] : 'Current'}</span>
          {compareMonth && <span className="text-right">{getMonthLabel(compareMonth).split(' ')[0]}</span>}
          {compareMonth && <span className="text-right">Change</span>}
        </div>
        {comparison.map(c => {
          const pct = c.compare > 0 ? ((c.diff / c.compare) * 100) : 0;
          const max = Math.max(c.current, c.compare, 1);
          return (
            <div key={c.id} className="comp-row">
              <div className="comp-cat">
                <span className="color-swatch small" style={{ backgroundColor: c.color }}>
                  <Icon name={c.icon} size={12} color="#fff" />
                </span>
                <span>{c.name}</span>
              </div>
              <div className="comp-amount">
                <div className="comp-bar-wrapper">
                  <div className="comp-bar current" style={{ width: `${(c.current / max) * 100}%`, backgroundColor: c.color }} />
                </div>
                <span>{formatCurrency(c.current, currency)}</span>
              </div>
              {compareMonth && (
                <div className="comp-amount">
                  <div className="comp-bar-wrapper">
                    <div className="comp-bar compare" style={{ width: `${(c.compare / max) * 100}%`, backgroundColor: c.color + '66' }} />
                  </div>
                  <span>{formatCurrency(c.compare, currency)}</span>
                </div>
              )}
              {compareMonth && (
                <div className={`comp-change ${c.diff > 0 ? 'up' : c.diff < 0 ? 'down' : ''}`}>
                  {c.diff > 0 ? '+' : ''}{formatCurrency(c.diff, currency)}
                  {c.compare > 0 && <small> ({pct > 0 ? '+' : ''}{pct.toFixed(0)}%)</small>}
                </div>
              )}
            </div>
          );
        })}
        <div className="comp-row total">
          <div className="comp-cat"><strong>Total</strong></div>
          <div className="comp-amount"><strong>{formatCurrency(totalCurrent, currency)}</strong></div>
          {compareMonth && <div className="comp-amount"><strong>{formatCurrency(totalCompare, currency)}</strong></div>}
          {compareMonth && (
            <div className={`comp-change ${totalCurrent - totalCompare > 0 ? 'up' : 'down'}`}>
              <strong>
                {totalCurrent - totalCompare > 0 ? '+' : ''}{formatCurrency(totalCurrent - totalCompare, currency)}
              </strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
