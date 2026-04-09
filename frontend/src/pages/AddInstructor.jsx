import React, { useState } from 'react';
import { 
  UserPlus, Mail, Lock, User, CreditCard, Phone, MapPin, 
  Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft,
  Save, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import useAuthStore from '../store/authStore';
const AddInstructor = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const {error, createInstructor} = useAuthStore()
  const navigate = useNavigate()
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim().length < 2 ? 'Name must be at least 2 characters' : '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Please enter a valid email address' : '';
      case 'password':
        return value.length < 6 ? 'Password must be at least 6 characters' : '';
      case 'employeeId':
        return value.trim().length < 3 ? 'Employee ID must be at least 3 characters' : '';
      case 'phone':
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        return !phoneRegex.test(value) || value.length < 10 ? 'Please enter a valid phone number' : '';
      case 'address':
        return value.trim().length < 10 ? 'Address must be at least 10 characters' : '';
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
      console.log("hey i am inside here");
      await createInstructor(formData)
      setSuccessMessage('Instructor created successfully! 🎉');
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: ''
      });
    } catch (error) {
      setErrors({ submit: 'Failed to create instructor. Please try again.' });
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
      address: ''
    });
    setErrors({});
    setSuccessMessage('');
  };

  const inputFields = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter instructor\'s full name',
      icon: User
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'instructor@university.edu',
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
    // {
    //   name: 'employeeId',
    //   label: 'Employee ID',
    //   type: 'text',
    //   placeholder: 'EMP-12345',
    //   icon: CreditCard
    // },
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
    }
  ];
 
  return (
    <div className="min-h-screen p-8">
      {/* Back Button */}
      
      <Link
      to="/admin/dashboard"
      className="mb-6 flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
    >
      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
      <span>Back to Dashboard</span>
    </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Add New Instructor</h1>
            <p className="text-white/70">Create a new instructor account for your university</p>
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
              <span className="text-red-100 font-medium">{error}</span>
            </div>
          )}
          {/* {error && <p className="text-red-500 font-semibold mb-2">{error}</p>} */}
          <div onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {inputFields.map((field) => {
                const Icon = field.icon;
                const hasError = errors[field.name];
                
                return (
                  <div key={field.name} className={field.type === 'textarea' ? 'lg:col-span-2' : ''}>
                    <label className="block text-white font-medium mb-2">
                      {field.label}
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                        <Icon className={`w-5 h-5 transition-colors duration-200 ${
                          hasError ? 'text-red-400' : 'text-white/60 group-focus-within:text-white'
                        }`} />
                      </div>
                      
                      {field.type === 'textarea' ? (
                        <textarea
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          placeholder={field.placeholder}
                          rows={4}
                          className={`w-full pl-12 pr-4 py-4 bg-white/10 border ${
                            hasError 
                              ? 'border-red-500/50 focus:border-red-500' 
                              : 'border-white/20 focus:border-white/40'
                          } rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200 resize-none`}
                          disabled={isSubmitting}
                        />
                      ) : (
                        <input
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          placeholder={field.placeholder}
                          className={`w-full pl-12 ${field.hasToggle ? 'pr-12' : 'pr-4'} py-4 bg-white/10 border ${
                            hasError 
                              ? 'border-red-500/50 focus:border-red-500' 
                              : 'border-white/20 focus:border-white/40'
                          } rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200`}
                          disabled={isSubmitting}
                        />
                      )}
                      
                      {field.hasToggle && (
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
                          disabled={isSubmitting}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      )}
                    </div>
                    
                    {hasError && (
                      <p className="mt-2 text-red-400 text-sm flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                        <AlertCircle className="w-4 h-4" />
                        {hasError}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:scale-100 disabled:hover:shadow-none group"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Creating Instructor...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    <span>Create Instructor</span>
                    
                    
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
          
          {/* Form Info */}
          <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-white font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-400" />
              Form Guidelines
            </h3>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• All fields are required for instructor creation</li>
              <li>• Email must be unique and follow standard format</li>
              {/* <li>• Employee ID must be unique across the system</li> */}
              <li>• Password should be at least 6 characters long</li>
              <li>• Phone number should include country code if applicable</li>
            </ul>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Auto Verification</h3>
            <p className="text-white/70 text-sm">Instructor accounts are automatically verified upon creation.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Id generator</h3>
            <p className="text-white/70 text-sm">Id for instructor will automatically generated and will show in his profile</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Role Assignment</h3>
            <p className="text-white/70 text-sm">Instructor role and permissions are assigned automatically.</p>
          </div>
        </div>
      </div>
      </form>
    </div>
  );
};

export default AddInstructor;