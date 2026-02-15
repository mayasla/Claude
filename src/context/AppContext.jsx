import { createContext, useContext, useReducer, useEffect } from 'react';
import { DEFAULT_CATEGORIES } from '../utils/categories';

const AppContext = createContext(null);

const STORAGE_KEY = 'expense-tracker-data';

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        transactions: parsed.transactions || [],
        categories: parsed.categories || DEFAULT_CATEGORIES,
        currency: parsed.currency || 'USD',
      };
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return {
    transactions: [],
    categories: DEFAULT_CATEGORIES,
    currency: 'USD',
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'IMPORT_TRANSACTIONS': {
      const existingIds = new Set(state.transactions.map(t => `${t.date}-${t.amount}-${t.description}`));
      const newTxns = action.payload.filter(
        t => !existingIds.has(`${t.date}-${t.amount}-${t.description}`)
      );
      return { ...state, transactions: [...newTxns, ...state.transactions] };
    }
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        ),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
      };
    case 'BATCH_DELETE_TRANSACTIONS':
      return {
        ...state,
        transactions: state.transactions.filter(t => !action.payload.includes(t.id)),
      };
    case 'BATCH_REVIEW_TRANSACTIONS':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          action.payload.ids.includes(t.id) ? { ...t, reviewed: action.payload.reviewed } : t
        ),
      };
    case 'BATCH_UPDATE_CATEGORY':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          action.payload.ids.includes(t.id) ? { ...t, category: action.payload.category } : t
        ),
      };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c
        ),
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== action.payload),
        transactions: state.transactions.map(t =>
          t.category === action.payload ? { ...t, category: t.amount > 0 ? 'other_income' : 'other_expense' } : t
        ),
      };
    case 'SET_CURRENCY':
      return { ...state, currency: action.payload };
    case 'CLEAR_ALL':
      return { transactions: [], categories: DEFAULT_CATEGORIES, currency: 'USD' };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
