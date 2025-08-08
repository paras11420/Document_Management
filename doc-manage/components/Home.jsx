import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  UploadCloud,
  Building2,
  LogOut,
  LayoutDashboard,
  TrendingUp,
  Users,
  Activity,
  BarChart3,
  Clock,
  FileCheck,
  ArrowUpRight,
  Zap,
  Settings,
  Search,
  Archive,
  Shield,
  UserCheck,
  FolderOpen,
  Database,
  Bell,
  HelpCircle,
} from "lucide-react";
import { BiSolidReport } from "react-icons/bi";

function Home() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    totalDocuments: 156,
    totalDepartments: 8,
    todayUploads: 12,
    weeklyGrowth: 15.3,
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const userName = user.name || "User";

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };

  const quickActions = [
    {
      title: "Upload Document",
      description: "Add new documents to the system",
      icon: UploadCloud,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      action: () => navigate("/upload"),
    },
    {
      title: "Manage Departments",
      description: "Create and edit departments",
      icon: Building2,
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      action: () => navigate("/department"),
    },
    {
      title: "Document Library",
      description: "Browse and manage all documents",
      icon: FileText,
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      action: () => navigate("/document"),
    },
    {
      title: "Analytics Dashboard",
      description: "View reports and insights",
      icon: BarChart3,
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
      action: () => navigate("/report"),
    },
  ];

  const recentActivity = [
    {
      action: "Document uploaded",
      item: "Project Proposal.pdf",
      time: "2 hours ago",
      icon: FileCheck,
      color: "text-green-600",
    },
    {
      action: "Department created",
      item: "Human Resources",
      time: "5 hours ago",
      icon: Building2,
      color: "text-blue-600",
    },
    {
      action: "Report generated",
      item: "Monthly Analytics",
      time: "1 day ago",
      icon: BarChart3,
      color: "text-orange-600",
    },
    {
      action: "Document deleted",
      item: "Old Meeting Notes.docx",
      time: "2 days ago",
      icon: FileText,
      color: "text-red-600",
    },
  ];

  return (
    <div className="flex h-screen">
      {/* Simplified Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-blue-400">
            <div className="bg-blue-600 p-2 rounded-lg">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            DocuFlow Pro
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Document Management System
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-3 text-sm overflow-y-auto">
          {/* Dashboard Home */}
          <button
            onClick={() => navigate("/home")}
            className="w-full flex items-center gap-3 hover:bg-gray-700 px-4 py-3 rounded-lg transition-all duration-200 text-blue-300 bg-gray-700/50"
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>

          {/* Document Management */}
          <button
            onClick={() => navigate("/upload")}
            className="w-full flex items-center gap-3 hover:bg-gray-700 px-4 py-3 rounded-lg transition-all duration-200 text-gray-300 hover:text-white"
          >
            <UploadCloud size={20} />
            <span className="font-medium">Upload Documents</span>
          </button>

          <button
            onClick={() => navigate("/document")}
            className="w-full flex items-center gap-3 hover:bg-gray-700 px-4 py-3 rounded-lg transition-all duration-200 text-gray-300 hover:text-white"
          >
            <FolderOpen size={20} />
            <span className="font-medium">Document Library</span>
          </button>

          {/* Organization */}
          <button
            onClick={() => navigate("/department")}
            className="w-full flex items-center gap-3 hover:bg-gray-700 px-4 py-3 rounded-lg transition-all duration-200 text-gray-300 hover:text-white"
          >
            <Building2 size={20} />
            <span className="font-medium">Manage Departments</span>
          </button>

          {/* Analytics */}
          <button
            onClick={() => navigate("/report")}
            className="w-full flex items-center gap-3 hover:bg-gray-700 px-4 py-3 rounded-lg transition-all duration-200 text-gray-300 hover:text-white"
          >
            <BarChart3 size={20} />
            <span className="font-medium">Analytics & Reports</span>
          </button>

          {/* Divider */}
          <div className="border-t border-gray-600 my-6"></div>

          {/* Quick Access */}
          <div className="pb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
              Quick Access
            </p>

            <button
              onClick={() => navigate("/document")}
              className="w-full flex items-center gap-3 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors text-gray-300 hover:text-white"
            >
              <Clock size={18} />
              <span>Recent Files</span>
            </button>

            <button
              onClick={() => navigate("/document")}
              className="w-full flex items-center gap-3 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors text-gray-300 hover:text-white"
            >
              <Archive size={18} />
              <span>Archived Documents</span>
            </button>

            <button
              onClick={() => navigate("/report")}
              className="w-full flex items-center gap-3 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors text-gray-300 hover:text-white"
            >
              <Bell size={18} />
              <span>Activity Notifications</span>
            </button>
          </div>

          {/* System */}
          <div className="pt-4 border-t border-gray-600">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
              System
            </p>

            <button className="w-full flex items-center gap-3 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors text-gray-300 hover:text-white">
              <Settings size={18} />
              <span>System Settings</span>
            </button>

            <button className="w-full flex items-center gap-3 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors text-gray-300 hover:text-white">
              <HelpCircle size={18} />
              <span>Help & Support</span>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {userName}
              </p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg text-white transition-colors font-medium"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content - Same as before */}
      <main className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 p-8 overflow-y-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {userName}! 👋
              </h1>
              <p className="text-xl text-gray-600">
                Here's what's happening with your document management system
                today.
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Current Time</div>
              <div className="text-lg font-semibold text-gray-900">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-sm text-gray-600">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Documents
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalDocuments}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500 text-sm font-medium ml-1">
                +{stats.weeklyGrowth}%
              </span>
              <span className="text-gray-500 text-sm ml-2">from last week</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalDepartments}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Building2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-gray-500 text-sm ml-2">
                Active departments
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Today's Uploads
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.todayUploads}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <UploadCloud className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-gray-500 text-sm ml-2">Since midnight</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  System Health
                </p>
                <p className="text-2xl font-bold text-green-600">Excellent</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <Zap className="h-4 w-4 text-green-500" />
              <span className="text-gray-500 text-sm ml-2">
                All systems operational
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`${action.color} ${action.hoverColor} text-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition-all duration-200 text-left`}
              >
                <div className="flex items-center justify-between mb-4">
                  <action.icon className="h-8 w-8" />
                  <ArrowUpRight className="h-5 w-5 opacity-70" />
                </div>
                <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Recent Activity
              </h2>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-2 rounded-lg bg-gray-100`}>
                    <activity.icon className={`h-5 w-5 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {activity.item}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              System Overview
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Storage Usage
                  </span>
                  <span className="text-sm text-gray-900">67%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: "67%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Active Users
                  </span>
                  <span className="text-sm text-gray-900">24</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: "80%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Server Performance
                  </span>
                  <span className="text-sm text-gray-900">Optimal</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: "95%" }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Last Backup
                  </span>
                  <span className="text-sm text-green-600 font-medium">
                    2 hours ago
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
