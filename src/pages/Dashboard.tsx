import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { 
  TrendingUp, 
  Award, 
  Users, 
  DollarSign, 
  BookOpen, 
  Target,
  Calendar,
  MessageSquare,
  Plus
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { roadmaps, balance, communityPosts, mentorshipRequests } = useDatabase();

  const currentRoadmap = roadmaps[0];
  const nextMilestone = currentRoadmap?.milestones.find((m: { status: string; }) => m.status === 'available');
  const completedMilestones = currentRoadmap?.milestones.filter((m: { status: string; }) => m.status === 'completed').length || 0;
  const totalMilestones = currentRoadmap?.milestones.length || 0;

  const stats = [
    {
      icon: Award,
      label: 'Impact Score',
      value: user?.impact_score || 0,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100'
    },
    {
      icon: DollarSign,
      label: 'Wallet Balance',
      value: `$${balance}`,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      icon: BookOpen,
      label: 'Milestones',
      value: `${completedMilestones}/${totalMilestones}`,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      icon: Users,
      label: 'Mentorship',
      value: `${mentorshipRequests.filter(req => req.status === 'accepted').length} Active`,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    }
  ];

  const quickActions = [
    {
      icon: Target,
      title: 'Continue Learning',
      description: 'Resume your current roadmap',
      link: currentRoadmap ? `/roadmap/${currentRoadmap.id}` : '/roadmap',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      icon: Plus,
      title: 'New Roadmap',
      description: 'Start a new skill journey',
      link: '/roadmap',
      color: 'bg-teal-600 hover:bg-teal-700'
    },
    {
      icon: MessageSquare,
      title: 'Find Mentor',
      description: 'Connect with expert mentors',
      link: '/mentorship',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      icon: Users,
      title: 'Join Community',
      description: 'Engage with fellow learners',
      link: '/community',
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}! 🚀
        </h1>
        <p className="text-gray-600">
          Ready to continue your learning journey? You're making amazing progress.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Progress */}
          {currentRoadmap && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Current Progress</h2>
                <Link 
                  to={`/roadmap/${currentRoadmap.id}`}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  View Details
                </Link>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">{currentRoadmap.title}</h3>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentRoadmap.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {Math.round(currentRoadmap.progress)}% Complete
                </p>
              </div>

              {nextMilestone && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-1">Next Milestone:</h4>
                  <p className="text-green-800 mb-2">{nextMilestone.title}</p>
                  <p className="text-sm text-green-700">
                    Reward: ${nextMilestone.reward} • Est. {nextMilestone.duration} days
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className={`${action.color} text-white p-4 rounded-lg hover:shadow-lg transition-all transform hover:scale-105`}
                >
                  <div className="flex items-center mb-2">
                    <action.icon className="w-5 h-5 mr-2" />
                    <span className="font-medium">{action.title}</span>
                  </div>
                  <p className="text-sm opacity-90">{action.description}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Community Activity</h2>
            <div className="space-y-4">
              {communityPosts.slice(0, 3).map((post) => (
                <div key={post.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <img 
                    src={post.author.avatar_url || `https://ui-avatars.com/api/?name=${post.author.name}`}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{post.author.name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mt-1 line-clamp-2">{post.content}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{post.likes.length} likes</span>
                      <span>{post.comments.length} comments</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link 
                to="/community" 
                className="text-green-600 hover:text-green-700 font-medium text-sm"
              >
                View all posts →
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Achievements */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">First Milestone</p>
                  <p className="text-xs text-gray-600">Completed your first learning milestone</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Rising Star</p>
                  <p className="text-xs text-gray-600">Reached 250 impact points</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Mentor Session</p>
                  <p className="text-xs text-gray-600">Tomorrow at 3:00 PM</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Study Group</p>
                  <p className="text-xs text-gray-600">Friday at 7:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Wellness Check */}
          <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">How are you feeling today?</h3>
            <p className="text-green-100 text-sm mb-4">
              Take a quick wellness check to stay balanced in your learning journey.
            </p>
            <Link 
              to="/wellness"
              className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-green-50 transition-colors inline-block"
            >
              Check In Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;