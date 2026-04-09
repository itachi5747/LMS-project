import React, { useEffect, useState } from 'react';
import {
  Menu, X, Award, Users, GraduationCap, Home, LogOut, BookOpen,
  ClipboardList, ArrowLeft, Search, Save, CheckCircle, AlertCircle, FileText
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const MarkGrades = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [searchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(searchParams.get('course') || '');
  const [selectedStudent, setSelectedStudent] = useState(searchParams.get('student') || '');
  const [grade, setGrade] = useState('');
  const [gradePoint, setGradePoint] = useState('');
  const [semester, setSemester] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      const course = courses.find(c => c._id === selectedCourse);
      if (course) {
        setSemester(course.semester);
      }
    }
  }, [selectedCourse, courses]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStudent || !selectedCourse || !grade || !gradePoint || !semester) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post("http://localhost:3000/app/v1/teacher/mark-grade", {
        studentId: selectedStudent,
        courseId: selectedCourse,
        grade,
        gradePoint: parseFloat(gradePoint),
        semester,
        remarks
      }, { withCredentials: true });

      if (response.data.success) {
        toast.success('Grade marked successfully!');
        // Reset form
        setGrade('');
        setGradePoint('');
        setRemarks('');
        setSelectedStudent('');
        setSelectedCourse('');
        setSemester('');
      }
    } catch (err) {
      console.error('Error marking grade:', err);
      toast.error(err.response?.data?.message || 'Failed to mark grade');
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
      path: '/teacher/mark-grades',
      active: true
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

  // Filter students based on selected course
  const filteredStudents = selectedCourse
    ? students.filter(student =>
        student.enrolledCourses.some(course => course.courseId === selectedCourse)
      )
    : students;

  const gradeOptions = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];

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
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Teacher Portal</h2>
              <p className="text-white/70 text-sm">Grade Management</p>
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
              <h1 className="text-4xl font-bold text-white">Mark Grades</h1>
            </div>
            <p className="text-white/80 text-lg">
              Assign grades to students for your courses
            </p>
          </div>

          {/* Grade Form */}
          <div className="max-w-2xl">
            <form onSubmit={handleSubmit} className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-8">
              <div className="space-y-6">
                {/* Course Selection */}
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
                        {course.title} ({course.code}) - Semester {course.semester}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Student Selection */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Select Student *
                  </label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!selectedCourse}
                  >
                    <option value="" className="bg-gray-800">Choose a student</option>
                    {filteredStudents.map(student => (
                      <option key={student._id} value={student._id} className="bg-gray-800">
                        {student.name} ({student.studentId || student.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Semester */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Semester *
                  </label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2024"
                    required
                    readOnly
                  />
                </div>

                {/* Grade */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Grade *
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="" className="bg-gray-800">Select grade</option>
                    {gradeOptions.map(gradeOption => (
                      <option key={gradeOption} value={gradeOption} className="bg-gray-800">
                        {gradeOption}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grade Point */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Grade Point (0-4.0) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    step="0.1"
                    value={gradePoint}
                    onChange={(e) => setGradePoint(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 4.0"
                    required
                  />
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Remarks (Optional)
                  </label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Additional comments..."
                    rows="3"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Marking Grade...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Mark Grade
                    </>
                  )}
                </button>
              </div>
            </form>
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

export default MarkGrades;