import React, { useState, useEffect } from 'react';
import {
  BookOpen, Users, Clock, ArrowLeft, RefreshCw, AlertCircle,
  User, Mail, Phone, FileText, ChevronRight, Star
} from 'lucide-react';
import { Link } from "react-router-dom";
import axios from 'axios';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      console.log('Selected Course:', selectedCourse);
      console.log('Instructors:', selectedCourse.instructors);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "http://localhost:3000/app/v1/student/courses/enrolled",
        { withCredentials: true }
      );

      if (response.data.success) {
        // Backend may return enrolled courses under `enrolledCourses` (array of { course })
        // or under `data` as an array of course objects. Normalize both shapes.
        const payload = response.data.enrolledCourses || response.data.data || [];
        const normalized = Array.isArray(payload)
          ? payload.map(item => (item && item.course) ? item.course : item)
          : [];
        setCourses(normalized);
        setError('');
      } else {
        setError(response.data.message || 'Failed to fetch courses');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.response?.data?.message || 'Failed to fetch your courses');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin">
          <RefreshCw className="w-12 h-12 text-blue-400" />
        </div>
        <p className="ml-4 text-white/70 text-lg">Loading your courses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      {/* Back Button */}
      <Link
        to="/student/dashboard"
        className="mb-6 flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">My Courses</h1>
            <p className="text-white/70">View your enrolled courses and details</p>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && !isLoading && (
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-center gap-4">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <p className="text-red-100">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {courses.length === 0 && !error && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
            <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Courses Yet</h3>
            <p className="text-white/70">You haven't enrolled in any courses yet. Visit the course catalog to enroll.</p>
            <button className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200">
              Browse Courses
            </button>
            <Link
              to="/student/enroll-course"
              className="mt-4 inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              Enroll in More Courses
            </Link>
          </div>
        </div>
      )}

      {/* Courses Overview */}
      {courses.length > 0 && (
        <>
          {/* Summary Stats */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm mb-1">Total Courses</p>
                  <p className="text-3xl font-bold text-white">{courses.length}</p>
                </div>
                <BookOpen className="w-10 h-10 text-blue-400/20" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm mb-1">Total Credit Hours</p>
                  <p className="text-3xl font-bold text-white">
                    {courses.reduce((sum, c) => sum + (c.creditHours || c.credits || 0), 0)}
                  </p>
                </div>
                <Star className="w-10 h-10 text-yellow-400/20" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm mb-1">Semester</p>
                  <p className="text-3xl font-bold text-white">Active</p>
                </div>
                <Clock className="w-10 h-10 text-green-400/20" />
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="max-w-6xl mx-auto">
            {selectedCourse ? (
              // Course Detail View
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-xl">
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="mb-6 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Courses
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Main Info */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Header */}
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-white mb-2">{selectedCourse.title}</h2>
                          <p className="text-white/70">Code: {selectedCourse.code}</p>
                        </div>
                      </div>
                      <p className="text-white/70">{selectedCourse.description || 'No description available'}</p>
                    </div>

                    {/* Course Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <p className="text-white/70 text-sm mb-1">Credit Hours</p>
                        <p className="text-2xl font-bold text-white">{selectedCourse.creditHours || selectedCourse.credits || 'N/A'}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <p className="text-white/70 text-sm mb-1">Status</p>
                        <p className="text-lg font-bold text-green-300">Active</p>
                      </div>
                    </div>

                    {/* Instructors */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        Instructors ({selectedCourse.instructors?.length || 0})
                      </h3>
                      <div className="space-y-3">
                        {selectedCourse.instructors && selectedCourse.instructors.length > 0 ? (
                          selectedCourse.instructors.map((instructor, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                  <User className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-semibold">{instructor.name}</p>
                                  <p className="text-white/70 text-sm">{instructor.employeeId}</p>
                                  <p className="text-white/70 text-sm flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {instructor.email}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-white/70">No instructors assigned yet</p>
                        )}
                      </div>
                    </div>

                    {/* Prerequisites */}
                    {selectedCourse.prerequisites && selectedCourse.prerequisites.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-white mb-4">Prerequisites</h3>
                        <div className="space-y-2">
                          {selectedCourse.prerequisites.map((prereq, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-3">
                              <ChevronRight className="w-5 h-5 text-blue-400 flex-shrink-0" />
                              <span className="text-white">{prereq.title} ({prereq.code})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-4">
                    {/* Enrollment Info */}
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-3">Enrollment Status</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/70">Status</span>
                          <span className="text-green-300 font-semibold">Enrolled</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Semester</span>
                          <span className="text-white font-semibold">Active</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200">
                        View Grades
                      </button>
                      <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-200 border border-white/20">
                        Download Material
                      </button>
                      <button className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg font-medium transition-all duration-200 border border-red-500/30">
                        Unroll Course
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Courses List
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    onClick={() => setSelectedCourse(course)}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:border-white/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors duration-200">{course.title}</h3>
                        <p className="text-white/70 text-sm mt-1">{course.code}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-blue-400" />
                      </div>
                    </div>

                    {course.description && (
                      <p className="text-white/70 text-sm mb-4 line-clamp-2">{course.description}</p>
                    )}

                    <div className="space-y-2 mb-4 py-4 border-t border-white/10">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Credit Hours</span>
                        <span className="text-white font-semibold">{course.creditHours || course.credits || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Instructors</span>
                        <span className="text-white font-semibold">
                          {course.instructors?.length || 0}
                        </span>
                      </div>
                    </div>

                    <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2">
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentCourses;
