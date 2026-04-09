import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Search, RefreshCw, AlertCircle, CheckCircle2,
  Clock, DollarSign, User, FileText, Filter,
  ChevronDown, Loader, Users
} from 'lucide-react';
import { Link } from "react-router-dom";
import axios from 'axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const HeadManageStudentChallans = () => {
  const { user } = useAuthStore();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [updatingChallan, setUpdatingChallan] = useState(null);

  useEffect(() => {
    fetchDepartmentStudents();
  }, []);

  const fetchDepartmentStudents = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "http://localhost:3000/app/v1/head-dept/get-all-students",
        { withCredentials: true }
      );

      if (response.data.success) {
        setStudents(response.data.data || []);
        setError('');
      } else {
        setError(response.data.message || 'Failed to fetch students');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || 'Failed to fetch department students');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateChallanToPaid = async (studentId, challanId) => {
    try {
      setUpdatingChallan(`${studentId}-${challanId}`);
      const response = await axios.post(
        "http://localhost:3000/app/v1/head-dept/update-challan-to-paid",
        {
          challanId,
          studentId
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Challan marked as paid!');
        // Update the local state
        const updatedStudents = students.map(student => {
          if (student._id === studentId) {
            const updatedChallans = student.assignedChallans?.map(ch => {
              if (ch.challan._id === challanId) {
                return { ...ch, status: 'paid', paidDate: new Date().toISOString() };
              }
              return ch;
            }) || [];
            return { ...student, assignedChallans: updatedChallans };
          }
          return student;
        });
        setStudents(updatedStudents);
      } else {
        toast.error(response.data.message || 'Failed to update challan');
      }
    } catch (err) {
      console.error('Error updating challan:', err);
      toast.error(err.response?.data?.message || 'Failed to update challan status');
    } finally {
      setUpdatingChallan(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-300', label: 'Pending' },
      notified: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-300', label: 'Notified' },
      paid: { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-300', label: 'Paid' },
      overdue: { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-300', label: 'Overdue' }
    };
    return statusConfig[status] || statusConfig.pending;
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.includes(searchTerm);

    const hasStatusFilter = student.assignedChallans?.some(ch => {
      if (filterStatus === 'all') return true;
      return ch.status === filterStatus;
    });

    return matchesSearch && hasStatusFilter;
  });

  const getStudentChallanStatus = (student) => {
    const challans = student.assignedChallans || [];
    const paid = challans.filter(c => c.status === 'paid').length;
    return { paid, total: challans.length };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      {/* Back Button */}
      <Link
        to="/head-department/dashboard"
        className="mb-6 flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group w-fit"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-violet-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Manage Student Challans</h1>
            <p className="text-white/70">Update payment status for your department students</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="max-w-6xl mx-auto mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Box */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-white/50" />
          <input
            type="text"
            placeholder="Search by name, email, or student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-200"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <Filter className="absolute left-4 top-3.5 w-5 h-5 text-white/50" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-200 appearance-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900">All Status</option>
            <option value="pending" className="bg-slate-900">Pending</option>
            <option value="notified" className="bg-slate-900">Notified</option>
            <option value="paid" className="bg-slate-900">Paid</option>
            <option value="overdue" className="bg-slate-900">Overdue</option>
          </select>
          <ChevronDown className="absolute right-4 top-3.5 w-5 h-5 text-white/50 pointer-events-none" />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center py-12">
          <div className="animate-spin">
            <RefreshCw className="w-8 h-8 text-white/50" />
          </div>
          <p className="ml-3 text-white/70 mt-4">Loading students and challans...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-center gap-4">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-100 font-medium">Error Loading Students</p>
              <p className="text-red-100/70 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredStudents.length === 0 && !error && (
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
            <User className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Students Found</h3>
            <p className="text-white/70">Either no students in your department or no matches for your search.</p>
          </div>
        </div>
      )}

      {/* Students List */}
      {!isLoading && filteredStudents.length > 0 && (
        <div className="max-w-6xl mx-auto space-y-4">
          {filteredStudents.map((student) => {
            const { paid, total } = getStudentChallanStatus(student);
            const isExpanded = expandedStudent === student._id;

            return (
              <div
                key={student._id}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-white/30"
              >
                {/* Student Summary Row */}
                <button
                  onClick={() => setExpandedStudent(isExpanded ? null : student._id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>

                    {/* Student Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{student.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-white/70">
                        <span>{student.studentId}</span>
                        <span>•</span>
                        <span>{student.email}</span>
                      </div>
                    </div>

                    {/* Challan Progress */}
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">{paid}/{total} Paid</p>
                        <div className="w-24 h-2 bg-white/10 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                            style={{ width: total > 0 ? `${(paid / total) * 100}%` : '0%' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Expand Icon */}
                    <ChevronDown
                      className={`w-5 h-5 text-white/50 transition-transform duration-300 flex-shrink-0 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded Challans List */}
                {isExpanded && (
                  <div className="border-t border-white/10 px-6 py-4 bg-black/10">
                    {student.assignedChallans && student.assignedChallans.length > 0 ? (
                      <div className="space-y-3">
                        {student.assignedChallans.map((assignment) => {
                          const challan = assignment.challan;
                          const statusConfig = getStatusBadge(assignment.status);
                          const isUpdating = updatingChallan === `${student._id}-${challan._id}`;

                          return (
                            <div
                              key={challan._id}
                              className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors duration-200"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <FileText className="w-4 h-4 text-white/60" />
                                  <h4 className="font-semibold text-white">{challan.challanNumber}</h4>
                                  <span className="px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded text-xs font-medium text-orange-300">
                                    Sem {challan.semester}
                                  </span>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-white/70">
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    <span>Rs. {challan.amount?.toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>Due: {new Date(challan.dueDate).toLocaleDateString()}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text}`}>
                                    {statusConfig.label}
                                  </span>
                                  {assignment.paidDate && (
                                    <span className="text-xs text-green-400">
                                      Paid on {new Date(assignment.paidDate).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Update Button */}
                              {assignment.status !== 'paid' && (
                                <button
                                  onClick={() => handleUpdateChallanToPaid(student._id, challan._id)}
                                  disabled={isUpdating}
                                  className="ml-4 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-green-500/50 disabled:to-emerald-600/50 text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-200 flex-shrink-0"
                                >
                                  {isUpdating ? (
                                    <>
                                      <Loader className="w-4 h-4 animate-spin" />
                                      <span>Updating...</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-4 h-4" />
                                      <span>Mark as Paid</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-white/70 text-center py-4">No challans assigned to this student yet.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {!isLoading && filteredStudents.length > 0 && (
        <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-white/70 text-sm">Total Students</p>
                <p className="text-2xl font-bold text-white">{filteredStudents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-white/70 text-sm">Challans Paid</p>
                <p className="text-2xl font-bold text-white">
                  {filteredStudents.reduce((acc, s) => acc + (s.assignedChallans || []).filter(c => c.status === 'paid').length, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-white/70 text-sm">Pending</p>
                <p className="text-2xl font-bold text-white">
                  {filteredStudents.reduce((acc, s) => acc + (s.assignedChallans || []).filter(c => c.status !== 'paid').length, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeadManageStudentChallans;
