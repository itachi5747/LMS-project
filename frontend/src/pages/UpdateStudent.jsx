// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";

// const UpdateStudent = () => {
//   const { id } = useParams(); // student ID from URL
//   const [formData, setFormData] = useState({
//     email: "",
//     name: "",
//     newStudentId: "",
//     phone: "",
//     address: "",
//     semester: "",
//     departmentId: "",
//     isActive: true,
//   });
//   const [departments, setDepartments] = useState([]); // for dropdown
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState("");

//   // fetch student + departments
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       // fetch student profile
  //       const studentRes = await axios.get(
  //         `http://localhost:3000/app/v1/user-profile/${id}`,
  //         { withCredentials: true }
  //       );
  //       const student = studentRes.data.data;

  //       setFormData({
  //         email: student.email || "",
  //         name: student.name || "",
  //         newStudentId: student.studentId || "",
  //         phone: student.phone || "",
  //         address: student.address || "",
  //         semester: student.semester || "",
  //         departmentId: student.department?._id || "",
  //         isActive: student.isActive ?? true,
  //       });

  //       // fetch departments
  //       const deptRes = await axios.get(
  //         "http://localhost:3000/app/v1/departments",
  //         { withCredentials: true }
  //       );
        
  //       setDepartments(deptRes.data || []);
  //       console.log("department are --> ", departments);

  //       setLoading(false);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //       setMessage("Failed to load student or department data");
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [id]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === "checkbox" ? checked : value,
//     });
//   };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const res = await axios.put(
  //       `http://localhost:3000/app/v1/admin/update-student/${id}`,
  //       formData,
  //       { withCredentials: true }
  //     );
  //     setMessage(res.data.message);
  //     console.log("Updated Student:", res.data.data);
  //   } catch (error) {
  //     console.error("Error updating student:", error);
  //     setMessage(error.response?.data?.message || "Error while updating student");
  //   }
  // };

//   if (loading) return <p>Loading student data...</p>;

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">Update Student Profile</h2>
//       <form onSubmit={handleSubmit} className="space-y-3">
//         <input
//           type="text"
//           name="name"
//           placeholder="Name"
//           value={formData.name}
//           onChange={handleChange}
//           className="border p-2 w-full"
//         />
//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={formData.email}
//           onChange={handleChange}
//           className="border p-2 w-full"
//         />
//         <input
//           type="text"
//           name="newStudentId"
//           placeholder="Student ID"
//           value={formData.newStudentId}
//           onChange={handleChange}
//           className="border p-2 w-full"
//         />
//         <input
//           type="text"
//           name="phone"
//           placeholder="Phone"
//           value={formData.phone}
//           onChange={handleChange}
//           className="border p-2 w-full"
//         />
//         <input
//           type="text"
//           name="address"
//           placeholder="Address"
//           value={formData.address}
//           onChange={handleChange}
//           className="border p-2 w-full"
//         />
//         <input
//           type="number"
//           name="semester"
//           placeholder="Semester"
//           value={formData.semester}
//           onChange={handleChange}
//           className="border p-2 w-full"
//         />

//         {/* Dropdown for department */}
//         <select
//           name="departmentId"
//           value={formData.departmentId}
//           onChange={handleChange}
//           className="border p-2 w-full"
//         >
//           <option value="">-- Select Department --</option>
//           {departments.map((dept) => (
//             <option key={dept._id} value={dept._id}>
//               {dept.name} ({dept.code})
//             </option>
//           ))}
//         </select>

//         <label className="flex items-center">
//           <input
//             type="checkbox"
//             name="isActive"
//             checked={formData.isActive}
//             onChange={handleChange}
//             className="mr-2"
//           />
//           Active
//         </label>
//         <button type="submit" className="bg-blue-500 text-white p-2 rounded">
//           Update Student
//         </button>
//       </form>
//       {message && <p className="mt-4">{message}</p>}
//     </div>
//   );
// };

// export default UpdateStudent;



import React, { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  GraduationCap,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Hash,
  Calendar
} from "lucide-react";
import { useParams } from "react-router-dom";
import axios from "axios";

const UpdateStudent = () => {
  // Mock data for demonstration - replace with your actual logic
  // const [formData, setFormData] = useState({
  //   email: "john.doe@university.edu",
  //   name: "John Doe",
  //   newStudentId: "CS-2024-001",
  //   phone: "+1 (555) 123-4567",
  //   address: "123 University Ave, Campus City, ST 12345",
  //   semester: "6",
  //   departmentId: "dept1",
  //   isActive: true,
  // });
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    newStudentId: "",
    phone: "",
    address: "",
    semester: "",
    departmentId: "",
    isActive: true,
  });
  const { id } = useParams();
  // const [departments] = useState([
  //   { _id: "dept1", name: "Computer Science", code: "CS" },
  //   { _id: "dept2", name: "Engineering", code: "ENG" },
  //   { _id: "dept3", name: "Mathematics", code: "MATH" }
  // ]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success or error

   useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch student profile
        const studentRes = await axios.get(
          `http://localhost:3000/app/v1/user-profile/${id}`,
          { withCredentials: true }
        );
        const student = studentRes.data.data;

        setFormData({
          email: student.email || "",
          name: student.name || "",
          newStudentId: student.studentId || "",
          phone: student.phone || "",
          address: student.address || "",
          semester: student.semester || "",
          departmentId: student.department?._id || "",
          isActive: student.isActive ?? true,
        });

        // fetch departments
        const deptRes = await axios.get(
          "http://localhost:3000/app/v1/departments",
          { withCredentials: true }
        );
        
        setDepartments(deptRes.data || []);
        console.log("department are --> ", departments);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage("Failed to load student or department data");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:3000/app/v1/admin/update-student/${id}`,
        formData,
        { withCredentials: true }
      );
      setMessage(res.data.message);
      console.log("Updated Student:", res.data.data);
    } catch (error) {
      console.error("Error updating student:", error);
      setMessage(error.response?.data?.message || "Error while updating student");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center space-x-4">
          <div className="bg-white bg-opacity-20 rounded-full p-3">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Update Student Profile</h2>
            <p className="text-indigo-100 mt-1">Modify student information and settings</p>
          </div>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          messageType === "success" 
            ? "bg-green-50 border-green-200 text-green-800" 
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <div className="flex items-center">
            {messageType === "success" ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <p className="font-medium">{message}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-8 border border-white border-opacity-20">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-400" />
              Personal Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Student ID */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Student ID
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="newStudentId"
                    placeholder="Enter student ID"
                    value={formData.newStudentId}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Address - Full width */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  name="address"
                  placeholder="Enter full address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Academic Information Section */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-purple-400" />
              Academic Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Semester */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Semester
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="semester"
                    placeholder="Enter semester"
                    value={formData.semester}
                    onChange={handleChange}
                    min="1"
                    max="8"
                    className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Department
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                    required
                  >
                    <option value="" className="bg-gray-800">-- Select Department --</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id} className="bg-gray-800">
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Status</h3>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-white bg-opacity-20 border-white border-opacity-30 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label className="text-gray-300 font-medium">
                Active Student
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Update Student</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStudent;