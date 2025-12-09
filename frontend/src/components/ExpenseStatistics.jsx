import { useMemo } from 'react';
import { formatCurrency } from '../utils/currency';

export default function ExpenseStatistics({ expenses, members, currencyCode = 'USD' }) {
  const stats = useMemo(() => {
    if (!expenses || expenses.length === 0) return null;

    // Total spent
    const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    // By category
    const byCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount);
      return acc;
    }, {});

    // By member (who paid)
    const byMember = expenses.reduce((acc, exp) => {
      const memberId = exp.paid_by_member_id;
      const memberName = exp.paid_by?.name || 'Unknown';
      if (!acc[memberId]) {
        acc[memberId] = { name: memberName, amount: 0, count: 0 };
      }
      acc[memberId].amount += parseFloat(exp.amount);
      acc[memberId].count += 1;
      return acc;
    }, {});

    // Top spenders
    const topSpenders = Object.values(byMember)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    // Most expensive category
    const topCategory = Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a)[0];

    // Average expense
    const avgExpense = totalSpent / expenses.length;

    // Recent trend (last 7 days vs previous 7 days)
    const now = new Date();
    const last7Days = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const daysDiff = (now - expDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });
    const prev7Days = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const daysDiff = (now - expDate) / (1000 * 60 * 60 * 24);
      return daysDiff > 7 && daysDiff <= 14;
    });

    const last7Total = last7Days.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const prev7Total = prev7Days.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const trend = prev7Total > 0 ? ((last7Total - prev7Total) / prev7Total) * 100 : 0;

    return {
      totalSpent,
      byCategory,
      topSpenders,
      topCategory,
      avgExpense,
      expenseCount: expenses.length,
      trend,
      last7Total
    };
  }, [expenses]);

  if (!stats) return null;

  const categoryColors = {
    food: { bg: 'bg-orange-500', light: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
    utilities: { bg: 'bg-blue-500', light: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    entertainment: { bg: 'bg-purple-500', light: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
    transportation: { bg: 'bg-green-500', light: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
    other: { bg: 'bg-gray-500', light: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400' },
  };

  const maxCategoryAmount = Math.max(...Object.values(stats.byCategory));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Statistics</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatCurrency(stats.totalSpent, currencyCode)}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">Avg Expense</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">{formatCurrency(stats.avgExpense, currencyCode)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.expenseCount}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
          <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-1">Last 7 Days</p>
          <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{formatCurrency(stats.last7Total, currencyCode)}</p>
          {stats.trend !== 0 && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${stats.trend > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {stats.trend > 0 ? '↑' : '↓'} {Math.abs(stats.trend).toFixed(1)}% vs prev week
            </p>
          )}
        </div>
      </div>

      {/* Spending by Category */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Spending by Category</h3>
        <div className="space-y-3">
          {Object.entries(stats.byCategory)
            .sort(([, a], [, b]) => b - a)
            .map(([category, amount]) => {
              const percentage = (amount / stats.totalSpent) * 100;
              const colors = categoryColors[category] || categoryColors.other;

              return (
                <div key={category} className="group">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{category}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(amount, currencyCode)} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors.bg} transition-all duration-500 group-hover:opacity-80`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Top Spenders */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Top Spenders</h3>
        <div className="space-y-2">
          {stats.topSpenders.map((spender, index) => {
            const medals = ['🥇', '🥈', '🥉'];
            return (
              <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{medals[index]}</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{spender.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{spender.count} expenses</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(spender.amount, currencyCode)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
