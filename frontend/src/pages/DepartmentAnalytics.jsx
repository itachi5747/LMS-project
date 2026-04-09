import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, Area, AreaChart, Cell
} from "recharts";
import {
  Building2, Users, GraduationCap, BookOpen, ChevronDown, 
  TrendingUp, Award, Target, Zap, Loader2, AlertCircle,
  ArrowLeft
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DepartmentAnalytics = () => {
  const [departmentsData, setDepartmentsData] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate()
  useEffect(() => {
    const fetchDepartmentStats = async () => {
      try {
        const res = await axios.get("http://localhost:3000/app/v1/admin/departments/stats", { 
          withCredentials: true 
        });
        const data = res.data.data;
        setDepartmentsData(data);
        
        // Set Computer Science as default if available
        const defaultDept = data.find(dept => dept.name === "Computer Science") || data[0];
        if (defaultDept) {
          setSelectedDepartment(defaultDept.name);
        }
        
        console.log("Department stats are --> ", data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching department stats", err);
        setError("Failed to load department statistics");
        setLoading(false);
      }
    };
    fetchDepartmentStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-gray-400 mt-4 text-lg">Loading department analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700 font-medium">Error loading analytics</p>
          </div>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  const currentDept = departmentsData.find(dept => dept.name === selectedDepartment);
  const currentStats = currentDept?.stats || { totalStudents: 0, totalInstructors: 0, totalCourses: 0 };

  // Data for different visualizations
  const comparisonData = departmentsData.map(dept => ({
    name: dept.name.length > 12 ? dept.name.substring(0, 12) + "..." : dept.name,
    fullName: dept.name,
    students: dept.stats.totalStudents,
    instructors: dept.stats.totalInstructors,
    courses: dept.stats.totalCourses,
    ratio: dept.stats.totalStudents > 0 ? (dept.stats.totalStudents / Math.max(dept.stats.totalInstructors, 1)).toFixed(1) : 0
  }));

  const radarData = [
    { subject: 'Students', value: currentStats.totalStudents, fullMark: Math.max(...departmentsData.map(d => d.stats.totalStudents)) || 10 },
    { subject: 'Instructors', value: currentStats.totalInstructors, fullMark: Math.max(...departmentsData.map(d => d.stats.totalInstructors)) || 10 },
    { subject: 'Courses', value: currentStats.totalCourses, fullMark: Math.max(...departmentsData.map(d => d.stats.totalCourses)) || 10 },
  ];

  const performanceData = [
    { name: 'Efficiency', value: currentStats.totalCourses > 0 ? (currentStats.totalStudents / currentStats.totalCourses) : 0 },
    { name: 'Faculty Ratio', value: currentStats.totalInstructors > 0 ? (currentStats.totalStudents / currentStats.totalInstructors) : 0 },
    { name: 'Course Load', value: currentStats.totalInstructors > 0 ? (currentStats.totalCourses / currentStats.totalInstructors) : 0 }
  ];

  const MetricCard = ({ icon: Icon, title, value, subtitle, gradient, comparison }) => (
    <div className={`${gradient} rounded-2xl p-6 text-white relative overflow-hidden transform hover:scale-105 transition-all duration-300`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -mr-8 -mt-8"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-5 rounded-full -ml-4 -mb-4"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <Icon className="h-8 w-8" />
          {comparison && (
            <div className="flex items-center text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>vs avg</span>
            </div>
          )}
        </div>
        <h3 className="text-lg font-medium opacity-90">{title}</h3>
        <p className="text-3xl font-bold mt-2">{value}</p>
        {subtitle && <p className="text-sm opacity-75 mt-1">{subtitle}</p>}
      </div>
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
      {/* Header with Dropdown */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 rounded-2xl p-8 text-white relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-20"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <Building2 className="h-10 w-10 mr-3" />
                Department Analytics
              </h1>
              <p className="text-indigo-100">Deep insights into departmental performance</p>
            </div>
            
            {/* Department Selector */}
            <div className="relative pl-52 z-20">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-xl px-6 py-3 flex items-center space-x-3 hover:bg-opacity-30 transition-all min-w-64"
              >
                <Building2 className="h-5 w-5" />
                <span className="font-medium">{selectedDepartment}</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                  {departmentsData.map((dept) => (
                    <button
                      key={dept.name}
                      onClick={() => {
                        setSelectedDepartment(dept.name);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors z-30 ${
                        selectedDepartment === dept.name ? 'bg-indigo-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{dept.name}</span>
                        <span className="text-gray-400 text-sm">{dept.stats.totalStudents} students</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          icon={Users}
          title="Total Students"
          value={currentStats.totalStudents}
          subtitle="Active enrollments"
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <MetricCard
          icon={GraduationCap}
          title="Faculty Members"
          value={currentStats.totalInstructors}
          subtitle="Teaching staff"
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <MetricCard
          icon={BookOpen}
          title="Course Offerings"
          value={currentStats.totalCourses}
          subtitle="Available courses"
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Performance Radar */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center mb-6">
            <Target className="h-6 w-6 text-indigo-400 mr-3" />
            <h2 className="text-2xl font-semibold text-white">Department Profile</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <PolarRadiusAxis 
                angle={0} 
                domain={[0, 'dataMax']} 
                tick={{ fill: '#6b7280', fontSize: 10 }}
                stroke="rgba(255,255,255,0.2)"
              />
              <Radar
                name={selectedDepartment}
                dataKey="value"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.9)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Metrics */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center mb-6">
            <Zap className="h-6 w-6 text-yellow-400 mr-3" />
            <h2 className="text-2xl font-semibold text-white">Performance Metrics</h2>
          </div>
          <div className="space-y-4">
            {performanceData.map((metric, index) => (
              <div key={metric.name} className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 font-medium">{metric.name}</span>
                  <span className="text-white font-bold">{metric.value.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${Math.min((metric.value / 10) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Additional Insights */}
          <div className="mt-6 p-4 bg-indigo-900 bg-opacity-30 rounded-xl border border-indigo-500 border-opacity-20">
            <div className="flex items-center mb-2">
              <Award className="h-5 w-5 text-indigo-400 mr-2" />
              <span className="text-indigo-200 font-medium">Department Insights</span>
            </div>
            <div className="text-sm text-gray-300 space-y-1">
              <p>• Student-to-Faculty ratio: {currentStats.totalInstructors > 0 ? (currentStats.totalStudents / currentStats.totalInstructors).toFixed(1) : 'N/A'}:1</p>
              <p>• Courses per instructor: {currentStats.totalInstructors > 0 ? (currentStats.totalCourses / currentStats.totalInstructors).toFixed(1) : 'N/A'}</p>
              <p>• Students per course: {currentStats.totalCourses > 0 ? (currentStats.totalStudents / currentStats.totalCourses).toFixed(1) : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Department Comparison */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center mb-6">
          <BarChart className="h-6 w-6 text-emerald-400 mr-3" />
          <h2 className="text-2xl font-semibold text-white">Inter-Department Comparison</h2>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#fff'
              }}
              formatter={(value, name, props) => [
                value,
                name,
                props.payload.fullName
              ]}
            />
            <Legend />
            <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Students" />
            <Bar dataKey="instructors" fill="#10b981" radius={[4, 4, 0, 0]} name="Instructors" />
            <Bar dataKey="courses" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Courses" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Department Rankings */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center mb-6">
          <Award className="h-6 w-6 text-amber-400 mr-3" />
          <h2 className="text-2xl font-semibold text-white">Department Rankings</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* By Students */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-blue-400 mb-4">By Student Count</h3>
            {[...departmentsData].sort((a, b) => b.stats.totalStudents - a.stats.totalStudents).map((dept, index) => (
              <div key={dept.name} className={`flex items-center justify-between p-3 rounded-lg ${
                dept.name === selectedDepartment ? 'bg-blue-600 bg-opacity-20 border border-blue-500 border-opacity-30' : 'bg-gray-800'
              }`}>
                <div className="flex items-center">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                    index === 0 ? 'bg-yellow-500 text-black' : 
                    index === 1 ? 'bg-gray-400 text-white' : 
                    index === 2 ? 'bg-amber-600 text-white' : 'bg-gray-600 text-white'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="text-white font-medium text-sm">{dept.name}</span>
                </div>
                <span className="text-blue-400 font-bold">{dept.stats.totalStudents}</span>
              </div>
            ))}
          </div>

          {/* By Instructors */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-green-400 mb-4">By Faculty Count</h3>
            {[...departmentsData].sort((a, b) => b.stats.totalInstructors - a.stats.totalInstructors).map((dept, index) => (
              <div key={dept.name} className={`flex items-center justify-between p-3 rounded-lg ${
                dept.name === selectedDepartment ? 'bg-green-600 bg-opacity-20 border border-green-500 border-opacity-30' : 'bg-gray-800'
              }`}>
                <div className="flex items-center">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                    index === 0 ? 'bg-yellow-500 text-black' : 
                    index === 1 ? 'bg-gray-400 text-white' : 
                    index === 2 ? 'bg-amber-600 text-white' : 'bg-gray-600 text-white'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="text-white font-medium text-sm">{dept.name}</span>
                </div>
                <span className="text-green-400 font-bold">{dept.stats.totalInstructors}</span>
              </div>
            ))}
          </div>

          {/* By Courses */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-purple-400 mb-4">By Course Offerings</h3>
            {[...departmentsData].sort((a, b) => b.stats.totalCourses - a.stats.totalCourses).map((dept, index) => (
              <div key={dept.name} className={`flex items-center justify-between p-3 rounded-lg ${
                dept.name === selectedDepartment ? 'bg-purple-600 bg-opacity-20 border border-purple-500 border-opacity-30' : 'bg-gray-800'
              }`}>
                <div className="flex items-center">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                    index === 0 ? 'bg-yellow-500 text-black' : 
                    index === 1 ? 'bg-gray-400 text-white' : 
                    index === 2 ? 'bg-amber-600 text-white' : 'bg-gray-600 text-white'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="text-white font-medium text-sm">{dept.name}</span>
                </div>
                <span className="text-purple-400 font-bold">{dept.stats.totalCourses}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentAnalytics;