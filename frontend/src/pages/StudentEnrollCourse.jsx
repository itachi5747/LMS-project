import React, { useState, useEffect } from 'react';
import {
  BookOpen, Users, Zap, ArrowLeft, RefreshCw, AlertCircle,
  CheckCircle2, Lock, ArrowRight, User, Mail, Clock, Layers,
  Search, Filter, X, Check
} from 'lucide-react';
import { Link } from "react-router-dom";
import axios from 'axios';

const StudentEnrollCourse = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSemester, setFilterSemester] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchCoursesAndEnrollments();
  }, []);

  const fetchCoursesAndEnrollments = async () => {
  try {
    setIsLoading(true);

    // Fetch all available courses
    const coursesRes = await axios.get(
      "http://localhost:3000/app/v1/student/courses",
      { withCredentials: true }
    );

    // Fetch enrolled courses
    const enrolledRes = await axios.get(
      "http://localhost:3000/app/v1/student/courses/enrolled",
      { withCredentials: true }
    );

    if (coursesRes.data.success) {
      setCourses(coursesRes.data.data || []);
    }
    console.log("enrolledRes -> ", enrolledRes.data.enrolledCourses.length);
    
    if (enrolledRes.data.success) {
      const enrolledIds = new Set(
        (enrolledRes.data.enrolledCourses || [])
          .filter(c => c && c.course) // Filter out undefined/null entries
          .map(c => {
            // Handle both object and string course references
            return typeof c.course === 'object' ? c.course._id : c.course;
          })
          .filter(id => id) // Remove any undefined IDs
      );
      setEnrolledCourseIds(enrolledIds);
    }

    setError('');
  } catch (err) {
    console.error('Error fetching courses:', err);
    setError(err.response?.data?.message || 'Failed to load courses');
  } finally {
    setIsLoading(false);
  }
};

  const handleEnroll = async (courseId) => {
    if (enrolledCourseIds.has(courseId)) {
      setError('You are already enrolled in this course');
      return;
    }

    try {
      setIsEnrolling(true);
      const response = await axios.post(
        `http://localhost:3000/app/v1/student/courses/${courseId}/enroll`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setEnrolledCourseIds(prev => new Set([...prev, courseId]));
        setSuccessMessage(`Successfully enrolled in course!`);
        setTimeout(() => setSuccessMessage(''), 4000);
        setSelectedCourse(null);
      } else {
        setError(response.data.message || 'Failed to enroll');
      }
    } catch (err) {
      console.error('Error enrolling:', err);
      setError(err.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleUnenroll = async (courseId) => {
    if (!window.confirm('Are you sure you want to unenroll from this course?')) {
      return;
    }

    try {
      setIsEnrolling(true);
      const response = await axios.post(
        `http://localhost:3000/app/v1/student/courses/${courseId}/unregister`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setEnrolledCourseIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(courseId);
          return newSet;
        });
        setSuccessMessage('Successfully unenrolled from course');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setError(response.data.message || 'Failed to unenroll');
      }
    } catch (err) {
      console.error('Error unenrolling:', err);
      setError(err.response?.data?.message || 'Failed to unenroll');
    } finally {
      setIsEnrolling(false);
    }
  };

  // Filter and search courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSemester = filterSemester === 'all' || course.semester === filterSemester;
    return matchesSearch && matchesSemester;
  });

  const enrolledCount = enrolledCourseIds.size;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin">
          <RefreshCw className="w-12 h-12 text-blue-400" />
        </div>
        <p className="ml-4 text-white/70 text-lg">Loading courses...</p>
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
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Enroll in Courses</h1>
            <p className="text-white/70">Browse available courses and register for the semester</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="max-w-6xl mx-auto mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="text-green-100 font-medium">{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="max-w-6xl mx-auto mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-100 font-medium">{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-300 hover:text-red-200">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Stats */}
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
              <p className="text-white/70 text-sm mb-1">Enrolled</p>
              <p className="text-3xl font-bold text-green-300">{enrolledCount}</p>
            </div>
            <CheckCircle2 className="w-10 h-10 text-green-400/20" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm mb-1">Available</p>
              <p className="text-3xl font-bold text-yellow-300">{courses.length - enrolledCount}</p>
            </div>
            <Zap className="w-10 h-10 text-yellow-400/20" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search by course title or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-3.5 w-5 h-5 text-white/40" />
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 appearance-none"
            >
              <option value="all" className="bg-slate-900">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem.toString()} className="bg-slate-900">
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
            <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Courses Found</h3>
            <p className="text-white/70">
              {searchQuery || filterSemester !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No courses available at this time'}
            </p>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      {filteredCourses.length > 0 && (
        <div className="max-w-6xl mx-auto">
          {selectedCourse ? (
            // Course Detail Modal
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
              <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-8 space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{selectedCourse.title}</h2>
                      <p className="text-white/70">{selectedCourse.code}</p>
                    </div>
                    <button
                      onClick={() => setSelectedCourse(null)}
                      className="text-white/70 hover:text-white"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-3">
                    {enrolledCourseIds.has(selectedCourse._id) ? (
                      <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-300 font-medium flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Enrolled
                      </span>
                    ) : selectedCourse.capacity && selectedCourse.enrolledCount >= selectedCourse.capacity ? (
                      <span className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-xs text-red-300 font-medium flex items-center gap-1">
                        <Lock className="w-4 h-4" />
                        Course Full
                      </span>
                    ) : !selectedCourse.isRegistrationOpen ? (
                      <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-xs text-yellow-300 font-medium flex items-center gap-1">
                        <Lock className="w-4 h-4" />
                        Registration Closed
                      </span>
                    ) : !selectedCourse.prerequisitesMet ? (
                      <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-xs text-orange-300 font-medium flex items-center gap-1">
                        <Lock className="w-4 h-4" />
                        Prerequisites Not Met
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-300 font-medium flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        Available
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {selectedCourse.description && (
                    <div>
                      <h3 className="text-white font-semibold mb-2">Description</h3>
                      <p className="text-white/70">{selectedCourse.description}</p>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-white/70 text-sm mb-1">Credit Hours</p>
                      <p className="text-2xl font-bold text-white">{selectedCourse.credits}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-white/70 text-sm mb-1">Semester</p>
                      <p className="text-2xl font-bold text-white">Sem {selectedCourse.semester}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-white/70 text-sm mb-1">Enrolled</p>
                      <p className="text-2xl font-bold text-white">
                        {selectedCourse.enrolledCount}{selectedCourse.capacity ? `/${selectedCourse.capacity}` : ''}
                      </p>
                    </div>
                    {selectedCourse.capacity && (
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <p className="text-white/70 text-sm mb-1">Available Seats</p>
                        <p className="text-2xl font-bold text-green-300">
                          {Math.max(0, selectedCourse.capacity - selectedCourse.enrolledCount)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Instructors */}
                  {selectedCourse.instructors && selectedCourse.instructors.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Instructors
                      </h3>
                      <div className="space-y-2">
                        {selectedCourse.instructors.map((instructor, idx) => (
                          <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3">
                            <p className="text-white font-semibold">{instructor.name}</p>
                            <p className="text-white/70 text-sm">{instructor.email}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prerequisites */}
                  {selectedCourse.prerequisites && selectedCourse.prerequisites.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-3">Prerequisites</h3>
                      <div className="space-y-2">
                        {selectedCourse.prerequisites.map((prereq, idx) => (
                          <div key={idx} className={`border rounded-lg p-3 flex items-center justify-between gap-2 ${
                            prereq.passed
                              ? 'bg-green-500/10 border-green-500/30'
                              : 'bg-red-500/10 border-red-500/30'
                          }`}>
                            <div className="flex items-center gap-2">
                              <ArrowRight className={`w-4 h-4 flex-shrink-0 ${prereq.passed ? 'text-green-400' : 'text-red-400'}`} />
                              <span className="text-white">{prereq.title} ({prereq.code})</span>
                            </div>
                            {prereq.passed ? (
                              <span className="flex items-center gap-1 text-xs text-green-300 font-medium">
                                <Check className="w-3 h-3" /> Passed
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-red-300 font-medium">
                                <X className="w-3 h-3" /> Not Passed
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      {!selectedCourse.prerequisitesMet && !enrolledCourseIds.has(selectedCourse._id) && (
                        <p className="mt-3 text-sm text-red-300 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          You must pass all prerequisites (grade other than F) before enrolling.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4 border-t border-white/10">
                    <button
                      onClick={() => setSelectedCourse(null)}
                      className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-200 border border-white/20"
                    >
                      Cancel
                    </button>
                    {enrolledCourseIds.has(selectedCourse._id) ? (
                      <button
                        onClick={() => handleUnenroll(selectedCourse._id)}
                        disabled={isEnrolling}
                        className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200"
                      >
                        {isEnrolling ? 'Processing...' : 'Unenroll'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(selectedCourse._id)}
                        disabled={
                          isEnrolling ||
                          !selectedCourse.isRegistrationOpen ||
                          (selectedCourse.capacity && selectedCourse.enrolledCount >= selectedCourse.capacity) ||
                          !selectedCourse.prerequisitesMet
                        }
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Zap className="w-5 h-5" />
                        {isEnrolling ? 'Enrolling...' : !selectedCourse.prerequisitesMet ? 'Prerequisites Required' : 'Enroll Now'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isEnrolled = enrolledCourseIds.has(course._id);
              const isFull = course.capacity && course.enrolledCount >= course.capacity;
              const spotsAvailable = course.capacity ? Math.max(0, course.capacity - course.enrolledCount) : null;

              return (
                <div
                  key={course._id}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:border-white/30 hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-green-300 transition-colors duration-200 mb-1">
                        {course.title}
                      </h3>
                      <p className="text-white/70 text-sm">{course.code}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isEnrolled
                        ? 'bg-green-500/20 border border-green-500/30'
                        : 'bg-blue-500/20 border border-blue-500/30'
                    }`}>
                      {isEnrolled ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    {isEnrolled ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-300 font-medium">
                        <Check className="w-3 h-3" />
                        Enrolled
                      </span>
                    ) : isFull ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-xs text-red-300 font-medium">
                        <Lock className="w-3 h-3" />
                        Full
                      </span>
                    ) : !course.isRegistrationOpen ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-xs text-yellow-300 font-medium">
                        <Lock className="w-3 h-3" />
                        Closed
                      </span>
                    ) : !course.prerequisitesMet ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-xs text-orange-300 font-medium">
                        <Lock className="w-3 h-3" />
                        Prereqs Not Met
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-300 font-medium">
                        <Zap className="w-3 h-3" />
                        Available
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4 py-4 border-t border-white/10 flex-grow">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Credits</span>
                      <span className="text-white font-semibold">{course.credits}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Semester</span>
                      <span className="text-white font-semibold">Sem {course.semester}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Instructors</span>
                      <span className="text-white font-semibold">{course.instructors?.length || 0}</span>
                    </div>
                    {course.capacity && (
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Capacity</span>
                        <span className={`font-semibold ${
                          spotsAvailable > 0 ? 'text-green-300' : 'text-red-300'
                        }`}>
                          {spotsAvailable}/{course.capacity}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentEnrollCourse;
