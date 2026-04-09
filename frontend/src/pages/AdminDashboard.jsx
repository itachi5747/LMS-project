import React, { useEffect, useState } from 'react';
import { 
  Menu, X, Home, Users, BookOpen, Building2, GraduationCap, 
  UserPlus, Building, PlusCircle, Link, Search, BarChart3,
  Settings, User, LogOut, ChevronDown, ChevronRight,
  TrendingUp, Award
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});
  const navigate = useNavigate()
    const { user, logout , getUniversityStats, university_stats} = useAuthStore();
    const handleLogout = () => {
		logout();
	};
     const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:3000/app/v1/admin/university/stats", { withCredentials: true });
        setStats(res.data.data);
        console.log("university stats are 456--> ", res.data.data);
        // console.log("university stats are 456--> ", );
        // console.log("university stats are 456--> ", stats.totalDepartments);
        
      } catch (err) {
        console.error("Error fetching stats", err);
      }
    };
    fetchStats();
  }, []);
  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };
 
  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/admin/dashboard',
      single: true
    },
    {
      title: 'User Management',
      icon: Users,
      key: 'users',
      children: [
        { title: 'Add Instructor', icon: UserPlus, path: '/admin/add-instructor' },
        // { title: 'Create Student', icon: GraduationCap, path: '/admin/create-student' },
        // { title: 'Search Users', icon: Search, path: '/admin/search-user' },
        { title: 'All Users', icon: Users, path: '/admin/getalluser' },
        // { title: 'User Profile', icon: User, path: '/user-profile' }
      ]
    },
    {
      title: 'Department Management',
      icon: Building2,
      key: 'departments',
      children: [
        { title: 'Create Department', icon: Building, path: '/admin/create-department' },
        // { title: 'View Departments', icon: Building2, path: '/departments' },
        { title: 'Department Stats', icon: BarChart3, path: '/departments/stats' },
        // { title: 'Add Instructor to Dept', icon: Link, path: '/admin/add-instructor-department' }
      ]
    },
    // {
    //   title: 'Course Management',
    //   icon: BookOpen,
    //   key: 'courses',
    //   children: [
    //     { title: 'Create Course', icon: PlusCircle, path: '/admin/create-course' },
    //     { title: 'Assign Course', icon: Link, path: '/admin/assign-course-to-instructor' },
    //     { title: 'Unassign Course', icon: X, path: '/admin/unassign-instructor' }
    //   ]
    // },
    // {
    //   title: 'Updates',
    //   icon: Settings,
    //   key: 'updates',
    //   children: [
    //     { title: 'Update Student', icon: GraduationCap, path: '/admin/update-student' },
    //     { title: 'Update Instructor', icon: UserPlus, path: '/admin/update-instructor' },
    //     { title: 'Update Course', icon: BookOpen, path: '/admin/update-course' }
    //   ]
    // },
    {
      title: 'Analytics',
      icon: TrendingUp,
      key: 'analytics',
      children: [
        { title: 'University Stats', icon: BarChart3, path: '/admin/university-stats' },
        { title: 'Department Analytics', icon: Building2, path: '/admin/departments/stats' }
      ]
    }
  ];

  const statsCards = [
  { 
    title: 'Total Students', 
    value: stats?.totalStudents || 0, 
    icon: GraduationCap, 
    color: 'from-blue-500 to-cyan-500' 
  },
  { 
    title: 'Total Instructors', 
    value: stats?.totalInstructors || 0, 
    icon: Users, 
    color: 'from-purple-500 to-pink-500' 
  },
  { 
    title: 'Departments', 
    value: stats?.totalDepartments || 0, 
    icon: Building2, 
    color: 'from-orange-500 to-red-500' 
  },
];

  return (
    <div className="relative min-h-screen">
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
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">EduAdmin</h2>
              <p className="text-white/70 text-sm">University LMS</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                
                if (item.single) {
                  return (
                    <a
                      key={item.title}
                      href={item.path}
                      className="flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200 group"
                    >
                      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-medium">{item.title}</span>
                    </a>
                  );
                }

                return (
                  <div key={item.key} className="space-y-1">
                    <button
                      onClick={() => toggleMenu(item.key)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200 group"
                    >
                      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-medium flex-1 text-left">{item.title}</span>
                      {expandedMenus[item.key] ? 
                        <ChevronDown className="w-4 h-4 transition-transform duration-200" /> : 
                        <ChevronRight className="w-4 h-4 transition-transform duration-200" />
                      }
                    </button>
                    
                    {expandedMenus[item.key] && (
                      <div className="ml-6 space-y-1 animate-in slide-in-from-top-2 duration-200">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <a
                              key={child.title}
                              href={child.path}
                              className="flex items-center gap-3 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
                            >
                              <ChildIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                              <span className="text-sm">{child.title}</span>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* User Profile & Logout */}
          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">Admin: {user.name}</p>
                <p className="text-white/70 text-xs">{user.email}</p>
              </div>
            </div>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-red-500/20 rounded-lg transition-all duration-200 group" onClick={handleLogout}>
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
              Welcome Back, Admin! 
            </h1>
            <p className="text-white/80 text-lg">
              Manage your university with ease and efficiency
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
            {/* Quick Actions Card */}
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <PlusCircle className="w-6 h-6" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                  <UserPlus className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="block text-sm font-medium">Add Instructor</span>
                </button>
                <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                  <GraduationCap className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="block text-sm font-medium">Add Student</span>
                </button>
                <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                  <BookOpen className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="block text-sm font-medium">Create Course</span>
                </button>
                <button className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                  <Building2 className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="block text-sm font-medium">Add Department</span>
                </button>
              </div>
            </div>
          </div>
          {/* Management Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Course Management */}
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Course Management
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200 group">
                  <PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  <span>Create New Course</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200 group">
                  <Link className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  <span>Assign Course to Instructor</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200 group">
                  <Settings className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  <span>Update Course Details</span>
                </button>
              </div>
            </div>

            {/* User Management */}
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Users className="w-6 h-6" />
                User Management
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200 group">
                  <Search className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  <span>Search Users</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200 group">
                  <User className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  <span>View User Profiles</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200 group">
                  <Settings className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  <span>Update User Information</span>
                </button>
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

export default AdminDashboard;