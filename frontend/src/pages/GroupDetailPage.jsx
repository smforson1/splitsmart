import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupsApi, membersApi, expensesApi, balancesApi } from '../api/groups';
import toast from 'react-hot-toast';
import BalanceSummary from '../components/BalanceSummary';
import ExpenseCard from '../components/ExpenseCard';
import SettlementModal from '../components/SettlementModal';

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [showSettlement, setShowSettlement] = useState(false);

  useEffect(() => {
    fetchGroupData();
  }, [id]);

  const fetchGroupData = async () => {
    try {
      const [groupRes, expensesRes, balancesRes] = await Promise.all([
        groupsApi.getById(id),
        expensesApi.getAll({ groupId: id }),
        balancesApi.getByGroup(id),
      ]);
      setGroup(groupRes.data);
      setExpenses(expensesRes.data);
      setBalances(balancesRes.data);
    } catch (error) {
      toast.error('Failed to load group data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) {
      toast.error('Member name is required');
      return;
    }

    try {
      await groupsApi.addMember(id, { name: newMemberName });
      toast.success('Member added!');
      setNewMemberName('');
      setShowAddMember(false);
      fetchGroupData();
    } catch (error) {
      toast.error('Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await membersApi.delete(memberId);
      toast.success('Member removed');
      fetchGroupData();
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm('Are you sure you want to delete this group? This will delete all expenses and data.')) return;

    try {
      await groupsApi.delete(id);
      toast.success('Group deleted');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete group');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Groups
        </button>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
              <p className="text-gray-600 mt-1">{group.members.length} members</p>
            </div>
            <button
              onClick={handleDeleteGroup}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Delete Group
            </button>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Members</h2>
              <button
                onClick={() => setShowAddMember(true)}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                + Add Member
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {group.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between bg-gray-50 rounded p-3">
                  <span className="text-sm">{member.name}</span>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {balances && <BalanceSummary balances={balances} onSettle={() => setShowSettlement(true)} />}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Expenses</h2>
            <button
              onClick={() => navigate(`/groups/${id}/add-expense`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Add Expense
            </button>
          </div>

          {expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No expenses yet. Add your first expense!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <ExpenseCard key={expense.id} expense={expense} onUpdate={fetchGroupData} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add Member</h2>
            <form onSubmit={handleAddMember}>
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Enter member name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMember(false);
                    setNewMemberName('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSettlement && (
        <SettlementModal
          groupId={id}
          balances={balances}
          members={group.members}
          onClose={() => setShowSettlement(false)}
          onSuccess={fetchGroupData}
        />
      )}
    </div>
  );
}
