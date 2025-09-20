import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'learner' as 'learner' | 'mentor',
    skills: ''
  });
  const [error, setError] = useState('');
  const [info, setInfo] = useState(''); // general info messages (e.g., check email)
  const [usernameFeedback, setUsernameFeedback] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false); // Default to false until checked
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        navigate('/dashboard');
      } else {
        await signup({
          ...formData,
          skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
        });
        // If email confirmation is enabled, there will be no active session yet.
        setInfo("Signup successful! We've sent a confirmation link to your email. Please check your inbox to complete your signup.");
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const checkUsername = useCallback(async (username: string) => {
    if (username.length < 3) {
      setUsernameFeedback('Username must be at least 3 characters.');
      setIsUsernameAvailable(false);
      return;
    }
    if (username.length > 20) {
        setUsernameFeedback('Username must be 20 characters or less.');
        setIsUsernameAvailable(false);
        return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameFeedback('Only letters, numbers, and underscores allowed.');
      setIsUsernameAvailable(false);
      return;
    }

    setIsCheckingUsername(true);
    setUsernameFeedback('');

    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();

    setIsCheckingUsername(false);

    if (data) {
      setUsernameFeedback('Username is already taken.');
      setIsUsernameAvailable(false);
    } else if (error && error.code === 'PGRST116') {
      setUsernameFeedback('Username is available!');
      setIsUsernameAvailable(true);
    } else {
        setUsernameFeedback('Error checking username.');
        setIsUsernameAvailable(false);
    }
  }, []);

  const debouncedCheckUsername = useCallback((username: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      checkUsername(username);
    }, 500); // 500ms delay
  }, [checkUsername]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'username') {
      if (value.trim() === '') {
        setUsernameFeedback('');
        setIsUsernameAvailable(false);
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      } else {
        debouncedCheckUsername(value);
      }
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setInfo('');
        if (!formData.email) {
      setError('Please enter your email or username in the field above first.');
      return;
    }

    try {
      let emailToUse = formData.email;
      if (!formData.email.includes('@')) {
        const { data, error } = await supabase
          .from('profiles')
          .select('users(email)')
          .eq('username', formData.email)
          .single();
        if (error || !data) throw new Error('Account not found for this username');
        const extracted = (data as any)?.users?.email;
        if (!extracted) throw new Error('Email not found for this username');
        emailToUse = extracted;
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(emailToUse, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
            setInfo('Password reset email sent. Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              {isLogin ? 'Welcome Back' : 'Create Your Account'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {isLogin ? 'Sign in to continue your journey.' : 'Join SkillBridge AI and start learning.'}
            </p>
          </div>

          {info && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
              {info}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Enter your full name" />
                  </div>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input id="username" name="username" type="text" required value={formData.username} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="3-20 characters, letters, numbers, _" />
                    {usernameFeedback && (
                      <p className={`mt-1 text-sm ${isUsernameAvailable ? 'text-green-600' : 'text-red-600'}`}>
                        {isCheckingUsername ? 'Checking...' : usernameFeedback}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{isLogin ? 'Email or Username' : 'Email Address'}</label>
                <input id="email" name="email" type="text" required value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder={isLogin ? 'Enter your email or username' : 'Enter your email'} />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 pr-10" placeholder="Enter your password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </button>
                </div>
                {isLogin && (
                  <div className="mt-2 text-right">
                    <button type="button" onClick={handleForgotPassword} className="text-sm text-green-600 hover:text-green-700">Forgot password?</button>
                  </div>
                )}
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, role: 'learner' }))} className={`px-4 py-3 rounded-lg text-center font-medium border-2 transition-all ${formData.role === 'learner' ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'}`}>Learner</button>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, role: 'mentor' }))} className={`px-4 py-3 rounded-lg text-center font-medium border-2 transition-all ${formData.role === 'mentor' ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'}`}>Mentor</button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">Skills/Interests</label>
                    <input id="skills" name="skills" type="text" value={formData.skills} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g., JavaScript, React" />
                    <p className="mt-1 text-sm text-gray-500">Separate skills with commas</p>
                  </div>
                </>
              )}

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading || (!isLogin && !isUsernameAvailable)} className="w-full mt-6 bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-all">
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </div>
            <div className="text-center">
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-green-600 hover:text-green-500 font-medium">
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </div>
    </div>
  );
};

export default Auth;