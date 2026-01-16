import { useState } from 'react';
import { settlementsApi } from '../api/groups';
import toast from 'react-hot-toast';
import PaystackPaymentButton from './PaystackPaymentButton';

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

  const handleSubmit = async (e, paystackRef = null) => {
    if (e) e.preventDefault();
    if (!selectedDebt) {
      toast.error('Please select a debt to settle');
      return;
    }

    setLoading(true);

    const settlementData = {
      group_id: groupId,
      from_member_id: selectedDebt.from_member_id,
      to_member_id: selectedDebt.to_member_id,
      amount: parseFloat(amount),
      date: new Date().toISOString().split('T')[0],
      notes: paystackRef ? `Paid via Paystack - Ref: ${paystackRef}` : notes,
    };

    try {
      await settlementsApi.create(settlementData);
      toast.success(paystackRef ? 'Payment verified and recorded!' : 'Cash settlement recorded!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Settlement creation failed:', error);
      toast.error(`Failed to record settlement: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-scale-in border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settle Debt</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Select Debt to Settle
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {simplified_debts.map((debt, index) => (
              <div
                key={index}
                onClick={() => handleSelectDebt(debt)}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${selectedDebt === debt
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {debt.from_member_name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">pays {debt.to_member_name}</span>
                  </div>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    ₵{debt.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedDebt ? (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recipient Email
                </label>
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 truncate">
                  {selectedDebt.to_member_email || 'No email found'}
                </div>
              </div>
            </div>

            {/* Paystack Option */}
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-900/30">
              <h3 className="text-sm font-bold text-green-800 dark:text-green-400 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Instant Digital Payment
              </h3>
              <PaystackPaymentButton
                amount={Math.round(parseFloat(amount) * 100)}
                email={selectedDebt.to_member_email}
                currency="GHS"
                reference={`ss_${Date.now()}`}
                onSuccess={(res) => handleSubmit(null, res.reference)}
                onClose={() => { }}
                className="!py-2.5 shadow-sm hover:shadow-md"
              />
              <p className="text-[10px] text-green-700 dark:text-green-500 mt-2 text-center">
                Payment is auto-recorded after successful transaction
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or record manually</span>
              </div>
            </div>

            <div className="space-y-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                rows="2"
                placeholder="Notes (e.g., Paid in cash)"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 font-medium transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Record Cash'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            <p>Select a debt above to continue</p>
            <button
              onClick={onClose}
              className="mt-6 text-sm font-medium hover:underline"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
