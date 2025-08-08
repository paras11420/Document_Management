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
  ArrowLeft,
  Info,
  ChevronDown,
  ChevronUp,
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
  const [showGuidelines, setShowGuidelines] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between border-b">
        <button
          onClick={() => navigate("/home")}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-900">
            Upload Document
          </h1>
          <p className="text-xs text-gray-500">
            {departments.length} departments
          </p>
        </div>
        <button
          onClick={() => setShowGuidelines(!showGuidelines)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Info className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      {/* Mobile Guidelines Modal */}
      {showGuidelines && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-h-[70vh] rounded-t-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Upload Guidelines
              </h2>
              <button
                onClick={() => setShowGuidelines(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      Supported Formats
                    </h4>
                    <p className="text-xs text-gray-600">
                      PDF, DOC, DOCX, XLS, XLSX, TXT, and image files
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                    <UploadCloud className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      File Size Limit
                    </h4>
                    <p className="text-xs text-gray-600">
                      Maximum file size is 10MB per document
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                    <Building2 className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      Organization
                    </h4>
                    <p className="text-xs text-gray-600">
                      Choose the correct department for easy access
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Desktop Header Section */}
          <div className="hidden lg:block bg-white rounded-xl shadow-lg p-6 mb-8">
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

          {/* Upload Form - Mobile Responsive */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="hidden lg:block px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <Upload className="h-6 w-6 mr-2 text-blue-600" />
                Upload New Document
              </h2>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-4 lg:p-8 space-y-6 lg:space-y-8"
            >
              {/* Document Title - Mobile Responsive */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FileText className="h-4 w-4 mr-2" />
                  Document Title
                </label>
                <input
                  type="text"
                  placeholder="Enter a descriptive title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    clearMessage();
                  }}
                  className="w-full px-3 lg:px-4 py-2.5 lg:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm lg:text-base"
                  disabled={isLoading}
                />
              </div>

              {/* File Upload with Drag & Drop - Mobile Responsive */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Select Document File
                </label>

                <div
                  className={`relative border-2 border-dashed rounded-xl p-4 lg:p-8 text-center transition-all duration-200 ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
                  } ${
                    isLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
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
                        className={`h-8 w-8 lg:h-12 lg:w-12 mx-auto mb-3 lg:mb-4 ${
                          dragActive ? "text-blue-500" : "text-gray-400"
                        }`}
                      />
                      <p
                        className={`text-base lg:text-lg font-medium mb-2 ${
                          dragActive ? "text-blue-700" : "text-gray-700"
                        }`}
                      >
                        {dragActive
                          ? "Drop your file here"
                          : "Choose a file or drag & drop"}
                      </p>
                      <p className="text-xs lg:text-sm text-gray-500">
                        PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG (Max 10MB)
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <div className="flex items-center space-x-3 bg-white rounded-lg p-3 lg:p-4 shadow-sm max-w-full">
                        {getFileIcon(file.name)}
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
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
                          className="p-1 text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Department Selection - Mobile Responsive */}
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
                  className="w-full px-3 lg:px-4 py-2.5 lg:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm lg:text-base"
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

              {/* Progress/Status Message - Mobile Responsive */}
              {message && (
                <div
                  className={`flex items-start space-x-3 p-3 lg:p-4 rounded-xl ${
                    message.startsWith("✅")
                      ? "bg-green-50 border border-green-200"
                      : message.startsWith("❌")
                      ? "bg-red-50 border border-red-200"
                      : "bg-yellow-50 border border-yellow-200"
                  }`}
                >
                  {message.startsWith("✅") ? (
                    <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  )}
                  <p
                    className={`font-medium text-xs lg:text-sm leading-relaxed ${
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

              {/* Action Buttons - Mobile Responsive */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 lg:pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 flex items-center justify-center py-2.5 lg:py-3 px-4 lg:px-6 rounded-xl text-white font-semibold transition-all duration-200 transform text-sm lg:text-base ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                      Upload Document
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/home")}
                  disabled={isLoading}
                  className="flex items-center justify-center px-4 lg:px-6 py-2.5 lg:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 text-sm lg:text-base"
                >
                  <Home className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                  Back to Dashboard
                </button>
              </div>
            </form>
          </div>

          {/* Desktop Upload Tips */}
          <div className="hidden lg:block bg-white rounded-xl shadow-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Upload Guidelines
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Supported Formats
                  </h4>
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

          {/* Mobile Quick Tips */}
          <div className="lg:hidden bg-white rounded-xl shadow-lg p-4 mt-4">
            <button
              onClick={() => setShowGuidelines(true)}
              className="w-full flex items-center justify-center py-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Info className="h-4 w-4 mr-2" />
              View Upload Guidelines
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadDocument;
