import { useState } from 'react';
import { Plus, Edit3, Trash2, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORY_COLORS } from '../utils/categories';
import Icon from './Icon';

const ICONS = [
  'UtensilsCrossed', 'Car', 'ShoppingBag', 'Film', 'Receipt', 'Heart',
  'GraduationCap', 'Home', 'Shield', 'User', 'Gift', 'Plane',
  'CreditCard', 'Briefcase', 'Laptop', 'TrendingUp', 'Building',
  'RotateCcw', 'Music', 'Dumbbell', 'Coffee', 'Wifi', 'Phone',
  'Monitor', 'Scissors', 'Package', 'Zap', 'Droplet', 'Sun', 'Moon',
];

export default function CategoryManager() {
  const { state, dispatch } = useApp();
  const { categories } = state;
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [adding, setAdding] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', icon: 'Circle', color: '#4ECDC4', type: 'expense' });
  const [showIconPicker, setShowIconPicker] = useState(false);

  const expenseCats = categories.filter(c => c.type === 'expense');
  const incomeCats = categories.filter(c => c.type === 'income');

  function startEdit(cat) {
    setEditId(cat.id);
    setEditData({ name: cat.name, icon: cat.icon, color: cat.color });
    setAdding(false);
  }

  function saveEdit() {
    if (!editData.name.trim()) return;
    dispatch({ type: 'UPDATE_CATEGORY', payload: { id: editId, updates: editData } });
    setEditId(null);
  }

  function addCategory() {
    if (!newCat.name.trim()) return;
    const id = newCat.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    dispatch({ type: 'ADD_CATEGORY', payload: { ...newCat, id } });
    setNewCat({ name: '', icon: 'Circle', color: '#4ECDC4', type: 'expense' });
    setAdding(false);
  }

  function deleteCategory(id) {
    const txCount = state.transactions.filter(t => t.category === id).length;
    if (txCount > 0) {
      if (!confirm(`This category has ${txCount} transactions. They will be moved to "Other". Continue?`)) return;
    }
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
  }

  function renderCategoryRow(cat) {
    const isEditing = editId === cat.id;
    const txCount = state.transactions.filter(t => t.category === cat.id).length;

    return (
      <div key={cat.id} className={`cat-manager-row ${isEditing ? 'editing' : ''}`}>
        {isEditing ? (
          <>
            <div className="cat-edit-row">
              <div
                className="color-swatch clickable"
                style={{ backgroundColor: editData.color }}
                onClick={() => setShowIconPicker(showIconPicker === cat.id ? false : cat.id)}
              >
                <Icon name={editData.icon} size={16} color="#fff" />
              </div>
              <input
                className="edit-input"
                value={editData.name}
                onChange={e => setEditData({ ...editData, name: e.target.value })}
                placeholder="Category name"
              />
              <button className="btn-icon save" onClick={saveEdit}><Check size={15} /></button>
              <button className="btn-icon cancel" onClick={() => { setEditId(null); setShowIconPicker(false); }}><X size={15} /></button>
            </div>
            {showIconPicker === cat.id && (
              <div className="picker-panel">
                <div className="icon-grid">
                  {ICONS.map(icon => (
                    <button
                      key={icon}
                      className={`icon-option ${editData.icon === icon ? 'selected' : ''}`}
                      onClick={() => setEditData({ ...editData, icon })}
                    >
                      <Icon name={icon} size={18} />
                    </button>
                  ))}
                </div>
                <div className="color-grid">
                  {CATEGORY_COLORS.map(color => (
                    <button
                      key={color}
                      className={`color-option ${editData.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditData({ ...editData, color })}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="color-swatch" style={{ backgroundColor: cat.color }}>
              <Icon name={cat.icon} size={16} color="#fff" />
            </div>
            <span className="cat-manager-name">{cat.name}</span>
            <span className="cat-tx-count">{txCount} txns</span>
            <button className="btn-icon" onClick={() => startEdit(cat)}><Edit3 size={15} /></button>
            <button className="btn-icon delete" onClick={() => deleteCategory(cat.id)}><Trash2 size={15} /></button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="category-manager">
      <div className="cm-header">
        <h2>Categories</h2>
        <button className="btn-primary" onClick={() => { setAdding(true); setEditId(null); }}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      {adding && (
        <div className="add-cat-form">
          <div className="cat-edit-row">
            <div
              className="color-swatch clickable"
              style={{ backgroundColor: newCat.color }}
              onClick={() => setShowIconPicker(showIconPicker === 'new' ? false : 'new')}
            >
              <Icon name={newCat.icon} size={16} color="#fff" />
            </div>
            <input
              className="edit-input"
              value={newCat.name}
              onChange={e => setNewCat({ ...newCat, name: e.target.value })}
              placeholder="New category name"
              autoFocus
            />
            <select
              className="edit-select type-select"
              value={newCat.type}
              onChange={e => setNewCat({ ...newCat, type: e.target.value })}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <button className="btn-icon save" onClick={addCategory}><Check size={15} /></button>
            <button className="btn-icon cancel" onClick={() => setAdding(false)}><X size={15} /></button>
          </div>
          {showIconPicker === 'new' && (
            <div className="picker-panel">
              <div className="icon-grid">
                {ICONS.map(icon => (
                  <button
                    key={icon}
                    className={`icon-option ${newCat.icon === icon ? 'selected' : ''}`}
                    onClick={() => setNewCat({ ...newCat, icon })}
                  >
                    <Icon name={icon} size={18} />
                  </button>
                ))}
              </div>
              <div className="color-grid">
                {CATEGORY_COLORS.map(color => (
                  <button
                    key={color}
                    className={`color-option ${newCat.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewCat({ ...newCat, color })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="cat-section">
        <h3>Expense Categories</h3>
        <div className="cat-list">
          {expenseCats.map(renderCategoryRow)}
        </div>
      </div>

      <div className="cat-section">
        <h3>Income Categories</h3>
        <div className="cat-list">
          {incomeCats.map(renderCategoryRow)}
        </div>
      </div>
    </div>
  );
}
