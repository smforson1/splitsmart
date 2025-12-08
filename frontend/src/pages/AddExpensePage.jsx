import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupsApi, expensesApi } from '../api/groups';
import toast from 'react-hot-toast';
import ReceiptScanner from '../components/ReceiptScanner';

export default function AddExpensePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('manual');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'other',
    date: new Date().toISOString().split('T')[0],
    paid_by_member_id: '',
    split_type: 'equal',
    receipt_image_url: '',
  });

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [customSplits, setCustomSplits] = useState({});

  useEffect(() => {
    fetchGroup();
  }, [id]);

  const fetchGroup = async () => {
    try {
      const response = await groupsApi.getById(id);
      setGroup(response.data);
      if (response.data.members.length > 0) {
        setFormData(prev => ({ ...prev, paid_by_member_id: response.data.members[0].id }));
        setSelectedMembers(response.data.members.map(m => m.id));
      }
    } catch (error) {
      toast.error('Failed to load group');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberToggle = (memberId) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleCustomSplitChange = (memberId, amount) => {
    setCustomSplits(prev => ({ ...prev, [memberId]: amount }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description || !formData.amount || !formData.paid_by_member_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.split_type === 'equal' && selectedMembers.length === 0) {
      toast.error('Please select at least one member to split with');
      return;
    }

    let split_data;
    if (formData.split_type === 'equal') {
      split_data = selectedMembers;
    } else {
      split_data = Object.entries(customSplits)
        .filter(([_, amount]) => parseFloat(amount) > 0)
        .map(([member_id, amount]) => ({
          member_id,
          amount: parseFloat(amount),
        }));

      const total = split_data.reduce((sum, s) => sum + s.amount, 0);
      if (Math.abs(total - parseFloat(formData.amount)) > 0.01) {
        toast.error(`Split amounts must equal total. Current: $${total.toFixed(2)}`);
        return;
      }
    }

    setLoading(true);
    try {
      await expensesApi.create({
        group_id: id,
        ...formData,
        split_data,
      });
      toast.success('Expense added!');
      navigate(`/groups/${id}`);
    } catch (error) {
      toast.error('Failed to add expense');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleScanComplete = (data) => {
    setFormData(prev => ({
      ...prev,
      description: data.merchant_name || prev.description,
      amount: data.total_amount || prev.amount,
      date: data.date || prev.date,
      receipt_image_url: data.receipt_url || prev.receipt_image_url,
    }));
    setActiveTab('manual');
    toast.success('Receipt scanned! Review and submit');
  };

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(`/groups/${id}`)}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Group
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Add Expense</h1>

          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'manual'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setActiveTab('scan')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'scan'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Scan Receipt
            </button>
          </div>

          {activeTab === 'scan' ? (
            <ReceiptScanner onScanComplete={handleScanComplete} />
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="food">Food</option>
                      <option value="utilities">Utilities</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="transportation">Transportation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Paid By *
                    </label>
                    <select
                      name="paid_by_member_id"
                      value={formData.paid_by_member_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {group.members.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Split Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="split_type"
                        value="equal"
                        checked={formData.split_type === 'equal'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Equal Split
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="split_type"
                        value="custom"
                        checked={formData.split_type === 'custom'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Custom Amounts
                    </label>
                  </div>
                </div>

                {formData.split_type === 'equal' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Split Between
                    </label>
                    <div className="space-y-2">
                      {group.members.map(member => (
                        <label key={member.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(member.id)}
                            onChange={() => handleMemberToggle(member.id)}
                            className="mr-2"
                          />
                          {member.name}
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Split Amounts
                    </label>
                    <div className="space-y-2">
                      {group.members.map(member => (
                        <div key={member.id} className="flex items-center gap-2">
                          <span className="w-32 text-sm">{member.name}</span>
                          <input
                            type="number"
                            step="0.01"
                            value={customSplits[member.id] || ''}
                            onChange={(e) => handleCustomSplitChange(member.id, e.target.value)}
                            className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/groups/${id}`)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Expense'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
