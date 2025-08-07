import { useState, useEffect } from "react";
// import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

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

  const navigate = useNavigate();

  const API_BASE = "https://document-auth-api.onrender.com/api/department";

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editIndex !== null) {
      // Update department
      try {
        const deptToUpdate = departments[editIndex];
        const res = await fetch(`${API_BASE}/${deptToUpdate.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, id: deptToUpdate.id }),
        });

        if (res.ok) {
          const updatedDepartments = departments.map((dept, index) =>
            index === editIndex ? { ...deptToUpdate, ...formData } : dept
          );
          setDepartments(updatedDepartments);
          setFormData({ code: "", name: "", hod: "", mobile: "", email: "" });
          setEditIndex(null);
        } else {
          console.error("Failed to update department", await res.text());
        }
      } catch (err) {
        console.error("Error updating department:", err);
      }
    } else {
      // Add new department
      try {
        const res = await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const newDept = await res.json();
          setDepartments([...departments, newDept]);
          setFormData({ code: "", name: "", hod: "", mobile: "", email: "" });
        } else {
          console.error("Failed to add department", await res.text());
        }
      } catch (err) {
        console.error("Submit error:", err);
      }
    }
  };

  const handleEdit = (index) => {
    setFormData(departments[index]);
    setEditIndex(index);
  };

  const handleDelete = async (index) => {
    const deptToDelete = departments[index];
    try {
      const res = await fetch(`${API_BASE}/${deptToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const updatedDepartments = departments.filter((_, i) => i !== index);
        setDepartments(updatedDepartments);
      } else {
        console.error("Failed to delete department");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Department Form</h1>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded shadow"
      >
        <input
          type="text"
          name="code"
          placeholder="Department Code"
          value={formData.code}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Department Name"
          value={formData.name}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="hod"
          placeholder="HOD"
          value={formData.hod}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="tel"
          name="mobile"
          placeholder="Mobile No"
          value={formData.mobile}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <button
          type="submit"
          className="col-span-1 md:col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {editIndex !== null ? "Update" : "Submit"}
        </button>
      </form>

      {/* List Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Department List</h2>
        {departments.length === 0 ? (
          <p>No departments added yet.</p>
        ) : (
          <table className="w-full border table-auto">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">Code</th>
                <th className="p-2">Department Name</th>
                <th className="p-2">HOD</th>
                <th className="p-2">Mobile</th>
                <th className="p-2">Email</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, index) => (
                <tr key={dept.id} className="text-center border-t">
                  <td className="p-2">{dept.code}</td>
                  <td className="p-2">{dept.name}</td>
                  <td className="p-2">{dept.hod}</td>
                  <td className="p-2">{dept.mobile}</td>
                  <td className="p-2">{dept.email}</td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => handleEdit(index)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="mt-8 flex justify-center">
        <button
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          onClick={() => navigate("/home")}
        >
          {" "}
          Home{" "}
        </button>
      </div>
    </div>
  );
}

export default Department;
