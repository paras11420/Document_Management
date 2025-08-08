import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    email: "",
    username: "",
    password: "",
    mobile: "",
    gst: "",
    pan: "",
  });
  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  // Validation function
  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;

    if (!form.name) newErrors.name = "Name is required";
    if (!form.address) newErrors.address = "Address is required";
    if (!form.email || !emailRegex.test(form.email))
      newErrors.email = "Valid email required";
    if (!form.username) newErrors.username = "Username is required";
    if (!form.password || form.password.length < 6)
      newErrors.password = "Minimum 6 characters required";
    if (!form.mobile || !/^[6-9]\d{9}$/.test(form.mobile))
      newErrors.mobile = "Valid 10-digit mobile number required";
    if (!form.gst || !gstRegex.test(form.gst))
      newErrors.gst = "Invalid GST Number";
    if (!form.pan || !panRegex.test(form.pan))
      newErrors.pan = "Invalid PAN Number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSignup = async (e) => {
    e.preventDefault();
    setServerMsg("");

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch(
        "https://document-auth-api.onrender.com/api/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setServerMsg("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setServerMsg(data.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      setServerMsg("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Update form fields
  const updateForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  // Field configurations with icons and enhanced labels
  const fieldConfigs = {
    name: {
      label: "Full Name",
      icon: User,
      placeholder: "Enter your full name",
      type: "text",
    },
    address: {
      label: "Address",
      icon: MapPin,
      placeholder: "Enter your complete address",
      type: "text",
    },
    email: {
      label: "Email Address",
      icon: Mail,
      placeholder: "Enter your email address",
      type: "email",
    },
    username: {
      label: "Username",
      icon: User,
      placeholder: "Choose a unique username",
      type: "text",
    },
    password: {
      label: "Password",
      icon: Lock,
      placeholder: "Create a strong password (min 6 characters)",
      type: "password",
    },
    mobile: {
      label: "Mobile Number",
      icon: Phone,
      placeholder: "Enter 10-digit mobile number",
      type: "tel",
    },
    gst: {
      label: "GST Number",
      icon: CreditCard,
      placeholder: "Enter valid GST number",
      type: "text",
    },
    pan: {
      label: "PAN Number",
      icon: FileText,
      placeholder: "Enter valid PAN number",
      type: "text",
    },
  };

  // Group fields by steps for better UX
  const step1Fields = ["name", "email", "username", "password"];
  const step2Fields = ["mobile", "address", "gst", "pan"];

  const renderField = (fieldName) => {
    const config = fieldConfigs[fieldName];
    const IconComponent = config.icon;

    return (
      <div key={fieldName} className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <IconComponent className="h-4 w-4 mr-2" />
          {config.label}
        </label>
        <div className="relative">
          <input
            name={fieldName}
            type={
              fieldName === "password"
                ? showPassword
                  ? "text"
                  : "password"
                : config.type
            }
            placeholder={config.placeholder}
            className={`w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 border rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base ${
              errors[fieldName]
                ? "border-red-500 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            value={form[fieldName]}
            onChange={updateForm}
            disabled={loading}
            required
            aria-invalid={errors[fieldName] ? "true" : "false"}
          />
          <IconComponent
            className={`absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 ${
              errors[fieldName] ? "text-red-400" : "text-gray-400"
            }`}
          />

          {/* Password visibility toggle */}
          {fieldName === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 lg:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 lg:h-5 lg:w-5" />
              ) : (
                <Eye className="h-4 w-4 lg:h-5 lg:w-5" />
              )}
            </button>
          )}
        </div>

        {errors[fieldName] && (
          <div className="flex items-start space-x-1">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-500 text-xs lg:text-sm leading-relaxed">
              {errors[fieldName]}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 lg:p-8">
      {/* Mobile Back Button */}
      <button
        onClick={() => navigate("/")}
        className="sm:hidden absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-colors"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>

      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-sm sm:max-w-2xl">
          {/* Header Section - Mobile Responsive */}
          <div className="text-center mb-6 lg:mb-8">
            <div className="bg-white rounded-full p-3 lg:p-4 shadow-lg inline-flex mb-3 lg:mb-4">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 lg:p-3 rounded-full">
                <UserPlus className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h1>
            <p className="text-sm lg:text-base text-gray-600 px-2">
              Join our Document Management System
            </p>
          </div>

          {/* Progress Indicator - Mobile Responsive */}
          <div className="bg-white rounded-xl p-3 lg:p-4 mb-4 lg:mb-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div
                className={`flex items-center ${
                  currentStep >= 1 ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs lg:text-sm ${
                    currentStep >= 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {currentStep > 1 ? (
                    <CheckCircle className="h-3 w-3 lg:h-5 lg:w-5" />
                  ) : (
                    "1"
                  )}
                </div>
                <span className="ml-2 text-xs lg:text-sm font-medium hidden sm:inline">
                  Personal Info
                </span>
                <span className="ml-2 text-xs font-medium sm:hidden">
                  Step 1
                </span>
              </div>
              <div
                className={`flex-1 h-1 mx-2 lg:mx-4 rounded-full ${
                  currentStep > 1 ? "bg-blue-600" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`flex items-center ${
                  currentStep >= 2 ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs lg:text-sm ${
                    currentStep >= 2
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  2
                </div>
                <span className="ml-2 text-xs lg:text-sm font-medium hidden sm:inline">
                  Business Details
                </span>
                <span className="ml-2 text-xs font-medium sm:hidden">
                  Step 2
                </span>
              </div>
            </div>
          </div>

          {/* Signup Form - Mobile Responsive */}
          <div className="bg-white shadow-2xl rounded-2xl p-4 lg:p-8">
            <div className="mb-4 lg:mb-6 text-center">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center justify-center">
                <UserPlus className="h-5 w-5 lg:h-6 lg:w-6 mr-2 text-green-600" />
                {currentStep === 1
                  ? "Personal Information"
                  : "Business Information"}
              </h2>
              <p className="text-gray-600 mt-2 text-sm lg:text-base px-2">
                {currentStep === 1
                  ? "Please provide your basic information"
                  : "Enter your business and contact details"}
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4 lg:space-y-6">
              {/* Step 1: Personal Info - Mobile Responsive */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  {step1Fields.map(renderField)}
                </div>
              )}

              {/* Step 2: Business Info - Mobile Responsive */}
              {currentStep === 2 && (
                <div className="space-y-4 lg:space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {step2Fields.slice(0, 2).map(renderField)}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {step2Fields.slice(2).map(renderField)}
                  </div>
                </div>
              )}

              {/* Server Message - Mobile Responsive */}
              {serverMsg && (
                <div
                  className={`flex items-start space-x-2 p-3 lg:p-4 rounded-xl ${
                    serverMsg.includes("successfully")
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  {serverMsg.includes("successfully") ? (
                    <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 lg:h-5 lg:w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <p
                    className={`text-xs lg:text-sm leading-relaxed ${
                      serverMsg.includes("successfully")
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {serverMsg}
                  </p>
                </div>
              )}

              {/* Navigation Buttons - Mobile Responsive */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                {currentStep === 2 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center py-2.5 lg:py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 text-sm lg:text-base"
                  >
                    <ArrowLeft className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                    Previous
                  </button>
                )}

                {currentStep === 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="w-full flex items-center justify-center py-2.5 lg:py-3 px-4 rounded-xl text-white font-semibold transition-all duration-200 transform bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] shadow-lg hover:shadow-xl text-sm lg:text-base"
                  >
                    Next Step
                    <ArrowLeft className="h-4 w-4 lg:h-5 lg:w-5 ml-2 rotate-180" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 flex items-center justify-center py-2.5 lg:py-3 px-4 rounded-xl text-white font-semibold transition-all duration-200 transform text-sm lg:text-base ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                        Create Account
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>

            {/* Divider - Mobile Responsive */}
            <div className="my-6 lg:my-8 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-3 lg:px-4 text-xs lg:text-sm text-gray-500">
                or
              </span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Login Link - Mobile Responsive */}
            <div className="text-center">
              <p className="text-gray-600 mb-3 lg:mb-4 text-sm lg:text-base">
                Already have an account?
              </p>
              <button
                onClick={() => navigate("/")}
                disabled={loading}
                className="inline-flex items-center px-4 lg:px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 text-sm lg:text-base"
              >
                Sign In Instead
              </button>
            </div>
          </div>

          {/* Footer - Mobile Responsive */}
          <div className="text-center mt-6 lg:mt-8 px-4">
            <p className="text-xs lg:text-sm text-gray-500 mb-3">
              By creating an account, you agree to our Terms of Service and
              Privacy Policy
            </p>
            <div className="flex items-center justify-center">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-green-500 rounded-full"></div>
                <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-green-500 rounded-full"></div>
                <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-xs lg:text-sm text-green-600 ml-2">
                Secure Registration
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
