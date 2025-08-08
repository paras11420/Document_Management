import { useEffect, useState } from "react";
import axios from "axios";
import {
  FileText,
  Search,
  Filter,
  Calendar,
  Download,
  Trash2,
  Building2,
  SortDesc,
  SortAsc,
  AlertCircle,
  Loader2,
  RefreshCw,
  Eye,
} from "lucide-react";

function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(null);

  // Production API base URL for all requests
  const API_BASE_URL = "https://document-auth-api.onrender.com/api";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchDocuments(), fetchDepartments()]);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [searchTerm, documents, selectedDept, sortOrder]);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/document`);
      setDocuments(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load documents");
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/document/departments`);
      setDepartments(res.data);
    } catch (err) {
      setError("Failed to load departments");
    }
  };

  const filterDocuments = () => {
    let docs = [...documents];

    if (searchTerm.trim()) {
      docs = docs.filter((doc) =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDept) {
      docs = docs.filter((doc) => doc.departmentName === selectedDept);
    }

    docs.sort((a, b) =>
      sortOrder === "asc"
        ? new Date(a.uploadedAt) - new Date(b.uploadedAt)
        : new Date(b.uploadedAt) - new Date(a.uploadedAt)
    );

    setFilteredDocs(docs);
  };

  const handleDelete = async (id, title) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete "${title}"?\n\nThis action cannot be undone.`
    );
    if (!confirmDelete) return;

    setIsDeleting(id);
    try {
      await axios.delete(`${API_BASE_URL}/document/${id}`);
      await fetchDocuments();
    } catch (err) {
      alert("Failed to delete document. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleRefresh = () => {
    setError("");
    setLoading(true);
    fetchDocuments().finally(() => setLoading(false));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDept("");
    setSortOrder("desc");
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <FileText className="h-5 w-5" />;
    const ext = fileName.split(".").pop()?.toLowerCase();
    return <FileText className="h-5 w-5" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-3 rounded-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Document Library
                </h1>
                <p className="text-gray-600">
                  Browse and manage all organizational documents
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Eye className="h-4 w-4" />
                <span>
                  {filteredDocs.length} of {documents.length} documents
                </span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
              <button
                onClick={handleRefresh}
                className="ml-auto text-red-600 hover:text-red-800 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Loading Documents
              </h3>
              <p className="text-gray-600">
                Please wait while we fetch your documents...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Filters Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-indigo-600" />
                  Filter & Search
                </h2>
                {(searchTerm || selectedDept || sortOrder !== "desc") && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search Input */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Search className="h-4 w-4 mr-2" />
                    Search Documents
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by document title..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Department Filter */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Building2 className="h-4 w-4 mr-2" />
                    Filter by Department
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Order */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    Sort by Date
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="desc">
                      {sortOrder === "desc" ? "↓ " : ""}Newest First
                    </option>
                    <option value="asc">
                      {sortOrder === "asc" ? "↑ " : ""}Oldest First
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Documents Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <FileText className="h-6 w-6 mr-2 text-indigo-600" />
                  Documents{" "}
                  {filteredDocs.length > 0 && `(${filteredDocs.length})`}
                </h2>
              </div>

              <div className="overflow-x-auto">
                {filteredDocs.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                          Document
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                          Upload Date
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredDocs.map((doc) => (
                        <tr
                          key={doc.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                  {getFileIcon(doc.fileName)}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {doc.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {doc.fileName || "Unknown file"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                                {doc.departmentName || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                              {doc.uploadedAt
                                ? new Date(doc.uploadedAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
                                : "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <a
                                href={`${API_BASE_URL}/document/download/${doc.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors"
                                title="Download document"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </a>
                              <button
                                onClick={() => handleDelete(doc.id, doc.title)}
                                disabled={isDeleting === doc.id}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete document"
                              >
                                {isDeleting === doc.id ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 mr-1" />
                                )}
                                {isDeleting === doc.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-12 text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl text-gray-600 mb-2">
                      No documents found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm || selectedDept
                        ? "Try adjusting your search criteria or filters"
                        : "No documents have been uploaded yet"}
                    </p>
                    {(searchTerm || selectedDept) && (
                      <button
                        onClick={clearFilters}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Clear Filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DocumentList;
