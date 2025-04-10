import { StatusCodes } from "http-status-codes";
import VideoCall from "../models/VideoCall.js";
import { Appointment } from "../models/Appointment.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../errors/index.js";

// Generate a unique room ID
const generateRoomId = (appointmentId, teacherId, studentId) => {
  return `room-${appointmentId}_${teacherId}_${studentId}`;
};

// Create a new video call session
export const createVideoCall = async (req, res) => {
  const { appointmentId } = req.body;
  const { userId, role } = req.user;

  console.log("Creating video call with:", { appointmentId, userId, role });

  // Check if user is a teacher
  if (role !== "teacher") {
    throw new UnauthorizedError("Only teachers can create video calls");
  }

  // Find the appointment
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new NotFoundError("Appointment not found");
  }

  console.log("Found appointment:", appointment);

  // Verify if the appointment belongs to the teacher
  if (appointment.teacherId.toString() !== userId) {
    throw new UnauthorizedError("You are not authorized to create video calls for this appointment");
  }

  // Verify if the appointment is accepted
  if (appointment.status !== "approved") {
    throw new BadRequestError("Appointment must be approved to start video call");
  }

  // Check if there's already an active video call for this appointment
  const existingCall = await VideoCall.findOne({
    appointment: appointmentId,
    status: { $in: ["pending", "active"] },
  });

  if (existingCall) {
    console.log("Found existing call:", existingCall);
    return res.status(StatusCodes.OK).json({
      success: true,
      videoCall: existingCall,
    });
  }

  // Create new video call session
  const roomId = generateRoomId(
    appointmentId,
    appointment.teacherId.toString(),
    appointment.studentId.toString()
  );

  // Use the appointment's date and time
  const scheduledDate = appointment.date;
  const scheduledTime = appointment.startTime;

  const videoCall = await VideoCall.create({
    roomId,
    appointment: appointmentId,
    teacher: appointment.teacherId,
    student: appointment.studentId,
    status: "pending",
    canJoin: false, // Initially set to false
    scheduledDate,
    scheduledTime,
  });

  console.log("Created video call:", videoCall);

  res.status(StatusCodes.CREATED).json({
    success: true,
    videoCall,
  });
};

// Toggle canJoin status (only for teachers)
export const toggleCanJoin = async (req, res) => {
  const { roomId } = req.params;
  const { userId, role } = req.user;

  console.log("Toggle join request:", { roomId, userId, role });

  try {
    if (role !== "teacher") {
      console.error("Unauthorized: User is not a teacher", { role });
      throw new UnauthorizedError("Only teachers can toggle join status");
    }

    console.log("Finding video call with roomId:", roomId);
    const videoCall = await VideoCall.findOne({ roomId });
    
    if (!videoCall) {
      console.error("Video call not found:", roomId);
      throw new NotFoundError("Video call session not found");
    }
    
    console.log("Found video call:", {
      id: videoCall._id,
      teacher: videoCall.teacher,
      userId,
      currentCanJoin: videoCall.canJoin
    });

    if (videoCall.teacher.toString() !== userId) {
      console.error("Unauthorized: User is not the teacher of this call", {
        callTeacher: videoCall.teacher.toString(),
        userId
      });
      throw new UnauthorizedError("You are not authorized to modify this video call");
    }

    videoCall.canJoin = !videoCall.canJoin;
    console.log("Updating canJoin to:", videoCall.canJoin);
    
    await videoCall.save();
    console.log("Video call updated successfully");

    res.status(StatusCodes.OK).json({
      success: true,
      videoCall,
    });
  } catch (error) {
    console.error("Error in toggleCanJoin:", error);
    throw error;
  }
};

// Join video call
export const joinVideoCall = async (req, res) => {
  const { roomId } = req.params;
  const { userId, role } = req.user;

  console.log("Join video call request:", { roomId, userId, role });

  try {
    // Try to find the video call by roomId
    console.log("Finding video call with roomId:", roomId);
    let videoCall = await VideoCall.findOne({ roomId });
    
    if (!videoCall) {
      console.error("Video call not found:", roomId);
      throw new NotFoundError("Video call session not found");
    }
    
    console.log("Found video call:", {
      id: videoCall._id,
      roomId: videoCall.roomId,
      teacher: videoCall.teacher,
      student: videoCall.student,
      userId,
      canJoin: videoCall.canJoin,
      status: videoCall.status
    });

    // Verify if the user is either the teacher or student
    if (
      videoCall.teacher.toString() !== userId &&
      videoCall.student.toString() !== userId
    ) {
      console.error("Unauthorized: User is not the teacher or student of this call", {
        callTeacher: videoCall.teacher.toString(),
        callStudent: videoCall.student.toString(),
        userId
      });
      throw new UnauthorizedError("You are not authorized to join this video call");
    }

    // Check if students can join
    if (videoCall.student.toString() === userId && !videoCall.canJoin) {
      console.error("Student cannot join: canJoin is false", {
        userId,
        canJoin: videoCall.canJoin
      });
      throw new BadRequestError("Teacher has not enabled joining yet");
    }

    // Update video call status to active and set start time
    if (videoCall.status === "pending") {
      console.log("Updating video call status to active");
      videoCall.status = "active";
      videoCall.startTime = new Date();
      await videoCall.save();
      console.log("Video call status updated successfully");
    }

    console.log("User successfully joined video call");
    res.status(StatusCodes.OK).json({
      success: true,
      videoCall,
    });
  } catch (error) {
    console.error("Error in joinVideoCall:", error);
    throw error;
  }
};

// End video call
export const endVideoCall = async (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.user;

  console.log("End video call request:", { roomId, userId });

  try {
    console.log("Finding video call with roomId:", roomId);
    const videoCall = await VideoCall.findOne({ roomId });
    
    if (!videoCall) {
      console.error("Video call not found:", roomId);
      throw new NotFoundError("Video call session not found");
    }
    
    console.log("Found video call:", {
      id: videoCall._id,
      roomId: videoCall.roomId,
      teacher: videoCall.teacher,
      student: videoCall.student,
      userId,
      status: videoCall.status
    });

    // Verify if the user is either the teacher or student
    if (
      videoCall.teacher.toString() !== userId &&
      videoCall.student.toString() !== userId
    ) {
      console.error("Unauthorized: User is not the teacher or student of this call", {
        callTeacher: videoCall.teacher.toString(),
        callStudent: videoCall.student.toString(),
        userId
      });
      throw new UnauthorizedError("You are not authorized to end this video call");
    }

    // Update video call status to ended and calculate duration
    videoCall.status = "ended";
    videoCall.endTime = new Date();
    videoCall.duration = Math.round(
      (videoCall.endTime - videoCall.startTime) / (1000 * 60)
    );
    await videoCall.save();
    console.log("Video call ended successfully");

    res.status(StatusCodes.OK).json({
      success: true,
      videoCall,
    });
  } catch (error) {
    console.error("Error in endVideoCall:", error);
    throw error;
  }
};

// Get video call details
export const getVideoCallDetails = async (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.user;

  console.log("Getting video call details for roomId:", roomId);
  console.log("User ID:", userId);

  try {
    // Try to find the video call by roomId
    console.log("Finding video call with roomId:", roomId);
    let videoCall = await VideoCall.findOne({ roomId });
    
    if (!videoCall) {
      console.error("Video call not found:", roomId);
      throw new NotFoundError("Video call session not found");
    }
    
    console.log("Found video call:", {
      id: videoCall._id,
      roomId: videoCall.roomId,
      teacher: videoCall.teacher,
      student: videoCall.student,
      userId,
      canJoin: videoCall.canJoin,
      status: videoCall.status
    });

    // Verify if the user is either the teacher or student
    if (
      videoCall.teacher.toString() !== userId &&
      videoCall.student.toString() !== userId
    ) {
      console.error("Unauthorized: User is not the teacher or student of this call", {
        callTeacher: videoCall.teacher.toString(),
        callStudent: videoCall.student.toString(),
        userId
      });
      throw new UnauthorizedError("You are not authorized to view this video call");
    }

    console.log("User authorized to view video call");
    res.status(StatusCodes.OK).json({
      success: true,
      videoCall,
    });
  } catch (error) {
    console.error("Error in getVideoCallDetails:", error);
    throw error;
  }
};

// Get all video calls for a teacher
export const getTeacherVideoCalls = async (req, res) => {
  const { userId, role } = req.user;

  console.log("Fetching video calls for teacher:", { userId, role });

  try {
    if (role !== "teacher") {
      console.error("Unauthorized: User is not a teacher", { role });
      throw new UnauthorizedError("Only teachers can fetch their video calls");
    }

    const videoCalls = await VideoCall.find({ teacher: userId })
      .populate('appointment', 'date startTime endTime')
      .populate('student', 'name email')
      .sort({ createdAt: -1 }); // Sort by newest first

    console.log(`Found ${videoCalls.length} video calls for teacher ${userId}`);

    res.status(StatusCodes.OK).json({
      success: true,
      videoCalls,
    });
  } catch (error) {
    console.error("Error in getTeacherVideoCalls:", error);
    throw error;
  }
};
