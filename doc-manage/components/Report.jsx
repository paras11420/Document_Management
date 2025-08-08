import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart3,
  TrendingUp,
  Building2,
  Calendar,
  Search,
  Filter,
  Download,
  FileText,
  Users,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  PieChart,
  Activity,
  FileBarChart,
  Home,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  MoreVertical,
} from "lucide-react";

function Report() {
  const [summary, setSummary] = useState([]);
  const [details, setDetails] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    departmentId: "",
    from: "",
    to: "",
    search: "",
  });
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorSummary, setErrorSummary] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [errorDepartments, setErrorDepartments] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [showActionMenu, setShowActionMenu] = useState(null);

  // Production API base URL for all requests
  const API_BASE_URL = "https://document-auth-api.onrender.com/api";

  // Fetch department summary and departments list on mount
  useEffect(() => {
    const fetchSummaryAndDepartments = async () => {
      setLoadingSummary(true);
      setErrorSummary("");
      setErrorDepartments("");
      try {
        const [summaryRes, departmentsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/reports/department-summary`),
          axios.get(`${API_BASE_URL}/document/departments`),
        ]);
        setSummary(Array.isArray(summaryRes.data) ? summaryRes.data : []);
        setDepartments(
          Array.isArray(departmentsRes.data) ? departmentsRes.data : []
        );
      } catch (err) {
        console.error("Failed to fetch summary or departments", err);
        setErrorSummary("Failed to load summary data");
        setErrorDepartments("Failed to load departments list");
        setSummary([]);
        setDepartments([]);
      } finally {
        setLoadingSummary(false);
      }
    };
    fetchSummaryAndDepartments();
  }, []);

  // Fetch details based on current filters
  const handleFilter = async () => {
    setLoadingDetails(true);
    setErrorDetails("");
    setShowMobileFilters(false);
    try {
      // Clean params by removing empty filters
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v)
      );
      const res = await axios.get(`${API_BASE_URL}/reports/document-details`, {
        params,
      });
      setDetails(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch document details", err);
      setErrorDetails("Failed to load document details");
      setDetails([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      departmentId: "",
      from: "",
      to: "",
      search: "",
    });
    setDetails([]);
    setShowMobileFilters(false);
  };

  const refreshData = () => {
    setLoadingSummary(true);
    fetchSummaryAndDepartments();
  };

  const toggleCardExpansion = (index) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  // Calculate analytics
  const totalDocuments = summary.reduce(
    (total, dept) => total + (dept.documentCount || 0),
    0
  );
  const activeDepartments = summary.filter(
    (dept) => dept.documentCount > 0
  ).length;
  const avgDocsPerDept =
    activeDepartments > 0 ? Math.round(totalDocuments / activeDepartments) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between border-b">
        <button
          onClick={() => window.history.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Home className="h-6 w-6 text-gray-600" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-900">Analytics</h1>
          <p className="text-xs text-gray-500">{totalDocuments} documents</p>
        </div>
        <button
          onClick={() => setShowMobileFilters(true)}
          className="p-2 bg-purple-600 text-white rounded-lg"
        >
          <Filter className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-h-[90vh] rounded-t-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Document Analysis Filters
              </h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Mobile Filters */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Building2 className="h-4 w-4 mr-2" />
                  Department
                </label>
                <select
                  value={filters.departmentId}
                  onChange={(e) =>
                    setFilters({ ...filters, departmentId: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.from}
                    onChange={(e) =>
                      setFilters({ ...filters, from: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.to}
                    onChange={(e) =>
                      setFilters({ ...filters, to: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Search className="h-4 w-4 mr-2" />
                  Search Title
                </label>
                <input
                  type="text"
                  placeholder="Enter document title..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Mobile Filter Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
                >
                  Clear Filters
                </button>
                <button
                  onClick={handleFilter}
                  disabled={loadingDetails}
                  className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center justify-center"
                >
                  {loadingDetails ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Filter className="h-4 w-4 mr-1" />
                      Apply
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Desktop Header Section */}
          <div className="hidden lg:block bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Analytics & Reports
                  </h1>
                  <p className="text-gray-600">
                    Comprehensive insights into your document management system
                  </p>
                </div>
              </div>
              <button
                onClick={refreshData}
                disabled={loadingSummary}
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    loadingSummary ? "animate-spin" : ""
                  }`}
                />
                Refresh Data
              </button>
            </div>
          </div>

          {/* Analytics Overview Cards - Mobile Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">
                    Total Documents
                  </p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {totalDocuments}
                  </p>
                </div>
                <div className="bg-blue-100 p-2 lg:p-3 rounded-lg">
                  <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-3 lg:mt-4">
                <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-green-500" />
                <span className="text-green-500 text-xs lg:text-sm font-medium ml-1">
                  Across all departments
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">
                    Active Departments
                  </p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {activeDepartments}
                  </p>
                </div>
                <div className="bg-green-100 p-2 lg:p-3 rounded-lg">
                  <Building2 className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-3 lg:mt-4">
                <Users className="h-3 w-3 lg:h-4 lg:w-4 text-blue-500" />
                <span className="text-gray-500 text-xs lg:text-sm ml-2">
                  With documents
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 transform hover:scale-105 transition-transform sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">
                    Avg. per Department
                  </p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {avgDocsPerDept}
                  </p>
                </div>
                <div className="bg-purple-100 p-2 lg:p-3 rounded-lg">
                  <Activity className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center mt-3 lg:mt-4">
                <PieChart className="h-3 w-3 lg:h-4 lg:w-4 text-purple-500" />
                <span className="text-gray-500 text-xs lg:text-sm ml-2">
                  Documents per dept
                </span>
              </div>
            </div>
          </div>

          {/* Department Summary Section */}
          <div className="bg-white rounded-xl shadow-lg mb-6 lg:mb-8 overflow-hidden">
            <div className="px-4 lg:px-8 py-4 lg:py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg lg:text-2xl font-semibold text-gray-900 flex items-center">
                  <FileBarChart className="h-5 w-5 lg:h-6 lg:w-6 mr-2 text-blue-600" />
                  Department Performance
                </h2>
                {errorSummary && (
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs lg:text-sm">Failed to load</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 lg:p-8">
              {loadingSummary ? (
                <div className="flex items-center justify-center py-8 lg:py-12">
                  <Loader2 className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 animate-spin mr-3" />
                  <span className="text-gray-600 text-sm lg:text-base">
                    Loading analytics...
                  </span>
                </div>
              ) : errorSummary ? (
                <div className="text-center py-8 lg:py-12">
                  <AlertCircle className="h-8 w-8 lg:h-12 lg:w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 text-base lg:text-lg">
                    {errorSummary}
                  </p>
                  <button
                    onClick={refreshData}
                    className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm lg:text-base"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="lg:hidden">
                    {summary.length > 0 ? (
                      <div className="space-y-4">
                        {summary.map((s, idx) => (
                          <div
                            key={idx}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <Building2 className="h-5 w-5 text-gray-400" />
                                <div>
                                  <h3 className="font-medium text-gray-900 text-sm">
                                    {s.department}
                                  </h3>
                                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                    {s.documentCount || 0} docs
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => toggleCardExpansion(idx)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                              >
                                {expandedCards.has(idx) ? (
                                  <ChevronUp className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </div>

                            {expandedCards.has(idx) && (
                              <div className="space-y-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Clock className="h-4 w-4 mr-2" />
                                  <span>
                                    Last Activity:{" "}
                                    {s.lastUploaded
                                      ? new Date(
                                          s.lastUploaded
                                        ).toLocaleDateString()
                                      : "No activity"}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500 mb-1">
                                    Performance
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                      style={{
                                        width: `${
                                          totalDocuments > 0
                                            ? Math.min(
                                                (s.documentCount /
                                                  Math.max(
                                                    ...summary.map(
                                                      (d) => d.documentCount
                                                    )
                                                  )) *
                                                  100,
                                                100
                                              )
                                            : 0
                                        }%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-base text-gray-600 mb-2">
                          No Analytics Data
                        </h3>
                        <p className="text-gray-500 text-sm">
                          Data will appear once documents are uploaded
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    {summary.length > 0 ? (
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                              Department
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                              Document Count
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                              Last Activity
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                              Performance
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {summary.map((s, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                                  <span className="text-sm font-medium text-gray-900">
                                    {s.department}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                                    {s.documentCount || 0} docs
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center text-sm text-gray-900">
                                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                  {s.lastUploaded
                                    ? new Date(
                                        s.lastUploaded
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })
                                    : "No activity"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                    style={{
                                      width: `${
                                        totalDocuments > 0
                                          ? Math.min(
                                              (s.documentCount /
                                                Math.max(
                                                  ...summary.map(
                                                    (d) => d.documentCount
                                                  )
                                                )) *
                                                100,
                                              100
                                            )
                                          : 0
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-12">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg text-gray-600 mb-2">
                          No Analytics Data Available
                        </h3>
                        <p className="text-gray-500">
                          Department performance data will appear here once
                          documents are uploaded
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Document Details Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-4 lg:px-8 py-4 lg:py-6 border-b border-gray-200">
              <h2 className="text-lg lg:text-2xl font-semibold text-gray-900 flex items-center">
                <Search className="h-5 w-5 lg:h-6 lg:w-6 mr-2 text-indigo-600" />
                Document Analysis
              </h2>
            </div>

            {/* Desktop Advanced Filters */}
            <div className="hidden lg:block px-8 py-6 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Building2 className="h-4 w-4 mr-2" />
                    Department
                  </label>
                  <select
                    value={filters.departmentId}
                    onChange={(e) =>
                      setFilters({ ...filters, departmentId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.from}
                    onChange={(e) =>
                      setFilters({ ...filters, from: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.to}
                    onChange={(e) =>
                      setFilters({ ...filters, to: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Search className="h-4 w-4 mr-2" />
                    Search Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter document title..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    &nbsp;
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleFilter}
                      disabled={loadingDetails}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loadingDetails ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Filter className="h-4 w-4 mr-1" />
                          Apply
                        </>
                      )}
                    </button>
                    <button
                      onClick={clearFilters}
                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Details Results */}
            <div className="p-4 lg:p-8">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-8 lg:py-12">
                  <Loader2 className="h-6 w-6 lg:h-8 lg:w-8 text-indigo-600 animate-spin mr-3" />
                  <span className="text-gray-600 text-sm lg:text-base">
                    Analyzing documents...
                  </span>
                </div>
              ) : errorDetails ? (
                <div className="text-center py-8 lg:py-12">
                  <AlertCircle className="h-8 w-8 lg:h-12 lg:w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 text-base lg:text-lg">
                    {errorDetails}
                  </p>
                  <button
                    onClick={handleFilter}
                    className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm lg:text-base"
                  >
                    Retry Analysis
                  </button>
                </div>
              ) : (
                <>
                  {/* Mobile Card View for Details */}
                  <div className="lg:hidden">
                    {details.length > 0 ? (
                      <div className="space-y-4">
                        {details.map((doc, idx) => (
                          <div
                            key={idx}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <div className="bg-indigo-100 p-2 rounded-lg flex-shrink-0">
                                  <FileText className="h-4 w-4 text-indigo-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-medium text-gray-900 truncate">
                                    {doc.title}
                                  </h3>
                                  <p className="text-xs text-gray-500 truncate mt-1">
                                    {doc.fileName}
                                  </p>
                                  <div className="flex items-center mt-2">
                                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                      {doc.department}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-2">
                                <a
                                  href={doc.downloadUrl}
                                  download
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors"
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Download
                                </a>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>
                                  {doc.uploadedAt
                                    ? new Date(
                                        doc.uploadedAt
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Search className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-base text-gray-600 mb-2">
                          No Documents Found
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {Object.values(filters).some((v) => v)
                            ? "Try adjusting your search filters"
                            : "Apply filters above to analyze documents"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Desktop Table View for Details */}
                  <div className="hidden lg:block overflow-x-auto">
                    {details.length > 0 ? (
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
                              File Details
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
                          {details.map((doc, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                                    <FileText className="h-5 w-5 text-indigo-600" />
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">
                                    {doc.title}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                                  {doc.department}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {doc.fileName}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center text-sm text-gray-900">
                                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                  {doc.uploadedAt
                                    ? new Date(
                                        doc.uploadedAt
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "N/A"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <a
                                  href={doc.downloadUrl}
                                  download
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors"
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-12">
                        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg text-gray-600 mb-2">
                          No Documents Found
                        </h3>
                        <p className="text-gray-500">
                          {Object.values(filters).some((v) => v)
                            ? "Try adjusting your search filters to find documents"
                            : "Apply filters above to analyze specific documents"}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Report;
