import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupsApi, membersApi, expensesApi, balancesApi } from '../api/groups';
import toast from 'react-hot-toast';
import BalanceSummary from '../components/BalanceSummary';
import ExpenseCard from '../components/ExpenseCard';
import SettlementModal from '../components/SettlementModal';
import ExpenseFilters from '../components/ExpenseFilters';
import ExpenseStatistics from '../components/ExpenseStatistics';
import { exportExpensesToCSV, exportBalancesToCSV } from '../utils/exportCSV';

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
  const [filters, setFilters] = useState({ search: '', category: '', startDate: '', endDate: '' });

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

  // Filter expenses based on search and filters
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      // Search filter
      if (filters.search && !expense.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      // Category filter
      if (filters.category && expense.category !== filters.category) {
        return false;
      }
      // Start date filter
      if (filters.startDate && new Date(expense.date) < new Date(filters.startDate)) {
        return false;
      }
      // End date filter
      if (filters.endDate && new Date(expense.date) > new Date(filters.endDate)) {
        return false;
      }
      return true;
    });
  }, [expenses, filters]);

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

  const handleExportExpenses = () => {
    if (filteredExpenses.length === 0) {
      toast.error('No expenses to export');
      return;
    }
    exportExpensesToCSV(filteredExpenses, group.name);
    toast.success('Expenses exported to CSV!');
  };

  const handleExportBalances = () => {
    if (!balances || balances.simplified_debts.length === 0) {
      toast.error('No balances to export');
      return;
    }
    exportBalancesToCSV(balances, group.name);
    toast.success('Balances exported to CSV!');
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

        {expenses.length > 0 && <ExpenseStatistics expenses={expenses} members={group.members} />}

        {balances && <BalanceSummary balances={balances} onSettle={() => setShowSettlement(true)} onExport={handleExportBalances} />}

        {expenses.length > 0 && <ExpenseFilters onFilterChange={setFilters} />}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h2>
              {filteredExpenses.length !== expenses.length && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Showing {filteredExpenses.length} of {expenses.length} expenses
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {expenses.length > 0 && (
                <button
                  onClick={handleExportExpenses}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium flex items-center gap-2"
                  title="Export to CSV"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                </button>
              )}
              <button
                onClick={() => navigate(`/groups/${id}/add-expense`)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Expense
              </button>
            </div>
          </div>

          {expenses.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-lg font-medium">No expenses yet</p>
              <p className="text-sm mt-1">Add your first expense to get started!</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-lg font-medium">No expenses match your filters</p>
              <p className="text-sm mt-1">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map((expense) => (
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
