import React from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { Check, X } from 'lucide-react';

const StudentRequests: React.FC = () => {
  const { mentorshipRequests, updateMentorshipRequest, loading } = useDatabase();
  const pendingRequests = mentorshipRequests.filter(req => req.status === 'pending');
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {loading && <div className="text-center p-8">Loading requests...</div>}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Requests</h1>
        <p className="text-gray-600">Review and respond to mentorship requests from learners.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <ul className="divide-y divide-gray-200">
          {!loading && pendingRequests.length === 0 && (
            <li className="p-6 text-center text-gray-500">No pending requests.</li>
          )}
          {pendingRequests.map((request) => (
            <li key={request.id} className="p-6">
              <div className="flex items-start space-x-4">
                <img 
                  src={request.learner.avatar_url || `https://ui-avatars.com/api/?name=${request.learner.name}`}
                  alt={request.learner.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{request.learner.name}</h4>
                      <p className="text-sm text-gray-500">Requested on {new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => updateMentorshipRequest(request.id, 'rejected')} className="bg-red-100 text-red-700 p-2 rounded-full hover:bg-red-200 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                      <button onClick={() => updateMentorshipRequest(request.id, 'accepted')} className="bg-green-100 text-green-700 p-2 rounded-full hover:bg-green-200 transition-colors">
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 mt-2 p-3 bg-gray-50 rounded-lg">
                    {request.message}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StudentRequests;
