import React, { useState, useEffect } from 'react';
import {
  Mail, Trash2, Eye, CheckCircle, AlertCircle, Loader,
  MessageSquare, Clock, User
} from 'lucide-react';
import axios from 'axios';

const TeacherMessages = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch messages on component mount and page change
  useEffect(() => {
    fetchMessages(currentPage);
    fetchUnreadCount();
  }, [currentPage]);

  const fetchMessages = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:3000/app/v1/teacher/messages?page=${page}&limit=10`, {
        withCredentials: true
      });

      if (response.data.success) {
        setMessages(response.data.data);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setErrorMessage('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('http://localhost:3000/app/v1/teacher/messages/unread-count', {
        withCredentials: true
      });

      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMarkAsRead = async (messageId, isRead) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/app/v1/teacher/messages/${messageId}/mark-read`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessages(messages.map(msg => 
          msg._id === messageId ? response.data.data : msg
        ));
        setSuccessMessage('Message marked as read');
        fetchUnreadCount();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
      setErrorMessage('Failed to mark message as read');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      const response = await axios.put(
        'http://localhost:3000/app/v1/teacher/messages/mark-all-read',
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        fetchMessages(currentPage);
        fetchUnreadCount();
        setSuccessMessage(`${response.data.data.modifiedCount} message(s) marked as read`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      setErrorMessage('Failed to mark all messages as read');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:3000/app/v1/teacher/messages/${messageId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessages(messages.filter(msg => msg._id !== messageId));
        setSuccessMessage('Message deleted successfully');
        fetchUnreadCount();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      setErrorMessage('Failed to delete message');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="mt-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Mail className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Department Messages</h2>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-100 text-sm">
          <CheckCircle className="w-4 h-4" />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-100 text-sm">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="w-8 h-8 text-blue-400 animate-spin mb-3" />
          <p className="text-white/70">Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-white/30 mx-auto mb-3" />
          <p className="text-white/70">No messages yet</p>
          <p className="text-white/50 text-sm mt-1">Messages from your department head will appear here</p>
        </div>
      ) : (
        <>
          {/* Messages List */}
          <div className="space-y-3">
            {messages.map(message => (
              <div
                key={message._id}
                className={`border rounded-xl p-4 transition-all duration-200 cursor-pointer ${
                  message.isRead
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
                }`}
                onClick={() => {
                  if (!message.isRead) {
                    handleMarkAsRead(message._id, message.isRead);
                  }
                  setExpandedMessage(expandedMessage === message._id ? null : message._id);
                }}
              >
                {/* Message Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`font-semibold text-lg ${
                        message.isRead ? 'text-white' : 'text-blue-100'
                      }`}>
                        {message.subject}
                      </h3>
                      {!message.isRead && (
                        <span className="inline-block w-2 h-2 bg-blue-400 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-white/70 text-sm flex items-center gap-2">
                      <User className="w-4 h-4" />
                      From: {message.sender.name}
                    </p>
                    <p className="text-white/50 text-xs flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(message.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!message.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(message._id, message.isRead);
                        }}
                        className="p-2 hover:bg-blue-500/30 rounded-lg text-blue-300 hover:text-blue-200 transition-all duration-200"
                        title="Mark as read"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMessage(message._id);
                      }}
                      className="p-2 hover:bg-red-500/30 rounded-lg text-red-300 hover:text-red-200 transition-all duration-200"
                      title="Delete message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Message Content */}
                {expandedMessage === message._id && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-white/90 whitespace-pre-wrap text-sm leading-relaxed">
                      {message.message}
                    </p>
                    {message.readAt && (
                      <p className="text-white/50 text-xs mt-3">
                        Read on {new Date(message.readAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
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
  );
};

export default TeacherMessages;
