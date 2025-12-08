import { useNavigate } from 'react-router-dom';

export default function ExpenseCard({ expense }) {
  const navigate = useNavigate();

  const categoryColors = {
    food: 'bg-orange-100 text-orange-800',
    utilities: 'bg-blue-100 text-blue-800',
    entertainment: 'bg-purple-100 text-purple-800',
    transportation: 'bg-green-100 text-green-800',
    other: 'bg-gray-100 text-gray-800',
  };

  return (
    <div
      onClick={() => navigate(`/expenses/${expense.id}`)}
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{expense.description}</h3>
            <span className={`text-xs px-2 py-1 rounded ${categoryColors[expense.category] || categoryColors.other}`}>
              {expense.category}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Paid by {expense.paid_by?.name || 'Unknown'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(expense.date).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">${parseFloat(expense.amount).toFixed(2)}</p>
          <p className="text-xs text-gray-500">{expense.splits?.length || 0} splits</p>
        </div>
      </div>
    </div>
  );
}
