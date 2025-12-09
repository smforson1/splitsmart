import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../api/analytics';
import CategoryPieChart from './graphs/CategoryPieChart';
import SpendingTrendChart from './graphs/SpendingTrendChart';

export default function AnalyticsDashboard({ groupId, currencyCode = 'USD' }) {
    const [categoryData, setCategoryData] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, trendRes] = await Promise.all([
                    analyticsApi.getSpendingByCategory(groupId),
                    analyticsApi.getSpendingTrend(groupId)
                ]);

                // Parse numbers
                const catData = catRes.data.map(d => ({ ...d, total: parseFloat(d.total) }));
                const trData = trendRes.data.map(d => ({ ...d, total: parseFloat(d.total) }));

                setCategoryData(catData);
                setTrendData(trData);
            } catch (error) {
                console.error('Failed to load analytics', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [groupId]);

    if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl"></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Spending by Category</h3>
                    <CategoryPieChart data={categoryData} currencyCode={currencyCode} />
                </div>

                {/* Monthly Trend */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Monthly Spending Trend</h3>
                    <SpendingTrendChart data={trendData} currencyCode={currencyCode} />
                </div>
            </div>
        </div>
    );
}
