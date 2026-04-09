import React, { useState, useEffect } from 'react';
import { 
  Building2, FileText, Hash, User, Building, Mail, Phone, 
  CheckCircle, AlertCircle, ArrowLeft, Save, RefreshCw,
  Search, ChevronDown, Users, Shield
} from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';

const CreateDepartment = () => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    headId: '',
    building: '',
    contactEmail: '',
    contactPhone: ''
  });

  const [instructors, setInstructors] = useState([]);
  const [filteredInstructors, setFilteredInstructors] = useState([]);
  const [showInstructorDropdown, setShowInstructorDropdown] = useState(false);
  const [instructorSearch, setInstructorSearch] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingInstructors, setIsLoadingInstructors] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  

  // Fetch instructors from API 
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setIsLoadingInstructors(true);
        
        const response = await axios.get('http://localhost:3000/app/v1/admin/get-user?role=headDept');
        console.log("fetch instructor are  ---> ", response.data.data);
          setInstructors(response.data.data);
          setFilteredInstructors(response.data.data);
            
      } catch (error) {
        console.error('Error fetching instructors:', error);
        setErrors({ fetch: 'Failed to load instructors. Please try again.' });
      } finally {
        setIsLoadingInstructors(false);
      }
    };

    fetchInstructors();
  }, []);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim().length < 3 ? 'Department name must be at least 3 characters' : '';
      case 'code':
        const codeRegex = /^[A-Z]{2,6}$/;
        return !codeRegex.test(value.toUpperCase()) ? 'Code must be 2-6 uppercase letters (e.g., CS, ENG)' : '';
      case 'description':
        return value.trim().length < 10 ? 'Description must be at least 10 characters' : '';
      case 'headId':
        return !value ? 'Please select a department head' : '';
      case 'building':
        return value.trim().length < 2 ? 'Building name is required' : '';
      case 'contactEmail':
        if (!value) return ''; // Optional field
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Please enter a valid email address' : '';
      case 'contactPhone':
        if (!value) return ''; // Optional field
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        return !phoneRegex.test(value) || value.length < 10 ? 'Please enter a valid phone number' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Auto-uppercase department code
    if (name === 'code') {
      processedValue = value.toUpperCase();
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
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

  const handleInstructorSearch = (e) => {
    const searchTerm = e.target.value;
    setInstructorSearch(searchTerm);
    
    const filtered = instructors.filter(instructor =>
      instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (instructor.department?.name && instructor.department.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredInstructors(filtered);
  };

  const selectInstructor = (instructor) => {
    setSelectedInstructor(instructor);
    setFormData(prev => ({ ...prev, headId: instructor._id }));
    setInstructorSearch(instructor.name);
    setShowInstructorDropdown(false);
    
    // Clear headId error if it exists
    if (errors.headId) {
      setErrors(prev => ({ ...prev, headId: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    const requiredFields = ['name', 'code', 'description', 'headId', 'building'];
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    
    // Validate optional fields if they have values
    if (formData.contactEmail) {
      const emailError = validateField('contactEmail', formData.contactEmail);
      if (emailError) newErrors.contactEmail = emailError;
    }
    
    if (formData.contactPhone) {
      const phoneError = validateField('contactPhone', formData.contactPhone);
      if (phoneError) newErrors.contactPhone = phoneError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const {error , createDep} = useAuthStore()
  /*const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {      
      console.log("hi i am here");
      
      // const response = await axios.post('http://localhost:3000/app/v1/admin/create-department', {formData});
      // console.log("result -----> ", response);
      await createDep(formData)
      setSuccessMessage('Department created successfully! 🎉');
     
        // setFormData({
        //   name: '',
        //   code: '',
        //   description: '',
        //   headId: '',
        //   building: '',
        //   contactEmail: '',
        //   contactPhone: ''
        // });
        // setSelectedInstructor(null);
        // setInstructorSearch('');
      
      
    } catch (error) {
      console.error('Error creating department:', error);
      // setErrors({ submit: 'Failed to create department. Please try again.' });
      setIsSubmitting(false);
    }
  };*/
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  setIsSubmitting(true);

  try {
    console.log("Submitting department:", formData);
    await createDep(formData); // pass formData
    setSuccessMessage('Department created successfully! 🎉');
    handleReset(); // optional: reset form on success
  } catch (error) {
    console.error('Error creating department:', error);
    setErrors({ submit: 'Failed to create department. Please try again.' });
  } finally {
    setIsSubmitting(false);
  }
};

  const handleReset = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      headId: '',
      building: '',
      contactEmail: '',
      contactPhone: ''
    });
    setSelectedInstructor(null);
    setInstructorSearch('');
    setErrors({});
    setSuccessMessage('');
  };
  const navigate = useNavigate()
  return (
    <div className="min-h-screen p-8">
      {/* Back Button */}
      <button className="mb-6 flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
      onClick={() => navigate('/admin/dashboard')}
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
        <span>Back to Dashboard</span>
      </button>
       {/* <Link
      to="/admin/dashboard"
      className="mb-6 flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
    >
      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
      <span>Back to Dashboard</span>
    </Link> */}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Create New Department</h1>
            <p className="text-white/70">Add a new academic department to your university</p>
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

          {/* Error Messages */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-100 font-medium">{error}</span>
            </div>
          )}

          {errors.fetch && (
            <div className="mb-6 p-4 bg-orange-500/20 border border-orange-500/30 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 text-orange-400" />
              <span className="text-orange-100 font-medium">{errors.fetch}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department Name */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Department Name
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <Building2 className={`w-5 h-5 transition-colors duration-200 ${
                      errors.name ? 'text-red-400' : 'text-white/60 group-focus-within:text-white'
                    }`} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="e.g., Computer Science"
                    className={`w-full pl-12 pr-4 py-4 bg-white/10 border ${
                      errors.name 
                        ? 'border-red-500/50 focus:border-red-500' 
                        : 'border-white/20 focus:border-white/40'
                    } rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-red-400 text-sm flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Department Code */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Department Code
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <Hash className={`w-5 h-5 transition-colors duration-200 ${
                      errors.code ? 'text-red-400' : 'text-white/60 group-focus-within:text-white'
                    }`} />
                  </div>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="CS, ENG, MATH"
                    className={`w-full pl-12 pr-4 py-4 bg-white/10 border ${
                      errors.code 
                        ? 'border-red-500/50 focus:border-red-500' 
                        : 'border-white/20 focus:border-white/40'
                    } rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200 uppercase`}
                    disabled={isSubmitting}
                    maxLength={6}
                  />
                </div>
                {errors.code && (
                  <p className="mt-2 text-red-400 text-sm flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="w-4 h-4" />
                    {errors.code}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-white font-medium mb-2">
                Description
                <span className="text-red-400 ml-1">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-4 z-10">
                  <FileText className={`w-5 h-5 transition-colors duration-200 ${
                    errors.description ? 'text-red-400' : 'text-white/60 group-focus-within:text-white'
                  }`} />
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Provide a detailed description of the department's focus and objectives..."
                  rows={4}
                  className={`w-full pl-12 pr-4 py-4 bg-white/10 border ${
                    errors.description 
                      ? 'border-red-500/50 focus:border-red-500' 
                      : 'border-white/20 focus:border-white/40'
                  } rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200 resize-none`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.description && (
                <p className="mt-2 text-red-400 text-sm flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="w-4 h-4" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Department Head Selection */}
            <div>
              <label className="block text-white font-medium mb-2">
                Department Head
                <span className="text-red-400 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <User className={`w-5 h-5 transition-colors duration-200 ${
                      errors.headId ? 'text-red-400' : 'text-white/60 group-focus-within:text-white'
                    }`} />
                  </div>
                  <input
                    type="text"
                    value={instructorSearch}
                    onChange={handleInstructorSearch}
                    onFocus={() => !isLoadingInstructors && setShowInstructorDropdown(true)}
                    placeholder={isLoadingInstructors ? "Loading instructors..." : "Search for an instructor..."}
                    className={`w-full pl-12 pr-12 py-4 bg-white/10 border ${
                      errors.headId 
                        ? 'border-red-500/50 focus:border-red-500' 
                        : 'border-white/20 focus:border-white/40'
                    } rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200`}
                    disabled={isSubmitting || isLoadingInstructors}
                  />
                  <button
                    type="button"
                    onClick={() => setShowInstructorDropdown(!showInstructorDropdown)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
                  >
                    <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${showInstructorDropdown ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Instructor Dropdown */}
                {showInstructorDropdown && !isLoadingInstructors && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-black backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                    {filteredInstructors.length > 0 ? (
                      <div className="p-2">
                        {filteredInstructors.map((instructor) => (
                          <button
                            key={instructor._id}
                            type="button"
                            onClick={() => selectInstructor(instructor)}
                            className="w-full text-left p-3 hover:bg-white/20 rounded-lg transition-colors duration-200 group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-white font-medium group-hover:text-blue-200 transition-colors duration-200">
                                  {instructor.name}
                                </p>
                                <p className="text-white/60 text-sm">
                                  {instructor.employeeId} 
                                  {instructor.department && ` • ${instructor.department.name}`}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-white/60">
                        No instructors found
                      </div>
                    )}
                  </div>
                )}

                {/* Loading State */}
                {isLoadingInstructors && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 p-4">
                    <div className="flex items-center justify-center gap-2 text-white/60">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Loading instructors...</span>
                    </div>
                  </div>
                )}
              </div>
              {errors.headId && (
                <p className="mt-2 text-red-400 text-sm flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="w-4 h-4" />
                  {errors.headId}
                </p>
              )}
            </div>

            {/* Building and Contact Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Building */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Building
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <Building className={`w-5 h-5 transition-colors duration-200 ${
                      errors.building ? 'text-red-400' : 'text-white/60 group-focus-within:text-white'
                    }`} />
                  </div>
                  <input
                    type="text"
                    name="building"
                    value={formData.building}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Main Building, Block A"
                    className={`w-full pl-12 pr-4 py-4 bg-white/10 border ${
                      errors.building 
                        ? 'border-red-500/50 focus:border-red-500' 
                        : 'border-white/20 focus:border-white/40'
                    } rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.building && (
                  <p className="mt-2 text-red-400 text-sm flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="w-4 h-4" />
                    {errors.building}
                  </p>
                )}
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Contact Email
                  <span className="text-white/60 ml-1">(Optional)</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <Mail className={`w-5 h-5 transition-colors duration-200 ${
                      errors.contactEmail ? 'text-red-400' : 'text-white/60 group-focus-within:text-white'
                    }`} />
                  </div>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="dept@university.edu"
                    className={`w-full pl-12 pr-4 py-4 bg-white/10 border ${
                      errors.contactEmail 
                        ? 'border-red-500/50 focus:border-red-500' 
                        : 'border-white/20 focus:border-white/40'
                    } rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.contactEmail && (
                  <p className="mt-2 text-red-400 text-sm flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="w-4 h-4" />
                    {errors.contactEmail}
                  </p>
                )}
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Contact Phone
                  <span className="text-white/60 ml-1">(Optional)</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <Phone className={`w-5 h-5 transition-colors duration-200 ${
                      errors.contactPhone ? 'text-red-400' : 'text-white/60 group-focus-within:text-white'
                    }`} />
                  </div>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="+1 (555) 123-4567"
                    className={`w-full pl-12 pr-4 py-4 bg-white/10 border ${
                      errors.contactPhone 
                        ? 'border-red-500/50 focus:border-red-500' 
                        : 'border-white/20 focus:border-white/40'
                    } rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.contactPhone && (
                  <p className="mt-2 text-red-400 text-sm flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="w-4 h-4" />
                    {errors.contactPhone}
                  </p>
                )}
              </div>
            </div>

            {/* Selected Instructor Preview */}
            {selectedInstructor && (
              <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Selected Department Head
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{selectedInstructor.name}</p>
                    <p className="text-white/70 text-sm">
                      {selectedInstructor.employeeId}
                      {selectedInstructor.department && ` • Currently in: ${selectedInstructor.department.name}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                // onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:scale-100 disabled:hover:shadow-none group"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Creating Department...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    <span>Create Department</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-6 py-4 bg-white/10 hover:bg-white/20 disabled:bg-white/5 border border-white/20 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:opacity-50"
              >
                Reset Form
              </button>
            </div>
          </div>

          {/* Form Guidelines */}
          <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-white font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-green-400" />
              Form Guidelines
            </h3>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• Required fields: Name, Code, Description, Head, and Building</li>
              <li>• Department code should be 2-6 uppercase letters (automatically converted)</li>
              <li>• Department head must be an existing instructor or admin</li>
              <li>• Contact email and phone are optional but recommended</li>
              <li>• Selected head will be automatically added to the department's instructor list</li>
            </ul>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Auto Assignment</h3>
            <p className="text-white/70 text-sm">Department head is automatically added to the instructor list.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Validation</h3>
            <p className="text-white/70 text-sm">Department names and codes are checked for uniqueness.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Security</h3>
            <p className="text-white/70 text-sm">All data is validated and sanitized before submission.</p>
          </div>
        </div>
      </div>
      </form>
    </div>
  );
};

export default CreateDepartment;