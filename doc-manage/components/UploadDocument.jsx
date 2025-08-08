import { useState, useEffect } from "react";
import axios from "axios";
import {
  UploadCloud,
  Loader2,
  FileText,
  Building2,
  Upload,
  X,
  CheckCircle,
  AlertTriangle,
  Home,
  Paperclip,
  FolderOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function UploadDocument() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const navigate = useNavigate();

  // Production API base URL for all requests
  const API_BASE_URL = "https://document-auth-api.onrender.com/api";

  // Clear messages on input updates for better UX
  const clearMessage = () => setMessage("");

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/department`);
        setDepartments(res.data);
      } catch (err) {
        console.error("Error fetching departments:", err);
        setMessage("⚠️ Failed to load departments. Please try again later.");
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
      const res = await axios.post(`${API_BASE_URL}/document/upload`, formData);
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

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      clearMessage();
    }
  };

  // File size formatter
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get file type icon
  const getFileIcon = (fileName) => {
    if (!fileName) return <FileText className="h-5 w-5" />;
    const ext = fileName.split(".").pop()?.toLowerCase();
    return <FileText className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-lg">
                <UploadCloud className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Document Upload
                </h1>
                <p className="text-gray-600">
                  Add new documents to your management system
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <FolderOpen className="h-4 w-4" />
              <span>{departments.length} Departments Available</span>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Upload className="h-6 w-6 mr-2 text-blue-600" />
              Upload New Document
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Document Title */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FileText className="h-4 w-4 mr-2" />
                Document Title
              </label>
              <input
                type="text"
                placeholder="Enter a descriptive title for your document"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  clearMessage();
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                disabled={isLoading}
              />
            </div>

            {/* File Upload with Drag & Drop */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Paperclip className="h-4 w-4 mr-2" />
                Select Document File
              </label>

              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
                } ${
                  isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() =>
                  !isLoading && document.getElementById("file-input").click()
                }
              >
                <input
                  id="file-input"
                  type="file"
                  onChange={(e) => {
                    setFile(e.target.files[0]);
                    clearMessage();
                  }}
                  className="hidden"
                  disabled={isLoading}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                />

                {!file ? (
                  <div>
                    <UploadCloud
                      className={`h-12 w-12 mx-auto mb-4 ${
                        dragActive ? "text-blue-500" : "text-gray-400"
                      }`}
                    />
                    <p
                      className={`text-lg font-medium mb-2 ${
                        dragActive ? "text-blue-700" : "text-gray-700"
                      }`}
                    >
                      {dragActive
                        ? "Drop your file here"
                        : "Choose a file or drag & drop"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG (Max
                      10MB)
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex items-center space-x-3 bg-white rounded-lg p-4 shadow-sm">
                      {getFileIcon(file.name)}
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          clearMessage();
                        }}
                        className="ml-2 p-1 text-red-500 hover:text-red-700 transition-colors"
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Department Selection */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Building2 className="h-4 w-4 mr-2" />
                Target Department
              </label>
              <select
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  clearMessage();
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                disabled={isLoading}
              >
                <option value="">-- Select Department --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                Choose the department this document belongs to
              </p>
            </div>

            {/* Progress/Status Message */}
            {message && (
              <div
                className={`flex items-center space-x-3 p-4 rounded-xl ${
                  message.startsWith("✅")
                    ? "bg-green-50 border border-green-200"
                    : message.startsWith("❌")
                    ? "bg-red-50 border border-red-200"
                    : "bg-yellow-50 border border-yellow-200"
                }`}
              >
                {message.startsWith("✅") ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                )}
                <p
                  className={`font-medium ${
                    message.startsWith("✅")
                      ? "text-green-700"
                      : message.startsWith("❌")
                      ? "text-red-700"
                      : "text-yellow-700"
                  }`}
                >
                  {message}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 flex items-center justify-center py-3 px-6 rounded-xl text-white font-semibold transition-all duration-200 transform ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] shadow-lg hover:shadow-xl"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Uploading Document...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Document
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/home")}
                disabled={isLoading}
                className="flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
              >
                <Home className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
            </div>
          </form>
        </div>

        {/* Upload Tips */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upload Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Supported Formats</h4>
                <p className="text-sm text-gray-600">
                  PDF, DOC, DOCX, XLS, XLSX, TXT, and image files
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <UploadCloud className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">File Size Limit</h4>
                <p className="text-sm text-gray-600">
                  Maximum file size is 10MB per document
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Organization</h4>
                <p className="text-sm text-gray-600">
                  Choose the correct department for easy access
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadDocument;
