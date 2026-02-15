import { useState } from 'react';
import { Trash2, Download, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK', 'INR', 'BRL', 'MXN'];

export default function Settings() {
  const { state, dispatch } = useApp();
  const [showConfirm, setShowConfirm] = useState(false);

  function exportCSV() {
    const header = 'Date,Description,Amount,Category,Reviewed,Account,Note\n';
    const rows = state.transactions.map(t => {
      const cat = state.categories.find(c => c.id === t.category)?.name || t.category;
      return `"${new Date(t.date).toLocaleDateString()}","${t.description.replace(/"/g, '""')}",${t.amount},"${cat}","${t.reviewed ? 'Yes' : 'No'}","${(t.account || '').replace(/"/g, '""')}","${(t.note || '').replace(/"/g, '""')}"`;
    });
    const blob = new Blob([header + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-tracker-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="settings">
      <h2>Settings</h2>

      <div className="settings-section">
        <h3>Currency</h3>
        <select
          className="month-select"
          value={state.currency}
          onChange={e => dispatch({ type: 'SET_CURRENCY', payload: e.target.value })}
        >
          {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="settings-section">
        <h3>Export Data</h3>
        <p>Download all transactions as a CSV file.</p>
        <button className="btn-primary" onClick={exportCSV} disabled={state.transactions.length === 0}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="settings-section danger">
        <h3>Danger Zone</h3>
        {!showConfirm ? (
          <button className="btn-danger" onClick={() => setShowConfirm(true)}>
            <Trash2 size={16} /> Clear All Data
          </button>
        ) : (
          <div className="confirm-box">
            <AlertTriangle size={20} />
            <p>This will permanently delete all transactions and reset categories. Are you sure?</p>
            <div className="confirm-actions">
              <button className="btn-danger" onClick={() => { dispatch({ type: 'CLEAR_ALL' }); setShowConfirm(false); }}>
                Yes, Delete Everything
              </button>
              <button className="btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3>About</h3>
        <p>Expense Tracker — inspired by Spendee. Built with React & Chart.js.</p>
        <p className="muted">Your data is stored locally in your browser. Nothing is sent to any server.</p>
      </div>
    </div>
  );
}
