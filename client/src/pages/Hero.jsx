import { ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import heroImage from "../assets/fhefeh.jpg";
import heroImage2 from "../assets/veife.jpg";
import FeatureCard from "../components/FeatureCard";
import Footer from "../components/Footer";
import customFetch from "../utils/customFetch";
import About from "./About";

export default function Hero() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await customFetch.get("/auth/check-auth");
        setUser(data.user);
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };
    checkAuth();
  }, []);

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "teacher") return "/teacher-dashboard";
    if (user.role === "admin") return "/admin-dashboard";
    return "/dashboard";
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-24 pb-12 flex flex-col lg:flex-row items-center">
        {/* Content Section */}
        <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Empower Your Learning with{" "}
            <span className="text-blue-400">Teacher Connect</span>
          </h1>
          <p className="text-gray-300 max-w-lg mx-auto lg:mx-0">
            Seamlessly connect with educators, schedule lessons, and take
            control of your academic success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link to={getDashboardLink()} className="w-full sm:w-auto">
              <button className="px-6 py-3 rounded-xl font-semibold text-lg bg-blue-500 hover:bg-blue-600 transition-all shadow-lg flex items-center gap-2">
                Get Started <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/about" className="w-full sm:w-auto">
              <button className="px-6 py-3 rounded-xl font-semibold text-lg bg-gray-700 hover:bg-gray-600 transition-all shadow-lg">
                Learn More
              </button>
            </Link>
          </div>
        </div>

        {/* Image Section */}
        <div className="lg:w-1/2 relative flex justify-center mt-8 lg:mt-0">
          <div className="absolute inset-0 bg-gradient-to-br  opacity-30 blur-2xl rounded-full"></div>
          <div className="relative w-full max-w-lg">
            <img
              src={heroImage}
              alt="Teacher and Student"
              className="rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300 border-4 border-gray-800"
            />
            <img
              src={heroImage2}
              alt="Online Learning"
              className="absolute bottom-0 right-0 w-1/2 rounded-xl shadow-xl border-2 border-gray-800 transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-800">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            title="Seamless Scheduling"
            description="Book and manage appointments effortlessly"
            icon="📅"
          />
          <FeatureCard
            title="Instant Notifications"
            description="Stay updated with real-time alerts"
            icon="🔔"
          />
          <FeatureCard
            title="Secure & Reliable"
            description="Your data is protected at all times"
            icon="🔐"
          />
        </div>
      </div>

      <About />
      <Footer />
    </div>
  );
}
