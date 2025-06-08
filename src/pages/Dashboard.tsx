import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Mic, 
  FileText, 
  BarChart3, 
  Users, 
  Settings, 
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Zap,
  Brain,
  Shield,
  Globe,
  Mail,
  Phone,
  Building2,
  Calendar,
  Eye,
  MessageSquare,
  Filter,
  Search,
  Download,
  MoreHorizontal,
  User,
  Timer,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import VoiceFormBuilder from '../components/VoiceFormBuilder';

interface ContactSubmission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  industry: string | null;
  phone: string | null;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  preferred_contact_method: 'email' | 'phone' | 'both';
  budget_range: string | null;
  timeline: string | null;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed' | 'lost';
  created_at: string;
  updated_at: string;
}

function Dashboard() {
  const { user } = useAuth();
  const [showVoiceBuilder, setShowVoiceBuilder] = useState(false);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchContactSubmissions();
  }, []);

  const fetchContactSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contact submissions:', error);
      } else {
        setContactSubmissions(data || []);
      }
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error updating submission status:', error);
      } else {
        // Update local state
        setContactSubmissions(prev => 
          prev.map(submission => 
            submission.id === id 
              ? { ...submission, status: status as any, updated_at: new Date().toISOString() }
              : submission
          )
        );
      }
    } catch (error) {
      console.error('Error updating submission status:', error);
    }
  };

  const filteredSubmissions = contactSubmissions.filter(submission => {
    const matchesSearch = 
      submission.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-purple-100 text-purple-800';
      case 'proposal': return 'bg-orange-100 text-orange-800';
      case 'closed': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'}!
              </h1>
              <p className="text-gray-600">Manage your voice forms and track your progress</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                <CheckCircle className="w-4 h-4 mr-1" />
                All Systems Operational
              </div>
              <button 
                onClick={() => setShowVoiceBuilder(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Form
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setSelectedTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setSelectedTab('contact-submissions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'contact-submissions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Contact Submissions ({contactSubmissions.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Overview Tab - Original Design */}
        {selectedTab === 'overview' && (
          <>
            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <button 
                onClick={() => setShowVoiceBuilder(true)}
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <Mic className="w-8 h-8" />
                  <ArrowRight className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Voice Form Builder</h3>
                <p className="text-blue-100 text-sm">Create forms using AI voice commands</p>
              </button>

              <Link 
                to="/templates"
                className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-8 h-8" />
                  <ArrowRight className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Templates</h3>
                <p className="text-emerald-100 text-sm">Browse and manage form templates</p>
              </Link>

              <button className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <BarChart3 className="w-8 h-8" />
                  <ArrowRight className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Analytics</h3>
                <p className="text-purple-100 text-sm">View performance metrics</p>
              </button>

              <button 
                onClick={() => setSelectedTab('contact-submissions')}
                className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8" />
                  <ArrowRight className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Contact Submissions</h3>
                <p className="text-orange-100 text-sm">Manage incoming inquiries</p>
              </button>
            </div>

            {/* Feature Highlights */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                <p className="text-gray-600 text-sm">Complete forms 95% faster with voice commands</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-200">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered</h3>
                <p className="text-gray-600 text-sm">Advanced AI understands context and intent</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-200">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure</h3>
                <p className="text-gray-600 text-sm">Enterprise-grade security and compliance</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Mic className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Voice Form Builder</h4>
                    <p className="text-sm text-gray-600">Ready to create your first voice-powered form</p>
                  </div>
                </div>
                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Templates Available</h4>
                    <p className="text-sm text-gray-600">Browse industry-specific form templates</p>
                  </div>
                </div>
                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <Globe className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Account Active</h4>
                    <p className="text-sm text-gray-600">Your account is ready for voice form creation</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Contact Submissions Tab - NEW */}
        {selectedTab === 'contact-submissions' && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Contact Submissions</h2>
                <div className="flex items-center space-x-4">
                  <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search submissions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="closed">Closed</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
            </div>

            {/* Submissions List */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredSubmissions.map((submission) => (
                    <div key={submission.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {submission.first_name} {submission.last_name}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(submission.status)}`}>
                              {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                            </span>
                            <span className={`text-xs font-medium ${getPriorityColor(submission.priority)}`}>
                              {submission.priority.toUpperCase()} PRIORITY
                            </span>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="w-4 h-4 mr-2" />
                                {submission.email}
                              </div>
                              {submission.phone && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="w-4 h-4 mr-2" />
                                  {submission.phone}
                                </div>
                              )}
                              {submission.company && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Building2 className="w-4 h-4 mr-2" />
                                  {submission.company}
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              {submission.budget_range && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <DollarSign className="w-4 h-4 mr-2" />
                                  {submission.budget_range}
                                </div>
                              )}
                              {submission.timeline && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Timer className="w-4 h-4 mr-2" />
                                  {submission.timeline}
                                </div>
                              )}
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="w-4 h-4 mr-2" />
                                {new Date(submission.created_at).toLocaleDateString()} at {new Date(submission.created_at).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <p className="text-sm text-gray-700">{submission.message}</p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <select
                              value={submission.status}
                              onChange={(e) => updateSubmissionStatus(submission.id, e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="qualified">Qualified</option>
                              <option value="proposal">Proposal</option>
                              <option value="closed">Closed</option>
                              <option value="lost">Lost</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Voice Form Builder Modal */}
      {showVoiceBuilder && (
        <VoiceFormBuilder onClose={() => setShowVoiceBuilder(false)} />
      )}
    </div>
  );
}

export default Dashboard;