import React, { useState, useEffect } from 'react';
import {
  Link as LinkIcon, AlertCircle, CheckCircle, ArrowLeft, Send, RefreshCw,
  Users, FileText
} from 'lucide-react';
import { Link } from "react-router-dom";
import axios from 'axios';

const AssignChallan = () => {
  const [challans, setChallans] = useState([]);
  const [formData, setFormData] = useState({
    challanId: '',
    semester: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedChallan, setSelectedChallan] = useState(null);

  // Fetch unassigned challans on component mount
  useEffect(() => {
    const fetchChallans = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "http://localhost:3000/app/v1/head-dept/challans",
          { withCredentials: true }
        );

        const data = response.data?.data || [];
        // Keep only unassigned challans (so head can assign them)
        const unassigned = data.filter(c => !c.isAssigned);
        setChallans(unassigned);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching challans:', error);
        setIsLoading(false);
      }
    };

    fetchChallans();
  }, []);

  const validateField = (name, value) => {
    switch (name) {
      case 'challanId':
        return !value ? 'Please select a challan' : '';
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

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (successMessage) {
      setSuccessMessage('');
    }

    // Update selected challan info if challanId changes
    if (name === 'challanId' && challans.length > 0) {
      const selected = challans.find(c => c._id === value);
      setSelectedChallan(selected);
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
        "http://localhost:3000/app/v1/head-dept/assign-challan-to-semester",
        {
          challanId: formData.challanId,
          semester: parseInt(formData.semester)
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccessMessage(
          `Challan assigned to ${response.data.data.totalStudentsAssigned} students in semester ${response.data.data.semester}!`
        );
        setFormData({
          challanId: '',
          semester: ''
        });
        setSelectedChallan(null);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrors({ submit: response.data.message || 'Failed to assign challan' });
      }
    } catch (error) {
      console.error('Error assigning challan:', error);
      const errorMessage = error.response?.data?.message || 'Failed to assign challan. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      challanId: '',
      semester: ''
    });
    setErrors({});
    setSuccessMessage('');
    setSelectedChallan(null);
  };

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
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
            <LinkIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Assign Challan to Semester</h1>
            <p className="text-white/70">Link a challan to a specific semester so students can view it</p>
          </div>
        </div>
      </div>

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

            {/* Info Box */}
            <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3">
              <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-white/70">
                <p className="font-medium text-white mb-1">How it works:</p>
                <p>Select an unassigned challan and the semester you want to assign it to. All students in that semester will automatically receive the challan and can view it on their dashboard.</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Challan Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/90">
                  Select Challan <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FileText className="w-5 h-5 text-white/50" />
                  </div>
                  <select
                    name="challanId"
                    value={formData.challanId}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-200 ${
                      errors.challanId ? 'border-red-500/50' : 'border-white/20'
                    }`}
                  >
                    <option value="">Choose a challan...</option>
                    {isLoading && <option value="">Loading challans...</option>}
                    {!isLoading && challans.length === 0 && (
                      <option value="">No unassigned challans available</option>
                    )}
                    {challans.map(c => (
                      <option key={c._id} value={c._id} className="bg-slate-900">
                        {`${c.challanNumber} (Semester ${c.semester} - ${c.amount?.toLocaleString() || c.amount})`}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.challanId && (
                  <p className="text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.challanId}
                  </p>
                )}
              </div>

              {/* Semester Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/90">
                  Assign to Semester <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Users className="w-5 h-5 text-white/50" />
                  </div>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-200 ${
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

              {/* Selected Challan Info */}
              {selectedChallan && (
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-3">
                  <p className="text-sm font-medium text-white">Challan Details:</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-white/70">Amount</p>
                      <p className="text-white font-semibold">Rs. {selectedChallan.amount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-white/70">Due Date</p>
                      <p className="text-white font-semibold">
                        {new Date(selectedChallan.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-white/70">Description</p>
                      <p className="text-white font-semibold">{selectedChallan.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Assign Challan
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

      {/* Helpful Info Box */}
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-yellow-400" />
          Important Notes
        </h3>
        <ul className="space-y-2 text-sm text-white/70">
          <li>• A challan can only be assigned to one semester</li>
          <li>• Once assigned, all students in the selected semester will receive the challan</li>
          <li>• Students can view their assigned challans on their dashboard</li>
          <li>• Fine amount is charged per day after the due date</li>
        </ul>
      </div>
    </div>
  );
};

export default AssignChallan;
