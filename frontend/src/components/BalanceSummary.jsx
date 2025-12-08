export default function BalanceSummary({ balances, onSettle, onExport }) {
  const { simplified_debts } = balances;

  if (simplified_debts.length === 0) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-6 mb-6 animate-scale-in">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-900 dark:text-green-100">All Settled Up!</h3>
            <p className="text-green-700 dark:text-green-300 text-sm mt-1">Everyone is even - no outstanding debts</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex-shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Balance Summary</h2>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onExport && (
            <button
              onClick={onExport}
              className="flex-1 sm:flex-none bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
              title="Export balances to CSV"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
          <button
            onClick={onSettle}
            className="flex-1 sm:flex-none bg-gradient-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Settle Up
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {simplified_debts.map((debt, index) => (
          <div 
            key={index} 
            className="group flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 rounded-xl p-3 sm:p-5 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-600 gap-3"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-2 sm:gap-3 flex-1 w-full overflow-hidden">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm flex-shrink-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                  {debt.from_member_name.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-xs sm:text-base text-gray-900 dark:text-white truncate">{debt.from_member_name}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 px-1 sm:px-3 flex-shrink-0">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-blue-500 dark:text-blue-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm flex-shrink-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                  {debt.to_member_name.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-xs sm:text-base text-gray-900 dark:text-white truncate">{debt.to_member_name}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white px-3 sm:px-5 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-lg shadow-lg self-end sm:self-auto flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ${debt.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
