import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupsApi, membersApi, expensesApi, balancesApi } from '../api/groups';
import { invitesApi } from '../api/invites';
import toast from 'react-hot-toast';
import BalanceSummary from '../components/BalanceSummary';
import ExpenseCard from '../components/ExpenseCard';
import SettlementModal from '../components/SettlementModal';
import ExpenseFilters from '../components/ExpenseFilters';
import ExpenseStatistics from '../components/ExpenseStatistics';
import { exportExpensesToCSV, exportBalancesToCSV } from '../utils/exportCSV';
import ActivityFeed from '../components/ActivityFeed';
import RecurringList from '../components/RecurringList';
import AnalyticsDashboard from '../components/AnalyticsDashboard';



export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [showSettlement, setShowSettlement] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' or 'analytics'
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

  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error('Email is required');
      return;
    }

    try {
      await invitesApi.send({ groupId: id, email: inviteEmail });
      toast.success('Invite sent!');
      setInviteEmail('');
      setShowInviteMember(false);
    } catch (error) {
      toast.error('Failed to send invite');
      console.error(error);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors duration-200">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-900 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 dark:border-blue-400 mx-auto absolute top-0 left-1/2 -translate-x-1/2"></div>
          </div>
          <p className="mt-6 text-gray-600 dark:text-gray-300 font-medium">Loading group...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 flex items-center transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Groups
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{group.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">{group.members.length} members</p>
            </div>
            <button
              onClick={handleDeleteGroup}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm transition-colors self-end sm:self-auto"
            >
              Delete Group
            </button>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Members</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowInviteMember(true)}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm transition-colors"
              >
                + Invite User
              </button>
              <button
                onClick={() => setShowAddMember(true)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm transition-colors"
              >
                + Add Member
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {group.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3 border border-gray-200 dark:border-gray-600">
                <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate mr-2">{member.name}</span>
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-lg sm:text-xl transition-colors flex-shrink-0"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl mb-6 w-full max-w-md mx-auto sm:mx-0">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'expenses'
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'analytics'
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
          >
            Analytics
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area (Expenses & Charts) */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'analytics' ? (
              <AnalyticsDashboard groupId={id} currencyCode={group.currency_code} />
            ) : (
              <>
                {expenses.length > 0 && <ExpenseStatistics expenses={expenses} members={group.members} currencyCode={group.currency_code} />}
                {balances && <BalanceSummary balances={balances} onSettle={() => setShowSettlement(true)} onExport={handleExportBalances} currencyCode={group.currency_code} />}
                {expenses.length > 0 && <ExpenseFilters onFilterChange={setFilters} />}

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Expenses</h2>
                      {filteredExpenses.length !== expenses.length && (
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Showing {filteredExpenses.length} of {expenses.length} expenses
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                      {expenses.length > 0 && (
                        <button
                          onClick={handleExportExpenses}
                          className="flex-1 sm:flex-none bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium flex items-center justify-center gap-2 text-sm"
                          title="Export to CSV"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="hidden sm:inline">Export</span>
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/groups/${id}/add-expense`)}
                        className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium flex items-center justify-center gap-2 text-sm"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        <ExpenseCard key={expense.id} expense={expense} onUpdate={fetchGroupData} currencyCode={group.currency_code} />
                      ))}
                    </div>
                  )}
                </div>

              </>
            )}
          </div>

          {/* Sidebar (Recurring & Activity) */}
          <div className="lg:col-span-1 space-y-6">
            <RecurringList groupId={id} members={group.members} currencyCode={group.currency_code} />
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 sticky top-6">
              <ActivityFeed groupId={id} currencyCode={group.currency_code} />
            </div>
          </div>
        </div>


        {
          showInviteMember && (
            <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scale-in border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invite User</h2>
                </div>
                <form onSubmit={handleInviteUser}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      User Email
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Enter user email"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                      autoFocus
                    />
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      The user will receive a notification to join the group.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowInviteMember(false);
                        setInviteEmail('');
                      }}
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
                    >
                      Invite
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        }

        {
          showAddMember && (
            <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scale-in border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Member</h2>
                </div>
                <form onSubmit={handleAddMember}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Member Name
                    </label>
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="Enter member name"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddMember(false);
                        setNewMemberName('');
                      }}
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        }

        {
          showSettlement && (
            <SettlementModal
              groupId={id}
              balances={balances}
              members={group.members}
              onClose={() => setShowSettlement(false)}
              onSuccess={fetchGroupData}
            />
          )
        }
      </div>
    </div>

  );
}
