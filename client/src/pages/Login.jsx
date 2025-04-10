import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import customFetch from "../utils/customFetch";

export default function AuthPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [isTeacher, setIsTeacher] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    department: "",
    customDepartment: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (activeTab === "login") {
        const { data } = await customFetch.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });
        if (data.success) {
          toast.success("Login successful!");
          navigate(
            data.user.role === "admin" ? "/admin-dashboard" : "/dashboard"
          );
        }
      } else {
        const registerData = isTeacher
          ? {
              name: formData.username,
              email: formData.email,
              password: formData.password,
              department:
                formData.department === "other"
                  ? formData.customDepartment
                  : formData.department,
            }
          : {
              username: formData.username,
              email: formData.email,
              password: formData.password,
            };

        const endpoint = isTeacher
          ? "/auth/register/teacher"
          : "/auth/register";
        const { data } = await customFetch.post(endpoint, registerData);

        if (data.success) {
          toast.success("Registration successful!");
          setActiveTab("login");
          setFormData({
            email: "",
            password: "",
            username: "",
            department: "",
            customDepartment: "",
          });
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="relative w-full max-w-lg p-9 bg-white/10 backdrop-blur-lg shadow-xl rounded-2xl">
        <div className="flex justify-center gap-6 mb-6">
          <button
            className={`py-2 px-6 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === "login"
                ? "bg-blue-500 text-white"
                : "bg-gray-300 text-gray-800"
            }`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            className={`py-2 px-6 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === "register"
                ? "bg-blue-500 text-white"
                : "bg-gray-300 text-gray-800"
            }`}
            onClick={() => setActiveTab("register")}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === "register" && (
            <div>
              <label className="block text-white text-sm font-medium">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-3 mt-1 rounded-lg bg-white/20 text-white outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your name"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-white text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 mt-1 rounded-lg bg-white/20 text-white outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-white text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 mt-1 rounded-lg bg-white/20 text-white outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          {activeTab === "register" && isTeacher && (
            <div>
              <label className="block text-white text-sm font-medium">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full p-3 mt-1 rounded-lg bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Department</option>
                <option value="computer-science">Computer Science</option>
                <option value="mathematics">Mathematics</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="biology">Biology</option>
                <option value="zoology">Zoology</option>
                <option value="commerce">Commerce</option>
                <option value="accountancy">Accountancy</option>
                <option value="economics">Economics</option>
                <option value="other">Other</option>
              </select>
              {formData.department === "other" && (
                <input
                  type="text"
                  name="customDepartment"
                  value={formData.customDepartment}
                  onChange={handleChange}
                  className="w-full p-3 mt-2 rounded-lg bg-white/20 text-white outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter department name"
                  required
                />
              )}
            </div>
          )}
          {activeTab === "register" && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isTeacher}
                onChange={(e) => setIsTeacher(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-white">Register as a Teacher</span>
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-300"
          >
            {isLoading
              ? "Processing..."
              : activeTab === "login"
              ? "Login"
              : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
