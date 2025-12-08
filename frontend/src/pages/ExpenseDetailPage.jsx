import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { expensesApi } from '../api/groups';
import toast from 'react-hot-toast';

export default function ExpenseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpense();
  }, [id]);

  const fetchExpense = async () => {
    try {
      const response = await expensesApi.getById(id);
      setExpense(response.data);
    } catch (error) {
      toast.error('Failed to load expense');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      await expensesApi.delete(id);
      toast.success('Expense deleted');
      navigate(`/groups/${expense.group_id}`);
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Expense not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(`/groups/${expense.group_id}`)}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Group
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{expense.description}</h1>
              <p className="text-gray-600 mt-1">
                {new Date(expense.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Delete
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-gray-900">
                ${parseFloat(expense.amount).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Category</p>
              <p className="text-lg font-medium text-gray-900 capitalize">
                {expense.category}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-1">Paid By</p>
            <p className="text-lg font-medium text-gray-900">
              {expense.paid_by?.name || 'Unknown'}
            </p>
          </div>

          {expense.receipt_image_url && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Receipt</p>
              <img
                src={expense.receipt_image_url}
                alt="Receipt"
                className="max-w-full h-auto rounded-lg border border-gray-200"
              />
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold mb-3">Split Breakdown</h2>
            <div className="space-y-2">
              {expense.splits?.map((split) => (
                <div
                  key={split.id}
                  className="flex justify-between items-center bg-gray-50 rounded-lg p-3"
                >
                  <span className="text-gray-900">{split.member_name}</span>
                  <span className="font-semibold text-gray-900">
                    ${parseFloat(split.amount_owed).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
