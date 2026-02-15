import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { parseCSV } from '../utils/csvParser';
import { useApp } from '../context/AppContext';

export default function CSVUpload() {
  const { dispatch } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState(null);
  const fileRef = useRef();

  async function handleFiles(files) {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    setStatus({ type: 'loading', message: `Parsing ${fileList.length} file${fileList.length > 1 ? 's' : ''}...` });

    let totalImported = 0;
    let totalRows = 0;
    const errors = [];

    for (const file of fileList) {
      try {
        const { transactions, rowCount } = await parseCSV(file);
        if (transactions.length === 0) {
          errors.push(`${file.name}: no valid transactions found`);
          continue;
        }
        dispatch({ type: 'IMPORT_TRANSACTIONS', payload: transactions });
        totalImported += transactions.length;
        totalRows += rowCount;
      } catch (err) {
        errors.push(`${file.name}: ${err.message}`);
      }
    }

    if (totalImported > 0 && errors.length === 0) {
      setStatus({
        type: 'success',
        message: `Imported ${totalImported} transactions from ${fileList.length} file${fileList.length > 1 ? 's' : ''} (${totalRows} rows).`,
      });
    } else if (totalImported > 0 && errors.length > 0) {
      setStatus({
        type: 'success',
        message: `Imported ${totalImported} transactions. ${errors.length} file${errors.length > 1 ? 's' : ''} had issues: ${errors.join('; ')}`,
      });
    } else {
      setStatus({ type: 'error', message: errors.join('; ') || 'No valid transactions found.' });
    }

    setTimeout(() => setStatus(null), 6000);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
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
          multiple
          style={{ display: 'none' }}
          onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
        />
        <Upload size={32} strokeWidth={1.5} />
        <p className="drop-zone-title">Drop your CSV files here</p>
        <p className="drop-zone-subtitle">or click to browse — select multiple files at once</p>
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
