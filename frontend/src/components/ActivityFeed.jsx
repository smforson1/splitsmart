import React, { useEffect, useState } from 'react';
import { activityApi } from '../api/activity';
import { formatCurrency } from '../utils/currency';
// import { formatDistanceToNow } from 'date-fns'; // Would be nice, but stick to standard JS or minimal imports

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
}

export default function ActivityFeed({ groupId, currencyCode = 'USD' }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivities();
    }, [groupId]);

    const fetchActivities = async () => {
        try {
            const res = await activityApi.getAll(groupId);
            setActivities(res.data);
        } catch (error) {
            console.error('Failed to load activity');
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'CREATE_EXPENSE': return '💸';
            case 'SETTLEMENT_CONFIRMED': return '🤝';
            case 'RECURRING_GENERATED': return '🔄';
            case 'MEMBER_JOINED': return '👋';
            default: return '📝';
        }
    };

    const renderContent = (activity) => {
        const { action_type, payload, actor_name } = activity;
        const data = payload || {};

        switch (action_type) {
            case 'CREATE_EXPENSE':
                return (
                    <span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{actor_name}</span> added "
                        <span className="font-medium text-gray-900 dark:text-gray-100">{data.description}</span>"
                        for <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(data.amount, currencyCode)}</span>
                    </span>
                );
            case 'SETTLEMENT_CONFIRMED':
                return (
                    <span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{actor_name}</span> confirmed a settlement of
                        <span className="font-semibold text-green-600 dark:text-green-400"> {formatCurrency(data.amount, currencyCode)}</span>
                    </span>
                );
            case 'RECURRING_GENERATED':
                return (
                    <span>
                        Recurring expense "
                        <span className="font-medium text-gray-900 dark:text-gray-100">{data.description}</span>"
                        was automatically created
                    </span>
                );
            default:
                return <span>{actor_name} performed an action</span>;
        }
    };

    if (loading) return <div className="text-sm text-gray-500">Loading activity...</div>;
    if (activities.length === 0) return <div className="text-sm text-gray-500">No recent activity</div>;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity</h3>
            <div className="space-y-4">
                {activities.map((item) => (
                    <div key={item.id} className="flex gap-3 items-start animate-fade-in">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 text-lg">
                            {getIcon(item.action_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
                                {renderContent(item)}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                {formatTimeAgo(item.created_at)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
