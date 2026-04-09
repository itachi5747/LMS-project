import React, { useEffect, useState } from 'react';
import {
  Menu, X, BookOpen, Users, GraduationCap, Award, TrendingUp,
  Home, LogOut, BarChart3, UserCheck, ClipboardList, Calendar,
  CheckCircle, Clock, AlertCircle, FileText
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import TeacherMessages from '../components/TeacherMessages';

const TeacherDashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalEnrolled: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch assigned courses
      const coursesRes = await axios.get("http://localhost:3000/app/v1/teacher/courses", {
        withCredentials: true
      });

      // Fetch enrolled students
      const studentsRes = await axios.get("http://localhost:3000/app/v1/teacher/students", {
        withCredentials: true
      });

      if (coursesRes.data.success) {
        setCourses(coursesRes.data.data);
      }

      if (studentsRes.data.success) {
        const students = studentsRes.data.data;
        const totalStudents = students.length;
        const totalEnrolled = students.reduce((acc, student) => acc + student.enrolledCourses.length, 0);

        setStats({
          totalCourses: coursesRes.data.data.length,
          totalStudents,
          totalEnrolled
        });
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
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
      path: '/teacher/dashboard',
      active: true
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
      path: '/teacher/mark-attendance'
    },
    {
      title: 'Assignments',
      icon: FileText,
      path: '/teacher/create-assignment'
    }
  ];

  const statsCards = [
    {
      title: 'Assigned Courses',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Total Enrollments',
      value: stats.totalEnrolled,
      icon: GraduationCap,
      color: 'from-orange-500 to-red-500'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
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
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Teacher Portal</h2>
              <p className="text-white/70 text-sm">Course Management</p>
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
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome Back, {user?.name}!
            </h1>
            <p className="text-white/80 text-lg">
              Manage your courses and students efficiently
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="group bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                  <p className="text-white/70">{stat.title}</p>
                </div>
              );
            })}
          </div>

          {/* Recent Courses */}
          <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Your Assigned Courses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.slice(0, 4).map((course) => (
                <div key={course._id} className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors">
                  <h4 className="text-white font-semibold mb-2">{course.title}</h4>
                  <p className="text-white/70 text-sm mb-2">{course.code}</p>
                  <div className="flex justify-between text-sm text-white/60">
                    <span>Capacity: {course.capacity}</span>
                    <span>Enrolled: {course.enrolledStudents?.length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
            {courses.length > 4 && (
              <div className="mt-4 text-center">
                <Link to="/teacher/courses" className="text-blue-400 hover:text-blue-300">
                  View all courses →
                </Link>
              </div>
            )}
          </div>

          {/* Messages Section */}
          <TeacherMessages />
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

export default TeacherDashboard;