import React, { useState, useEffect } from 'react';
import { recurringApi } from '../api/recurring';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/currency';

export default function RecurringList({ groupId, members, currencyCode = 'USD' }) {
    const [recurring, setRecurring] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        paidBy: '', // memberId
    });

    useEffect(() => {
        fetchRecurring();
    }, [groupId]);

    const fetchRecurring = async () => {
        try {
            const res = await recurringApi.getAll(groupId);
            setRecurring(res.data);
        } catch (error) {
            console.error('Failed to load recurring expenses');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Stop this recurring expense?')) return;
        try {
            await recurringApi.delete(id);
            toast.success('Stopped recurring expense');
            fetchRecurring();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.paidBy) {
            toast.error('Please select who pays');
            return;
        }

        // Simplified split logic: Equal split among all members
        const splitAmount = (parseFloat(formData.amount) / members.length).toFixed(2);
        const splits = members.map(m => ({
            member_id: m.id,
            amount: splitAmount // Note: verify backend expects 'amount' in split details JSON
        }));

        try {
            await recurringApi.create({
                groupId,
                description: formData.description,
                amount: parseFloat(formData.amount),
                frequency: formData.frequency,
                startDate: formData.startDate,
                paidBy: formData.paidBy,
                splits: splits
            });
            toast.success('Recurring expense created!');
            setShowForm(false);
            setFormData({
                description: '',
                amount: '',
                frequency: 'monthly',
                startDate: new Date().toISOString().split('T')[0],
                paidBy: '',
            });
            fetchRecurring();
        } catch (error) {
            toast.error('Failed to create');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>🔄</span> Recurring Expenses
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors"
                >
                    {showForm ? 'Cancel' : '+ New'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Description (e.g. Rent)"
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Amount"
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                        <select
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            value={formData.frequency}
                            onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                        >
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            value={formData.startDate}
                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            required
                        />
                        <select
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            value={formData.paidBy}
                            onChange={e => setFormData({ ...formData, paidBy: e.target.value })}
                            required
                        >
                            <option value="">Paid By...</option>
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
                        Set Recurring
                    </button>
                </form>
            )}

            {recurring.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic">No recurring expenses set up.</p>
            ) : (
                <div className="space-y-3">
                    {recurring.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{item.description}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatCurrency(item.amount, currencyCode)} • {item.frequency} • Next: {new Date(item.next_due).toLocaleDateString()}
                                </p>
                            </div>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-500 hover:text-red-700 p-2"
                                title="Stop recurring"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
