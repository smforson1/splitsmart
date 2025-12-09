import { useState } from 'react';
import { settlementsApi } from '../api/groups';
import toast from 'react-hot-toast';

export default function SettlementModal({ groupId, balances, members, onClose, onSuccess }) {
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const { simplified_debts } = balances;

  const handleSelectDebt = (debt) => {
    setSelectedDebt(debt);
    setAmount(debt.amount.toFixed(2));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDebt) {
      toast.error('Please select a debt to settle');
      return;
    }

    setLoading(true);
    try {
      await settlementsApi.create({
        group_id: groupId,
        from_member_id: selectedDebt.from_member_id,
        to_member_id: selectedDebt.to_member_id,
        amount: parseFloat(amount),
        date: new Date().toISOString().split('T')[0],
        notes,
      });
      toast.success('Settlement recorded!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to record settlement');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Record Settlement</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Debt to Settle
            </label>
            <div className="space-y-2">
              {simplified_debts.map((debt, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectDebt(debt)}
                  className={`p-3 border rounded-lg cursor-pointer transition ${selectedDebt === debt
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      {debt.from_member_name} → {debt.to_member_name}
                    </span>
                    <span className="font-semibold text-blue-600">
                      ${debt.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedDebt && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="e.g., Cash payment, Venmo, etc."
                />
              </div>
            </>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={loading || !selectedDebt}
            >
              {loading ? 'Processing...' : 'Request Settlement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
