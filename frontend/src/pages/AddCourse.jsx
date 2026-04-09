import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Mail, User, Hash, Calendar, FileText,
  Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft,
  Save, RefreshCw, Users, Plus, X
} from 'lucide-react';
import { Link } from "react-router-dom";
import axios from 'axios';
import useAuthStore from '../store/authStore';

const AddCourse = () => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    instructorId: [],
    credits: '',
    semester: '',
    prerequisites: []
  });

  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [instructorSearch, setInstructorSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [showInstructorDropdown, setShowInstructorDropdown] = useState(false);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Refs for click-outside detection
  const instructorDropdownRef = useRef(null);
  const courseDropdownRef = useRef(null);

  // Fetch instructors and courses on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch instructors (both instructor and headDept roles)
        const [instructorRes, headDeptRes] = await Promise.all([
          axios.get("http://localhost:3000/app/v1/head-dept/department-users?role=instructor", {
            withCredentials: true
          }),
          axios.get("http://localhost:3000/app/v1/head-dept/department-users?role=headDept", {
            withCredentials: true
          })
        ]);

        const allInstructors = [];
        if (instructorRes.data.success) {
          allInstructors.push(...instructorRes.data.data);
        }
        if (headDeptRes.data.success) {
          allInstructors.push(...headDeptRes.data.data);
        }
        setInstructors(allInstructors);

        // Fetch courses for prerequisites
        const coursesRes = await axios.get("http://localhost:3000/app/v1/head-dept/department-courses", {
          withCredentials: true
        });
        if (coursesRes.data.success) {
          setCourses(coursesRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Handle click outside for instructor dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (instructorDropdownRef.current && !instructorDropdownRef.current.contains(event.target)) {
        setShowInstructorDropdown(false);
      }
    };

    if (showInstructorDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInstructorDropdown]);

  // Handle click outside for course dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target)) {
        setShowCourseDropdown(false);
      }
    };

    if (showCourseDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCourseDropdown]);

  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        return value.trim().length < 3 ? 'Title must be at least 3 characters' : '';
      case 'code':
        return value.trim().length < 3 ? 'Code must be at least 3 characters' : '';
      case 'description':
        return value.trim().length < 10 ? 'Description must be at least 10 characters' : '';
      case 'instructorId':
        return value.length === 0 ? 'At least one instructor must be selected' : '';
      case 'credits':
        const creditsNum = parseInt(value);
        return !value || creditsNum < 1 || creditsNum > 3 ? 'Credits must be between 1 and 3' : '';
      case 'semester':
        return !value ? 'Semester is required' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleInstructorSelect = (instructor) => {
    if (!formData.instructorId.includes(instructor._id)) {
      setFormData(prev => ({
        ...prev,
        instructorId: [...prev.instructorId, instructor._id]
      }));
    }
    setInstructorSearch('');
    setShowInstructorDropdown(false);
  };

  const handleInstructorRemove = (instructorId) => {
    setFormData(prev => ({
      ...prev,
      instructorId: prev.instructorId.filter(id => id !== instructorId)
    }));
  };

  const handlePrerequisiteSelect = (course) => {
    if (!formData.prerequisites.includes(course._id)) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, course._id]
      }));
    }
    setCourseSearch('');
    setShowCourseDropdown(false);
  };

  const handlePrerequisiteRemove = (courseId) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter(id => id !== courseId)
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        departmentId: typeof user?.department === 'string' ? user.department : user?.department?._id,
        credits: parseInt(formData.credits)
      };
      console.log("user ---> " , user?.department);
      
      console.log(submitData);
      
      const response = await axios.post("http://localhost:3000/app/v1/head-dept/create-course", submitData, {
        withCredentials: true
      });

      if (response.data.success) {
        setSuccessMessage('Course created successfully! 🎉');
        setFormData({
          title: '',
          code: '',
          description: '',
          instructorId: [],
          credits: '',
          semester: '',
          prerequisites: []
        });
      } else {
        setErrors({ submit: response.data.message || 'Failed to create course' });
      }
    } catch (error) {
      console.error('Error creating course:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create course. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      code: '',
      description: '',
      instructorId: [],
      credits: '',
      semester: '',
      prerequisites: []
    });
    setErrors({});
    setSuccessMessage('');
  };

  // Filter instructors based on search
  const filteredInstructors = instructors.filter(instructor =>
    instructor.name.toLowerCase().includes(instructorSearch.toLowerCase()) ||
    instructor.email.toLowerCase().includes(instructorSearch.toLowerCase()) ||
    (instructor.employeeId && instructor.employeeId.toLowerCase().includes(instructorSearch.toLowerCase()))
  );

  // Get selected instructors for display
  const selectedInstructors = instructors.filter(instructor =>
    formData.instructorId.includes(instructor._id)
  );

  // Filter courses based on search
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
    course.code.toLowerCase().includes(courseSearch.toLowerCase())
  );

  // Get selected prerequisites for display
  const selectedPrerequisites = courses.filter(course =>
    formData.prerequisites.includes(course._id)
  );

  const inputFields = [
    {
      name: 'title',
      label: 'Course Title',
      type: 'text',
      placeholder: 'Enter course title',
      icon: BookOpen
    },
    {
      name: 'code',
      label: 'Course Code',
      type: 'text',
      placeholder: 'e.g., CS101',
      icon: Hash
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter course description',
      icon: FileText
    },
    {
      name: 'credits',
      label: 'Credits',
      type: 'number',
      placeholder: '1-3',
      icon: Hash,
      min: 1,
      max: 3
    },
    {
      name: 'semester',
      label: 'Semester',
      type: 'select',
      options: ['Fall', 'Spring', 'Summer'],
      icon: Calendar
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      {/* Back Button */}
      <Link
        to="/head-department/dashboard"
        className="mb-6 flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Create New Course</h1>
            <p className="text-white/70">Add a new course to your department</p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-100 font-medium">{successMessage}</span>
              </div>
            )}

            {/* Error Message */}
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-100 font-medium">{errors.submit}</span>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inputFields.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.name} className="space-y-2">
                    <label className="block text-sm font-medium text-white/90">
                      {field.label}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Icon className="w-5 h-5 text-white/50" />
                      </div>
                      {field.type === 'textarea' ? (
                        <textarea
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          placeholder={field.placeholder}
                          className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 resize-none ${
                            errors[field.name] ? 'border-red-500/50' : 'border-white/20'
                          }`}
                          rows={3}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 ${
                            errors[field.name] ? 'border-red-500/50' : 'border-white/20'
                          }`}
                        >
                          <option value="" className="bg-slate-800">Select {field.label}</option>
                          {field.options.map(option => (
                            <option key={option} value={option} className="bg-slate-800">{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          placeholder={field.placeholder}
                          min={field.min}
                          max={field.max}
                          className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 ${
                            errors[field.name] ? 'border-red-500/50' : 'border-white/20'
                          }`}
                        />
                      )}
                    </div>
                    {errors[field.name] && (
                      <p className="text-red-400 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors[field.name]}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Instructor Selection */}
              <div className="space-y-2" ref={instructorDropdownRef}>
                <label className="block text-sm font-medium text-white/90">
                  Instructors
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Users className="w-5 h-5 text-white/50" />
                  </div>
                  <input
                    type="text"
                    value={instructorSearch}
                    onChange={(e) => {
                      setInstructorSearch(e.target.value);
                      setShowInstructorDropdown(true);
                    }}
                    onFocus={() => setShowInstructorDropdown(true)}
                    placeholder="Search and select instructors..."
                    className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 ${
                      errors.instructorId ? 'border-red-500/50' : 'border-white/20'
                    }`}
                  />
                  {showInstructorDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                      {filteredInstructors.length > 0 ? (
                        filteredInstructors.map(instructor => (
                          <div
                            key={instructor._id}
                            onClick={() => handleInstructorSelect(instructor)}
                            className="px-4 py-3 hover:bg-white/20 cursor-pointer transition-colors duration-200"
                          >
                            <div className="text-white font-medium">{instructor.name}</div>
                            <div className="text-white/60 text-sm">{instructor.email}</div>
                            {instructor.employeeId && (
                              <div className="text-white/60 text-sm">ID: {instructor.employeeId}</div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-white/60">No instructors found</div>
                      )}
                    </div>
                  )}
                </div>
                {errors.instructorId && (
                  <p className="text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.instructorId}
                  </p>
                )}

                {/* Selected Instructors */}
                {selectedInstructors.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedInstructors.map(instructor => (
                      <div
                        key={instructor._id}
                        className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-1"
                      >
                        <span className="text-blue-100 text-sm">{instructor.name}</span>
                        <button
                          type="button"
                          onClick={() => handleInstructorRemove(instructor._id)}
                          className="text-blue-300 hover:text-blue-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Prerequisites (Optional) */}
              <div className="space-y-2" ref={courseDropdownRef}>
                <label className="block text-sm font-medium text-white/90">
                  Prerequisites (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <BookOpen className="w-5 h-5 text-white/50" />
                  </div>
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => {
                      setCourseSearch(e.target.value);
                      setShowCourseDropdown(true);
                    }}
                    onFocus={() => setShowCourseDropdown(true)}
                    placeholder="Search and select prerequisite courses..."
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                  />
                  {showCourseDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                      {filteredCourses.length > 0 ? (
                        filteredCourses.map(course => (
                          <div
                            key={course._id}
                            onClick={() => handlePrerequisiteSelect(course)}
                            className="px-4 py-3 hover:bg-white/20 cursor-pointer transition-colors duration-200"
                          >
                            <div className="text-white font-medium">{course.title}</div>
                            <div className="text-white/60 text-sm">{course.code} - {course.credits} credits</div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-white/60">No courses found</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Prerequisites */}
                {selectedPrerequisites.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPrerequisites.map(course => (
                      <div
                        key={course._id}
                        className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-1"
                      >
                        <span className="text-purple-100 text-sm">{course.title} ({course.code})</span>
                        <button
                          type="button"
                          onClick={() => handlePrerequisiteRemove(course._id)}
                          className="text-purple-300 hover:text-purple-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create Course
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white/90 hover:text-white rounded-xl font-medium transition-all duration-200 border border-white/20 hover:border-white/30"
              >
                Reset Form
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddCourse;