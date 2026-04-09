import React, { useState } from 'react';
import {
  FileText, Calendar, DollarSign, AlertCircle, CheckCircle,
  ArrowLeft, Save, RefreshCw, Info
} from 'lucide-react';
import { Link } from "react-router-dom";
import axios from 'axios';

const CreateChallan = () => {
  const [formData, setFormData] = useState({
    semester: '',
    description: '',
    dueDate: '',
    fineAfterDueDate: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [challanInfo, setChallanInfo] = useState(null);

  // Calculate challan amount based on semester
  const calculateAmount = (semester) => {
    if (!semester) return 0;
    const baseAmount = 70000;
    const incrementPerSemester = 4000;
    return baseAmount + ((semester - 1) * incrementPerSemester);
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'semester':
        const semesterNum = parseInt(value);
        return !value || semesterNum < 1 || semesterNum > 8 ? 'Semester must be between 1 and 8' : '';
      case 'description':
        return value.trim().length < 5 ? 'Description must be at least 5 characters' : '';
      case 'dueDate':
        if (!value) return 'Due date is required';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate <= today ? 'Due date must be in the future' : '';
      case 'fineAfterDueDate':
        const fineAmount = parseFloat(value);
        return !value || fineAmount < 0 ? 'Fine amount must be a positive number' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (successMessage) {
      setSuccessMessage('');
    }

    // Update challan info preview if semester changes
    if (name === 'semester' && value) {
      setChallanInfo({
        semester: value,
        amount: calculateAmount(parseInt(value))
      });
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
      const response = await axios.post(
        "http://localhost:3000/app/v1/head-dept/create-challan",
        {
          semester: parseInt(formData.semester),
          description: formData.description,
          dueDate: formData.dueDate,
          fineAfterDueDate: parseFloat(formData.fineAfterDueDate)
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccessMessage(`Challan created successfully! Challan #: ${response.data.data.challanNumber}`);
        setFormData({
          semester: '',
          description: '',
          dueDate: '',
          fineAfterDueDate: ''
        });
        setChallanInfo(null);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrors({ submit: response.data.message || 'Failed to create challan' });
      }
    } catch (error) {
      console.error('Error creating challan:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create challan. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      semester: '',
      description: '',
      dueDate: '',
      fineAfterDueDate: ''
    });
    setErrors({});
    setSuccessMessage('');
    setChallanInfo(null);
  };

  const amount = calculateAmount(formData.semester);

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
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Create New Challan</h1>
            <p className="text-white/70">Generate a semester-based payment challan for your students</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
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
              <div className="space-y-6">
                {/* Semester */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90">
                    Semester <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FileText className="w-5 h-5 text-white/50" />
                    </div>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-200 ${
                        errors.semester ? 'border-red-500/50' : 'border-white/20'
                      }`}
                    >
                      <option value="">Select Semester</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <option key={sem} value={sem} className="bg-slate-900">
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.semester && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.semester}
                    </p>
                  )}
                </div>

                {/* Challan Amount Display */}
                {formData.semester && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <p className="text-sm text-white/70 mb-2">Auto-calculated Amount</p>
                    <p className="text-2xl font-bold text-green-400 flex items-center gap-2">
                      <DollarSign className="w-6 h-6" />
                      {amount.toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute top-4 left-0 pl-4 pointer-events-none">
                      <Info className="w-5 h-5 text-white/50" />
                    </div>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="e.g., Semester 1 Tuition Fee, Lab Charges, etc."
                      className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-200 resize-none ${
                        errors.description ? 'border-red-500/50' : 'border-white/20'
                      }`}
                      rows={3}
                    />
                  </div>
                  {errors.description && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90">
                    Due Date <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar className="w-5 h-5 text-white/50" />
                    </div>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-200 ${
                        errors.dueDate ? 'border-red-500/50' : 'border-white/20'
                      }`}
                    />
                  </div>
                  {errors.dueDate && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.dueDate}
                    </p>
                  )}
                </div>

                {/* Fine After Due Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90">
                    Fine Per Day (After Due Date) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <DollarSign className="w-5 h-5 text-white/50" />
                    </div>
                    <input
                      type="number"
                      name="fineAfterDueDate"
                      value={formData.fineAfterDueDate}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="e.g., 500"
                      min="0"
                      step="100"
                      className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-200 ${
                        errors.fineAfterDueDate ? 'border-red-500/50' : 'border-white/20'
                      }`}
                    />
                  </div>
                  {errors.fineAfterDueDate && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.fineAfterDueDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Create Challan
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

          {/* Info Card */}
          <div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl sticky top-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                Challan Structure
              </h3>
              <div className="space-y-4 text-sm">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-white/70 mb-2">Base Amount (Semester 1)</p>
                  <p className="text-white font-semibold">Rs. 70,000</p>
                </div>
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <p className="text-white/70 mb-2">Increment Per Semester</p>
                  <p className="text-white font-semibold">Rs. 4,000</p>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-white/70 mb-3 font-medium">Amount Breakdown</p>
                  <div className="space-y-2 text-white/70">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <div key={sem} className="flex justify-between">
                        <span>Semester {sem}:</span>
                        <span className="text-white font-medium">
                          Rs. {(70000 + (sem - 1) * 4000).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateChallan;
