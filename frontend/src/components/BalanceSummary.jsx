export default function BalanceSummary({ balances, onSettle }) {
  const { simplified_debts } = balances;

  if (simplified_debts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-green-900">All Settled Up!</h3>
            <p className="text-green-700 text-sm">Everyone is even</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Balance Summary</h2>
        <button
          onClick={onSettle}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
        >
          Settle Up
        </button>
      </div>
      <div className="space-y-3">
        {simplified_debts.map((debt, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <span className="font-medium text-gray-900">{debt.from_member_name}</span>
              <svg className="w-5 h-5 mx-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span className="font-medium text-gray-900">{debt.to_member_name}</span>
            </div>
            <span className="text-lg font-bold text-blue-600">
              ${debt.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
