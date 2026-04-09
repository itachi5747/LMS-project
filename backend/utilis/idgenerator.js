const User = require('../models/user.model')
exports.generateInstructorId = async () => {
  try {
    // Find the last instructor by sorting employeeId in descending order
   const lastInstructor = await User.findOne(
  { role: { $in: ['instructor', 'headDept'] } },
  { employeeId: 1 }
).sort({ employeeId: -1 });

    if (!lastInstructor) {
      return 'EMP-INST-001';
    }
    const lastId = lastInstructor.employeeId;
    const numericPart = lastId.split('-')[2]; 
    const nextNumber = parseInt(numericPart) + 1;
    const formattedNumber = nextNumber.toString().padStart(3, '0');
    return `EMP-INST-${formattedNumber}`;
  } catch (error) {
    throw new Error('Failed to generate instructor ID: ' + error.message);
  }
};
exports.generateStudentId = async (code) => { // code ---> i.e CS, IBM, SE, EE.....
  try {
    // Find the last student for THIS department code specifically
    const lastStudent = await User.findOne(
      { role: 'student', studentId: new RegExp(`^STU-${code}-`) },
      { studentId: 1 }
    ).sort({ studentId: -1 });

    if (!lastStudent || !lastStudent.studentId) {
      return `STU-${code}-001`;
    }

    const lastId = lastStudent.studentId;
    const parts = lastId.split('-');
    const numericPart = parts[2] || '000'; // fallback if format breaks
    const nextNumber = parseInt(numericPart) + 1;
    const formattedNumber = nextNumber.toString().padStart(3, '0');

    return `STU-${code}-${formattedNumber}`;
  } catch (error) {
    throw new Error('Failed to generate student ID: ' + error.message);
  }
};
