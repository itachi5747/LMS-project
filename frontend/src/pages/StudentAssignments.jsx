import React, { useState, useEffect } from 'react';
import {
  BookOpen, Users, ArrowLeft, RefreshCw, AlertCircle,
  FileText, Calendar, Clock, Upload, CheckCircle2,
  Download, ExternalLink, Filter, ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const StudentAssignments = () => {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        'http://localhost:3000/app/v1/student/assignments',
        { withCredentials: true }
      );
      if (response.data.success) {
        setAssignments(response.data.data || []);
        setError('');
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError(err.response?.data?.message || 'Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (selected.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      e.target.value = '';
      return;
    }

    setFile(selected);
  };

  const handleSubmit = async (assignmentId) => {
    if (!file) {
      toast.error('Please select a file to submit');
      return;
    }

    setSubmittingId(assignmentId);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `http://localhost:3000/app/v1/student/assignments/${assignmentId}/submit`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setFile(null);
        setSelectedAssignment(null);
        fetchAssignments();
      }
    } catch (err) {
      console.error('Error submitting assignment:', err);
      toast.error(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmittingId(null);
    }
  };

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const due = new Date(deadline);
    const diff = due - now;

    if (diff <= 0) return 'Overdue';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m remaining`;
  };

  const getStatusColor = (assignment) => {
    if (assignment.submission) return 'green';
    if (assignment.isOverdue) return 'red';
    const diff = new Date(assignment.deadline) - new Date();
    const days = diff / (1000 * 60 * 60 * 24);
    if (days < 2) return 'yellow';
    return 'blue';
  };

  const getStatusLabel = (assignment) => {
    if (assignment.submission) return 'Submitted';
    if (assignment.isOverdue) return 'Overdue';
    if (assignment.submissionType === 'class') return 'Submit in Class';
    return 'Pending';
  };

  const filteredAssignments = assignments.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !a.submission && !a.isOverdue && a.submissionType === 'dashboard';
    if (filter === 'submitted') return !!a.submission;
    if (filter === 'overdue') return a.isOverdue && !a.submission;
    if (filter === 'class') return a.submissionType === 'class';
    return true;
  });

  const pendingCount = assignments.filter(a => !a.submission && !a.isOverdue && a.submissionType === 'dashboard').length;
  const submittedCount = assignments.filter(a => !!a.submission).length;
  const overdueCount = assignments.filter(a => a.isOverdue && !a.submission).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin">
          <RefreshCw className="w-12 h-12 text-blue-400" />
        </div>
        <p className="ml-4 text-white/70 text-lg">Loading assignments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      {/* Back Button */}
      <Link
        to="/student/dashboard"
        className="mb-6 inline-flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">My Assignments</h1>
            <p className="text-white/70">View and submit your course assignments</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Total</p>
              <p className="text-3xl font-bold text-white">{assignments.length}</p>
            </div>
            <FileText className="w-10 h-10 text-blue-400/40" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Pending</p>
              <p className="text-3xl font-bold text-white">{pendingCount}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-400/40" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Submitted</p>
              <p className="text-3xl font-bold text-white">{submittedCount}</p>
            </div>
            <CheckCircle2 className="w-10 h-10 text-green-400/40" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Overdue</p>
              <p className="text-3xl font-bold text-white">{overdueCount}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-red-400/40" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-3 flex-wrap">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'submitted', label: 'Submitted' },
            { key: 'overdue', label: 'Overdue' },
            { key: 'class', label: 'In-Class' }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                filter === f.key
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-100">{error}</p>
          </div>
        </div>
      )}

      {/* Assignments List */}
      <div className="max-w-7xl mx-auto">
        {filteredAssignments.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
            <FileText className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Assignments Found</h3>
            <p className="text-white/70">
              {filter === 'all'
                ? 'No assignments have been posted for your enrolled courses yet.'
                : `No ${filter} assignments found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map(assignment => {
              const statusColor = getStatusColor(assignment);
              const statusLabel = getStatusLabel(assignment);
              const isExpanded = selectedAssignment === assignment._id;

              return (
                <div
                  key={assignment._id}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-xl hover:border-white/30 transition-all duration-300"
                >
                  {/* Assignment Header */}
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => setSelectedAssignment(isExpanded ? null : assignment._id)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            statusColor === 'green' ? 'bg-green-500/20' :
                            statusColor === 'red' ? 'bg-red-500/20' :
                            statusColor === 'yellow' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                          }`}>
                            <FileText className={`w-5 h-5 ${
                              statusColor === 'green' ? 'text-green-400' :
                              statusColor === 'red' ? 'text-red-400' :
                              statusColor === 'yellow' ? 'text-yellow-400' : 'text-blue-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white">{assignment.title}</h3>
                            <p className="text-white/60 text-sm">
                              {assignment.course?.title} ({assignment.course?.code})
                            </p>
                          </div>
                        </div>
                        {assignment.description && (
                          <p className="text-white/70 text-sm ml-13 line-clamp-2">{assignment.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {/* Status Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusColor === 'green' ? 'bg-green-500/20 border border-green-500/30 text-green-300' :
                          statusColor === 'red' ? 'bg-red-500/20 border border-red-500/30 text-red-300' :
                          statusColor === 'yellow' ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300' :
                          'bg-blue-500/20 border border-blue-500/30 text-blue-300'
                        }`}>
                          {statusLabel}
                        </span>

                        {/* Deadline */}
                        <div className="text-right hidden md:block">
                          <p className="text-white/70 text-xs">Deadline</p>
                          <p className="text-white text-sm font-medium">
                            {new Date(assignment.deadline).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </p>
                          <p className={`text-xs font-medium ${
                            assignment.isOverdue ? 'text-red-400' :
                            statusColor === 'yellow' ? 'text-yellow-400' : 'text-white/50'
                          }`}>
                            {getTimeRemaining(assignment.deadline)}
                          </p>
                        </div>

                        <ChevronDown className={`w-5 h-5 text-white/50 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180' : ''
                        }`} />
                      </div>
                    </div>

                    {/* Mobile deadline */}
                    <div className="mt-3 flex items-center gap-4 md:hidden">
                      <div className="flex items-center gap-1 text-white/60 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(assignment.deadline).toLocaleDateString()}</span>
                      </div>
                      <span className={`text-xs font-medium ${
                        assignment.isOverdue ? 'text-red-400' : 'text-white/50'
                      }`}>
                        {getTimeRemaining(assignment.deadline)}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-white/10 p-6 bg-white/5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Assignment Details */}
                        <div className="space-y-4">
                          <h4 className="text-white font-semibold flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-400" />
                            Assignment Details
                          </h4>

                          <div className="space-y-3">
                            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                              <p className="text-white/60 text-xs mb-1">Instructor</p>
                              <p className="text-white font-medium text-sm">{assignment.createdBy?.name || 'N/A'}</p>
                            </div>

                            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                              <p className="text-white/60 text-xs mb-1">Deadline</p>
                              <p className="text-white font-medium text-sm">
                                {new Date(assignment.deadline).toLocaleString('en-US', {
                                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                                  hour: '2-digit', minute: '2-digit'
                                })}
                              </p>
                            </div>

                            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                              <p className="text-white/60 text-xs mb-1">Submission Method</p>
                              <p className="text-white font-medium text-sm">
                                {assignment.submissionType === 'dashboard'
                                  ? '📤 Upload on Dashboard'
                                  : '🏫 Submit in Class'}
                              </p>
                            </div>

                            {assignment.description && (
                              <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                                <p className="text-white/60 text-xs mb-1">Description</p>
                                <p className="text-white/80 text-sm">{assignment.description}</p>
                              </div>
                            )}

                            {/* Download Assignment File */}
                            <a
                              href={`http://localhost:3000/app/v1/student/assignments/${assignment._id}/download`}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-all duration-200 group"
                            >
                              <Download className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                              <div>
                                <p className="text-blue-300 font-medium text-sm">Download Assignment Instructions</p>
                                <p className="text-white/50 text-xs">PDF / DOC file</p>
                              </div>
                              <ExternalLink className="w-4 h-4 text-blue-400/50 ml-auto" />
                            </a>
                          </div>
                        </div>

                        {/* Submission Section */}
                        <div className="space-y-4">
                          <h4 className="text-white font-semibold flex items-center gap-2">
                            <Upload className="w-4 h-4 text-purple-400" />
                            Submission
                          </h4>

                          {/* Already submitted */}
                          {assignment.submission && (
                            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                              <div className="flex items-center gap-2 mb-3">
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                                <p className="text-green-300 font-semibold">Assignment Submitted</p>
                              </div>
                              <div className="space-y-2">
                                <div className="p-2 bg-white/5 rounded-lg">
                                  <p className="text-white/60 text-xs">File</p>
                                  <p className="text-white text-sm font-medium">{assignment.submission.fileName}</p>
                                </div>
                                <div className="p-2 bg-white/5 rounded-lg">
                                  <p className="text-white/60 text-xs">Submitted At</p>
                                  <p className="text-white text-sm font-medium">
                                    {new Date(assignment.submission.submittedAt).toLocaleString()}
                                  </p>
                                </div>
                                <a
                                  href={assignment.submission.fileUrl}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-green-400 hover:text-green-300 text-sm mt-2 transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                  View Submitted File
                                </a>
                              </div>
                            </div>
                          )}

                          {/* Upload form - dashboard type, not overdue */}
                          {assignment.submissionType === 'dashboard' && !assignment.isOverdue && (
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                              <p className="text-white/80 text-sm mb-3">
                                {assignment.submission
                                  ? 'Want to resubmit? Upload a new file below:'
                                  : 'Upload your assignment file:'}
                              </p>
                              <div className="space-y-3">
                                <input
                                  type="file"
                                  id={`file-${assignment._id}`}
                                  onChange={handleFileChange}
                                  className="hidden"
                                  accept=".pdf,.doc,.docx,.cpp,.py,.java,.js,.ts,.c,.h,.hpp,.cs,.rb,.go,.rs,.php,.swift,.kt,.r,.sql,.html,.css,.txt,.zip,.rar"
                                />
                                <label
                                  htmlFor={`file-${assignment._id}`}
                                  className="flex items-center gap-3 w-full px-4 py-4 bg-white/5 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/10 hover:border-white/40 transition-all duration-200"
                                >
                                  <Upload className="w-6 h-6 text-white/50" />
                                  <div className="flex-1">
                                    {file && selectedAssignment === assignment._id ? (
                                      <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-green-400" />
                                        <span className="text-green-400 font-medium text-sm">{file.name}</span>
                                        <span className="text-white/40 text-xs">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                      </div>
                                    ) : (
                                      <div>
                                        <p className="text-white/70 font-medium text-sm">Click to select file</p>
                                        <p className="text-white/40 text-xs">.cpp, .py, .java, .js, .pdf, .doc and more (max 10MB)</p>
                                      </div>
                                    )}
                                  </div>
                                </label>

                                <button
                                  onClick={() => handleSubmit(assignment._id)}
                                  disabled={submittingId === assignment._id || !file || selectedAssignment !== assignment._id}
                                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                                >
                                  {submittingId === assignment._id ? (
                                    <>
                                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      Submitting...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-5 h-5" />
                                      {assignment.submission ? 'Resubmit Assignment' : 'Submit Assignment'}
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Class submission type */}
                          {assignment.submissionType === 'class' && (
                            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                              <div className="flex items-start gap-3">
                                <BookOpen className="w-5 h-5 text-orange-400 mt-0.5" />
                                <div>
                                  <p className="text-orange-300 font-semibold text-sm">In-Class Submission</p>
                                  <p className="text-white/60 text-sm mt-1">
                                    This assignment must be submitted physically in class. Please bring a printed or handwritten copy.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Overdue + dashboard + not submitted */}
                          {assignment.submissionType === 'dashboard' && assignment.isOverdue && !assignment.submission && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                              <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                                <div>
                                  <p className="text-red-300 font-semibold text-sm">Deadline Passed</p>
                                  <p className="text-white/60 text-sm mt-1">
                                    The submission deadline for this assignment has passed. You can no longer submit.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAssignments;
