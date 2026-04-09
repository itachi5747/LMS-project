import React, { useState, useEffect } from 'react';
import {
  BookOpen, Users, GraduationCap, FileText, Clock, AlertCircle,
  CheckCircle2, TrendingUp, Home, LogOut, BarChart3, Eye, LogIn,
  Calendar, DollarSign, Zap, RefreshCw, ArrowRight, Settings, Bell,
  Mail, Phone, MapPin, Award
} from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import useAuthStore from '../store/authStore';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const [studentData, setStudentData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [challans, setChallans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch enrolled courses
      const coursesRes = await axios.get(
        "http://localhost:3000/app/v1/student/courses/enrolled",
        { withCredentials: true }
      );

      // Fetch challans
      const challansRes = await axios.get(
        "http://localhost:3000/app/v1/student/challans",
        { withCredentials: true }
      );

      if (coursesRes.data.success) {
        // Backend may return enrolled courses under `enrolledCourses` (array of { course })
        // or under `data` as an array of course objects. Normalize both shapes.
        const payload = coursesRes.data.enrolledCourses || coursesRes.data.data || [];
        const normalized = Array.isArray(payload)
          ? payload.map(item => (item && item.course) ? item.course : item)
          : [];
        setCourses(normalized);
      }

      if (challansRes.data.success) {
        setChallans(challansRes.data.data || []);
      }

      setError('');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3000/app/v1/logout",
        {},
        { withCredentials: true }
      );
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const calculateFine = (dueDate, finePerDay) => {
    if (!isOverdue(dueDate)) return 0;
    const today = new Date();
    const due = new Date(dueDate);
    const daysOverdue = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
    return daysOverdue * finePerDay;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin">
          <RefreshCw className="w-12 h-12 text-blue-400" />
        </div>
        <p className="ml-4 text-white/70 text-lg">Loading your dashboard...</p>
      </div>
    );
  }

  const totalChallanAmount = challans.reduce((sum, c) => sum + c.amount, 0);
  const pendingChallans = challans.filter(c => c.assignedInfo?.status !== 'paid').length;
  const paidChallans = challans.filter(c => c.assignedInfo?.status === 'paid').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      {/* Header with Profile */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Profile Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user?.name || 'Student'}</h1>
                <p className="text-white/70 text-sm">ID: {user?.studentId || 'N/A'}</p>
                <p className="text-white/70 text-sm">Semester {user?.semester || 'N/A'}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Link
                to="/student/courses"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Courses
              </Link>
              <Link
                to="/student/enroll-course"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Enroll
              </Link>
              <Link
                to="/student/assignments"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Assignments
              </Link>
              <Link
                to="/student/challans"
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Challans
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Enrolled Courses */}
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Enrolled Courses</p>
              <p className="text-3xl font-bold text-white">{courses.length}</p>
            </div>
            <BookOpen className="w-12 h-12 text-blue-400/40" />
          </div>
        </div>

        {/* Pending Challans */}
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Pending Payments</p>
              <p className="text-3xl font-bold text-white">{pendingChallans}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-400/40" />
          </div>
        </div>

        {/* Total Due */}
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Total Due</p>
              <p className="text-2xl font-bold text-white">Rs. {totalChallanAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="w-12 h-12 text-red-400/40" />
          </div>
        </div>

        {/* Paid Challans */}
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Payments Made</p>
              <p className="text-3xl font-bold text-white">{paidChallans}</p>
            </div>
            <CheckCircle2 className="w-12 h-12 text-green-400/40" />
          </div>
        </div>
      </div>

      {/* Main Content - Tab Navigation */}
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-100">{error}</p>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex gap-4 mb-6 border-b border-white/10 overflow-x-auto pb-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === 'overview'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === 'courses'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-white/70 hover:text-white'
            }`}
          >
            My Courses ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('challans')}
            className={`px-4 py-2 font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === 'challans'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Challans ({challans.length})
          </button>
          <button
            onClick={() => setActiveTab('grades')}
            className={`px-4 py-2 font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === 'grades'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Grades
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === 'profile'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Profile
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Semester Info */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <GraduationCap className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">Academic Info</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-white/70">Current Semester</span>
                    <span className="text-white font-semibold">{user?.semester || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-white/70">Department</span>
                    <span className="text-white font-semibold">{user?.department?.name || user?.department || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-white/70">Contact Email</span>
                    <span className="text-white font-semibold text-sm">{user?.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-6 h-6 text-orange-400" />
                  <h3 className="text-lg font-bold text-white">Financial Summary</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-white/70">Total Challans</span>
                    <span className="text-white font-semibold">{challans.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-white/70">Total Due</span>
                    <span className="text-red-300 font-semibold">Rs. {totalChallanAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-white/70">Paid</span>
                    <span className="text-green-300 font-semibold">{paidChallans}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Courses */}
            {courses.length > 0 && (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                    <h3 className="text-lg font-bold text-white">Recent Courses</h3>
                  </div>
                  <Link to="/student/courses" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                    View All <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="space-y-2">
                  {courses.slice(0, 3).map(course => (
                    <div key={course._id} className="p-4 bg-white/5 border border-white/10 rounded-lg flex justify-between items-center hover:bg-white/10 transition-all duration-200">
                      <div>
                        <p className="text-white font-semibold">{course.title}</p>
                        <p className="text-white/70 text-sm">{course.code}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-300">
                        Enrolled
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Challans */}
            {challans.length > 0 && (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-orange-400" />
                    <h3 className="text-lg font-bold text-white">Pending Challans</h3>
                  </div>
                  <Link to="/student/challans" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                    View All <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="space-y-2">
                  {challans.filter(c => c.assignedInfo?.status !== 'paid').slice(0, 3).map(challan => {
                    const daysRemaining = getDaysRemaining(challan.dueDate);
                    return (
                      <div key={challan._id} className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="text-white font-semibold">{challan.challanNumber}</p>
                            <p className="text-white/70 text-sm">Rs. {challan.amount.toLocaleString()}</p>
                          </div>
                          <div className={`text-right ${
                            daysRemaining < 0 ? 'text-red-300' : 
                            daysRemaining < 7 ? 'text-yellow-300' : 'text-green-300'
                          }`}>
                            <p className="text-sm font-semibold">
                              {daysRemaining < 0 ? 'Overdue' : `${daysRemaining} days left`}
                            </p>
                            <p className="text-xs text-white/70">
                              Due: {new Date(challan.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div>
            {courses.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
                <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Courses Yet</h3>
                <p className="text-white/70">You haven't enrolled in any courses yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map(course => (
                  <div key={course._id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:border-white/30 hover:-translate-y-1 transition-all duration-300">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">{course.title}</h3>
                        <p className="text-white/70 text-sm">Code: {course.code}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-300">
                        Active
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-white/70">
                        <span>Credit Hours:</span>
                        <span className="text-white font-semibold">{course.credits || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Instructor:</span>
                        <span className="text-white font-semibold">{course.instructors?.[0]?.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Status:</span>
                        <span className="text-green-300 font-semibold">Enrolled</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Challans Tab */}
        {activeTab === 'challans' && (
          <div>
            {challans.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
                <FileText className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Challans Yet</h3>
                <p className="text-white/70">Your Head of Department hasn't assigned any challans yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {challans.map(challan => {
                  const daysRemaining = getDaysRemaining(challan.dueDate);
                  const fine = calculateFine(challan.dueDate, challan.fineAfterDueDate);
                  
                  return (
                    <div key={challan._id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:border-white/30 transition-all duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-white">{challan.challanNumber}</h3>
                          <p className="text-white/70 text-sm">Semester {challan.semester}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          challan.assignedInfo?.status === 'paid'
                            ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                            : daysRemaining < 0
                            ? 'bg-red-500/20 border border-red-500/30 text-red-300'
                            : 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300'
                        }`}>
                          {challan.assignedInfo?.status === 'paid' ? 'Paid' : 
                           daysRemaining < 0 ? 'Overdue' : 'Pending'}
                        </span>
                      </div>

                      <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/20 rounded-lg p-3 mb-4">
                        <p className="text-sm text-white/70 mb-1">Amount</p>
                        <p className="text-2xl font-bold text-white">Rs. {challan.amount.toLocaleString()}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                          <p className="text-xs text-white/70 mb-1">Due Date</p>
                          <p className="text-sm font-semibold text-white">
                            {new Date(challan.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`p-3 rounded-lg border ${
                          daysRemaining < 0
                            ? 'bg-red-500/10 border-red-500/20'
                            : daysRemaining < 7
                            ? 'bg-yellow-500/10 border-yellow-500/20'
                            : 'bg-green-500/10 border-green-500/20'
                        }`}>
                          <p className="text-xs text-white/70 mb-1">Days Left</p>
                          <p className={`text-sm font-semibold ${
                            daysRemaining < 0
                              ? 'text-red-300'
                              : daysRemaining < 7
                              ? 'text-yellow-300'
                              : 'text-green-300'
                          }`}>
                            {Math.abs(daysRemaining)} days
                          </p>
                        </div>
                      </div>

                      {fine > 0 && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-4 flex items-start gap-2">
                          <Zap className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="text-red-300 font-semibold">Late Fine</p>
                            <p className="text-red-200/80">Rs. {fine.toLocaleString()}</p>
                          </div>
                        </div>
                      )}

                      <button className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg font-medium transition-all duration-200">
                        Make Payment
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Grades Tab */}
        {activeTab === 'grades' && (
          <div>
            <div className="mb-6">
              <Link
                to="/student/grades"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <Award className="w-5 h-5" />
                View Detailed Grades
              </Link>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
              <Award className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Grade Overview</h3>
              <p className="text-white/70 mb-4">Click the button above to view your detailed grades and GPA.</p>
              <p className="text-white/60 text-sm">This section will show a summary of your academic performance.</p>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Personal Information</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-white/70 text-xs mb-1">Full Name</p>
                  <p className="text-white font-semibold">{user?.name || 'N/A'}</p>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-white/70 text-xs mb-1">Student ID</p>
                  <p className="text-white font-semibold">{user?.studentId || 'N/A'}</p>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-white/70 text-xs mb-1">Email</p>
                  <p className="text-white font-semibold text-sm break-all">{user?.email || 'N/A'}</p>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-white/70 text-xs mb-1">Phone</p>
                  <p className="text-white font-semibold">{user?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <GraduationCap className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Academic Information</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-white/70 text-xs mb-1">Department</p>
                  <p className="text-white font-semibold">{user?.department?.name || 'N/A'}</p>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-white/70 text-xs mb-1">Current Semester</p>
                  <p className="text-white font-semibold">Semester {user?.semester || 'N/A'}</p>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-white/70 text-xs mb-1">Enrolled Courses</p>
                  <p className="text-white font-semibold">{courses.length} courses</p>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-white/70 text-xs mb-1">Account Status</p>
                  <p className="text-green-300 font-semibold">Active</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-orange-400" />
                <h3 className="text-lg font-bold text-white">Contact Information</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-white/70 text-xs mb-1">Email Address</p>
                  <p className="text-white font-semibold text-sm break-all">{user?.email || 'N/A'}</p>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-white/70 text-xs mb-1">Phone Number</p>
                  <p className="text-white font-semibold">{user?.phone || 'N/A'}</p>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-white/70 text-xs mb-1">Address</p>
                  <p className="text-white font-semibold">{user?.address || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-bold text-white">Account Settings</h3>
              </div>
              <div className="space-y-3">
                <button className="w-full p-3 text-left text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium">
                  Change Password
                </button>
                <button className="w-full p-3 text-left text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium">
                  Update Profile
                </button>
                <button className="w-full p-3 text-left text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium">
                  Download Academic Record
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
