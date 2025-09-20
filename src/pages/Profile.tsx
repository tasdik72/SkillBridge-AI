import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { useDatabase } from '../contexts/DatabaseContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Certificate from '../components/Certificate';
import { 
  Award, 
  Edit, 
  Calendar,
  MapPin,
  Mail,
  Phone,
  Globe,
  Star,
  TrendingUp,
  BookOpen,
  Users,
  Settings,
  Eye,
  EyeOff,
  KeyRound,
  AtSign
} from 'lucide-react';

const Profile = () => {
  const { user, loading, updateProfile } = useAuth();
  const { roadmaps, balance } = useDatabase();
  const [editing, setEditing] = useState(false);
  interface ProfileData {
  name: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  phone: string;
  skills: string[];
  isPublic: boolean;
  avatar_url?: string;
}

const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    phone: '',
    skills: [],
    isPublic: true,
    avatar_url: '',
  });
  const [account, setAccount] = useState({ newEmail: '', newPassword: '', confirmPassword: '' });
  const [certificateData, setCertificateData] = useState<{ studentName: string; courseName: string; completionDate: string; } | null>(null);

  useEffect(() => {
    if (certificateData) {
      const certificateElement = document.getElementById('certificate');
      if (certificateElement) {
        html2canvas(certificateElement, { scale: 2 }).then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [800, 600] });
          pdf.addImage(imgData, 'PNG', 0, 0, 800, 600);
          pdf.save(`SkillBridge_Certificate_${certificateData.courseName.replace(/\s/g, '_')}.pdf`);
          setCertificateData(null); // Clean up
        });
      }
    }
  }, [certificateData]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        phone: user.phone || '',
        skills: user.skills || [],
        isPublic: user.is_public === undefined ? true : user.is_public,
        avatar_url: user.avatar_url || '',
      });
    }
  }, [user]);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

  
  const completedRoadmaps = roadmaps.filter(r => r.progress === 100);
  const totalMilestones = roadmaps.reduce((sum, r) => sum + r.milestones.filter((m: { status: string }) => m.status === 'completed').length, 0);

  const achievements = [
    {
      id: 1,
      title: 'First Steps',
      description: 'Completed your first milestone',
      icon: Star,
      color: 'bg-yellow-100 text-yellow-600',
      earned: true
    },
    {
      id: 2,
      title: 'Milestone Master',
      description: 'Completed 5 milestones',
      icon: Award,
      color: 'bg-green-100 text-green-600',
      earned: totalMilestones >= 5
    },
    {
      id: 3,
      title: 'Community Helper',
      description: 'Helped 10 fellow learners',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      earned: false
    },
    {
      id: 4,
      title: 'Learning Streak',
      description: '30 days of consistent learning',
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
      earned: false
    }
  ];

  const handleDownloadCertificate = async () => {
    const completedRoadmap = completedRoadmaps[0];
    if (!completedRoadmap || !user) {
      alert('No completed roadmaps to generate a certificate for!');
      return;
    }

    setCertificateData({
      studentName: user.name || 'Student',
      courseName: completedRoadmap.title,
      completionDate: new Date().toLocaleDateString(),
    });
  };

  const stats = [
    {
      label: 'Impact Score',
      value: user?.impact_score || 0,
      icon: Award,
      color: 'text-yellow-600'
    },
    {
      label: 'Completed Roadmaps',
      value: completedRoadmaps.length,
      icon: BookOpen,
      color: 'text-green-600'
    },
    {
      label: 'Total Milestones',
      value: totalMilestones,
      icon: Star,
      color: 'text-blue-600'
    },
    {
      label: 'Earnings',
      value: `$${balance}`,
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  const handleSave = async () => {
    setInfo('');
    setError('');
    try {
      await updateProfile({ ...profileData, email: undefined }); // email is handled separately
      setEditing(false);
      setInfo('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfo('');
    setError('');
    if (!account.newEmail) {
      setError('Please enter a new email address.');
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser(
        { email: account.newEmail },
        { emailRedirectTo: `${window.location.origin}/profile` }
      );
      if (error) throw error;
      setInfo('Confirmation email sent to your new address. Please check your inbox.');
      setAccount(prev => ({ ...prev, newEmail: '' }));
    } catch (err: any) {
      setError(err.message || 'Failed to update email.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfo('');
    setError('');
    if (account.newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (account.newPassword !== account.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: account.newPassword });
      if (error) throw error;
      setInfo('Password updated successfully.');
      setAccount(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB limit
      setError('File size must be less than 1MB.');
      return;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

    if (uploadError) {
      setError(uploadError.message);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

    await updateProfile({ avatar_url: publicUrl });
    setProfileData((prev: ProfileData) => ({ ...prev, avatar_url: publicUrl }));
        setInfo('Avatar updated!');
  };

  const handleSkillChange = (skill: string, checked: boolean) => {
    if (checked) {
      setProfileData((prev: ProfileData) => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    } else {
      setProfileData((prev: ProfileData) => ({
        ...prev,
        skills: prev.skills.filter((s: string) => s !== skill)
      }));
    }
  };

  const allSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'AI/ML', 
    'Data Science', 'Web Development', 'Mobile Development', 'DevOps',
    'UI/UX Design', 'Blockchain', 'Cloud Computing', 'Cybersecurity'
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading profile...</div>;
  }

  return (
    <>
      {certificateData && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <Certificate {...certificateData} />
        </div>
      )}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start justify-between mb-6">
            <div className="flex flex-col sm:flex-row items-start space-x-0 sm:space-x-4 w-full">
              <div className="relative">
                <img
                  src={profileData.avatar_url || `https://ui-avatars.com/api/?name=${profileData.name}`}
                  alt={user?.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                {editing && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                )}
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  {editing ? (
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData((prev: ProfileData) => ({ ...prev, name: e.target.value }))}
                      className="text-2xl font-bold text-gray-900 border-b-2 border-gray-300 focus:border-green-500 outline-none"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                  )}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user?.role === 'mentor' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                    {user?.role}
                  </span>
                </div>

                {editing ? (
                  <div className="relative">
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData((prev: ProfileData) => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows={3}
                      maxLength={200}
                    />
                    <span className="absolute bottom-2 right-2 text-xs text-gray-400">
                      {profileData.bio.length} / 200
                    </span>
                  </div>
                ) : (
                  <p className="text-gray-600 max-w-2xl">{profileData.bio}</p>
                )}

                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Joined {new Date(user?.joined_at || '').toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setProfileData((prev: ProfileData) => ({ ...prev, isPublic: !prev.isPublic }))}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  profileData.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                {profileData.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>{profileData.isPublic ? 'Public' : 'Private'}</span>
              </button>

              {editing ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors">
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          {/* Contact Information */}
          {editing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={profileData.email}
                    readOnly
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData((prev: ProfileData) => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData((prev: ProfileData) => ({ ...prev, website: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, location: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Skills */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Skills & Interests</h3>
            {editing ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {allSkills.map((skill) => (
                  <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileData.skills.includes(skill)}
                      onChange={(e) => handleSkillChange(skill, e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{skill}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        {/* Stats and Achievements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">My Impact</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-lg bg-gray-100 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    achievement.earned
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${achievement.earned ? achievement.color : 'bg-gray-100 text-gray-400'}`}>
                      <achievement.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-medium ${achievement.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                        {achievement.title}
                      </h3>
                      <p className={`text-sm ${achievement.earned ? 'text-gray-600' : 'text-gray-400'}`}>
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                  {achievement.earned && (
                    <div className="mt-2 text-xs text-green-600 font-medium">✓ Earned</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {roadmaps.slice(0, 3).map((roadmap) => (
                <div key={roadmap.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{roadmap.title}</p>
                    <p className="text-sm text-gray-600">
                      {Math.round(roadmap.progress)}% complete • {roadmap.domain}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(roadmap.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}

              {roadmaps.length === 0 && (
                <p className="text-gray-500 text-center py-4">No roadmaps started yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Summary */}
          <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
            <h3 className="font-semibold mb-3">Learning Journey</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-green-100">Active Roadmaps</span>
                <span className="font-bold">{roadmaps.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-100">Completion Rate</span>
                <span className="font-bold">
                  {roadmaps.length > 0
                    ? Math.round(roadmaps.reduce((sum, r) => sum + (r.progress || 0), 0) / roadmaps.length)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-100">Total Earnings</span>
                <span className="font-bold">${balance}</span>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Account Settings</h3>
            </div>

            {info && <p className="mb-3 text-sm text-green-600 bg-green-50 p-2 rounded-md">{info}</p>}
            {error && <p className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded-md">{error}</p>}

            {/* Change Email Form */}
            <form onSubmit={handleEmailChange} className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700">Change Email</label>
              <div className="flex items-center">
                <div className="relative flex-grow">
                  <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    placeholder="New email address"
                    value={account.newEmail}
                    onChange={(e) => setAccount((prev) => ({ ...prev, newEmail: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-r-lg hover:bg-gray-200 font-medium text-sm">
                  Save
                </button>
              </div>
            </form>

            {/* Change Password Form */}
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Change Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="password"
                  placeholder="New password"
                  value={account.newPassword}
                  onChange={(e) => setAccount((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={account.confirmPassword}
                  onChange={(e) => setAccount((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                type="submit"
                className="w-full text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm">
                Update Password
              </button>
            </form>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Settings</h3>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">Email Notifications</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">Mentor Requests</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">Progress Updates</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
              </label>
            </div>
          </div>

          {/* Export Data */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Data & Privacy</h3>
            <div className="space-y-3">
              <button className="w-full text-left text-sm text-gray-700 hover:text-gray-900 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                Export Profile Data
              </button>
              <button
                onClick={handleDownloadCertificate}
                disabled={completedRoadmaps.length === 0}
                className="w-full text-left text-sm text-gray-700 hover:text-gray-900 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Download Certificate (First Completed)
              </button>
              <button className="w-full text-left text-sm text-red-600 hover:text-red-700 py-2 px-3 rounded-lg hover:bg-red-50 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);
};

export default Profile;