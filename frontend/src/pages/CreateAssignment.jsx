import React, { useEffect, useState } from 'react';
import {
  Menu, X, BookOpen, Users, Home, LogOut, Award,
  ClipboardList, ArrowLeft, FileText, Upload, Calendar,
  CheckCircle, Save
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CreateAssignment = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submissionType, setSubmissionType] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:3000/app/v1/teacher/courses", {
        withCredentials: true
      });
      if (response.data.success) {
        setCourses(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(selected.type)) {
      toast.error('Only PDF and DOC/DOCX files are allowed');
      e.target.value = '';
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      e.target.value = '';
      return;
    }

    setFile(selected);
  };

  const getMinDeadline = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCourse || !title || !deadline || !submissionType || !file) {
      toast.error('Please fill in all required fields and upload a file');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('courseId', selectedCourse);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('deadline', deadline);
      formData.append('submissionType', submissionType);
      formData.append('file', file);

      const response = await axios.post(
        "http://localhost:3000/app/v1/teacher/create-assignment",
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (response.data.success) {
        toast.success('Assignment created successfully!');
        setSelectedCourse('');
        setTitle('');
        setDescription('');
        setDeadline('');
        setSubmissionType('');
        setFile(null);
        const fileInput = document.getElementById('assignment-file');
        if (fileInput) fileInput.value = '';
      }
    } catch (err) {
      console.error('Error creating assignment:', err);
      toast.error(err.response?.data?.message || 'Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { title: 'Dashboard', icon: Home, path: '/teacher/dashboard' },
    { title: 'My Courses', icon: BookOpen, path: '/teacher/courses' },
    { title: 'Students', icon: Users, path: '/teacher/students' },
    { title: 'Mark Grades', icon: Award, path: '/teacher/mark-grades' },
    { title: 'Mark Attendance', icon: ClipboardList, path: '/teacher/mark-attendance' },
    { title: 'Assignments', icon: FileText, path: '/teacher/create-assignment', active: true }
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
      <div className={`fixed left-0 top-0 h-full bg-white/10 backdrop-blur-xl border-r border-white/20 transition-all duration-500 ease-in-out flex flex-col ${
        isOpen ? 'w-80 translate-x-0' : 'w-80 -translate-x-full'
      }`}>
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Teacher Portal</h2>
              <p className="text-white/70 text-sm">Assignment Management</p>
            </div>
          </div>

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
              <h1 className="text-4xl font-bold text-white">Create Assignment</h1>
            </div>
            <p className="text-white/80 text-lg">
              Create a new assignment for your course
            </p>
          </div>

          {/* Assignment Form */}
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

                {/* Assignment Title */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Assignment Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Assignment 1 - Data Structures"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Brief description of the assignment..."
                    rows="3"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Upload Assignment File (PDF/DOC) *
                  </label>
                  <div className="relative">
                    <input
                      id="assignment-file"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      required={!file}
                    />
                    <label
                      htmlFor="assignment-file"
                      className="flex items-center gap-3 w-full px-4 py-4 bg-white/10 border-2 border-dashed border-white/30 rounded-lg cursor-pointer hover:bg-white/15 hover:border-white/50 transition-all duration-200"
                    >
                      <Upload className="w-6 h-6 text-white/70" />
                      <div className="flex-1">
                        {file ? (
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-green-400" />
                            <span className="text-green-400 font-medium">{file.name}</span>
                            <span className="text-white/50 text-sm">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                        ) : (
                          <div>
                            <p className="text-white/80 font-medium">Click to upload file</p>
                            <p className="text-white/50 text-sm">PDF, DOC, DOCX (max 10MB)</p>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={getMinDeadline()}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
                    required
                  />
                </div>

                {/* Submission Type */}
                <div>
                  <label className="block text-white font-medium mb-3">
                    Submission Method *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setSubmissionType('dashboard')}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-300 hover:scale-105 ${
                        submissionType === 'dashboard'
                          ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          submissionType === 'dashboard'
                            ? 'bg-blue-500'
                            : 'bg-white/10'
                        }`}>
                          <Upload className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-white font-semibold">Submit on Dashboard</h4>
                      </div>
                      <p className="text-white/60 text-sm">
                        Students upload files on the dashboard. Submissions are locked after the deadline.
                      </p>
                      {submissionType === 'dashboard' && (
                        <div className="mt-2 flex items-center gap-1 text-blue-400 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Selected
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSubmissionType('class')}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-300 hover:scale-105 ${
                        submissionType === 'class'
                          ? 'border-green-500 bg-green-500/20 shadow-lg shadow-green-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          submissionType === 'class'
                            ? 'bg-green-500'
                            : 'bg-white/10'
                        }`}>
                          <ClipboardList className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-white font-semibold">Submit in Class</h4>
                      </div>
                      <p className="text-white/60 text-sm">
                        Students complete assignments and submit them physically in class.
                      </p>
                      {submissionType === 'class' && (
                        <div className="mt-2 flex items-center gap-1 text-green-400 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Selected
                        </div>
                      )}
                    </button>
                  </div>
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
                      Creating Assignment...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Create Assignment
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

export default CreateAssignment;
