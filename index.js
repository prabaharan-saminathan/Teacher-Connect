import cloudinary from "cloudinary";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import http from "http";
import errorHandlerMiddleware from "./middleware/errorHandlerMiddleware.js";
import adminRoutes from "./routes/admin.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import userRoutes from "./routes/user.routes.js";
import videoCallRoutes from "./routes/videoCall.routes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production"
      ? process.env.CLIENT_URL
      : ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join video call room
  socket.on("join-room", (roomId, userId, role) => {
    console.log(`User ${userId} (${role}) joining room ${roomId}`);
    socket.join(roomId);
    
    // Store the role information with the socket
    socket.userId = userId;
    socket.role = role;
    
    // Notify other users in the room that a new user has joined
    socket.to(roomId).emit("user-joined", userId, role);
    
    // Notify the joining user about existing users in the room
    const room = io.sockets.adapter.rooms.get(roomId);
    if (room) {
      const users = Array.from(room).filter(id => id !== socket.id);
      console.log(`Existing users in room ${roomId}:`, users);
      
      // Get the sockets for the existing users
      const existingSockets = Array.from(room)
        .filter(id => id !== socket.id)
        .map(id => io.sockets.sockets.get(id))
        .filter(s => s); // Filter out any undefined sockets
      
      // Emit to the joining user with the correct role information
      existingSockets.forEach(existingSocket => {
        if (existingSocket.userId && existingSocket.role) {
          console.log(`Notifying about existing user: ${existingSocket.userId} (${existingSocket.role})`);
          socket.emit("user-joined", existingSocket.userId, existingSocket.role);
        }
      });
    }
  });

  // Handle WebRTC offer
  socket.on("offer", (offer, targetUserId) => {
    console.log(`Offer from ${socket.id} to ${targetUserId}`);
    socket.to(targetUserId).emit("offer", offer, socket.id);
  });

  // Handle WebRTC answer
  socket.on("answer", (answer, targetUserId) => {
    console.log(`Answer from ${socket.id} to ${targetUserId}`);
    socket.to(targetUserId).emit("answer", answer);
  });

  // Handle ICE candidate
  socket.on("ice-candidate", (candidate, targetUserId) => {
    console.log(`ICE candidate from ${socket.id} to ${targetUserId}`);
    socket.to(targetUserId).emit("ice-candidate", candidate);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL
        : "http://localhost:5173",
    credentials: true,
  })
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("MongoDB connection error: ", error);
  }
};

if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/teacher", teacherRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/video-call", videoCallRoutes);

if (process.env.NODE_ENV === "production") {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  app.use(express.static(path.resolve(__dirname, "./public")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "./public", "index.html"));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

app.use("*", (req, res) => {
  res.status(404).json({ msg: "not found" });
});

app.use(errorHandlerMiddleware);

// Export the app before starting the server
export default app;

// Only start the server if this file is run directly
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
}
