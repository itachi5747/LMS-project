import React, { useEffect, useState } from 'react';
import {
  Menu, X, ClipboardList, Users, GraduationCap, Home, LogOut, BookOpen,
  Award, ArrowLeft, Calendar, Save, CheckCircle, AlertCircle, UserCheck, UserX, FileText
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const MarkAttendance = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [searchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(searchParams.get('course') || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      initializeAttendanceRecords();
    }
  }, [selectedCourse, students]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get("http://localhost:3000/app/v1/teacher/courses", {
        withCredentials: true
      });
      if (response.data.success) {
        setCourses(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      toast.error('Failed to load courses');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://localhost:3000/app/v1/teacher/students", {
        withCredentials: true
      });
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error('Failed to load students');
    }
  };

  const initializeAttendanceRecords = () => {
    const courseStudents = students.filter(student =>
      student.enrolledCourses.some(course => course.courseId === selectedCourse)
    );

    const records = courseStudents.map(student => ({
      studentId: student._id,
      name: student.name,
      studentId_display: student.studentId || student.email,
      status: 'present', // default to present
      remarks: ''
    }));

    setAttendanceRecords(records);
  };

  const updateAttendanceRecord = (studentId, field, value) => {
    setAttendanceRecords(prev =>
      prev.map(record =>
        record.studentId === studentId
          ? { ...record, [field]: value }
          : record
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCourse || !selectedDate || attendanceRecords.length === 0) {
      toast.error('Please select a course, date, and ensure there are students');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post("http://localhost:3000/app/v1/teacher/mark-attendance", {
        courseId: selectedCourse,
        date: selectedDate,
        attendanceRecords: attendanceRecords.map(record => ({
          studentId: record.studentId,
          status: record.status,
          remarks: record.remarks
        }))
      }, { withCredentials: true });

      if (response.data.success) {
        toast.success('Attendance marked successfully!');
        // Reset form
        setAttendanceRecords([]);
        setSelectedCourse('');
        setSelectedDate(new Date().toISOString().split('T')[0]);
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
      toast.error(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/teacher/dashboard'
    },
    {
      title: 'My Courses',
      icon: BookOpen,
      path: '/teacher/courses'
    },
    {
      title: 'Students',
      icon: Users,
      path: '/teacher/students'
    },
    {
      title: 'Mark Grades',
      icon: Award,
      path: '/teacher/mark-grades'
    },
    {
      title: 'Mark Attendance',
      icon: ClipboardList,
      path: '/teacher/mark-attendance',
      active: true
    },
    {
      title: 'Assignments',
      icon: FileText,
      path: '/teacher/create-assignment'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <UserCheck className="w-5 h-5 text-green-400" />;
      case 'absent':
        return <UserX className="w-5 h-5 text-red-400" />;
      case 'late':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <UserCheck className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'text-green-400 bg-green-500/20';
      case 'absent':
        return 'text-red-400 bg-red-500/20';
      case 'late':
        return 'text-yellow-400 bg-yellow-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-4 z-50 p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl shadow-lg hover:bg-white/30 transition-all duration-300 ${
          isOpen ? 'left-72' : 'left-4'
        }`}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white/10 backdrop-blur-xl border-r border-white/20 transition-all duration-500 ease-in-out flex flex-col ${
        isOpen ? 'w-80 translate-x-0' : 'w-80 -translate-x-full'
      }`}>
        <div className="p-6 flex flex-col flex-1">
          {/* Logo/Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Teacher Portal</h2>
              <p className="text-white/70 text-sm">Attendance Management</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200 group ${
                      item.active ? 'bg-white/20' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile & Logout */}
          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">Instructor: {user?.name}</p>
                <p className="text-white/70 text-xs">{user?.email}</p>
              </div>
            </div>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-red-500/20 rounded-lg transition-all duration-200 group"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'ml-80' : 'ml-0'}`}>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link to="/teacher/dashboard" className="text-white/70 hover:text-white">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-4xl font-bold text-white">Mark Attendance</h1>
            </div>
            <p className="text-white/80 text-lg">
              Record attendance for your course sessions
            </p>
          </div>

          {/* Attendance Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course and Date Selection */}
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Select Course *
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="" className="bg-gray-800">Choose a course</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id} className="bg-gray-800">
                        {course.title} ({course.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Attendance Records */}
            {selectedCourse && attendanceRecords.length > 0 && (
              <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Student Attendance</h3>
                <div className="space-y-4">
                  {attendanceRecords.map((record, index) => (
                    <div key={record.studentId} className="flex items-center gap-4 p-4 bg-white/10 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {record.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{record.name}</p>
                            <p className="text-white/60 text-sm">{record.studentId_display}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <select
                          value={record.status}
                          onChange={(e) => updateAttendanceRecord(record.studentId, 'status', e.target.value)}
                          className={`px-3 py-2 border border-white/20 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(record.status)}`}
                        >
                          <option value="present" className="bg-gray-800">Present</option>
                          <option value="absent" className="bg-gray-800">Absent</option>
                          <option value="late" className="bg-gray-800">Late</option>
                        </select>

                        <input
                          type="text"
                          placeholder="Remarks"
                          value={record.remarks}
                          onChange={(e) => updateAttendanceRecord(record.studentId, 'remarks', e.target.value)}
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <div className="flex items-center">
                          {getStatusIcon(record.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            {selectedCourse && attendanceRecords.length > 0 && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Marking Attendance...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Attendance
                  </>
                )}
              </button>
            )}
          </form>

          {selectedCourse && attendanceRecords.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No students found</h3>
              <p className="text-white/60">There are no enrolled students in this course</p>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default MarkAttendance;