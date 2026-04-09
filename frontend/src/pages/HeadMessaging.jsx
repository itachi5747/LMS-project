import React, { useState, useEffect } from 'react';
import {
  Send, Mail, Users, MessageSquare, Trash2, Eye, EyeOff,
  CheckCircle, AlertCircle, ArrowLeft, RefreshCw, Loader
} from 'lucide-react';
import { Link } from "react-router-dom";
import axios from 'axios';

const HeadMessaging = () => {
  const [messageType, setMessageType] = useState('single'); // 'single' or 'all'
  const [formData, setFormData] = useState({
    instructorId: '',
    subject: '',
    message: ''
  });

  const [instructors, setInstructors] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [viewSentMessages, setViewSentMessages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch instructors and sent messages on component mount
  useEffect(() => {
    fetchInstructors();
    fetchSentMessages();
  }, []);

  // Fetch messages on page change
  useEffect(() => {
    if (viewSentMessages) {
      fetchSentMessages(currentPage);
    }
  }, [currentPage, viewSentMessages]);

  const fetchInstructors = async () => {
    try {
      const response = await axios.get("http://localhost:3000/app/v1/head-dept/department-users?role=instructor", {
        withCredentials: true
      });

      if (response.data.success) {
        // Filter only instructors
        // const instructorsList = response.data.data.filter(user => user.role === 'instructor');
        // console.log(instructorsList);
        
        setInstructors(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
      setErrors(prev => ({
        ...prev,
        fetch: 'Failed to load instructors'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSentMessages = async (page = 1) => {
    try {
      const response = await axios.get(`http://localhost:3000/app/v1/head-dept/sent-messages?page=${page}&limit=10`, {
        withCredentials: true
      });

      if (response.data.success) {
        setSentMessages(response.data.data);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching sent messages:', error);
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'subject':
        return value.trim().length < 3 ? 'Subject must be at least 3 characters' : '';
      case 'message':
        return value.trim().length < 10 ? 'Message must be at least 10 characters' : '';
      case 'instructorId':
        if (messageType === 'single') {
          return !value ? 'Please select an instructor' : '';
        }
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (messageType === 'single' && !formData.instructorId) {
      newErrors.instructorId = 'Please select an instructor';
    }

    const subjectError = validateField('subject', formData.subject);
    if (subjectError) newErrors.subject = subjectError;

    const messageError = validateField('message', formData.message);
    if (messageError) newErrors.message = messageError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = messageType === 'single'
        ? 'http://localhost:3000/app/v1/head-dept/send-message-to-instructor'
        : 'http://localhost:3000/app/v1/head-dept/send-message-to-all-instructors';

      const payload = messageType === 'single'
        ? {
            instructorId: formData.instructorId,
            subject: formData.subject,
            message: formData.message
          }
        : {
            subject: formData.subject,
            message: formData.message
          };

      const response = await axios.post(endpoint, payload, {
        withCredentials: true
      });

      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setFormData({
          instructorId: '',
          subject: '',
          message: ''
        });
        // Refresh sent messages
        fetchSentMessages();
      } else {
        setErrors({ submit: response.data.message || 'Failed to send message' });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send message. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:3000/app/v1/head-dept/messages/${messageId}`, {
        withCredentials: true
      });

      if (response.data.success) {
        setSentMessages(sentMessages.filter(msg => msg._id !== messageId));
        setSuccessMessage('Message deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      setErrors({ submit: 'Failed to delete message' });
    }
  };

  const handleReset = () => {
    setFormData({
      instructorId: '',
      subject: '',
      message: ''
    });
    setErrors({});
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      {/* Back Button */}
      <Link
        to="/head-department/dashboard"
        className="mb-6 flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Department Messaging</h1>
              <p className="text-white/70">Send notifications to instructors in your department</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Send Message Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send Message
              </h2>

              {/* Message Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white/90 mb-3">
                  Message Type
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMessageType('single');
                      setFormData({ ...formData, instructorId: '' });
                      setErrors({ ...errors, instructorId: '' });
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      messageType === 'single'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Single Instructor
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMessageType('all');
                      setFormData({ ...formData, instructorId: '' });
                      setErrors({ ...errors, instructorId: '' });
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      messageType === 'all'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    All Instructors
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Success Message */}
                {successMessage && (
                  <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-100 font-medium">{successMessage}</span>
                  </div>
                )}

                {/* Error Message */}
                {errors.submit && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-100 font-medium">{errors.submit}</span>
                  </div>
                )}

                {/* Instructor Selection - Only for single message */}
                {messageType === 'single' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Select Instructor
                    </label>
                    <div className="relative">
                      <Users className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none w-5 h-5 text-white/50" />
                      <select
                        name="instructorId"
                        value={formData.instructorId}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 appearance-none ${
                          errors.instructorId ? 'border-red-500/50' : 'border-white/20'
                        }`}
                      >
                        <option value="">Choose an instructor...</option>
                        {instructors.map(instructor => (
                          <option key={instructor._id} value={instructor._id}>
                            {instructor.name} ({instructor.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.instructorId && (
                      <p className="text-red-400 text-sm flex items-center gap-1 mt-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.instructorId}
                      </p>
                    )}
                  </div>
                )}

                {/* Subject Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Subject
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none w-5 h-5 text-white/50" />
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="Enter message subject"
                      className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 ${
                        errors.subject ? 'border-red-500/50' : 'border-white/20'
                      }`}
                    />
                  </div>
                  {errors.subject && (
                    <p className="text-red-400 text-sm flex items-center gap-1 mt-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Message Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Write your message here..."
                    rows={6}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 resize-none ${
                      errors.message ? 'border-red-500/50' : 'border-white/20'
                    }`}
                  />
                  {errors.message && (
                    <p className="text-red-400 text-sm flex items-center gap-1 mt-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white/90 hover:text-white rounded-xl font-medium transition-all duration-200 border border-white/20 hover:border-white/30"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-white/70 text-sm">Total Instructors</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {isLoading ? <Loader className="w-6 h-6 animate-spin" /> : instructors.length}
                  </p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Sent Messages</p>
                  <p className="text-3xl font-bold text-cyan-400">
                    {sentMessages.length}
                  </p>
                </div>
              </div>
            </div>

            {/* View Messages Toggle */}
            <button
              onClick={() => {
                setViewSentMessages(!viewSentMessages);
                setCurrentPage(1);
              }}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              {viewSentMessages ? (
                <>
                  <EyeOff className="w-5 h-5" />
                  Hide Sent Messages
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5" />
                  View Sent Messages
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sent Messages Section */}
        {viewSentMessages && (
          <div className="mt-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Sent Messages
            </h2>

            {sentMessages.length === 0 ? (
              <p className="text-white/70 text-center py-8">No messages sent yet</p>
            ) : (
              <>
                <div className="space-y-4">
                  {sentMessages.map(message => (
                    <div
                      key={message._id}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{message.subject}</h4>
                          <p className="text-white/70 text-sm">
                            To: {message.recipient.name}
                          </p>
                          <p className="text-white/50 text-xs mt-1">
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteMessage(message._id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-white/80 text-sm line-clamp-2">
                        {message.message}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-white/10">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200"
                    >
                      Previous
                    </button>
                    <span className="text-white/70">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeadMessaging;
