export const DEFAULT_CATEGORIES = [
  { id: 'food', name: 'Food & Dining', icon: 'UtensilsCrossed', color: '#FF6B6B', type: 'expense' },
  { id: 'transport', name: 'Transport', icon: 'Car', color: '#4ECDC4', type: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#45B7D1', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Film', color: '#96CEB4', type: 'expense' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'Receipt', color: '#FFEAA7', type: 'expense' },
  { id: 'health', name: 'Health', icon: 'Heart', color: '#DDA0DD', type: 'expense' },
  { id: 'education', name: 'Education', icon: 'GraduationCap', color: '#98D8C8', type: 'expense' },
  { id: 'housing', name: 'Housing', icon: 'Home', color: '#F7DC6F', type: 'expense' },
  { id: 'insurance', name: 'Insurance', icon: 'Shield', color: '#BB8FCE', type: 'expense' },
  { id: 'personal', name: 'Personal Care', icon: 'User', color: '#F0B27A', type: 'expense' },
  { id: 'gifts', name: 'Gifts & Donations', icon: 'Gift', color: '#F1948A', type: 'expense' },
  { id: 'travel', name: 'Travel', icon: 'Plane', color: '#7FB3D8', type: 'expense' },
  { id: 'subscriptions', name: 'Subscriptions', icon: 'CreditCard', color: '#C39BD3', type: 'expense' },
  { id: 'other_expense', name: 'Other Expense', icon: 'MoreHorizontal', color: '#AEB6BF', type: 'expense' },
  { id: 'salary', name: 'Salary', icon: 'Briefcase', color: '#2ECC71', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: 'Laptop', color: '#27AE60', type: 'income' },
  { id: 'investments', name: 'Investments', icon: 'TrendingUp', color: '#1ABC9C', type: 'income' },
  { id: 'rental', name: 'Rental Income', icon: 'Building', color: '#16A085', type: 'income' },
  { id: 'refunds', name: 'Refunds', icon: 'RotateCcw', color: '#48C9B0', type: 'income' },
  { id: 'other_income', name: 'Other Income', icon: 'Plus', color: '#82E0AA', type: 'income' },
];

export const CATEGORY_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#F0B27A',
  '#F1948A', '#7FB3D8', '#C39BD3', '#AEB6BF', '#2ECC71',
  '#27AE60', '#1ABC9C', '#16A085', '#48C9B0', '#82E0AA',
  '#E74C3C', '#3498DB', '#9B59B6', '#E67E22', '#1ABC9C',
];

export function guessCategory(description, amount) {
  const desc = (description || '').toLowerCase();
  const isIncome = amount > 0;

  if (isIncome) {
    if (desc.match(/salary|payroll|wage/)) return 'salary';
    if (desc.match(/freelance|contract|consult/)) return 'freelance';
    if (desc.match(/dividend|interest|invest|stock/)) return 'investments';
    if (desc.match(/rent|tenant|lease/)) return 'rental';
    if (desc.match(/refund|return|reimburse/)) return 'refunds';
    return 'other_income';
  }

  if (desc.match(/restaurant|food|grocery|cafe|coffee|lunch|dinner|breakfast|uber eats|doordash|grubhub|mcdonald|starbucks|pizza/)) return 'food';
  if (desc.match(/uber|lyft|gas|fuel|parking|taxi|transit|metro|bus|train|toll/)) return 'transport';
  if (desc.match(/amazon|walmart|target|shop|store|mall|ebay|etsy/)) return 'shopping';
  if (desc.match(/netflix|spotify|movie|cinema|game|concert|hulu|disney/)) return 'entertainment';
  if (desc.match(/electric|water|internet|phone|mobile|utility|verizon|comcast|att/)) return 'bills';
  if (desc.match(/doctor|hospital|pharmacy|medical|dental|health|cvs|walgreen/)) return 'health';
  if (desc.match(/tuition|school|course|book|university|college|udemy/)) return 'education';
  if (desc.match(/rent|mortgage|hoa|maintenance|repair|home/)) return 'housing';
  if (desc.match(/insurance|premium|coverage|policy/)) return 'insurance';
  if (desc.match(/hair|salon|spa|gym|fitness|beauty/)) return 'personal';
  if (desc.match(/gift|donat|charity|church/)) return 'gifts';
  if (desc.match(/flight|hotel|airbnb|travel|vacation|booking/)) return 'travel';
  if (desc.match(/subscription|membership|annual|monthly fee/)) return 'subscriptions';
  return 'other_expense';
}
