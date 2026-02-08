import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import CSVUpload from './components/CSVUpload';
import CategoryManager from './components/CategoryManager';
import BudgetView from './components/BudgetView';
import Settings from './components/Settings';
import { LayoutDashboard, List, Upload, Tags, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import './App.css';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: List },
  { id: 'upload', label: 'Import', icon: Upload },
  { id: 'compare', label: 'Compare', icon: BarChart3 },
  { id: 'categories', label: 'Categories', icon: Tags },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

function AppContent() {
  const [tab, setTab] = useState('dashboard');

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="logo">
          <div className="logo-icon">$</div>
          <span className="logo-text">SpendWise</span>
        </div>
        <ul className="nav-list">
          {TABS.map(t => {
            const TabIcon = t.icon;
            return (
              <li key={t.id}>
                <button
                  className={`nav-btn ${tab === t.id ? 'active' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  <TabIcon size={18} />
                  <span>{t.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav className="mobile-nav">
        {TABS.slice(0, 5).map(t => {
          const TabIcon = t.icon;
          return (
            <button
              key={t.id}
              className={`mobile-nav-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <TabIcon size={20} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>

      <main className="main-content">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'transactions' && <TransactionList />}
        {tab === 'upload' && <CSVUpload />}
        {tab === 'compare' && <BudgetView />}
        {tab === 'categories' && <CategoryManager />}
        {tab === 'settings' && <Settings />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
