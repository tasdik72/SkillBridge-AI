import React, { useState } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { Award, Send } from 'lucide-react';

const Mentorship = () => {
  const { mentors, loading, mentorshipRequests, sendMentorshipRequest } = useDatabase();
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  const handleRequestMentor = (mentor: any) => {
    setSelectedMentor(mentor);
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;

    try {
      await sendMentorshipRequest(selectedMentor.id, requestMessage);
      setRequestSent(true);
      setShowRequestModal(false);
      setRequestMessage('');
      setSelectedMentor(null);
      setTimeout(() => setRequestSent(false), 3000); // Reset after 3 seconds
    } catch (error) {
      console.error('Failed to send mentorship request:', error);
      // Optionally, show an error message to the user
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading mentors...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {requestSent && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p className="font-bold">Success</p>
          <p>Your mentorship request has been sent!</p>
        </div>
      )}
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Mentor</h1>
        <p className="text-gray-600">Connect with expert mentors to accelerate your learning journey</p>
      </div>

      {/* Search Bar (optional, can be added later) */}

      {/* Mentor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map((mentor) => (
          <div key={mentor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex items-center space-x-4 mb-4">
              <img 
                src={mentor.avatar_url || `https://ui-avatars.com/api/?name=${mentor.name}`} 
                alt={mentor.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                <p className="text-sm text-gray-500">{mentor.headline}</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4 flex-grow">{mentor.bio}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {mentor.skills && mentor.skills.map((skill: string) => (
                <span key={skill} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <Award className="w-4 h-4 mr-1 text-yellow-500" />
                <span>{mentor.impact_score} Impact Score</span>
              </div>
              <button
                onClick={() => handleRequestMentor(mentor)}
                disabled={mentorshipRequests.some(req => req.mentor_id === mentor.id && req.status === 'pending')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>Request</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Request Mentor Modal */}
      {showRequestModal && selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Mentorship</h3>
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src={selectedMentor.avatar} 
                alt={selectedMentor.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 className="font-medium text-gray-900">{selectedMentor.name}</h4>
                <p className="text-sm text-gray-600">{selectedMentor.title}</p>
              </div>
            </div>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What would you like help with? *
                </label>
                <textarea
                  required
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={4}
                  placeholder="Describe your goals, current challenges, and what you hope to learn..."
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Send Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mentorship;