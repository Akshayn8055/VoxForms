import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mic, 
  FileText, 
  BarChart3, 
  Users, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Share2,
  Download,
  Upload,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  TrendingUp,
  Calendar,
  Globe,
  Lock,
  Zap,
  Brain,
  Shield,
  LogOut,
  User,
  Bell,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import VoiceFormBuilder from '../components/VoiceFormBuilder';

function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showVoiceBuilder, setShowVoiceBuilder] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out failed:', error);
      navigate('/');
    }
  };

  const stats = [
    { label: 'Total Forms', value: '24', change: '+12%', icon: FileText, color: 'blue' },
    { label: 'Responses', value: '1,247', change: '+23%', icon: BarChart3, color: 'emerald' },
    { label: 'Completion Rate', value: '94%', change: '+5%', icon: CheckCircle, color: 'purple' },
    { label: 'Avg. Time Saved', value: '8.5min', change: '+2min', icon: Clock, color: 'orange' }
  ];

  const recentForms = [
    {
      id: 1,
      name: 'Patient Intake Form',
      responses: 156,
      lastResponse: '2 hours ago',
      status: 'active',
      completionRate: 94,
      avgTime: '3:45'
    },
    {
      id: 2,
      name: 'Employee Feedback Survey',
      responses: 89,
      lastResponse: '1 day ago',
      status: 'active',
      completionRate: 87,
      avgTime: '5:20'
    },
    {
      id: 3,
      name: 'Safety Inspection Checklist',
      responses: 234,
      lastResponse: '3 hours ago',
      status: 'active',
      completionRate: 96,
      avgTime: '4:15'
    },
    {
      id: 4,
      name: 'Customer Satisfaction',
      responses: 67,
      lastResponse: '5 hours ago',
      status: 'draft',
      completionRate: 0,
      avgTime: '0:00'
    }
  ];

  const quickActions = [
    {
      title: 'Quick Voice Form',
      description: 'Create forms using voice commands',
      icon: Mic,
      color: 'bg-blue-500',
      action: () => setShowVoiceBuilder(true)
    },
    {
      title: 'Template Library',
      description: 'Browse pre-built form templates',
      icon: FileText,
      color: 'bg-emerald-500',
      action: () => navigate('/templates')
    },
    {
      title: 'Import Form',
      description: 'Upload existing forms or documents',
      icon: Upload,
      color: 'bg-purple-500',
      action: () => {}
    },
    {
      title: 'Analytics',
      description: 'View detailed form performance',
      icon: BarChart3,
      color: 'bg-orange-500',
      action: () => {}
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
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
                  placeholder="Search forms, responses, or templates..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Help */}
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.user_metadata?.first_name || 'User'}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <User className="w-4 h-4 mr-3" />
                      Profile Settings
                    </button>
                    
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <Settings className="w-4 h-4 mr-3" />
                      Account Settings
                    </button>
                    
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <Bell className="w-4 h-4 mr-3" />
                      Notifications
                    </button>
                    
                    <div className="border-t border-gray-200 my-1"></div>
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your voice-powered forms today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${stat.color}-100`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full bg-${stat.color}-100 text-${stat.color}-700`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all hover:scale-105 text-left group"
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-gray-600 text-sm">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Forms */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Recent Forms</h2>
                  <div className="flex items-center space-x-3">
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <Filter className="w-4 h-4" />
                    </button>
                    <Link 
                      to="/templates"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Form
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {recentForms.map((form) => (
                  <div key={form.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{form.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{form.responses} responses</span>
                            <span>•</span>
                            <span>Last: {form.lastResponse}</span>
                            <span>•</span>
                            <span>Avg: {form.avgTime}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(form.status)}`}>
                          {form.status}
                        </span>
                        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <TrendingUp className="w-4 h-4 mr-1 text-emerald-500" />
                          {form.completionRate}% completion
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
              </div>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center text-sm">
                    <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                    <span className="text-gray-700">Your forms save users an average of 8.5 minutes</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-2" />
                    <span className="text-gray-700">Response rates increased 23% this month</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center text-sm">
                    <Star className="w-4 h-4 text-purple-500 mr-2" />
                    <span className="text-gray-700">Voice accuracy improved to 99.7%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">New response received</p>
                    <p className="text-xs text-gray-600">Patient Intake Form • 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">Form published</p>
                    <p className="text-xs text-gray-600">Safety Checklist • 1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <Share2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">Form shared with team</p>
                    <p className="text-xs text-gray-600">Employee Survey • 2 days ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Status */}
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center mb-3">
                <Shield className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Security Status</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center text-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>End-to-end Encryption</span>
                </div>
                <div className="flex items-center text-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>Blockchain Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Voice Form Builder Modal */}
      {showVoiceBuilder && (
        <VoiceFormBuilder onClose={() => setShowVoiceBuilder(false)} />
      )}

      {/* Click outside to close profile menu */}
      {showProfileMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;