import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Appointment } from './models/Appointment.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB connected successfully");
    
    // Check for appointments
    const appointments = await Appointment.find({});
    console.log(`Found ${appointments.length} appointments in the database`);
    
    if (appointments.length > 0) {
      console.log("Sample appointment:", appointments[0]);
      
      // Use the actual teacher ID from the appointment
      const teacherId = appointments[0].teacherId;
      console.log(`Using teacher ID: ${teacherId}`);
      
      // Check for teacher appointments
      const teacherAppointments = await Appointment.find({ teacherId });
      console.log(`Found ${teacherAppointments.length} appointments for teacher ${teacherId}`);
      
      if (teacherAppointments.length > 0) {
        console.log("Sample teacher appointment:", teacherAppointments[0]);
      }
      
      // Check for approved appointments
      const approvedAppointments = await Appointment.find({ status: "approved" });
      console.log(`Found ${approvedAppointments.length} approved appointments`);
      
      if (approvedAppointments.length > 0) {
        console.log("Sample approved appointment:", approvedAppointments[0]);
      }
      
      // Update the appointment status to approved
      console.log("Updating appointment status to approved...");
      await Appointment.findByIdAndUpdate(appointments[0]._id, { status: "approved" });
      console.log("Appointment status updated to approved");
      
      // Check again for approved appointments
      const updatedApprovedAppointments = await Appointment.find({ status: "approved" });
      console.log(`Found ${updatedApprovedAppointments.length} approved appointments after update`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

connectDB(); 