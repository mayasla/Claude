import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { parseCSV } from '../utils/csvParser';
import { useApp } from '../context/AppContext';

export default function CSVUpload() {
  const { dispatch } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState(null);
  const fileRef = useRef();

  async function handleFile(file) {
    if (!file) return;
    setStatus({ type: 'loading', message: 'Parsing CSV...' });
    try {
      const { transactions, rowCount } = await parseCSV(file);
      if (transactions.length === 0) {
        setStatus({ type: 'error', message: 'No valid transactions found. Check your CSV format.' });
        return;
      }
      dispatch({ type: 'IMPORT_TRANSACTIONS', payload: transactions });
      setStatus({
        type: 'success',
        message: `Imported ${transactions.length} transactions from ${rowCount} rows.`,
      });
      setTimeout(() => setStatus(null), 4000);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div className="csv-upload">
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.tsv,.txt"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />
        <Upload size={32} strokeWidth={1.5} />
        <p className="drop-zone-title">Drop your CSV file here</p>
        <p className="drop-zone-subtitle">or click to browse</p>
        <p className="drop-zone-hint">
          Supports most bank/finance CSV exports with columns like Date, Description, Amount
        </p>
      </div>

      {status && (
        <div className={`upload-status ${status.type}`}>
          {status.type === 'error' && <AlertCircle size={16} />}
          {status.type === 'success' && <CheckCircle2 size={16} />}
          {status.type === 'loading' && <FileText size={16} />}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );
}
