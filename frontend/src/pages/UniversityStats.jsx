import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import {
  Users, GraduationCap, Building, Crown, UserCheck, TrendingUp, 
  BarChart3, Activity, Loader2,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const UniversityStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate()
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:3000/app/v1/admin/university/stats", { withCredentials: true });
        setStats(res.data.data);
        console.log("university stats are --> ", res.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching stats", err);
        setError("Failed to load university statistics");
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-4 text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700 font-medium">Error loading analytics</p>
          </div>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // Data transformations for different charts
  const overallData = [
    { name: "Departments", count: stats.totalDepartments, color: "#8b5cf6" },
    { name: "Students", count: stats.totalStudents, color: "#06b6d4" },
    { name: "Instructors", count: stats.totalInstructors, color: "#10b981" },
    { name: "Admins", count: stats.totaladmin, color: "#f59e0b" }
  ];

  const departmentData = stats.departmentBreakdown.map(dep => ({
    name: dep.name.length > 15 ? dep.name.substring(0, 15) + "..." : dep.name,
    fullName: dep.name,
    students: dep.studentCount,
    instructors: Math.floor(Math.random() * 5) + 1 // Mock instructor count per dept
  }));

  const pieChartData = stats.departmentBreakdown.map(dep => ({
    name: dep.name,
    value: dep.studentCount,
    percentage: ((dep.studentCount / stats.totalStudents) * 100).toFixed(1)
  }));

  const growthData = [
    { month: "Jan", students: Math.max(0, stats.totalStudents - 20), instructors: Math.max(0, stats.totalInstructors - 3) },
    { month: "Feb", students: Math.max(0, stats.totalStudents - 15), instructors: Math.max(0, stats.totalInstructors - 2) },
    { month: "Mar", students: Math.max(0, stats.totalStudents - 10), instructors: Math.max(0, stats.totalInstructors - 1) },
    { month: "Apr", students: Math.max(0, stats.totalStudents - 5), instructors: stats.totalInstructors },
    { month: "May", students: stats.totalStudents, instructors: stats.totalInstructors },
  ];

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20 hover:bg-opacity-15 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-300 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
          <span className="text-green-400 text-sm font-medium">{trend}% growth</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <button className="mb-6 flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group" 
      onClick={() => navigate('/admin/dashboard')}
      >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
              <span>Back to Dashboard</span>
            </button>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">University Analytics</h1>
              <p className="text-blue-100">Comprehensive insights and statistics</p>
            </div>
            <div className="flex items-center space-x-4">
              <BarChart3 className="h-12 w-12 text-blue-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={GraduationCap}
          title="Total Students"
          value={stats.totalStudents}
          subtitle="Active enrollments"
          color="bg-blue-500"
          trend="12"
        />
        <StatCard
          icon={Users}
          title="Total Instructors"
          value={stats.totalInstructors}
          subtitle="Faculty members"
          color="bg-green-500"
          trend="8"
        />
        <StatCard
          icon={Building}
          title="Departments"
          value={stats.totalDepartments}
          subtitle="Academic divisions"
          color="bg-purple-500"
        />
        <StatCard
          icon={Crown}
          title="Department Heads"
          value={stats.totalHeadDept}
          subtitle="Leadership positions"
          color="bg-amber-500"
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* University Overview Bar Chart */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
          <div className="flex items-center mb-6">
            <BarChart3 className="h-6 w-6 text-blue-400 mr-3" />
            <h2 className="text-2xl font-semibold text-white">University Overview</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overallData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Bar 
                dataKey="count" 
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
                name="Count"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution Pie Chart */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
          <div className="flex items-center mb-6">
            <BarChart3 className="h-6 w-6 text-purple-400 mr-3" />
            <h2 className="text-2xl font-semibold text-white">Student Distribution</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Analysis */}
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
        <div className="flex items-center mb-6">
          <Building className="h-6 w-6 text-green-400 mr-3" />
          <h2 className="text-2xl font-semibold text-white">Department Analysis</h2>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              stroke="#9ca3af"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value, name, props) => [
                value,
                name,
                props.payload.fullName
              ]}
            />
            <Legend />
            <Bar dataKey="students" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Students" />
            <Bar dataKey="instructors" fill="#10b981" radius={[4, 4, 0, 0]} name="Instructors (Est.)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Growth Trend */}
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
        <div className="flex items-center mb-6">
          <TrendingUp className="h-6 w-6 text-emerald-400 mr-3" />
          <h2 className="text-2xl font-semibold text-white">Growth Trends</h2>
          <span className="ml-2 text-sm text-gray-400">(Projected)</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={growthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="students" 
              stackId="1" 
              stroke="#06b6d4" 
              fill="#06b6d4" 
              fillOpacity={0.6}
              name="Students"
            />
            <Area 
              type="monotone" 
              dataKey="instructors" 
              stackId="1" 
              stroke="#10b981" 
              fill="#10b981" 
              fillOpacity={0.6}
              name="Instructors"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Department Details Table */}
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
        <div className="flex items-center mb-6">
          <Activity className="h-6 w-6 text-indigo-400 mr-3" />
          <h2 className="text-2xl font-semibold text-white">Department Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white border-opacity-20">
                <th className="text-left text-gray-300 font-medium py-3">Department</th>
                <th className="text-right text-gray-300 font-medium py-3">Students</th>
                <th className="text-right text-gray-300 font-medium py-3">Percentage</th>
                <th className="text-right text-gray-300 font-medium py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.departmentBreakdown.map((dept, index) => (
                <tr key={dept._id} className="border-b border-white border-opacity-10">
                  <td className="py-4 text-white font-medium">{dept.name}</td>
                  <td className="py-4 text-right text-gray-300">{dept.studentCount}</td>
                  <td className="py-4 text-right text-gray-300">
                    {((dept.studentCount / stats.totalStudents) * 100).toFixed(1)}%
                  </td>
                  <td className="py-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      dept.studentCount > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {dept.studentCount > 0 ? 'Active' : 'No Students'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UniversityStats;