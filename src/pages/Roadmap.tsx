import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDatabase } from '../contexts/DatabaseContext';
import { useAI } from '../contexts/AIContext';
import { 
  Target, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  Lock, 
  Upload,
  AlertCircle,
  Plus,
  Lightbulb
} from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  duration: number;
  reward: number;
  deliverable: string;
  status: 'locked' | 'available' | 'submitted' | 'completed';
  resources?: { type: string; url: string }[];
  submittedAt?: string;
  approvedBy?: string;
}

const Roadmap = () => {
  const { id } = useParams();
  const { roadmaps, createRoadmap, updateMilestone } = useDatabase();
  const { generateRoadmap } = useAI();
  const [showGenerator, setShowGenerator] = useState(!id);
  const [generating, setGenerating] = useState(false);
  const [generatorForm, setGeneratorForm] = useState({
    goal: '',
    level: 'beginner'
  });
  const [submissionForm, setSubmissionForm] = useState({
    milestoneId: '',
    description: '',
    projectLink: '',
    notes: ''
  });
  const [showSubmission, setShowSubmission] = useState(false);

  const currentRoadmap = roadmaps.find(r => r.id === id) || roadmaps[0];

  useEffect(() => {
    if (id && !currentRoadmap) {
      setShowGenerator(true);
    }
  }, [id, currentRoadmap]);

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const aiRoadmap = await generateRoadmap(generatorForm.goal, generatorForm.level);
      // The createRoadmap function in the context should handle the UI update.
      // We'll add a loading state there.
      await createRoadmap(aiRoadmap);
      // After successful creation, the database context will update,
      // and this component will re-render, showing the new roadmap.
      setShowGenerator(false);
      setGeneratorForm({ goal: '', level: 'beginner' });
    } catch (error) {
      console.error('Failed to generate or create roadmap:', error);
      // Optionally, show an error message to the user
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    const milestone = currentRoadmap?.milestones.find((m: Milestone) => m.id === submissionForm.milestoneId);
    
    if (currentRoadmap && milestone) {
      await updateMilestone(currentRoadmap.id, submissionForm.milestoneId, {
        status: 'submitted',
        submittedAt: new Date().toISOString()
      });
      
      setShowSubmission(false);
      setSubmissionForm({
        milestoneId: '',
        description: '',
        projectLink: '',
        notes: ''
      });
    }
  };

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'submitted':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      case 'available':
        return <Target className="w-6 h-6 text-blue-600" />;
      default:
        return <Lock className="w-6 h-6 text-gray-400" />;
    }
  };

  const getMilestoneColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'submitted':
        return 'border-yellow-200 bg-yellow-50';
      case 'available':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (showGenerator) {
    return (
      <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">AI Roadmap Generator</h1>
          <p className="text-gray-600">
            Tell us your learning goal and we'll create a personalized roadmap just for you
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleGenerateRoadmap} className="space-y-6">
            <div>
              <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
                What do you want to learn? *
              </label>
              <input
                id="goal"
                type="text"
                required
                value={generatorForm.goal}
                onChange={(e) => setGeneratorForm(prev => ({ ...prev, goal: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., Web development, Data science, AI/Machine learning, UX design..."
              />
              <p className="mt-2 text-sm text-gray-500">
                Be specific! The more details you provide, the better your personalized roadmap will be.
              </p>
            </div>

            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                What's your current level?
              </label>
              <select
                id="level"
                value={generatorForm.level}
                onChange={(e) => setGeneratorForm(prev => ({ ...prev, level: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="beginner">Beginner - I'm just starting out</option>
                <option value="intermediate">Intermediate - I have some experience</option>
                <option value="advanced">Advanced - I want to master advanced topics</option>
              </select>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">What you'll get:</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>✅ Personalized learning milestones</li>
                <li>✅ Project-based deliverables</li>
                <li>✅ Micro-scholarship rewards</li>
                <li>✅ Estimated timeframes</li>
                <li>✅ Progress tracking</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={generating || !generatorForm.goal.trim()}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {generating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating your personalized roadmap...
                </div>
              ) : (
                'Generate My Roadmap'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!currentRoadmap) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Roadmap Found</h2>
          <p className="text-gray-600 mb-6">You don't have any active roadmaps yet.</p>
          <button
            onClick={() => setShowGenerator(true)}
            className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition-all"
          >
            Create Your First Roadmap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-0">{currentRoadmap.title}</h1>
          <button
            onClick={() => setShowGenerator(true)}
            className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Roadmap</span>
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">{currentRoadmap.description}</p>
        
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <span className="flex items-center">
            <Target className="w-4 h-4 mr-1" />
            {currentRoadmap.domain}
          </span>
          <span className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            {currentRoadmap.milestones.filter((m: Milestone) => m.status === 'completed').length}/{currentRoadmap.milestones.length} Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${currentRoadmap.progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {Math.round(currentRoadmap.progress)}% Complete
          </p>
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-6">
        {currentRoadmap.milestones.map((milestone: Milestone, index: number) => (
          <div key={milestone.id} className={`bg-white rounded-xl shadow-sm border-2 ${getMilestoneColor(milestone.status)} p-6`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="flex-shrink-0 mt-1">
                  {getMilestoneIcon(milestone.status)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{milestone.title}</h3>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      Milestone {index + 1}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{milestone.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {milestone.duration} days
                    </span>
                    <span className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      ${milestone.reward} reward
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <h4 className="font-medium text-gray-900 mb-1">Deliverable:</h4>
                    <p className="text-gray-700 text-sm">{milestone.deliverable}</p>
                  </div>

                  {milestone.resources && milestone.resources.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Recommended Resources:</h4>
                      <ul className="space-y-2">
                        {milestone.resources.map((resource: any, index: number) => (
                          <li key={index} className="flex items-center">
                            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline flex items-center">
                              {resource.type === 'video' ? '🎬' : resource.type === 'article' ? '📄' : '🔗'} 
                              <span className="ml-2">{resource.url}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {milestone.status === 'submitted' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-yellow-800 text-sm">
                        ⏱️ Submitted for review - approval pending
                      </p>
                    </div>
                  )}

                  {milestone.status === 'completed' && milestone.approvedBy && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-800 text-sm">
                        ✅ Completed! Reward of ${milestone.reward} has been added to your wallet.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {milestone.status === 'available' && (
                <button
                  onClick={() => {
                    setSubmissionForm(prev => ({ ...prev, milestoneId: milestone.id }));
                    setShowSubmission(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Submit</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submission Modal */}
      {showSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Milestone</h3>
            
            <form onSubmit={handleSubmitMilestone} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Description *
                </label>
                <textarea
                  required
                  value={submissionForm.description}
                  onChange={(e) => setSubmissionForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Briefly describe what you built and what you learned..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Link
                </label>
                <input
                  type="url"
                  value={submissionForm.projectLink}
                  onChange={(e) => setSubmissionForm(prev => ({ ...prev, projectLink: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://github.com/username/project or deployed URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={submissionForm.notes}
                  onChange={(e) => setSubmissionForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Any challenges faced or additional achievements..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit for Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmission(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
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

export default Roadmap;