import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { 
  User, 
  Mail, 
  Shield, 
  Building, 
  Phone, 
  MapPin, 
  CheckCircle, 
  XCircle,
  BookOpen,
  GraduationCap,
  ChevronRight
} from "lucide-react";

const UserProfile = () => {
  const { id } = useParams();
  const { profile, getUserProfile, error } = useAuthStore();

  useEffect(() => {
    console.log("Fetching profile : ", profile);
    console.log(id);
    if (id) getUserProfile(id);
  }, [id, getUserProfile]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700 font-medium">Error loading profile</p>
          </div>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-4 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-6">
            <div className="bg-white bg-opacity-20 rounded-full p-4">
              <User className="h-16 w-16" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
              <div className="flex items-center space-x-4">
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium capitalize">
                  {profile.role}
                </span>
                <div className="flex items-center">
                  {profile.isActive ? (
                    <CheckCircle className="h-5 w-5 text-green-300 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-300 mr-2" />
                  )}
                  <span className="text-sm">
                    {profile.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <Mail className="h-6 w-6 mr-3 text-blue-400" />
          Contact Information
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center text-gray-300">
              <Mail className="h-5 w-5 mr-3 text-gray-400" />
              <span className="text-sm text-gray-400 w-16">Email:</span>
              <span className="text-white">{profile.email}</span>
            </div>
            
            {profile.phone && (
              <div className="flex items-center text-gray-300">
                <Phone className="h-5 w-5 mr-3 text-gray-400" />
                <span className="text-sm text-gray-400 w-16">Phone:</span>
                <span className="text-white">{profile.phone}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {profile.department?.name && (
              <div className="flex items-center text-gray-300">
                <Building className="h-5 w-5 mr-3 text-gray-400" />
                <span className="text-sm text-gray-400 w-20">Department:</span>
                <span className="text-white">{profile.department.name}</span>
              </div>
            )}
            
            {profile.address && (
              <div className="flex items-center text-gray-300">
                <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                <span className="text-sm text-gray-400 w-20">Address:</span>
                <span className="text-white">{profile.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Courses Section */}
      {(profile.role === "student" || profile.role === "instructor") && (
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            {profile.role === "student" ? (
              <>
                <GraduationCap className="h-6 w-6 mr-3 text-green-400" />
                Enrolled Courses
              </>
            ) : (
              <>
                <BookOpen className="h-6 w-6 mr-3 text-purple-400" />
                Teaching Courses
              </>
            )}
          </h2>

          {profile.role === "student" && profile.enrolledCourses?.length > 0 && (
            <div className="grid gap-3">
              {profile.enrolledCourses.map((item) => {
                // item may be either a course object or an object like { course: {...}, status, enrollmentDate }
                const course = item?.course || item;
                const key = item?._id || course?._id;
                return (
                  <div
                    key={key}
                    className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10 hover:bg-opacity-10 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 text-blue-400 mr-3" />
                        <div>
                          <h3 className="text-white font-medium">{course?.title || 'Untitled'}</h3>
                          <p className="text-gray-400 text-sm">Code: {course?.code || 'N/A'}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                    {item?.status && (
                      <div className="mt-2 text-sm text-gray-400">Status: {item.status}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {profile.role === "instructor" && profile.teachingCourses?.length > 0 && (
            <div className="grid gap-3">
              {profile.teachingCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10 hover:bg-opacity-10 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <GraduationCap className="h-5 w-5 text-purple-400 mr-3" />
                      <div>
                        <h3 className="text-white font-medium">{course.title}</h3>
                        <p className="text-gray-400 text-sm">Code: {course.code}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {((profile.role === "student" && (!profile.enrolledCourses || profile.enrolledCourses.length === 0)) ||
            (profile.role === "instructor" && (!profile.teachingCourses || profile.teachingCourses.length === 0))) && (
            <div className="text-center py-8">
              <div className="bg-white bg-opacity-5 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                {profile.role === "student" ? (
                  <GraduationCap className="h-8 w-8 text-gray-400" />
                ) : (
                  <BookOpen className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <p className="text-gray-400">
                {profile.role === "student" ? "No enrolled courses" : "No teaching courses"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;