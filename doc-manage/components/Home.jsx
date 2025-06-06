import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  UploadCloud,
  Building2,
  FilePlus2,
  FileBarChart2,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { BiSolidReport } from "react-icons/bi";

function Home() {
  const navigate = useNavigate();
  const [showMasterDropdown, setShowMasterDropdown] = useState(false);
  const [showTransactionDropdown, setShowTransactionDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-4 shadow-md">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-400">
          <LayoutDashboard /> DMS Panel
        </h2>

        <nav className="flex flex-col gap-2 text-sm">
          {/* Master */}
          <button
            onClick={() => setShowMasterDropdown(!showMasterDropdown)}
            className="flex items-center justify-between hover:bg-gray-800 px-3 py-2 rounded"
          >
            <span className="flex items-center gap-2">
              <FileText size={18} /> Master
            </span>
            {showMasterDropdown ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
          {showMasterDropdown && (
            <div className="ml-6 flex flex-col gap-2 transition-all duration-200">
              <button
                onClick={() => navigate("/department")}
                className="flex items-center gap-2 text-gray-300 hover:text-white"
              >
                <Building2 size={16} /> Department
              </button>
              <button
                onClick={() => navigate("/document")}
                className="flex items-center gap-2 text-gray-300 hover:text-white"
              >
                <FilePlus2 size={16} /> Document
              </button>
            </div>
          )}

          {/* Transaction */}
          <button
            onClick={() => setShowTransactionDropdown(!showTransactionDropdown)}
            className="flex items-center justify-between hover:bg-gray-800 px-3 py-2 rounded"
          >
            <span className="flex items-center gap-2">
              <UploadCloud size={18} /> Transaction
            </span>
            {showTransactionDropdown ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
          {showTransactionDropdown && (
            <div className="ml-6 flex flex-col gap-2 transition-all duration-200">
              <button
                onClick={() => navigate("/upload")}
                className="flex items-center gap-2 text-gray-300 hover:text-white"
              >
                <UploadCloud size={16} /> Upload Document
              </button>
            </div>
          )}

          {/* Report */}
          <button
            onClick={() => navigate("/report")}
            className="flex items-center gap-2 hover:bg-gray-800 px-3 py-2 rounded"
          >
            <BiSolidReport size={20} /> Report
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="mt-auto flex items-center gap-2 bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-white"
          >
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-10 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Home Page</h1>
        <p className="text-lg text-gray-700">
          Welcome to the Document Management System.
        </p>
      </main>
    </div>
  );
}

export default Home;
