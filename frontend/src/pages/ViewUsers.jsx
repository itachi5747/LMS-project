import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { 
  ArrowLeft, Users, GraduationCap, UserCheck, Crown, 
  Search, Filter, Mail, Phone, MapPin, Building2,
  Hash, Calendar, Eye, Edit, Trash2, MoreHorizontal,
  ChevronDown, RefreshCw, AlertCircle, User
} from 'lucide-react';
import { number } from 'framer-motion';
import { u } from 'framer-motion/client';
import axios from 'axios';

const ViewUsers = () => {
  const { getuser, users = [], error } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showActions, setShowActions] = useState(null);
  const [statss, setStats] = useState(null);
  const role = searchParams.get('role') || '';
  const navigate = useNavigate();
  const fetchStats = async () => {
        try {
          const res = await axios.get("http://localhost:3000/app/v1/admin/university/stats", { withCredentials: true });
          setStats(res.data.data);
          console.log("university stats are --> ", res.data.data);
          // console.log("university stats are 456--> ", );
          // console.log("university stats are 456--> ", stats.totalDepartments);
          
        } catch (err) {
          console.error("Error fetching stats", err);
        }
      };
  // Fetch users whenever role changes
  useEffect(() => {
    fetchStats()
    if (!searchParams.get('role')) {
      setSearchParams({ role: 'all' });
    } else {
      setIsLoading(true);
      getuser(role);
      setTimeout(() => setIsLoading(false), 1000); // Simulate loading time
    }
  }, [role]);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Role configurations
  const roleConfig = {
    student: {
      icon: GraduationCap,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10 border-blue-500/30',
      textColor: 'text-blue-400',
      label: 'Students',
      numbers : statss?.totalStudents || 0
    },
    instructor: {
      icon: UserCheck,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10 border-green-500/30',
      textColor: 'text-green-400',
      label: 'Instructors',
      numbers : statss?.totalInstructors || 0
    },
    headDept: {
      icon: Crown,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10 border-purple-500/30',
      textColor: 'text-purple-400',
      label: 'Department Heads',
      numbers : statss?.totalHeadDept || 0, 
    },
    admin: {
      icon: Crown,
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-500/10 border-red-500/30',
      textColor: 'text-red-400',
      label: 'Administrators',
      numbers : statss?.totaladmin || 0, 
    }
  };

  const getRoleConfig = (userRole) => {
    return roleConfig[userRole] || {
      icon: User,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-500/10 border-gray-500/30',
      textColor: 'text-gray-400',
      label: 'Unknown'
    };
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length
        ? []
        : filteredUsers.map(user => user._id || user.id)
    );
  };

  const getRoleStats = () => {
    const stats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    return stats;
  };

  const stats = getRoleStats();

  return (
    
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <button 
          className="mb-6 flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
          onClick={() => navigate('/admin/dashboard')}
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-white/70">View and manage all system users</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(roleConfig).map(([roleKey, config]) => {
            const Icon = config.icon;
            const count = stats[roleKey] || 0;
            return (
              <div key={roleKey} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${config.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">{config.numbers}</p>
                    <p className="text-white/70 text-sm">{config.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Role Filter */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <select
                value={role}
                onChange={(e) => setSearchParams({ role: e.target.value })}
                className="pl-10 pr-8 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 transition-all duration-200 appearance-none min-w-[200px]"
              >
                <option value="all" className="bg-gray-800">All Users</option>
                <option value="student" className="bg-gray-800">Students</option>
                <option value="instructor" className="bg-gray-800">Instructors</option>
                <option value="headDept" className="bg-gray-800">Department Heads</option>
                {/* <option value="admin" className="bg-gray-800">Administrators</option> */}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 pointer-events-none" />
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 transition-all duration-200 min-w-[250px]"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center gap-4">
            <span className="text-white/70">
              Showing {filteredUsers.length} of {users.length} users
            </span>
            {isLoading && (
              <RefreshCw className="w-5 h-5 text-white/60 animate-spin" />
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-100 font-medium">{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="bg-white/5 border-b border-white/10 p-4">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-600 bg-transparent border-white/30 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-white font-medium">
              {selectedUsers.length > 0 ? `${selectedUsers.length} selected` : 'Select All'}
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 text-white/60 animate-spin mx-auto mb-4" />
              <p className="text-white/70">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/70 text-lg mb-2">No users found</p>
              <p className="text-white/50">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left p-4 text-white/80 font-medium">User</th>
                  <th className="text-left p-4 text-white/80 font-medium">ID</th>
                  <th className="text-left p-4 text-white/80 font-medium">Contact</th>
                  <th className="text-left p-4 text-white/80 font-medium">Department</th>
                  <th className="text-left p-4 text-white/80 font-medium">Role</th>
                  <th className="text-left p-4 text-white/80 font-medium">Additional</th>
                  <th className="text-left p-4 text-white/80 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => {
                  const roleConf = getRoleConfig(user.role);
                  const Icon = roleConf.icon;
                  const isSelected = selectedUsers.includes(user._id || user.id);
                  
                  return (
                    <tr 
                      key={user._id || user.id} 
                      className={`border-b border-white/10 hover:bg-white/5 transition-all duration-200 ${
                        isSelected ? 'bg-white/10' : ''
                      }`}
                    >
                      {/* User Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectUser(user._id || user.id)}
                            className="w-4 h-4 text-blue-600 bg-transparent border-white/30 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <div className={`w-10 h-10 bg-gradient-to-r ${roleConf.color} rounded-full flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-white/60 text-sm">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* ID */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-white/60" />
                          <span className="text-white font-mono text-sm">
                            {user.role === 'instructor' || user.role === 'headDept' ? user.employeeId : user.studentId || 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4">
                        <div className="space-y-1">
                          {user.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-white/60" />
                              <span className="text-white/80 text-sm">{user.phone}</span>
                            </div>
                          )}
                          {user.address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-white/60" />
                              <span className="text-white/80 text-sm truncate max-w-[150px]" title={user.address}>
                                {user.address}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Department */}
                      <td className="p-4">
                        {user.department ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-white/60" />
                            <div>
                              <p className="text-white font-medium text-sm">{user.department.name}</p>
                              <p className="text-white/60 text-xs">{user.department.code}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-white/50 text-sm">No Department</span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${roleConf.bgColor}`}>
                          <Icon className={`w-4 h-4 ${roleConf.textColor}`} />
                          <span className={`text-sm font-medium ${roleConf.textColor} capitalize`}>
                            {user.role === 'headDept' ? 'Head' : user.role}
                          </span>
                        </div>
                      </td>

                      {/* Additional Info */}
                      <td className="p-4">
                        <div className="space-y-1">
                          {user.semester && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-white/60" />
                              <span className="text-white/80 text-sm">Semester {user.semester}</span>
                            </div>
                          )}
                          {user.createdAt && (
                            <p className="text-white/50 text-xs">
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="relative">
                          <button
                            onClick={() => setShowActions(showActions === user._id ? null : user._id)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                          >
                            <MoreHorizontal className="w-4 h-4 text-white/60" />
                          </button>
                          
                          {showActions === user._id && (
                            <div className="absolute right-0 top-full mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 min-w-[150px]">
                              <div className="p-2">
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                                onClick={() => navigate(`/user-profile/${user._id}`)}
                                >
                                  <Eye className="w-4 h-4" />
                <span className="text-sm" >View Profile</span>
                                </button>
                                {user.role === 'instructor' ? (<button className="w-full flex items-center gap-2 px-3 py-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                                onClick={() => navigate(`/update-insturctor/${user._id}`)}
                                >
                                  <Edit className="w-4 h-4" />
                                  <span className="text-sm">Edit</span>
                                </button>) : (<button className="w-full flex items-center gap-2 px-3 py-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                                onClick={() => navigate(`/update-student/${user._id}`)}
                                >
                                  <Edit className="w-4 h-4" />
                                  <span className="text-sm">Edit</span>
                                </button>)}
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200">
                                  <Trash2 className="w-4 h-4" />
                                  <span className="text-sm">Delete</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center gap-4">
            <span className="text-white font-medium">{selectedUsers.length} users selected</span>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors duration-200 text-sm">
                Export
              </button>
              <button className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-200 text-sm">
                Delete
              </button>
              <button 
                onClick={() => setSelectedUsers([])}
                className="px-4 py-2 bg-white/10 border border-white/20 text-white/80 rounded-lg hover:bg-white/20 transition-colors duration-200 text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewUsers;