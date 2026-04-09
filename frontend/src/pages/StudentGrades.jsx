import React, { useState, useEffect } from 'react';
import {
  Award, BookOpen, Users, ArrowLeft, RefreshCw, AlertCircle,
  CheckCircle, Clock, Star, TrendingUp, FileText
} from 'lucide-react';
import { Link } from "react-router-dom";
import axios from 'axios';
import useAuthStore from '../store/authStore';

const StudentGrades = () => {
  const { user } = useAuthStore();
  const [grades, setGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "http://localhost:3000/app/v1/student/grades",
        { withCredentials: true }
      );

      if (response.data.success) {
        setGrades(response.data.data);
        setError('');
      } else {
        setError(response.data.message || 'Failed to fetch grades');
      }
    } catch (err) {
      console.error('Error fetching grades:', err);
      setError(err.response?.data?.message || 'Failed to fetch your grades');
    } finally {
      setIsLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'text-gray-400';
    const gradeLetter = grade.charAt(0);
    switch (gradeLetter) {
      case 'A': return 'text-green-400';
      case 'B': return 'text-blue-400';
      case 'C': return 'text-yellow-400';
      case 'D': return 'text-orange-400';
      case 'F': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getGradePointColor = (gradePoint) => {
    if (gradePoint >= 3.5) return 'text-green-400';
    if (gradePoint >= 3.0) return 'text-blue-400';
    if (gradePoint >= 2.0) return 'text-yellow-400';
    if (gradePoint >= 1.0) return 'text-orange-400';
    return 'text-red-400';
  };

  const calculateGPA = () => {
    const gradedCourses = grades.filter(g => g.grade);
    if (gradedCourses.length === 0) return 0;

    const totalPoints = gradedCourses.reduce((sum, g) => sum + (g.grade.gradePoint * g.course.credits), 0);
    const totalCredits = gradedCourses.reduce((sum, g) => sum + g.course.credits, 0);

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your grades...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/student/dashboard" className="text-white/70 hover:text-white transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">My Grades</h1>
                <p className="text-white/70 mt-1">View your academic performance</p>
              </div>
            </div>
            <button
              onClick={fetchGrades}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* GPA Summary */}
        {grades.length > 0 && (
          <div className="mb-8">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Overall GPA</h3>
                  <p className="text-white/70">Based on completed courses</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-white mb-1">{calculateGPA()}</div>
                  <div className="text-white/60">Grade Point Average</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grades List */}
        <div className="space-y-6">
          {grades.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Courses Found</h3>
              <p className="text-white/60">You haven't enrolled in any courses yet.</p>
            </div>
          ) : (
            grades.map((gradeItem, index) => (
              <div key={index} className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {gradeItem.course.title}
                        </h3>
                        <p className="text-white/70 mb-2">{gradeItem.course.code}</p>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Semester {gradeItem.course.semester}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {gradeItem.course.credits} Credits
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {gradeItem.grade ? (
                      <div className="space-y-2">
                        <div className={`text-3xl font-bold ${getGradeColor(gradeItem.grade.grade)}`}>
                          {gradeItem.grade.grade}
                        </div>
                        <div className={`text-lg font-semibold ${getGradePointColor(gradeItem.grade.gradePoint)}`}>
                          {gradeItem.grade.gradePoint} Points
                        </div>
                        <div className="text-white/60 text-sm">
                          Uploaded by {gradeItem.grade.uploadedBy}
                        </div>
                        <div className="text-white/50 text-xs">
                          {new Date(gradeItem.grade.uploadedAt).toLocaleDateString()}
                        </div>
                        {gradeItem.grade.remarks && (
                          <div className="text-white/70 text-sm mt-2 p-2 bg-white/10 rounded">
                            <strong>Remarks:</strong> {gradeItem.grade.remarks}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mb-2">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="text-gray-400 font-medium">
                          Grade has not been updated yet
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        {grades.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {grades.filter(g => g.grade).length}
              </div>
              <div className="text-white/70">Graded Courses</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {grades.filter(g => !g.grade).length}
              </div>
              <div className="text-white/70">Pending Grades</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {grades.reduce((sum, g) => sum + g.course.credits, 0)}
              </div>
              <div className="text-white/70">Total Credits</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentGrades;