import { useMemo, useState } from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { parseISO, format, startOfMonth, endOfMonth } from 'date-fns';
import { useApp } from '../context/AppContext';
import { formatCurrency, getAvailableMonths, getMonthLabel } from '../utils/formatters';
import { TrendingDown, TrendingUp, Wallet, ArrowDownUp } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyleWidth: 10, font: { size: 12 } } },
  },
};

const barOptions = {
  ...chartOptions,
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { callback: v => '$' + v.toLocaleString() } },
  },
  plugins: {
    ...chartOptions.plugins,
    legend: { display: false },
  },
};

const lineOptions = {
  ...chartOptions,
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { callback: v => '$' + v.toLocaleString() } },
  },
  elements: { line: { tension: 0.3 }, point: { radius: 4, hoverRadius: 6 } },
};

export default function Dashboard() {
  const { state } = useApp();
  const { transactions, categories, currency } = state;
  const months = useMemo(() => getAvailableMonths(transactions), [transactions]);
  const [selectedMonth, setSelectedMonth] = useState(months[0] || '');

  const monthTxns = useMemo(() => {
    if (!selectedMonth) return [];
    const [y, m] = selectedMonth.split('-').map(Number);
    const start = startOfMonth(new Date(y, m - 1));
    const end = endOfMonth(new Date(y, m - 1));
    return transactions.filter(t => {
      const d = parseISO(t.date);
      return d >= start && d <= end;
    });
  }, [transactions, selectedMonth]);

  const stats = useMemo(() => {
    const income = monthTxns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const expenses = monthTxns.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    return { income, expenses, balance: income - expenses, count: monthTxns.length };
  }, [monthTxns]);

  const expenseByCat = useMemo(() => {
    const map = {};
    monthTxns.filter(t => t.amount < 0).forEach(t => {
      map[t.category] = (map[t.category] || 0) + Math.abs(t.amount);
    });
    return Object.entries(map)
      .map(([id, total]) => {
        const cat = categories.find(c => c.id === id) || { name: id, color: '#999' };
        return { id, name: cat.name, color: cat.color, total };
      })
      .sort((a, b) => b.total - a.total);
  }, [monthTxns, categories]);

  const incomeByCat = useMemo(() => {
    const map = {};
    monthTxns.filter(t => t.amount > 0).forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([id, total]) => {
        const cat = categories.find(c => c.id === id) || { name: id, color: '#999' };
        return { id, name: cat.name, color: cat.color, total };
      })
      .sort((a, b) => b.total - a.total);
  }, [monthTxns, categories]);

  const monthlyTrend = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      const m = format(parseISO(t.date), 'yyyy-MM');
      if (!map[m]) map[m] = { income: 0, expenses: 0 };
      if (t.amount > 0) map[m].income += t.amount;
      else map[m].expenses += Math.abs(t.amount);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-12);
  }, [transactions]);

  const donutData = (items) => ({
    labels: items.map(i => i.name),
    datasets: [{
      data: items.map(i => i.total),
      backgroundColor: items.map(i => i.color),
      borderColor: items.map(i => i.color + '88'),
      borderWidth: 2,
      hoverOffset: 6,
    }],
  });

  const trendData = {
    labels: monthlyTrend.map(([m]) => getMonthLabel(m).replace(/\s\d{4}$/, '')),
    datasets: [
      {
        label: 'Income',
        data: monthlyTrend.map(([, v]) => v.income),
        borderColor: '#2ECC71',
        backgroundColor: 'rgba(46,204,113,0.1)',
        fill: true,
      },
      {
        label: 'Expenses',
        data: monthlyTrend.map(([, v]) => v.expenses),
        borderColor: '#FF6B6B',
        backgroundColor: 'rgba(255,107,107,0.1)',
        fill: true,
      },
    ],
  };

  const topExpensesBar = {
    labels: expenseByCat.slice(0, 8).map(i => i.name),
    datasets: [{
      data: expenseByCat.slice(0, 8).map(i => i.total),
      backgroundColor: expenseByCat.slice(0, 8).map(i => i.color),
      borderRadius: 6,
      barThickness: 28,
    }],
  };

  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <Wallet size={48} strokeWidth={1} />
        <h3>Welcome to your Expense Tracker</h3>
        <p>Upload a CSV file to see your spending dashboard</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dash-header">
        <h2>Dashboard</h2>
        <select
          className="month-select"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
        >
          {months.map(m => (
            <option key={m} value={m}>{getMonthLabel(m)}</option>
          ))}
        </select>
      </div>

      <div className="stat-cards">
        <div className="stat-card income">
          <div className="stat-icon"><TrendingUp size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Income</span>
            <span className="stat-value">{formatCurrency(stats.income, currency)}</span>
          </div>
        </div>
        <div className="stat-card expense">
          <div className="stat-icon"><TrendingDown size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Expenses</span>
            <span className="stat-value">{formatCurrency(stats.expenses, currency)}</span>
          </div>
        </div>
        <div className="stat-card balance">
          <div className="stat-icon"><ArrowDownUp size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Balance</span>
            <span className={`stat-value ${stats.balance >= 0 ? 'positive' : 'negative'}`}>
              {stats.balance >= 0 ? '+' : '-'}{formatCurrency(stats.balance, currency)}
            </span>
          </div>
        </div>
        <div className="stat-card count">
          <div className="stat-icon"><Wallet size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Transactions</span>
            <span className="stat-value">{stats.count}</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        {expenseByCat.length > 0 && (
          <div className="chart-card">
            <h3>Expenses by Category</h3>
            <div className="chart-container donut-chart">
              <Doughnut data={donutData(expenseByCat)} options={{
                ...chartOptions,
                cutout: '65%',
                plugins: {
                  ...chartOptions.plugins,
                  tooltip: {
                    callbacks: { label: ctx => ` ${ctx.label}: $${ctx.parsed.toLocaleString(undefined, { minimumFractionDigits: 2 })}` }
                  }
                }
              }} />
            </div>
            <div className="category-breakdown">
              {expenseByCat.map(c => (
                <div key={c.id} className="cat-row">
                  <span className="cat-dot" style={{ backgroundColor: c.color }} />
                  <span className="cat-name">{c.name}</span>
                  <span className="cat-amount">-{formatCurrency(c.total, currency)}</span>
                  <span className="cat-pct">
                    {((c.total / stats.expenses) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {incomeByCat.length > 0 && (
          <div className="chart-card">
            <h3>Income by Category</h3>
            <div className="chart-container donut-chart">
              <Doughnut data={donutData(incomeByCat)} options={{
                ...chartOptions,
                cutout: '65%',
                plugins: {
                  ...chartOptions.plugins,
                  tooltip: {
                    callbacks: { label: ctx => ` ${ctx.label}: $${ctx.parsed.toLocaleString(undefined, { minimumFractionDigits: 2 })}` }
                  }
                }
              }} />
            </div>
            <div className="category-breakdown">
              {incomeByCat.map(c => (
                <div key={c.id} className="cat-row">
                  <span className="cat-dot" style={{ backgroundColor: c.color }} />
                  <span className="cat-name">{c.name}</span>
                  <span className="cat-amount">+{formatCurrency(c.total, currency)}</span>
                  <span className="cat-pct">
                    {((c.total / stats.income) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {expenseByCat.length > 0 && (
          <div className="chart-card wide">
            <h3>Top Spending Categories</h3>
            <div className="chart-container bar-chart">
              <Bar data={topExpensesBar} options={barOptions} />
            </div>
          </div>
        )}

        {monthlyTrend.length > 1 && (
          <div className="chart-card wide">
            <h3>Monthly Trend</h3>
            <div className="chart-container line-chart">
              <Line data={trendData} options={lineOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
