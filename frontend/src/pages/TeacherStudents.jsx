import React, { useEffect, useState } from 'react';
import {
  Menu, X, Users, GraduationCap, Home, LogOut, BookOpen,
  Award, ClipboardList, FileText, ArrowLeft, Search, Filter, Mail, Phone
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const TeacherStudents = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [searchParams] = useSearchParams();

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(searchParams.get('course') || 'all');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, selectedCourse]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:3000/app/v1/teacher/students", {
        withCredentials: true
      });

      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by course
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(student =>
        student.enrolledCourses.some(course => course.courseId === selectedCourse)
      );
    }

    setFilteredStudents(filtered);
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
      path: '/teacher/students',
      active: true
    },
    {
      title: 'Mark Grades',
      icon: Award,
      path: '/teacher/mark-grades'
    },
    {
      title: 'Mark Attendance',
      icon: ClipboardList,
      path: '/teacher/mark-attendance'
    },
    {
      title: 'Assignments',
      icon: FileText,
      path: '/teacher/create-assignment'
    }
  ];

  // Get unique courses from all students
  const courses = ['all', ...new Set(
    students.flatMap(student =>
      student.enrolledCourses.map(course => course.courseId)
    )
  )];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading students...</div>
      </div>
    );
  }

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
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Teacher Portal</h2>
              <p className="text-white/70 text-sm">Student Management</p>
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
              <h1 className="text-4xl font-bold text-white">My Students</h1>
            </div>
            <p className="text-white/80 text-lg">
              View and manage students enrolled in your courses
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search students by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="md:w-64">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all" className="bg-gray-800">All Courses</option>
                  {courses.filter(course => course !== 'all').map(courseId => {
                    const studentWithCourse = students.find(s =>
                      s.enrolledCourses.some(c => c.courseId === courseId)
                    );
                    const courseInfo = studentWithCourse?.enrolledCourses.find(c => c.courseId === courseId);
                    return (
                      <option key={courseId} value={courseId} className="bg-gray-800">
                        {courseInfo ? `${courseInfo.courseTitle} (${courseInfo.courseCode})` : courseId}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Students Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div key={student._id} className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                    Active
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{student.name}</h3>
                <p className="text-white/70 mb-1">{student.email}</p>
                {student.studentId && (
                  <p className="text-white/60 text-sm mb-4">ID: {student.studentId}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Mail className="w-4 h-4" />
                    <span>{student.email}</span>
                  </div>
                  {student.phone && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Phone className="w-4 h-4" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                  {student.semester && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <BookOpen className="w-4 h-4" />
                      <span>Semester {student.semester}</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h4 className="text-white font-medium mb-2">Enrolled Courses:</h4>
                  <div className="space-y-1">
                    {student.enrolledCourses.slice(0, 2).map((course, index) => (
                      <div key={index} className="text-sm text-white/70 bg-white/10 rounded px-2 py-1">
                        {course.courseTitle} ({course.courseCode})
                      </div>
                    ))}
                    {student.enrolledCourses.length > 2 && (
                      <div className="text-sm text-white/60">
                        +{student.enrolledCourses.length - 2} more courses
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/teacher/mark-grades?student=${student._id}`}
                    className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 px-4 py-2 rounded-lg text-center text-sm font-medium transition-colors"
                  >
                    Grade
                  </Link>
                  <Link
                    to={`/teacher/mark-attendance?student=${student._id}`}
                    className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300 px-4 py-2 rounded-lg text-center text-sm font-medium transition-colors"
                  >
                    Attendance
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No students found</h3>
              <p className="text-white/60">Try adjusting your search or filter criteria</p>
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

export default TeacherStudents;