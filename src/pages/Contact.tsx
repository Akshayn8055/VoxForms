import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageSquare,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  Building2,
  User,
  DollarSign,
  Timer,
  Star,
  Globe
} from 'lucide-react';
import { supabase } from '../lib/supabase';

function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    industry: '',
    phone: '',
    message: '',
    priority: 'medium',
    preferredContactMethod: 'email',
    budgetRange: '',
    timeline: '',
    source: 'website'
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const industries = [
    'Healthcare',
    'Construction & Field Work',
    'Human Resources',
    'Legal Services',
    'Education',
    'Real Estate',
    'Manufacturing',
    'Technology',
    'Finance',
    'Retail',
    'Other'
  ];

  const budgetRanges = [
    'Under $1,000/month',
    '$1,000 - $5,000/month',
    '$5,000 - $10,000/month',
    '$10,000 - $25,000/month',
    '$25,000+/month',
    'Enterprise (Custom pricing)'
  ];

  const timelines = [
    'Immediate (Within 1 week)',
    'Short-term (1-4 weeks)',
    'Medium-term (1-3 months)',
    'Long-term (3+ months)',
    'Just exploring options'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.message.trim()) {
      setError('Message is required');
      return false;
    }
    if (formData.message.trim().length < 10) {
      setError('Message must be at least 10 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { error: submitError } = await supabase
        .from('contact_submissions')
        .insert([
          {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            email: formData.email.trim().toLowerCase(),
            company: formData.company.trim() || null,
            industry: formData.industry || null,
            phone: formData.phone.trim() || null,
            message: formData.message.trim(),
            priority: formData.priority,
            preferred_contact_method: formData.preferredContactMethod,
            budget_range: formData.budgetRange || null,
            timeline: formData.timeline || null,
            source: formData.source
          }
        ]);

      if (submitError) {
        throw submitError;
      }

      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        industry: '',
        phone: '',
        message: '',
        priority: 'medium',
        preferredContactMethod: 'email',
        budgetRange: '',
        timeline: '',
        source: 'website'
      });

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);

    } catch (err) {
      console.error('Error submitting contact form:', err);
      setError('Failed to submit your message. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step guides',
      icon: MessageSquare,
      color: 'bg-blue-100 text-blue-600',
      action: 'Browse Videos'
    },
    {
      title: 'Live Chat Support',
      description: 'Get instant help from our team',
      icon: MessageSquare,
      color: 'bg-emerald-100 text-emerald-600',
      action: 'Start Chat'
    },
    {
      title: 'Contact Support',
      description: 'Submit a support ticket',
      icon: Mail,
      color: 'bg-purple-100 text-purple-600',
      action: 'Contact Us'
    },
    {
      title: 'Schedule Demo',
      description: 'Book a personalized walkthrough',
      icon: Phone,
      color: 'bg-orange-100 text-orange-600',
      action: 'Book Demo'
    }
  ];

  return (
    <div className="py-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Get in
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Touch</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to transform your workflow? Our team is here to help you get started 
            with VoiceForm Pro and answer any questions you might have.
          </p>
        </div>
      </section>

      {/* Success Message */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <h4 className="text-green-800 font-medium">Message sent successfully!</h4>
              <p className="text-green-700 text-sm">We'll get back to you within 24 hours.</p>
            </div>
          </div>
        </div>
      )}

      {/* Contact Options */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Send us a message</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <div className="relative">
                      <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Smith"
                    />
                  </div>
                </div>
                
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                {/* Company and Industry */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <div className="relative">
                      <Building2 className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your Company"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <select
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select your industry</option>
                      {industries.map(industry => (
                        <option key={industry} value={industry.toLowerCase()}>{industry}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                {/* Priority and Contact Method */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <div className="relative">
                      <Star className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="preferredContactMethod" className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Contact Method
                    </label>
                    <select
                      id="preferredContactMethod"
                      name="preferredContactMethod"
                      value={formData.preferredContactMethod}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="both">Both Email and Phone</option>
                    </select>
                  </div>
                </div>

                {/* Budget and Timeline */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="budgetRange" className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Range
                    </label>
                    <div className="relative">
                      <DollarSign className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <select
                        id="budgetRange"
                        name="budgetRange"
                        value={formData.budgetRange}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select budget range</option>
                        {budgetRanges.map(range => (
                          <option key={range} value={range}>{range}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
                      Implementation Timeline
                    </label>
                    <div className="relative">
                      <Timer className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <select
                        id="timeline"
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select timeline</option>
                        {timelines.map(timeline => (
                          <option key={timeline} value={timeline}>{timeline}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about your needs and how we can help..."
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.message.length}/500 characters (minimum 10 required)
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Send className="w-5 h-5 mr-2" />
                  )}
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Other ways to reach us</h2>
              
              <div className="space-y-8 mb-12">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Email Support</h3>
                    <p className="text-gray-600 mb-2">Get help from our support team</p>
                    <a href="mailto:support@voiceformpro.com" className="text-blue-600 hover:text-blue-700">
                      support@voiceformpro.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                    <Phone className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Phone Support</h3>
                    <p className="text-gray-600 mb-2">Speak directly with our team</p>
                    <a href="tel:+1-555-123-4567" className="text-blue-600 hover:text-blue-700">
                      +1 (555) 123-4567
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Office Location</h3>
                    <p className="text-gray-600">
                      123 Innovation Drive<br />
                      San Francisco, CA 94105<br />
                      United States
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Business Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 6:00 PM PST<br />
                      Saturday: 10:00 AM - 4:00 PM PST<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule a Demo
                </button>
                
                <button className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Start Live Chat
                </button>
                
                <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center">
                  <Users className="w-5 h-5 mr-2" />
                  Talk to Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Common Questions
            </h2>
            <p className="text-xl text-gray-600">
              Quick answers to questions you might have
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How quickly can I get started?
              </h3>
              <p className="text-gray-600">
                You can start using VoiceForm Pro immediately with our 14-day free trial. 
                No setup required - just sign up and start speaking to forms.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer training and onboarding?
              </h3>
              <p className="text-gray-600">
                Yes! We provide comprehensive onboarding for all new customers, including 
                training sessions, best practices, and ongoing support.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can VoiceForm Pro integrate with our existing systems?
              </h3>
              <p className="text-gray-600">
                Absolutely. We offer API integrations and can work with your team to 
                connect VoiceForm Pro with your existing workflows and systems.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What kind of support do you provide?
              </h3>
              <p className="text-gray-600">
                We offer email support for all customers, priority support for Professional 
                plans, and dedicated 24/7 support for Enterprise customers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;