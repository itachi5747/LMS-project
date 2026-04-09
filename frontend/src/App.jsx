import { useEffect, useState } from 'react'

import './App.css'
import FloatingShape from './components/FloatingShape'
import { Navigate, Route, Routes } from 'react-router-dom'
import LogIn from './pages/LogIn'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'
import Dash from './pages/Dash'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ViewUsers from './pages/ViewUsers'
import SearchUsers from './pages/SearchUser'
import UserProfile from './pages/UserProfile'
import UniversityStats from './pages/UniversityStats'
import UpdateStudent from './pages/UpdateStudent'
import UpdateInstructor from './pages/UpdateInsturctor'
import AdminDashboard from './pages/AdminDashboard'
import AddInstructor from './pages/AddInstructor'
import CreateDepartment from './pages/CreateDepartment'
import DepartmentAnalytics from './pages/DepartmentAnalytics'
import HeadDepartmentDashboard from './pages/head_admin_dash'
import CreateInstructor from './pages/CreateInstructor'
import CreateStudent from './pages/CreateStudent'
import AddCourse from './pages/AddCourse'
import AssignCourseToInstructor from './pages/AssignCourseToInstructor'
import CreateChallan from './pages/CreateChallan'
import AssignChallan from './pages/AssignChallan'
import StudentChallans from './pages/StudentChallans'
import StudentDashboard from './pages/StudentDashboard'
import StudentCourses from './pages/StudentCourses'
import StudentEnrollCourse from './pages/StudentEnrollCourse'
import HeadToggleRegistration from './pages/HeadToggleRegistration'
import HeadManageStudentChallans from './pages/HeadManageStudentChallans'
import TeacherDashboard from './pages/TeacherDashboard'
import TeacherCourses from './pages/TeacherCourses'
import TeacherStudents from './pages/TeacherStudents'
import MarkGrades from './pages/MarkGrades'
import MarkAttendance from './pages/MarkAttendance'
import StudentGrades from './pages/StudentGrades'
import CreateAssignment from './pages/CreateAssignment'
import StudentAssignments from './pages/StudentAssignments'
import HeadMessaging from './pages/HeadMessaging'

// Protected Route - requires authentication and optionally a specific role
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Check role if requiredRole is specified
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === 'headDept') {
      return <Navigate to="/head-department/dashboard" replace />;
    } else if (user?.role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    } else if (user?.role === 'instructor') {
      return <Navigate to="/teacher/dashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

// Redirects logged-in users to their dashboard, otherwise shows login
const RootRedirect = () => {
  const { isAuthenticated, user, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Redirect to appropriate dashboard based on user role
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user?.role === 'headDept') {
    return <Navigate to="/head-department/dashboard" replace />;
  } else if (user?.role === 'student') {
    return <Navigate to="/student/dashboard" replace />;
  } else if (user?.role === 'instructor') {
    return <Navigate to="/teacher/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

// Redirects authenticated users to their dashboard
const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl">
        Loading...
      </div>
    );
  }

  if (isAuthenticated && user?.isVerified) {
    // Redirect based on user role
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === 'headDept') {
      return <Navigate to="/head-department/dashboard" replace />;
    } else if (user?.role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    } else if (user?.role === 'instructor') {
      return <Navigate to="/teacher/dashboard" replace />;
    }
  }

  return children;
};

function App() {
  const { isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl">
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className='min-h-screen bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden'>
        <FloatingShape color='bg-white' size='w-64 h-64' top='-5%' left='10%' delay={0} />
        <FloatingShape color='bg-emerald-500' size='w-48 h-48' top='70%' left='80%' delay={5} />
        <FloatingShape color='bg-lime-500' size='w-32 h-32' top='40%' left='-10%' delay={2} />
        <Routes>
          {/* Root route - redirects based on auth status */}
          <Route path="/" element={<RootRedirect />} />

          {/* Auth Routes */}
          <Route path='/login' element={
            <RedirectAuthenticatedUser>
              <LogIn />
            </RedirectAuthenticatedUser>
          } />
          <Route path='/forgot-password' element={<ForgotPasswordPage />} />
          <Route path='/reset-password/:token' element={<ResetPasswordPage />} />

          {/* Admin Routes */}
          <Route path='/admin/dashboard' element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path='/admin/add-instructor' element={
            <ProtectedRoute requiredRole="admin">
              <AddInstructor />
            </ProtectedRoute>
          } />
          <Route path='/admin/create-department' element={
            <ProtectedRoute requiredRole="admin">
              <CreateDepartment />
            </ProtectedRoute>
          } />
          <Route path='/admin/getalluser' element={
            <ProtectedRoute requiredRole="admin">
              <ViewUsers />
            </ProtectedRoute>
          } />
          <Route path='/admin/search-user' element={
            <ProtectedRoute requiredRole="admin">
              <SearchUsers />
            </ProtectedRoute>
          } />
          <Route path='/admin/university-stats' element={
            <ProtectedRoute requiredRole="admin">
              <UniversityStats />
            </ProtectedRoute>
          } />
          <Route path='/admin/departments/stats' element={
            <ProtectedRoute requiredRole="admin">
              <DepartmentAnalytics />
            </ProtectedRoute>
          } />
          <Route path='/update-student/:id' element={
            <ProtectedRoute requiredRole="admin">
              <UpdateStudent />
            </ProtectedRoute>
          } />
          <Route path='/update-insturctor/:id' element={
            <ProtectedRoute requiredRole="admin">
              <UpdateInstructor />
            </ProtectedRoute>
          } />

          {/* Head Department Routes */}
          <Route path='/head-department/dashboard' element={
            <ProtectedRoute requiredRole="headDept">
              <HeadDepartmentDashboard />
            </ProtectedRoute>
          } />
          <Route path='/head/create-instructor' element={
            <ProtectedRoute requiredRole="headDept">
              <CreateInstructor />
            </ProtectedRoute>
          } />
          <Route path='/head/create-student' element={
            <ProtectedRoute requiredRole="headDept">
              <CreateStudent />
            </ProtectedRoute>
          } />
          <Route path='/head/create-course' element={
            <ProtectedRoute requiredRole="headDept">
              <AddCourse />
            </ProtectedRoute>
          } />
          <Route path='/head/assign-course' element={
            <ProtectedRoute requiredRole="headDept">
              <AssignCourseToInstructor />
            </ProtectedRoute>
          } />
          <Route path='/head/create-challan' element={
            <ProtectedRoute requiredRole="headDept">
              <CreateChallan />
            </ProtectedRoute>
          } />
          <Route path='/head/assign-challan' element={
            <ProtectedRoute requiredRole="headDept">
              <AssignChallan />
            </ProtectedRoute>
          } />
          <Route path='/head/registration' element={
            <ProtectedRoute requiredRole="headDept">
              <HeadToggleRegistration />
            </ProtectedRoute>
          } />
          <Route path='/head/manage-student-challans' element={
            <ProtectedRoute requiredRole="headDept">
              <HeadManageStudentChallans />
            </ProtectedRoute>
          } />
          <Route path='/head/messaging' element={
            <ProtectedRoute requiredRole="headDept">
              <HeadMessaging />
            </ProtectedRoute>
          } />

          {/* Student Routes */}
          <Route path='/student/dashboard' element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path='/student/courses' element={
            <ProtectedRoute requiredRole="student">
              <StudentCourses />
            </ProtectedRoute>
          } />
          <Route path='/student/enroll-course' element={
            <ProtectedRoute requiredRole="student">
              <StudentEnrollCourse />
            </ProtectedRoute>
          } />
          <Route path='/student/challans' element={
            <ProtectedRoute requiredRole="student">
              <StudentChallans />
            </ProtectedRoute>
          } />
          <Route path='/student/grades' element={
            <ProtectedRoute requiredRole="student">
              <StudentGrades />
            </ProtectedRoute>
          } />
          <Route path='/student/assignments' element={
            <ProtectedRoute requiredRole="student">
              <StudentAssignments />
            </ProtectedRoute>
          } />

          {/* Teacher Routes */}
          <Route path='/teacher/dashboard' element={
            <ProtectedRoute requiredRole="instructor">
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          <Route path='/teacher/courses' element={
            <ProtectedRoute requiredRole="instructor">
              <TeacherCourses />
            </ProtectedRoute>
          } />
          <Route path='/teacher/students' element={
            <ProtectedRoute requiredRole="instructor">
              <TeacherStudents />
            </ProtectedRoute>
          } />
          <Route path='/teacher/mark-grades' element={
            <ProtectedRoute requiredRole="instructor">
              <MarkGrades />
            </ProtectedRoute>
          } />
          <Route path='/teacher/mark-attendance' element={
            <ProtectedRoute requiredRole="instructor">
              <MarkAttendance />
            </ProtectedRoute>
          } />
          <Route path='/teacher/create-assignment' element={
            <ProtectedRoute requiredRole="instructor">
              <CreateAssignment />
            </ProtectedRoute>
          } />

          {/* Shared Routes - any authenticated user */}
          <Route path='/user-profile/:id' element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
        </Routes>
        <Toaster />
      </div>
    </>
  );
}

export default App
