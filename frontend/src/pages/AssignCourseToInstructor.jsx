import React, { useEffect, useState } from 'react';
import { ArrowRight, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AssignCourseToInstructor = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          'http://localhost:3000/app/v1/head-dept/department-courses',
          { withCredentials: true }
        );
        setCourses(res.data.data || []);
      } catch (err) {
        console.error('Error fetching courses:', err);
        toast.error('Failed to fetch courses');
        setErrorMessage('Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch instructors
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await axios.get(
          'http://localhost:3000/app/v1/head-dept/department-users?role=all',
          { withCredentials: true }
        );
        // Filter for instructors and headDept users
        const filteredUsers = res.data.data.filter(
          (u) => u.role === 'instructor' || u.role === 'headDept'
        );
        setInstructors(filteredUsers);
      } catch (err) {
        console.error('Error fetching instructors:', err);
        toast.error('Failed to fetch instructors');
        setErrorMessage('Failed to fetch instructors');
      }
    };

    fetchInstructors();
  }, []);

  const handleAssignCourse = async (e) => {
    e.preventDefault();

    if (!selectedCourse || !selectedInstructor) {
      toast.error('Please select both a course and an instructor');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      const res = await axios.post(
        'http://localhost:3000/app/v1/head-dept/assign-course',
        {
          courseId: selectedCourse,
          instructorId: selectedInstructor,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        setSuccessMessage(res.data.message);
        toast.success(res.data.message);
        setSelectedCourse('');
        setSelectedInstructor('');
        setTimeout(() => {
          setSuccessMessage('');
        }, 4000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to assign course';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      console.error('Error assigning course:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Find course and instructor names for display
  const selectedCourseObj = courses.find((c) => c._id === selectedCourse);
  const selectedInstructorObj = instructors.find(
    (i) => i._id === selectedInstructor
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Assign Course to Instructor
          </h1>
          <p className="text-purple-200">
            Select a course and instructor to assign the course to teach
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleAssignCourse} className="space-y-6">
            {/* Course Selection */}
            <div>
              <label className="block text-white font-semibold mb-3">
                Select Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                disabled={loading || courses.length === 0}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-black placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" >
                  {loading ? 'Loading courses...' : 'Choose a course'}
                </option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.code} - {course.title}
                  </option>
                ))}
              </select>
              {courses.length === 0 && !loading && (
                <p className="text-orange-300 text-sm mt-2">
                  No courses available
                </p>
              )}
            </div>

            {/* Instructor Selection */}
            <div>
              <label className="block text-white font-semibold mb-3">
                Select Instructor/Head
              </label>
              <select
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                disabled={instructors.length === 0}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-black placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Choose an instructor</option>
                {instructors.map((instructor) => (
                  <option key={instructor._id} value={instructor._id}>
                    {instructor.name} ({instructor.role === 'headDept' ? 'Head' : 'Instructor'})
                  </option>
                ))}
              </select>
              {instructors.length === 0 && (
                <p className="text-orange-300 text-sm mt-2">
                  No instructors available
                </p>
              )}
            </div>

            {/* Preview */}
            {selectedCourse && selectedInstructor && (
              <div className="bg-white/5 border border-purple-400/30 rounded-lg p-4 mt-6">
                <p className="text-purple-200 text-sm mb-2">Assignment Preview:</p>
                <div className="flex items-center justify-between">
                  <div className="text-white font-semibold">
                    {selectedCourseObj?.code} - {selectedCourseObj?.title}
                  </div>
                  <ArrowRight className="w-5 h-5 text-purple-400" />
                  <div className="text-white font-semibold">
                    {selectedInstructorObj?.name}
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-200">{errorMessage}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-green-200">{successMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                submitting ||
                !selectedCourse ||
                !selectedInstructor ||
                loading
              }
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  Assign Course
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-blue-300 font-semibold mb-3">Information</h3>
          <ul className="text-blue-200 text-sm space-y-2">
            <li>• Select a course from your department</li>
            <li>• Select an instructor or head department member</li>
            <li>• Click "Assign Course" to assign the course to the instructor</li>
            <li>• You can assign multiple instructors to the same course</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AssignCourseToInstructor;
