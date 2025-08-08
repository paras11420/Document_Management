import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogIn,
  User,
  Lock,
  Eye,
  EyeOff,
  FileText,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

    if (!username || !password) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("loggedInUser", JSON.stringify(data));
        navigate("/home");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 lg:p-8">
      {/* Mobile Back Button (Optional - if coming from somewhere) */}
      <button
        onClick={() => window.history.back()}
        className="sm:hidden absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-colors"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>

      <div className="w-full max-w-sm sm:max-w-md">
        {/* Header Section - Mobile Responsive */}
        <div className="text-center mb-6 lg:mb-8">
          <div className="bg-white rounded-full p-3 lg:p-4 shadow-lg inline-flex mb-3 lg:mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 lg:p-3 rounded-full">
              <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-sm lg:text-base text-gray-600 px-2">
            Sign in to your Document Management System
          </p>
        </div>

        {/* Login Form - Mobile Responsive */}
        <div className="bg-white shadow-2xl rounded-2xl p-6 lg:p-8">
          <div className="mb-4 lg:mb-6 text-center">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center justify-center">
              <LogIn className="h-5 w-5 lg:h-6 lg:w-6 mr-2 text-blue-600" />
              Sign In
            </h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 lg:space-y-6">
            {/* Username Input - Mobile Optimized */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <User className="h-4 w-4 mr-2" />
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm lg:text-base"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
                <User className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
              </div>
            </div>

            {/* Password Input - Mobile Optimized */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Lock className="h-4 w-4 mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pl-10 lg:pl-12 pr-10 lg:pr-12 py-2.5 lg:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm lg:text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <Lock className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 lg:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 lg:h-5 lg:w-5" />
                  ) : (
                    <Eye className="h-4 w-4 lg:h-5 lg:w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message - Mobile Optimized */}
            {error && (
              <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="h-4 w-4 lg:h-5 lg:w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-xs lg:text-sm leading-relaxed">
                  {error}
                </p>
              </div>
            )}

            {/* Login Button - Mobile Optimized */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center py-2.5 lg:py-3 px-4 rounded-xl text-white font-semibold transition-all duration-200 transform text-sm lg:text-base ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] shadow-lg hover:shadow-xl"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider - Mobile Optimized */}
          <div className="my-6 lg:my-8 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 lg:px-4 text-xs lg:text-sm text-gray-500">
              or
            </span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Sign Up Link - Mobile Optimized */}
          <div className="text-center">
            <p className="text-gray-600 mb-3 lg:mb-4 text-sm lg:text-base">
              Don't have an account?
            </p>
            <button
              onClick={() => navigate("/signup")}
              disabled={isLoading}
              className="inline-flex items-center px-4 lg:px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 text-sm lg:text-base"
            >
              Create New Account
            </button>
          </div>
        </div>

        {/* Footer - Mobile Optimized */}
        <div className="text-center mt-6 lg:mt-8 px-4">
          <p className="text-xs lg:text-sm text-gray-500 mb-3">
            Secure access to your document management platform
          </p>
          <div className="flex items-center justify-center">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-green-500 rounded-full"></div>
              <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-green-500 rounded-full"></div>
              <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-xs lg:text-sm text-green-600 ml-2">
              System Online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
