import React, { useState } from 'react';
import { 
  Mic, 
  Plus, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Bell, 
  Search,
  Filter,
  Calendar,
  Clock,
  TrendingUp,
  Activity,
  Zap,
  Shield,
  Star,
  ArrowRight,
  Play,
  Pause,
  MoreHorizontal,
  User,
  LogOut,
  Edit,
  Lock,
  Globe,
  Smartphone,
  Mail,
  Eye,
  EyeOff,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Camera,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.user_metadata?.first_name || '',
    lastName: user?.user_metadata?.last_name || '',
    email: user?.email || '',
    company: user?.user_metadata?.company || '',
    phone: user?.user_metadata?.phone || '',
    timezone: 'UTC-8',
    language: 'en'
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    formCompletions: true,
    teamUpdates: false,
    securityAlerts: true,
    weeklyReports: true
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out failed:', error);
      navigate('/');
    }
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle profile update logic here
    console.log('Updating profile:', profileData);
    setShowProfileModal(false);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password change logic here
    console.log('Changing password');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name[0]}${user.user_metadata.last_name[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
    }
    return user?.email || 'User';
  };

  // Sample data for dashboard
  const recentForms = [
    {
      id: 1,
      name: 'Patient Intake - John Smith',
      status: 'completed',
      completedAt: '2 hours ago',
      duration: '3:45',
      accuracy: 98.5
    },
    {
      id: 2,
      name: 'Safety Inspection - Building A',
      status: 'in-progress',
      startedAt: '5 minutes ago',
      duration: '2:15',
      accuracy: 96.2
    },
    {
      id: 3,
      name: 'Employee Onboarding - Sarah Johnson',
      status: 'completed',
      completedAt: '1 day ago',
      duration: '8:30',
      accuracy: 99.1
    }
  ];

  const stats = [
    {
      title: 'Forms Completed',
      value: '247',
      change: '+12%',
      trend: 'up',
      icon: FileText,
      color: 'blue'
    },
    {
      title: 'Time Saved',
      value: '18.5h',
      change: '+8%',
      trend: 'up',
      icon: Clock,
      color: 'emerald'
    },
    {
      title: 'Accuracy Rate',
      value: '98.7%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: 'Team Members',
      value: '12',
      change: '+2',
      trend: 'up',
      icon: Users,
      color: 'orange'
    }
  ];

  const ProfileModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
            <button 
              onClick={() => setShowProfileModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-6 mt-6">
            <button
              onClick={() => setActiveProfileTab('profile')}
              className={`pb-2 border-b-2 transition-colors ${
                activeProfileTab === 'profile'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveProfileTab('security')}
              className={`pb-2 border-b-2 transition-colors ${
                activeProfileTab === 'security'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveProfileTab('preferences')}
              className={`pb-2 border-b-2 transition-colors ${
                activeProfileTab === 'preferences'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Preferences
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {activeProfileTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {getUserInitials()}
                </div>
                <div>
                  <button
                    type="button"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </button>
                  <p className="text-sm text-gray-600 mt-1">JPG, PNG up to 5MB</p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    value={profileData.company}
                    onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={profileData.timezone}
                    onChange={(e) => setProfileData({...profileData, timezone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="UTC-8">Pacific Time (UTC-8)</option>
                    <option value="UTC-7">Mountain Time (UTC-7)</option>
                    <option value="UTC-6">Central Time (UTC-6)</option>
                    <option value="UTC-5">Eastern Time (UTC-5)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={profileData.language}
                    onChange={(e) => setProfileData({...profileData, language: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeProfileTab === 'security' && (
            <div className="space-y-6">
              {/* Change Password */}
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Password
                </button>
              </form>

              {/* Two-Factor Authentication */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Authenticator App</h4>
                      <p className="text-sm text-gray-600">Use an authenticator app for additional security</p>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Enable
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <Smartphone className="w-5 h-5 text-gray-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Current Session</h4>
                        <p className="text-sm text-gray-600">Chrome on macOS • San Francisco, CA</p>
                      </div>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeProfileTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
              
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {key === 'emailNotifications' && 'Receive notifications via email'}
                        {key === 'pushNotifications' && 'Receive push notifications in browser'}
                        {key === 'formCompletions' && 'Get notified when forms are completed'}
                        {key === 'teamUpdates' && 'Updates about your team and collaborators'}
                        {key === 'securityAlerts' && 'Important security and account alerts'}
                        {key === 'weeklyReports' && 'Weekly summary of your activity'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setNotifications({...notifications, [key]: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data & Privacy</h3>
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <Download className="w-5 h-5 text-blue-600 mr-3" />
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900">Download Your Data</h4>
                        <p className="text-sm text-gray-600">Export all your forms and data</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600">
                    <div className="flex items-center">
                      <Trash2 className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <h4 className="font-medium">Delete Account</h4>
                        <p className="text-sm text-red-500">Permanently delete your account and data</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">VoiceForm Pro</span>
              </Link>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search forms, templates, or team members..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {getUserInitials()}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900">{getUserDisplayName()}</div>
                    <div className="text-xs text-gray-600">{user?.email}</div>
                  </div>
                </button>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {getUserDisplayName().split(' ')[0]}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your voice forms today.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Link
            to="/templates"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <Plus className="w-8 h-8" />
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Create Form</h3>
            <p className="text-blue-100 text-sm">Start with a template or build from scratch</p>
          </Link>

          <button className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow text-left group">
            <div className="flex items-center justify-between mb-4">
              <Mic className="w-8 h-8 text-emerald-600" />
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Demo</h3>
            <p className="text-gray-600 text-sm">Try our voice form technology</p>
          </button>

          <Link
            to="/templates"
            className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-purple-600" />
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Templates</h3>
            <p className="text-gray-600 text-sm">Browse industry-specific templates</p>
          </Link>

          <button className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow text-left group">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-orange-600" />
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600 text-sm">View your performance metrics</p>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Forms */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Forms</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {recentForms.map((form) => (
                  <div key={form.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                        form.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        {form.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{form.name}</h3>
                        <p className="text-sm text-gray-600">
                          {form.status === 'completed' ? `Completed ${form.completedAt}` : `Started ${form.startedAt}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{form.duration}</div>
                      <div className="text-sm text-gray-600">{form.accuracy}% accuracy</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Forms Completed</span>
                  <span className="font-semibold text-gray-900">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Time Saved</span>
                  <span className="font-semibold text-gray-900">2.5h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Avg Accuracy</span>
                  <span className="font-semibold text-gray-900">98.2%</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white p-6 rounded-2xl">
              <div className="flex items-center mb-4">
                <Zap className="w-6 h-6 mr-2" />
                <h3 className="text-lg font-bold">Pro Tip</h3>
              </div>
              <p className="text-emerald-100 text-sm">
                Use voice summaries to quickly review completed forms and share with your team.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      {showProfileModal && <ProfileModal />}
    </div>
  );
}

export default Dashboard;