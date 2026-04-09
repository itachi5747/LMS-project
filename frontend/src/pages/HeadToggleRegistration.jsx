import { useEffect, useState } from 'react'
import axios from 'axios'

axios.defaults.withCredentials = true
const API_URL = 'http://localhost:3000/app/v1'

export default function HeadToggleRegistration() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_URL}/head-dept/department-courses`)
      setCourses(res.data.data || [])
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Error fetching courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCourses() }, [])

  const toggleCourse = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/head-dept/course/${id}/toggle-registration`)
      const newState = res.data.data.isRegistrationOpen
      setCourses(courses.map(c => c._id === id ? { ...c, isRegistrationOpen: newState } : c))
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Error toggling course')
    }
  }

  const setDepartment = async (open) => {
    try {
      await axios.put(`${API_URL}/head-dept/department-toggle-registration`, { open })
      fetchCourses()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Error toggling department')
    }
  }

  return (
    // ✅ Added relative + z-10 so nothing from the parent dashboard overlaps this
    // ✅ Added pt-14 to push content below the dashboard's fixed top toggle button
    <div className="relative z-10 pt-14 p-6 max-w-4xl w-full bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Department Course Registration</h2>

      {/* ✅ Added relative z-10 to the buttons row as an extra safety layer */}
      <div className="relative z-10 flex gap-2 mb-4">
        <button
          onClick={() => setDepartment(true)}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 active:scale-95 transition-all"
        >
          Open All
        </button>
        <button
          onClick={() => setDepartment(false)}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 active:scale-95 transition-all"
        >
          Close All
        </button>
        <button
          onClick={() => setDepartment(undefined)}
          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 active:scale-95 transition-all"
        >
          Toggle By Current
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500 py-4">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-2 border-b">Title</th>
                <th className="text-left p-2 border-b">Code</th>
                <th className="text-left p-2 border-b">Semester</th>
                <th className="text-left p-2 border-b">Capacity</th>
                <th className="text-left p-2 border-b">Registration</th>
                <th className="p-2 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course._id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{course.title}</td>
                  <td className="p-2">{course.code}</td>
                  <td className="p-2">{course.semester}</td>
                  <td className="p-2">{course.capacity ?? '-'}</td>
                  <td className="p-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      course.isRegistrationOpen
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {course.isRegistrationOpen ? 'Open' : 'Closed'}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    {/* ✅ pointer-events-auto ensures clicks are never silently swallowed */}
                    <button
                      onClick={() => toggleCourse(course._id)}
                      className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 active:scale-95 transition-all pointer-events-auto"
                    >
                      Toggle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}