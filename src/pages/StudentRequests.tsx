import React, { useState } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { Check, X, Loader2, MessageCircle } from 'lucide-react';
import { supabase } from '../services/supabase';

const StudentRequests: React.FC = () => {
  const { mentorshipRequests, updateMentorshipRequest, loading } = useDatabase();
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);

  const handleUpdateRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    setUpdatingRequestId(requestId);
    try {
      await updateMentorshipRequest(requestId, status);
    } catch (error) {
      console.error(`Failed to update request ${requestId}:`, error);
      // Optionally show an error message to the user
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const checkConversationExists = async (learnerId: string, mentorId: string) => {
    const { data, error } = await supabase.rpc('get_conversation_between_users', {
      user1_id: learnerId,
      user2_id: mentorId
    });

    if (error) {
      console.error('Error checking conversation:', error);
      return false;
    }

    return data && data.length > 0;
  };

  const handleViewChat = async (request: any) => {
    const exists = await checkConversationExists(request.learner_id, request.mentor_id);
    if (exists) {
      // Navigate to talk page with conversation ID
      // This would need to be implemented based on your routing setup
      console.log('Conversation exists, navigate to chat');
    } else {
      console.log('No conversation found');
    }
  };

  const pendingRequests = mentorshipRequests.filter(req => req.status === 'pending');
  const acceptedRequests = mentorshipRequests.filter(req => req.status === 'accepted');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {loading && <div className="text-center p-8">Loading requests...</div>}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Requests</h1>
        <p className="text-gray-600">Review and respond to mentorship requests from learners.</p>
      </div>

      {/* Accepted Requests Section */}
      {acceptedRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Accepted Requests</h2>
          <div className="bg-green-50 rounded-xl p-4 mb-4">
            <div className="flex items-center">
              <MessageCircle className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-green-800">
                {acceptedRequests.length} accepted request{acceptedRequests.length > 1 ? 's' : ''} -
                conversations have been created for these mentorship pairs.
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <ul className="divide-y divide-gray-200">
              {acceptedRequests.map((request) => (
                <li key={request.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                    </div>
                    <img
                      src={request.learner.avatar_url || `https://ui-avatars.com/api/?name=${request.learner.name}`}
                      alt={request.learner.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{request.learner.name}</h4>
                          <p className="text-sm text-gray-500">Accepted on {new Date(request.created_at).toLocaleDateString()}</p>
                        </div>
                        <button
                          onClick={() => handleViewChat(request)}
                          className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center space-x-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>View Chat</span>
                        </button>
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
      )}

      {/* Pending Requests Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Pending Requests</h2>
          <p className="text-gray-600 text-sm mt-1">{pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}</p>
        </div>
        <ul className="divide-y divide-gray-200">
          {pendingRequests.length === 0 && (
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
                      {updatingRequestId === request.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                      ) : (
                        <>
                          <button
                            onClick={() => handleUpdateRequest(request.id, 'rejected')}
                            disabled={!!updatingRequestId}
                            className="bg-red-100 text-red-700 p-2 rounded-full hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateRequest(request.id, 'accepted')}
                            disabled={!!updatingRequestId}
                            className="bg-green-100 text-green-700 p-2 rounded-full hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </>
                      )}
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
