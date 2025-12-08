import { useNavigate } from 'react-router-dom';

export default function ExpenseCard({ expense }) {
  const navigate = useNavigate();

  const categoryConfig = {
    food: { 
      bg: 'bg-orange-100 dark:bg-orange-900/30', 
      text: 'text-orange-800 dark:text-orange-300',
      icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
    },
    utilities: { 
      bg: 'bg-blue-100 dark:bg-blue-900/30', 
      text: 'text-blue-800 dark:text-blue-300',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z'
    },
    entertainment: { 
      bg: 'bg-purple-100 dark:bg-purple-900/30', 
      text: 'text-purple-800 dark:text-purple-300',
      icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    transportation: { 
      bg: 'bg-green-100 dark:bg-green-900/30', 
      text: 'text-green-800 dark:text-green-300',
      icon: 'M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2'
    },
    other: { 
      bg: 'bg-gray-100 dark:bg-gray-700', 
      text: 'text-gray-800 dark:text-gray-300',
      icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6'
    },
  };

  const config = categoryConfig[expense.category] || categoryConfig.other;

  return (
    <div
      onClick={() => navigate(`/expenses/${expense.id}`)}
      className="group border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white dark:bg-gray-800 hover:scale-[1.02] hover:-translate-y-1"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${config.bg}`}>
              <svg className={`w-5 h-5 ${config.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {expense.description}
              </h3>
              <span className={`inline-block text-xs px-2 py-1 rounded-full ${config.bg} ${config.text} font-medium mt-1`}>
                {expense.category}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="truncate">{expense.paid_by?.name || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-500 text-xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{new Date(expense.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            ${parseFloat(expense.amount).toFixed(2)}
          </p>
          <div className="flex items-center justify-end gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{expense.splits?.length || 0} splits</span>
          </div>
        </div>
      </div>
    </div>
  );
}
