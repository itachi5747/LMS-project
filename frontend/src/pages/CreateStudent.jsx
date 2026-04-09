import React, { useState } from 'react';
import {
  GraduationCap, Mail, Lock, User, Phone, MapPin,
  Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft,
  Save, RefreshCw, Hash
} from 'lucide-react';
import { Link } from "react-router-dom";
import axios from 'axios';

const CreateStudent = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    semester: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim().length < 2 ? 'Name must be at least 2 characters' : '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Please enter a valid email address' : '';
      case 'password':
        return value.length < 6 ? 'Password must be at least 6 characters' : '';
      case 'phone':
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        return !phoneRegex.test(value) || value.length < 10 ? 'Please enter a valid phone number' : '';
      case 'address':
        return value.trim().length < 10 ? 'Address must be at least 10 characters' : '';
      case 'semester':
        const semesterNum = parseInt(value);
        return !value || semesterNum < 1 || semesterNum > 8 ? 'Semester must be between 1 and 8' : '';
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
      const response = await axios.post("http://localhost:3000/app/v1/head-dept/create-student", {
        ...formData,
        semester: parseInt(formData.semester)
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        setSuccessMessage('Student created successfully! 🎉');
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          address: '',
          semester: ''
        });
      } else {
        setErrors({ submit: response.data.message || 'Failed to create student' });
      }
    } catch (error) {
      console.error('Error creating student:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create student. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      semester: ''
    });
    setErrors({});
    setSuccessMessage('');
  };

  const inputFields = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter student\'s full name',
      icon: User
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'student@university.edu',
      icon: Mail
    },
    {
      name: 'password',
      label: 'Password',
      type: showPassword ? 'text' : 'password',
      placeholder: 'Create a secure password',
      icon: Lock,
      hasToggle: true
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      placeholder: '+1 (555) 123-4567',
      icon: Phone
    },
    {
      name: 'address',
      label: 'Address',
      type: 'textarea',
      placeholder: 'Enter complete address',
      icon: MapPin
    },
    {
      name: 'semester',
      label: 'Semester',
      type: 'number',
      placeholder: '1-8',
      icon: Hash,
      min: 1,
      max: 8
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
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Create New Student</h1>
            <p className="text-white/70">Add a new student to your department</p>
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
                      {field.hasToggle && (
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5 text-white/50 hover:text-white/70" />
                          ) : (
                            <Eye className="w-5 h-5 text-white/50 hover:text-white/70" />
                          )}
                        </button>
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
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create Student
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

export default CreateStudent;