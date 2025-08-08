import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  UserCheck,
  Phone,
  Mail,
  Code,
  Users,
  Edit3,
  Trash2,
  Home,
  Plus,
  Save,
  X,
} from "lucide-react";

function Department() {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    hod: "",
    mobile: "",
    email: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Use environment variable for API base URL
  const API_BASE = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api/department`
    : "http://localhost:8080/api/department";

  // Fetch departments when component mounts
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Fetch department list from API
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      console.error("Error fetching departments:", err);
      alert("Failed to load departments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Update form state on input change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Simple form validation
  const validateForm = () => {
    const { code, name, hod, mobile, email } = formData;
    const mobileRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!code || !name || !hod || !mobile || !email) {
      alert("All fields are required.");
      return false;
    }
    if (!mobileRegex.test(mobile)) {
      alert("Enter a valid 10-digit mobile number.");
      return false;
    }
    if (!emailRegex.test(email)) {
      alert("Enter a valid email address.");
      return false;
    }
    return true;
  };

  // Handle form submit for add or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    if (editIndex !== null) {
      // Update existing department
      try {
        const deptToUpdate = departments[editIndex];
        const res = await fetch(`${API_BASE}/${deptToUpdate.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, id: deptToUpdate.id }),
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Failed to update department.");
        }
        const updatedDept = await res.json();
        setDepartments((prev) =>
          prev.map((dept, i) => (i === editIndex ? updatedDept : dept))
        );
        resetForm();
      } catch (err) {
        console.error("Error updating department:", err);
        alert("Error updating department. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      // Add new department
      try {
        const res = await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Failed to add department.");
        }
        const newDept = await res.json();
        setDepartments((prev) => [...prev, newDept]);
        resetForm();
      } catch (err) {
        console.error("Error adding department:", err);
        alert("Error adding department. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Prepare form for editing a department
  const handleEdit = (index) => {
    setFormData(departments[index]);
    setEditIndex(index);
  };

  // Delete department by id
  const handleDelete = async (index) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the department "${departments[index].name}"?`
      )
    )
      return;

    try {
      const res = await fetch(`${API_BASE}/${departments[index].id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete department.");
      setDepartments((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting department. Please try again.");
    }
  };

  // Reset form and editing state
  const resetForm = () => {
    setFormData({ code: "", name: "", hod: "", mobile: "", email: "" });
    setEditIndex(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Department Management
                </h1>
                <p className="text-gray-600">
                  Create and manage organizational departments
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>{departments.length} Departments</span>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              {editIndex !== null ? (
                <>
                  <Edit3 className="h-6 w-6 mr-2 text-orange-500" />
                  Update Department
                </>
              ) : (
                <>
                  <Plus className="h-6 w-6 mr-2 text-green-500" />
                  Add New Department
                </>
              )}
            </h2>
            {editIndex !== null && (
              <button
                onClick={resetForm}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={loading}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel Edit
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Department Code */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Code className="h-4 w-4 mr-2" />
                Department Code
              </label>
              <input
                type="text"
                name="code"
                placeholder="e.g., CS, ECE, ME"
                value={formData.code}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                disabled={loading}
              />
            </div>

            {/* Department Name */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Building2 className="h-4 w-4 mr-2" />
                Department Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Computer Science"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                disabled={loading}
              />
            </div>

            {/* Head of Department */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <UserCheck className="h-4 w-4 mr-2" />
                Head of Department
              </label>
              <input
                type="text"
                name="hod"
                placeholder="e.g., Dr. John Smith"
                value={formData.hod}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                disabled={loading}
              />
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Phone className="h-4 w-4 mr-2" />
                Contact Number
              </label>
              <input
                type="tel"
                name="mobile"
                placeholder="e.g., 9876543210"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Mail className="h-4 w-4 mr-2" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="e.g., hod.cs@university.edu"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className={`w-full flex items-center justify-center px-6 py-3 rounded-lg text-white font-semibold transition-all ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : editIndex !== null
                    ? "bg-orange-600 hover:bg-orange-700 shadow-lg hover:shadow-xl"
                    : "bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl"
                } transform hover:scale-[1.02]`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {editIndex !== null ? "Updating..." : "Adding..."}
                  </div>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    {editIndex !== null
                      ? "Update Department"
                      : "Add Department"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Departments List Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Building2 className="h-6 w-6 mr-2 text-blue-600" />
              All Departments
            </h2>
          </div>

          <div className="overflow-x-auto">
            {loading && departments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading departments...</p>
              </div>
            ) : departments.length === 0 ? (
              <div className="p-12 text-center">
                <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-600 mb-2">
                  No departments found
                </p>
                <p className="text-gray-500">
                  Create your first department to get started
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      Head of Department
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {departments.map((dept, index) => (
                    <tr
                      key={dept.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {dept.code}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {dept.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {dept.hod}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {dept.mobile}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {dept.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(index)}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors"
                            disabled={loading}
                          >
                            <Edit3 className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(index)}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Navigation Button */}
        <div className="mt-8 flex justify-center">
          <button
            className="inline-flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
            onClick={() => navigate("/home")}
            disabled={loading}
          >
            <Home className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default Department;
