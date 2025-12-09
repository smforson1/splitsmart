import React, { useState, useEffect, useRef } from 'react';
import { commentsApi } from '../api/comments';
import { toast } from 'react-hot-toast';

export default function CommentsSection({ expenseId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const commentsEndRef = useRef(null);

    useEffect(() => {
        fetchComments();
    }, [expenseId]);

    const fetchComments = async () => {
        try {
            const res = await commentsApi.getAll(expenseId);
            setComments(res.data);
            scrollToBottom();
        } catch (error) {
            console.error('Failed to load comments', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const res = await commentsApi.create(expenseId, newComment);
            setComments([...comments, res.data]);
            setNewComment('');
            scrollToBottom();
        } catch (error) {
            toast.error('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="animate-pulse h-20 bg-gray-100 rounded-xl my-4"></div>;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mt-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>💬</span> Comments
            </h3>

            <div className="space-y-4 max-h-96 overflow-y-auto mb-4 pr-2 custom-scrollbar">
                {comments.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                        No comments yet. Start the conversation!
                    </p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 items-start animate-fade-in">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
                                {comment.members?.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-2xl rounded-tl-none p-3 border border-gray-100 dark:border-gray-600">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                        {comment.members?.name}
                                    </span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                        {new Date(comment.created_at).toLocaleDateString()} {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{comment.text}</p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={commentsEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-400 transition-all font-medium"
                    disabled={submitting}
                />
                <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </form>
        </div>
    );
}
