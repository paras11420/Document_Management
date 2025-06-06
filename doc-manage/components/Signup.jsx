import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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
      newErrors.password = "Min 6 characters";
    if (!form.mobile || form.mobile.length !== 10)
      newErrors.mobile = "10-digit mobile number";
    if (!form.gst || !gstRegex.test(form.gst)) newErrors.gst = "Invalid GST No";
    if (!form.pan || !panRegex.test(form.pan)) newErrors.pan = "Invalid PAN No";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await fetch("http://localhost:5186/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Signup successful!");
        navigate("/");
      } else {
        setServerMsg(data.message || "Signup failed");
      }
    } catch (err) {
      setServerMsg("Server error. Please try again later.");
    }
  };

  const updateForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSignup}
        className="bg-white shadow-lg rounded p-8 w-[500px]"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        {[
          "name",
          "address",
          "email",
          "username",
          "password",
          "mobile",
          "gst",
          "pan",
        ].map((field) => (
          <div key={field} className="mb-3">
            <input
              name={field}
              type={field === "password" ? "password" : "text"}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="w-full px-4 py-2 border rounded"
              onChange={updateForm}
              required
            />
            {errors[field] && (
              <p className="text-red-500 text-sm">{errors[field]}</p>
            )}
          </div>
        ))}
        {serverMsg && (
          <p className="text-red-500 text-sm text-center mb-3">{serverMsg}</p>
        )}
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          Sign up
        </button>
      </form>
    </div>
  );
}

export default Signup;
