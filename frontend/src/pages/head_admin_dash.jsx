import React, { useEffect, useState } from 'react';
import {
  Menu, X, Home, Users, BookOpen, GraduationCap,
  UserPlus, PlusCircle, Link as linkison, BarChart3,
  Settings, User, LogOut, ChevronDown, ChevronRight,
  TrendingUp, Award, Building2, FileText, Mail
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const HeadDepartmentDashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:3000/app/v1/head-dept/department-stats", { withCredentials: true });
        setStats(res.data.data);
        console.log("department stats are --> ", res.data.data);
      } catch (err) {
        console.error("Error fetching stats", err);
      }
    };
    fetchStats();
  }, []);

  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/head-department/dashboard',
      single: true
    },
    {
      title: 'Create Instructor',
      icon: UserPlus,
      path: '/head/create-instructor',
      single: true
    },
    {
      title: 'Create Student',
      icon: GraduationCap,
      path: '/head/create-student',
      single: true
    },
    {
      title: 'Create Course',
      icon: BookOpen,
      path: '/head/create-course',
      single: true
    },
    {
      title: 'Assign Course to Instructor',
      icon: linkison,
      path: '/head/assign-course',
      single: true
    },
    {
      title: 'Create Challan',
      icon: FileText,
      path: '/head/create-challan',
      single: true
    },
    {
      title: 'Assign Challan',
      icon: linkison,
      path: '/head/assign-challan',
      single: true
    },
    {
      title: 'Manage Student Challans',
      icon: FileText,
      path: '/head/manage-student-challans',
      single: true
    },
    {
      title: 'Toggle Course Registration',
      icon: BookOpen,
      path: '/head/registration',
      single: true
    },
    {
      title: 'Send Messages',
      icon: Mail,
      path: '/head/messaging',
      single: true
    }
  ];

  const statsCards = [
    {
      title: 'Department Students',
      value: stats?.totalStudents || 0,
      icon: GraduationCap,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Department Instructors',
      value: stats?.totalInstructors || 0,
      icon: Users,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Courses',
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      color: 'from-orange-500 to-red-500'
    },
  ];

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
      {/* Sidebar */}
<div className={`fixed left-0 top-0 h-screen bg-white/10 backdrop-blur-xl border-r border-white/20 transition-all duration-500 ease-in-out flex flex-col overflow-hidden ${
  isOpen ? 'w-80 translate-x-0' : 'w-80 -translate-x-full'
}`}>

  {/* Logo/Header — flex-shrink-0 so it never gets squished */}
  <div className="flex-shrink-0 px-6 pt-6 pb-4">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
        <Building2 className="w-7 h-7 text-white" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white">Head Department</h2>
        <p className="text-white/70 text-sm">Department Management</p>
      </div>
    </div>
  </div>

  {/* Navigation — flex-1 + overflow-y-auto = scrollable middle */}
  <div className="flex-1 overflow-y-auto px-6 py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
    <nav className="space-y-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.title}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200 group"
          >
            <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            <span className="font-medium">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  </div>

  {/* User Profile & Logout — flex-shrink-0 so it's always visible at bottom */}
  <div className="flex-shrink-0 px-6 py-4 border-t border-white/10 space-y-3">
    <div className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg">
      <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
        <User className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">Head: {user?.name}</p>
        <p className="text-white/70 text-xs truncate">{user?.email}</p>
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

      {/* Main Content Area */}
      <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'ml-80' : 'ml-0'}`}>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome Back, Head Department!
            </h1>
            <p className="text-white/80 text-lg">
              Manage your department efficiently
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

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-8">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <PlusCircle className="w-6 h-6" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/head/create-instructor" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group block text-center">
                  <UserPlus className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform duration-200 mx-auto" />
                  <span className="block text-sm font-medium">Create Instructor</span>
                </Link>
                <Link to="/head/create-student" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group block text-center">
                  <GraduationCap className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform duration-200 mx-auto" />
                  <span className="block text-sm font-medium">Create Student</span>
                </Link>
                <Link to="/head/create-course" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group block text-center">
                  <BookOpen className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform duration-200 mx-auto" />
                  <span className="block text-sm font-medium">Create Course</span>
                </Link>
                <Link to="/head/assign-course" className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group block text-center">
                  <linkison className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform duration-200 mx-auto" />
                  <span className="block text-sm font-medium">Assign Course</span>
                </Link>
                <Link to="/head/registration" className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group block text-center">
                  <BookOpen className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform duration-200 mx-auto" />
                  <span className="block text-sm font-medium">Registration</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Department Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Department Overview
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Active Courses</span>
                  <span className="text-white font-bold">{stats?.activeCourses || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Enrolled Students</span>
                  <span className="text-white font-bold">{stats?.enrolledStudents || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Available Instructors</span>
                  <span className="text-white font-bold">{stats?.availableInstructors || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Award className="w-6 h-6" />
                Recent Activities
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                  <UserPlus className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white text-sm">New instructor added</p>
                    <p className="text-white/60 text-xs">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white text-sm">Course created</p>
                    <p className="text-white/60 text-xs">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                  <Link className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white text-sm">Course assigned</p>
                    <p className="text-white/60 text-xs">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

export default HeadDepartmentDashboard;