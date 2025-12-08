import { useNavigate } from 'react-router-dom';

export default function GroupCard({ group }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/groups/${group.id}`)}
      className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer p-6"
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{group.name}</h3>
      <div className="flex items-center text-gray-600 text-sm">
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span>{group.member_count} {group.member_count === 1 ? 'member' : 'members'}</span>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <span className="text-sm text-gray-500">
          Created {new Date(group.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
