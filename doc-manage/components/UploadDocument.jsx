import { useState, useEffect } from "react";
import axios from "axios";
import { UploadCloud, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function UploadDocument() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/department");
        setDepartments(res.data);
      } catch (err) {
        console.error("Error fetching departments:", err);
      }
    };
    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !title || !departmentId) {
      setMessage("⚠️ Please fill all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("departmentId", departmentId);

    try {
      setIsLoading(true);
      const res = await axios.post(
        "http://localhost:8080/api/document/upload",
        formData
      );
      setMessage(`✅ ${res.data.message}`);
      setTitle("");
      setFile(null);
      setDepartmentId("");
    } catch (err) {
      setMessage(
        `❌ Error: ${err.response?.data?.message || "Please try again."}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center px-4 py-8">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-xl transition-all duration-300">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8 flex items-center justify-center gap-2">
          <UploadCloud className="w-7 h-7" />
          Upload Document
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block mb-2 text-gray-700 font-semibold">
              Document Title
            </label>
            <input
              type="text"
              placeholder="Enter document title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block mb-2 text-gray-700 font-semibold">
              Choose File
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full px-4 py-2 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block mb-2 text-gray-700 font-semibold">
              Select Department
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm"
            >
              <option value="">-- Select Department --</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-white font-semibold transition duration-300 ${
              isLoading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {isLoading && <Loader2 className="animate-spin h-5 w-5" />}
            {isLoading ? "Uploading..." : "Upload"}
          </button>

          {/* Message */}
          {message && (
            <div
              className={`text-center font-medium ${
                message.startsWith("✅")
                  ? "text-green-600"
                  : message.startsWith("❌")
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            >
              {message}
            </div>
          )}
        </form>

        {/* Home Button */}
        <div className="mt-6 flex justify-center">
          <button
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-5 rounded-xl transition"
            onClick={() => navigate("/home")}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadDocument;
