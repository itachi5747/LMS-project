# Ultimate Auth - Learning Management System (LMS)

A comprehensive, role-based Learning Management System built with the MERN stack (MongoDB, Express.js, React, Node.js). This application provides a complete solution for educational institutions to manage students, instructors, courses, assignments, attendance, and results.

## Overview

Ultimate Auth is designed to streamline academic operations by providing distinct portals for different user roles. The system offers secure authentication, real-time notifications, and a modular architecture that supports scalable educational workflows.

## Features

### Authentication & Security
- JWT-based authentication with HTTP-only cookies
- Role-based access control (RBAC)
- Password reset functionality with email verification
- Secure token management with expiration handling

### User Roles

#### Admin
- Create and manage user accounts (students, instructors, department heads)
- Manage departments and courses
- Oversee system-wide operations
- Generate reports and analytics

#### Department Head
- Manage department-specific courses and curriculum
- Oversee instructors within their department
- Monitor student progress and performance
- Handle department-level administrative tasks

#### Instructor/Teacher
- Create and manage assignments
- Mark attendance for enrolled students
- Grade submissions and publish results
- Upload course materials
- Communicate with students

#### Student
- Enroll in courses
- Submit assignments
- View attendance records
- Check results and grades
- Access fee challan information
- Communicate with instructors

### Core Modules

#### Course Management
- Create, update, and delete courses
- Course enrollment system
- Department-based course categorization
- Course material uploads

#### Assignment Management
- Assignment creation with due dates
- File submission system
- Grading and feedback
- Submission status tracking

#### Attendance Tracking
- Daily attendance marking
- Attendance reports and statistics
- Absence notifications

#### Result Management
- Grade publishing
- Result history
- Performance analytics with visual charts
- Semester-wise result tracking

#### Fee Management
- Fee challan generation
- Payment status tracking
- Fee history records

#### Communication
- Internal messaging system
- Email notifications via Mailtrap
- Announcement broadcasts

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT), bcrypt
- **File Storage:** Cloudinary
- **Email Service:** Mailtrap / Nodemailer
- **Validation:** Joi
- **Environment Management:** dotenv

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **State Management:** Zustand
- **Styling:** TailwindCSS
- **UI Icons:** Lucide React
- **Charts:** Recharts
- **Notifications:** React Hot Toast
- **HTTP Client:** Axios
- **Routing:** React Router DOM v7

## Architecture

### Backend Structure
```
backend/
├── config/          # Database and Cloudinary configuration
├── controllers/     # Route handlers (auth, admin, teacher, student, head)
├── middleware/      # Authentication and role verification
├── models/          # Mongoose schemas (user, course, assignment, etc.)
├── routes/          # API route definitions
├── service/         # Business logic layer
├── utilis/          # Utility functions (token generation, ID generation)
└── mailtrap.js/     # Email templates and configuration
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/  # Reusable UI components
│   ├── utils/       # Helper functions
│   └── assets/      # Static resources
├── public/          # Public assets
└── dist/           # Production build
```

## Data Models

### User
- Supports multiple roles: student, instructor, admin, headDept
- Department associations
- Course enrollments (for students)
- Teaching assignments (for instructors)
- Contact information and academic details

### Course
- Department association
- Instructor assignment
- Student enrollments
- Semester-based organization

### Assignment
- Course-specific tasks
- Due date tracking
- Submission management
- Grading system

### Additional Models
- **Department:** Academic department management
- **Submission:** Student assignment submissions
- **Attendance:** Daily attendance records
- **Result:** Student grades and performance
- **Challan:** Fee payment records
- **Message:** Internal communication system

## Security Considerations

- All sensitive credentials are managed via environment variables
- Passwords are hashed using bcrypt
- JWT tokens are securely managed with HTTP-only cookies
- CORS is configured to allow specific origins only
- Input validation is implemented on all API endpoints

## License

This project is licensed under the ISC License.
