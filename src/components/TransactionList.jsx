import { useState, useMemo } from 'react';
import { Search, Edit3, Trash2, Check, X, ChevronDown, ChevronUp, ArrowUpDown, CheckCircle2, Circle, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import Icon from './Icon';

export default function TransactionList({ filteredTransactions }) {
  const { state, dispatch } = useApp();
  const { categories } = state;
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);
  const [filterReviewed, setFilterReviewed] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const PAGE_SIZE = 50;

  const transactions = filteredTransactions || state.transactions;

  const accounts = useMemo(() => {
    const set = new Set(transactions.map(t => t.account).filter(Boolean));
    return Array.from(set).sort();
  }, [transactions]);

  const reviewStats = useMemo(() => {
    const reviewed = transactions.filter(t => t.reviewed).length;
    return { reviewed, pending: transactions.length - reviewed, total: transactions.length };
  }, [transactions]);

  const displayed = useMemo(() => {
    let list = transactions;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.description.toLowerCase().includes(q) ||
        (categories.find(c => c.id === t.category)?.name || '').toLowerCase().includes(q) ||
        (t.account || '').toLowerCase().includes(q) ||
        (t.csvCategory || '').toLowerCase().includes(q)
      );
    }
    if (filterReviewed === 'reviewed') list = list.filter(t => t.reviewed);
    else if (filterReviewed === 'pending') list = list.filter(t => !t.reviewed);
    if (filterAccount !== 'all') list = list.filter(t => t.account === filterAccount);

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') cmp = new Date(a.date) - new Date(b.date);
      else if (sortField === 'amount') cmp = a.amount - b.amount;
      else if (sortField === 'description') cmp = a.description.localeCompare(b.description);
      else if (sortField === 'category') cmp = (a.category || '').localeCompare(b.category || '');
      else if (sortField === 'account') cmp = (a.account || '').localeCompare(b.account || '');
      else if (sortField === 'reviewed') cmp = (a.reviewed ? 1 : 0) - (b.reviewed ? 1 : 0);
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return list;
  }, [transactions, search, sortField, sortDir, categories, filterReviewed, filterAccount]);

  const paged = displayed.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(displayed.length / PAGE_SIZE);

  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  }

  function startEdit(t) {
    setEditId(t.id);
    setEditData({ description: t.description, category: t.category, note: t.note || '' });
  }

  function saveEdit() {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: { id: editId, updates: { ...editData, reviewed: true } } });
    setEditId(null);
  }

  function toggleReviewed(t) {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: { id: t.id, updates: { reviewed: !t.reviewed } } });
  }

  function getCat(id) {
    return categories.find(c => c.id === id) || { name: id, color: '#999', icon: 'Circle' };
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="sort-icon muted" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="sort-icon" /> : <ChevronDown size={12} className="sort-icon" />;
  };

  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <p>No transactions yet. Upload a CSV to get started.</p>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      <div className="list-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search transactions, accounts, categories..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        <span className="tx-count">{displayed.length} transactions</span>
      </div>

      <div className="filter-bar">
        <div className="review-summary">
          <span className="review-done">{reviewStats.reviewed} reviewed</span>
          <span className="review-sep">/</span>
          <span className="review-pending">{reviewStats.pending} pending</span>
        </div>
        <div className="filter-controls">
          <select
            className="filter-select"
            value={filterReviewed}
            onChange={e => { setFilterReviewed(e.target.value); setPage(0); }}
          >
            <option value="all">All status</option>
            <option value="reviewed">Reviewed only</option>
            <option value="pending">Pending review</option>
          </select>
          {accounts.length > 1 && (
            <select
              className="filter-select"
              value={filterAccount}
              onChange={e => { setFilterAccount(e.target.value); setPage(0); }}
            >
              <option value="all">All accounts</option>
              {accounts.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          )}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="tx-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('reviewed')} className="review-col" title="Reviewed">
                <CheckCircle2 size={14} /> <SortIcon field="reviewed" />
              </th>
              <th onClick={() => toggleSort('date')}>Date <SortIcon field="date" /></th>
              <th onClick={() => toggleSort('description')}>Description <SortIcon field="description" /></th>
              <th onClick={() => toggleSort('category')}>Category <SortIcon field="category" /></th>
              <th className="csv-cat-col">CSV Category</th>
              <th onClick={() => toggleSort('account')}>Account <SortIcon field="account" /></th>
              <th onClick={() => toggleSort('amount')} className="text-right">Amount <SortIcon field="amount" /></th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(t => {
              const cat = getCat(t.category);
              const isEditing = editId === t.id;
              return (
                <tr key={t.id} className={isEditing ? 'editing' : ''}>
                  <td className="review-cell">
                    <button
                      className={`review-btn ${t.reviewed ? 'is-reviewed' : ''}`}
                      onClick={() => toggleReviewed(t)}
                      title={t.reviewed ? 'Reviewed — click to mark as pending' : 'Pending — click to mark as reviewed'}
                    >
                      {t.reviewed
                        ? <CheckCircle2 size={18} />
                        : <Circle size={18} />
                      }
                    </button>
                  </td>
                  <td className="date-cell">{formatDate(t.date)}</td>
                  <td className="desc-cell">
                    {isEditing ? (
                      <input
                        className="edit-input"
                        value={editData.description}
                        onChange={e => setEditData({ ...editData, description: e.target.value })}
                      />
                    ) : (
                      <span title={t.description}>{t.description}</span>
                    )}
                  </td>
                  <td className="cat-cell">
                    {isEditing ? (
                      <select
                        className="edit-select"
                        value={editData.category}
                        onChange={e => setEditData({ ...editData, category: e.target.value })}
                      >
                        <optgroup label="Expenses">
                          {categories.filter(c => c.type === 'expense').map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Income">
                          {categories.filter(c => c.type === 'income').map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </optgroup>
                      </select>
                    ) : (
                      <span className="category-badge" style={{ backgroundColor: cat.color + '22', color: cat.color, borderColor: cat.color + '44' }}>
                        <Icon name={cat.icon} size={13} />
                        {cat.name}
                      </span>
                    )}
                  </td>
                  <td className="csv-cat-cell">
                    {t.csvCategory ? (
                      <span className="csv-cat-tag">{t.csvCategory}</span>
                    ) : (
                      <span className="csv-cat-auto">auto</span>
                    )}
                  </td>
                  <td className="account-cell">
                    <span className="account-tag">{t.account || '—'}</span>
                  </td>
                  <td className={`amount-cell ${t.amount > 0 ? 'income' : 'expense'}`}>
                    {t.amount > 0 ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  <td className="actions-cell">
                    {isEditing ? (
                      <>
                        <button className="btn-icon save" onClick={saveEdit} title="Save & mark reviewed"><Check size={15} /></button>
                        <button className="btn-icon cancel" onClick={() => setEditId(null)} title="Cancel"><X size={15} /></button>
                      </>
                    ) : (
                      <>
                        <button className="btn-icon" onClick={() => startEdit(t)} title="Edit"><Edit3 size={15} /></button>
                        <button className="btn-icon delete" onClick={() => dispatch({ type: 'DELETE_TRANSACTION', payload: t.id })} title="Delete"><Trash2 size={15} /></button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span>Page {page + 1} of {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
