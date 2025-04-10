import {
  CalendarDays,
  CheckCircle,
  Clock,
  GraduationCap,
  MessageSquare,
  UserCheck,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FeatureCard from "../components/FeatureCard";
import StatCard from "../components/StatCard";
import customFetch from "../utils/customFetch";

export default function About() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await customFetch.get("/auth/check-auth");
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-800 text-gray-200">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center py-20 px-6 bg-gray-800">
        <h1 className="text-5xl font-extrabold mb-4">
          Welcome to Our Platform
        </h1>
        <p className="text-lg max-w-2xl text-gray-300">
          A seamless way to schedule and manage student-teacher interactions.
        </p>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 bg-gray-800">
        <FeatureCard
          icon={<UserCheck className="w-12 h-12 text-yellow-400" />}
          title="User Requests"
          description="Students send appointment requests easily."
        />
        <FeatureCard
          icon={<CalendarDays className="w-12 h-12 text-teal-400" />}
          title="Teacher Schedules"
          description="Teachers manage their time slots."
        />
        <FeatureCard
          icon={<Clock className="w-12 h-12 text-orange-400" />}
          title="Booking System"
          description="Book specific time slots effortlessly."
        />
        <FeatureCard
          icon={<CheckCircle className="w-12 h-12 text-green-400" />}
          title="Confirmations"
          description="Teachers approve and confirm bookings."
        />
      </div>

      {/* Stats Section */}
      <div className="bg-gray-800 py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <StatCard
            icon={<Users className="w-10 h-10 text-yellow-300" />}
            value="500+"
            label="Active Users"
          />
          <StatCard
            icon={<GraduationCap className="w-10 h-10 text-teal-300" />}
            value="50+"
            label="Expert Teachers"
          />
          <StatCard
            icon={<MessageSquare className="w-10 h-10 text-orange-300" />}
            value="1000+"
            label="Appointments"
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center py-20 px-6 bg-gray-800">
        <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6">
          Join our platform today and streamline your scheduling process.
        </p>
        {!user ? (
          <Link to="/login">
            <button className="px-6 py-3 bg-gray-800 hover:bg-gray-400 text-gray-200 shadow-md border border-gray-600 backdrop-blur-md">
              Get Started
            </button>
          </Link>
        ) : (
          <Link
            to={
              user.role === "admin"
                ? "/admin-dashboard"
                : user.role === "teacher"
                ? "/teacher-dashboard"
                : "/search-teacher"
            }
          >
            <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 transition rounded-xl text-gray-200 font-semibold shadow-md">
              {user.role === "admin"
                ? "Manage Teachers"
                : user.role === "teacher"
                ? "Go to Dashboard"
                : "View Teachers"}
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
