import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/User.js";

dotenv.config({ path: "../.env" });

const createAdmin = async () => {
  const MONGO_URI = process.env.MONGODB_URL;
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    await mongoose.connection.collections.users?.dropIndexes();

    const existingAdmin = await User.findOne({ email: "admin@admin.com" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    const adminUser = await User.create({
      username: "admin",
      email: "admin@admin.com",
      password: hashedPassword,
      role: "admin",
      isApproved: true,
    });

    console.log("Admin user created successfully:", adminUser);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdmin();
