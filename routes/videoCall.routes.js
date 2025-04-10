import express from "express";
import {
  createVideoCall,
  joinVideoCall,
  endVideoCall,
  getVideoCallDetails,
  toggleCanJoin,
  getTeacherVideoCalls,
} from "../controllers/videoCallController.js";
import { authenticateUser, requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authenticateUser, requireAuth, createVideoCall);
router.post("/join/:roomId", authenticateUser, requireAuth, joinVideoCall);
router.post("/end/:roomId", authenticateUser, requireAuth, endVideoCall);
router.get("/details/:roomId", authenticateUser, requireAuth, getVideoCallDetails);
router.post("/toggle-join/:roomId", authenticateUser, requireAuth, toggleCanJoin);

// Get all video calls for a teacher
router.get("/teacher/calls", authenticateUser, requireAuth, getTeacherVideoCalls);

export default router; 