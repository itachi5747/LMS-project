// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";

// const UpdateInstructor = () => {
//   const { id } = useParams(); // instructorId from URL
//   const [formData, setFormData] = useState({
//     email: "",
//     name: "",
//     newEmployeeId: "",
//     phone: "",
//     address: "",
//     departmentId: "",
//     isActive: true,
//   });
//   const [departments, setDepartments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState("");
//   const [isHead, setIsHead] = useState(false); // <-- new flag

//   // Fetch instructor + departments
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch instructor profile
//         const res = await axios.get(
//           `http://localhost:3000/app/v1/user-profile/${id}`,
//           { withCredentials: true }
//         );
//         const instructor = res.data.data;

//         setFormData({
//           email: instructor.email || "",
//           name: instructor.name || "",
//           newEmployeeId: instructor.employeeId || "",
//           phone: instructor.phone || "",
//           address: instructor.address || "",
//           departmentId: instructor.department?._id || "",
//           isActive: instructor.isActive ?? true,
//         });
//         console.log("dep ka instructor ki id--->", instructor.department?.head);
//         console.log("normal banda ka id ----> ", id);
        
//         // Check if this instructor is head of department
//         if (instructor.department?.head === id) {
//             console.log("true");
//           setIsHead(true);
//         }

//         // Fetch all departments
//         const deptRes = await axios.get(
//           "http://localhost:3000/app/v1/departments",
//           { withCredentials: true }
//         );
//         setDepartments(deptRes.data || []);

//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching instructor/departments:", error);
//         setMessage("Failed to load data");
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [id]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === "checkbox" ? checked : value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.put(
//         `http://localhost:3000/app/v1/admin/update-instructor/${id}`,
//         formData,
//         { withCredentials: true }
//       );
//       setMessage(res.data.message);
//       console.log("Updated Instructor:", res.data.data);
//     } catch (error) {
//       console.error("Error updating instructor:", error);
//       setMessage(error.response?.data?.message || "Error updating instructor");
//     }
//   };

//   if (loading) return <p>Loading instructor data...</p>;

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">Update Instructor Profile</h2>
//       {isHead && (
//         <p className="text-red-600 mb-2">
//           ⚠ This instructor is a Department Head. You cannot change Department or Employee ID until a new head is assigned.
//         </p>
//       )}
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
//           name="newEmployeeId"
//           placeholder="Employee ID"
//           value={formData.newEmployeeId}
//           onChange={handleChange}
//           disabled={isHead} // disable if head
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

//         {/* Dropdown for department */}
//         <select
//           name="departmentId"
//           value={formData.departmentId}
//           onChange={handleChange}
//           disabled={isHead} // disable if head
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

//         <button type="submit" className="bg-green-500 text-white p-2 rounded">
//           Update Instructor
//         </button>
//       </form>
//       {message && <p className="mt-4">{message}</p>}
//     </div>
//   );
// };

// export default UpdateInstructor;


import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
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
  Crown,
  AlertTriangle
} from "lucide-react";

const UpdateInstructor = () => {
  const { id } = useParams(); // instructorId from URL
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    newEmployeeId: "",
    phone: "",
    address: "",
    departmentId: "",
    isActive: true,
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isHead, setIsHead] = useState(false);

  // Fetch instructor + departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch instructor profile
        const res = await axios.get(
          `http://localhost:3000/app/v1/user-profile/${id}`,
          { withCredentials: true }
        );
        const instructor = res.data.data;

        setFormData({
          email: instructor.email || "",
          name: instructor.name || "",
          newEmployeeId: instructor.employeeId || "",
          phone: instructor.phone || "",
          address: instructor.address || "",
          departmentId: instructor.department?._id || "",
          isActive: instructor.isActive ?? true,
        });
        console.log("dep ka instructor ki id--->", instructor.department?.head);
        console.log("normal banda ka id ----> ", id);
        
        // Check if this instructor is head of department
        if (instructor.department?.head === id) {
            console.log("true");
          setIsHead(true);
        }

        // Fetch all departments
        const deptRes = await axios.get(
          "http://localhost:3000/app/v1/departments",
          { withCredentials: true }
        );
        setDepartments(deptRes.data || []);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching instructor/departments:", error);
        setMessage("Failed to load data");
        setMessageType("error");
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
    setLoading(true);
    setMessage("");
    
    try {
      const res = await axios.put(
        `http://localhost:3000/app/v1/admin/update-instructor/${id}`,
        formData,
        { withCredentials: true }
      );
      setMessage(res.data.message);
      setMessageType("success");
      console.log("Updated Instructor:", res.data.data);
    } catch (error) {
      console.error("Error updating instructor:", error);
      setMessage(error.response?.data?.message || "Error updating instructor");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-4 text-lg">Loading instructor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 mb-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4">
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold flex items-center">
                Update Instructor Profile
                {isHead && <Crown className="h-6 w-6 ml-2 text-yellow-300" />}
              </h2>
              <p className="text-emerald-100 mt-1">
                {isHead ? "Managing Department Head Profile" : "Modify instructor information and settings"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Department Head Warning */}
      {isHead && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-amber-800 font-semibold">Department Head Restrictions</h3>
              <p className="text-amber-700 text-sm mt-1">
                This instructor is a Department Head. You cannot change Department or Employee ID until a new head is assigned.
              </p>
            </div>
          </div>
        </div>
      )}

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
        <div onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-emerald-400" />
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
                    className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                    className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Employee ID */}
              <div>
                <label className=" text-sm font-medium text-gray-300 mb-2 flex items-center">
                  Employee ID
                  {isHead && <Crown className="h-4 w-4 ml-1 text-yellow-300" />}
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="newEmployeeId"
                    placeholder="Enter employee ID"
                    value={formData.newEmployeeId}
                    onChange={handleChange}
                    disabled={isHead}
                    className={`w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                      isHead ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    required
                  />
                </div>
                {isHead && (
                  <p className="text-xs text-amber-300 mt-1">Locked - Department Head</p>
                )}
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
                    className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                  className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Academic Information Section */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Building className="h-5 w-5 mr-2 text-teal-400" />
              Department Information
            </h3>
            
            {/* Department */}
            <div>
              <label className=" text-sm font-medium text-gray-300 mb-2 flex items-center">
                Department
                {isHead && <Crown className="h-4 w-4 ml-1 text-yellow-300" />}
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  disabled={isHead}
                  className={`w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none ${
                    isHead ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
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
              {isHead && (
                <p className="text-xs text-amber-300 mt-1">Locked - Department Head</p>
              )}
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
                className="w-4 h-4 text-emerald-600 bg-white bg-opacity-20 border-white border-opacity-30 rounded focus:ring-emerald-500 focus:ring-2"
              />
              <label className="text-gray-300 font-medium">
                Active Instructor
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Update Instructor</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateInstructor;







