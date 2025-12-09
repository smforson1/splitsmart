import { useState, useEffect } from 'react';
import { notificationsApi } from '../api/notifications';
import { invitesApi } from '../api/invites';
import { settlementsApi } from '../api/groups';
import toast from 'react-hot-toast';

export default function NotificationsDropdown() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await notificationsApi.getAll();
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await notificationsApi.markRead(id);
            fetchNotifications();
        } catch (error) {
            console.error(error);
        }
    };

    const handleAcceptInvite = async (notification) => {
        try {
            const { inviteId } = notification.payload;
            await invitesApi.accept(inviteId);
            toast.success('Joined group successfully!');
            await markAsRead(notification.id);
            window.location.reload(); // Refresh to show new group
        } catch (error) {
            toast.error('Failed to accept invite');
            console.error(error);
        }
    };

    const handleConfirmSettlement = async (notification) => {
        try {
            const { settlementId } = notification.payload;
            await settlementsApi.confirm(settlementId);
            toast.success('Settlement confirmed!');
            await markAsRead(notification.id);
        } catch (error) {
            toast.error('Failed to confirm settlement');
            console.error(error);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-fade-in">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-white">
                        Notifications
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                                No notifications
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                >
                                    <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">
                                        {notification.type === 'invite' && (
                                            <>You have been invited to join a group.</>
                                        )}
                                        {notification.type === 'settlement_request' && (
                                            <>
                                                Confirm receipt of <span className="font-semibold text-green-600">${notification.payload.amount}</span>?
                                            </>
                                        )}
                                        {notification.type === 'settlement_confirmed' && (
                                            <>
                                                Payment of <span className="font-semibold text-green-600">${notification.payload.amount}</span> was confirmed.
                                            </>
                                        )}
                                    </p>

                                    <div className="flex gap-2">
                                        {!notification.is_read && (
                                            <>
                                                {notification.type === 'invite' && (
                                                    <button
                                                        onClick={() => handleAcceptInvite(notification)}
                                                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors"
                                                    >
                                                        Accept
                                                    </button>
                                                )}
                                                {notification.type === 'settlement_request' && (
                                                    <button
                                                        onClick={() => handleConfirmSettlement(notification)}
                                                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md transition-colors"
                                                    >
                                                        Confirm
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1"
                                                >
                                                    Dismiss
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
