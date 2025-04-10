import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import {
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Copy,
  Edit,
  ExternalLink,
  FileText,
  History,
  Info,
  Key,
  Link,
  LogIn,
  MessageSquare,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  Smartphone,
  Trash2,
  User,
  Users,
  Video,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import customFetch from "../utils/customFetch";

const VideoCall = () => {
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingRooms, setExistingRooms] = useState([]);
  const [linkInput, setLinkInput] = useState("");
  const [customRoomId, setCustomRoomId] = useState("");
  const [activeTab, setActiveTab] = useState("create");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roomIdFromUrl = params.get("roomId");
    if (roomIdFromUrl && !isTeacher) {
      setRoomId(roomIdFromUrl);
      // Auto join room if we have user info
      if (userName && userId) {
        joinRoom();
      }
    }
  }, [location.search, userName, userId]);

  const extractRoomIdFromLink = (link) => {
    try {
      const url = new URL(link);
      const params = new URLSearchParams(url.search);
      return params.get("roomId");
    } catch (error) {
      console.error("Invalid URL:", error);
      return null;
    }
  };

  const handleLinkInput = (e) => {
    setLinkInput(e.target.value);
    const extractedRoomId = extractRoomIdFromLink(e.target.value);
    if (extractedRoomId) {
      setRoomId(extractedRoomId);
    }
  };

  const handleLinkSubmit = (e) => {
    e.preventDefault();
    const extractedRoomId = extractRoomIdFromLink(linkInput);
    if (extractedRoomId) {
      setRoomId(extractedRoomId);
      joinRoom();
    } else {
      toast.error(
        "Invalid video call link. Please check the link and try again."
      );
    }
  };

  useEffect(() => {
    const loadRoomHistory = () => {
      const savedRooms = localStorage.getItem("roomHistory");
      if (savedRooms) {
        try {
          const parsedRooms = JSON.parse(savedRooms);
          setExistingRooms(parsedRooms);
        } catch (error) {
          console.error("Error loading room history:", error);
        }
      }
    };

    loadRoomHistory();
  }, []);

  useEffect(() => {
    if (existingRooms.length > 0) {
      localStorage.setItem("roomHistory", JSON.stringify(existingRooms));
    }
  }, [existingRooms]);

  const getUserInfo = async () => {
    try {
      const { data } = await customFetch.get("/auth/check-auth");
      console.log("Auth response data:", data);

      if (data.user) {
        const userInfo = {
          role: data.user.role,
          id: data.user.id || data.user.userId,
          name:
            data.user.name ||
            data.user.firstName ||
            data.user.username ||
            "Unknown User",
        };

        console.log("Processed user info:", userInfo);

        setUserRole(userInfo.role);
        setUserId(userInfo.id);
        setUserName(userInfo.name);
        setIsTeacher(userInfo.role === "teacher");

        console.log("Updated state:", {
          userName,
          userRole,
          userId,
          isTeacher,
        });
      } else {
        console.log("No user data in response");
        toast.error("Please log in to access video calls");
        navigate("/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      if (error.response?.status === 401) {
        toast.error("Please log in to access video calls");
        navigate("/login");
      } else {
        toast.error("Failed to get user information");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateRoomId = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  const createNewRoom = () => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    saveNewRoom(newRoomId);
  };

  const createCustomRoom = () => {
    if (!customRoomId) {
      toast.error("Please enter a custom room ID");
      return;
    }

    if (customRoomId.length > 6) {
      toast.error("Room ID must be 6 characters or less");
      return;
    }

    if (existingRooms.some((room) => room.roomId === customRoomId)) {
      toast.error("This room ID already exists");
      return;
    }

    setRoomId(customRoomId);
    saveNewRoom(customRoomId);
    setCustomRoomId("");
  };

  const saveNewRoom = (newRoomId) => {
    const newRoom = {
      roomId: newRoomId,
      createdAt: new Date().toISOString(),
      createdBy: userName,
      userId: userId,
    };
    setExistingRooms((prevRooms) => [newRoom, ...prevRooms]);
    toast.success("New room created! Share the room ID with your student.");
  };

  const deleteRoom = (roomIdToDelete) => {
    setExistingRooms((prevRooms) =>
      prevRooms.filter((room) => room.roomId !== roomIdToDelete)
    );

    const updatedRooms = existingRooms.filter(
      (room) => room.roomId !== roomIdToDelete
    );
    localStorage.setItem("roomHistory", JSON.stringify(updatedRooms));
    toast.success("Room removed from history");
  };

  const clearHistory = () => {
    setExistingRooms([]);
    localStorage.removeItem("roomHistory");
    toast.success("Room history cleared");
  };

  const joinRoom = async () => {
    console.log("Joining room with user info:", {
      userName,
      userId,
      userRole,
      roomId,
    });

    if (!roomId) {
      toast.error("Please enter a room ID");
      return;
    }

    if (!userName || userName === "Unknown User") {
      console.error("Missing user name:", { userName, userRole, userId });
      toast.error(
        "Unable to get your name. Please try logging out and logging in again."
      );
      return;
    }

    try {
      const appID = 1961759842;
      const serverSecret = "3e460baa7031e40f8404a64ddc0959b5";

      const safeUserId = userId || Date.now().toString();
      const safeUserName = userName || `User-${safeUserId}`;

      console.log("Generating token with:", {
        roomId,
        userId: safeUserId,
        userName: safeUserName,
      });

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId,
        safeUserId,
        safeUserName
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zp.joinRoom({
        container: document.querySelector("#zego-container"),
        sharedLinks: [
          {
            name: "Copy link",
            url: window.location.origin + "/video-call?roomId=" + roomId,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        showScreenSharingButton: true,
        showUserList: true,
        showPreJoinView: true,
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: true,
        onJoinRoom: () => {
          console.log("Successfully joined room");
          setIsJoined(true);
        },
      });
    } catch (error) {
      console.error("Join room error:", error);
      toast.error(error.message || "Failed to join video call");
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  useEffect(() => {
    console.log("userName updated:", userName);
  }, [userName]);

  const copyRoomLink = () => {
    const link = `${window.location.origin}/video-call?roomId=${roomId}`;
    navigator.clipboard
      .writeText(link)
      .then(() => toast.success("Link copied to clipboard!"))
      .catch(() => toast.error("Failed to copy link"));
  };

  return (
    <div className="min-h-screen bg-gray-900 py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-teal-700 mb-2 flex items-center justify-center">
            <Video className="h-10 w-10 mr-3 text-purple-300" />
            Virtual Classroom
          </h1>
          <p className="text-teal-700 text-lg max-w-2xl mx-auto">
            Connect with your {isTeacher ? "students" : "teacher"} through
            high-quality video calls for personalized learning experiences
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-700"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-12 gap-8">
            {/* Left sidebar with illustration - only show when not in a call */}
            {!isJoined && (
              <div className="md:col-span-5 lg:col-span-4 hidden md:block">
                <div className="bg-gray-600 rounded-2xl  shadow-xl overflow-hidden h-full">
                  <div className="p-4 ">
                    <h3 className="text-xl text-black font-semibold text-gray-800 mb-4">
                      {isTeacher ? "Teach Anywhere" : "Learn Anywhere"}
                    </h3>
                    <div className="space-y-4  text-black">
                      <div className="flex items-start text-black">
                        <CheckCircle className="h-5 w-5 text-teal-900 mr-3 flex-shrink-0" />
                        <p>HD video and crystal-clear audio</p>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-teal-900 mr-3 flex-shrink-0" />
                        <p>Screen sharing for presentations</p>
                      </div>
                      <div className="flex items-start">
                        <Shield className="h-5 w-5 text-teal-900 mr-3 flex-shrink-0" />
                        <p>Secure, private connections</p>
                      </div>
                      <div className="flex items-start">
                        <Smartphone className="h-5 w-5 text-teal-900 mr-3 flex-shrink-0" />
                        <p>Works on all devices</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <img
                      src="https://images.pexels.com/photos/4145153/pexels-photo-4145153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                      alt="Online learning"
                      className="rounded-lg shadow-md w-full h-64 object-cover"
                    />
                  </div>
                  <div className="bg-gray-400 p-3">
                    <div className="text-sm text-black">
                      <p className="font-medium text-teal-900 mb-2 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Current User:
                      </p>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-purple-700 font-bold mr-3">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{userName}</p>
                          <p className="text-xs text-teal-900 capitalize">
                            {userRole}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main content area */}
            <div
              className={`${
                isJoined ? "md:col-span-12" : "md:col-span-7 lg:col-span-8"
              }`}
            >
              {!isJoined ? (
                <div className="bg-gray-600 rounded-2xl shadow-xl overflow-hidden">
                  {isTeacher ? (
                    <div className="p-6">
                      {/* Teacher Interface */}
                      <div className="border-b border-gray-200 mb-6">
                        <nav className="flex space-x-8">
                          <button
                            onClick={() => setActiveTab("create")}
                            className={`pb-4 px-1 font-medium text-sm flex items-center ${
                              activeTab === "create"
                                ? "border-b-2 border-purple-500 text-purple-600"
                                : "text-gray-500 hover:text-black"
                            }`}
                          >
                            <Plus className="h-5 w-5 mr-2" />
                            Create Room
                          </button>
                          <button
                            onClick={() => setActiveTab("join")}
                            className={`pb-4 px-1 font-medium text-sm flex items-center ${
                              activeTab === "join"
                                ? "border-b-2 border-purple-500 text-purple-600"
                                : "text-gray-500 hover:text-black"
                            }`}
                          >
                            <Users className="h-5 w-5 mr-2" />
                            Join Room
                          </button>
                          <button
                            onClick={() => setActiveTab("history")}
                            className={`pb-4 px-1 font-medium text-sm flex items-center ${
                              activeTab === "history"
                                ? "border-b-2 border-purple-500 text-purple-600"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            <History className="h-5 w-5 mr-2" />
                            Room History
                          </button>
                        </nav>
                      </div>

                      {activeTab === "create" && (
                        <div className="space-y-6">
                          <div className="bg-gray-400 rounded-lg p-6 border border-purple-100">
                            <h3 className="text-lg font-medium text-purple-800 mb-4 flex items-center">
                              <Zap className="h-5 w-5 mr-2" />
                              Generate Random Room
                            </h3>
                            <p className="text-sm text-zinc-900 mb-4">
                              Create a room with a randomly generated ID that
                              you can share with your student.
                            </p>
                            <button
                              className="w-full bg-gradient-to-r from-yellow-600 to-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                              onClick={createNewRoom}
                            >
                              <RefreshCw className="h-5 w-5 mr-2" />
                              Generate Random Room ID
                            </button>
                          </div>

                          <div className="bg-gray-400 rounded-lg p-6 border border-blue-100">
                            <h3 className="text-lg font-medium text-blue-800 mb-4 flex items-center">
                              <Edit className="h-5 w-5 mr-2" />
                              Create Custom Room
                            </h3>
                            <p className="text-sm text-zinc-900 mb-4">
                              Create a room with your own custom ID (maximum 6
                              characters).
                            </p>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                placeholder="Enter custom room ID"
                                value={customRoomId}
                                onChange={(e) =>
                                  setCustomRoomId(e.target.value)
                                }
                                maxLength={6}
                              />
                              <button
                                className="bg-gradient-to-r from-purple-600 to-zinc-600 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                onClick={createCustomRoom}
                                disabled={!customRoomId}
                              >
                                <Check className="h-5 w-5 mr-2" />
                                Create
                              </button>
                            </div>
                          </div>

                          {roomId && (
                            <div className="bg-gray-500 rounded-lg p-6 border border-green-100">
                              <h3 className="text-lg font-medium text-green-800 mb-4 flex items-center">
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Room Created Successfully!
                              </h3>
                              <div className="mb-4">
                                <div className="flex items-center justify-between bg-zinc-500 p-3 rounded-lg border border-green-200 mb-2">
                                  <div className="font-medium text-gray-900 flex items-center">
                                    <Key className="h-4 w-4 mr-2 text-green-600" />
                                    Room ID:{" "}
                                    <span className="text-green-600 ml-1">
                                      {roomId}
                                    </span>
                                  </div>
                                  <button
                                    onClick={copyRoomLink}
                                    className="text-green-600 hover:text-green-800 transition-colors duration-200"
                                    title="Copy room link"
                                  >
                                    <Copy className="h-5 w-5" />
                                  </button>
                                </div>
                                <div className="bg-zinc-500 p-3 rounded-lg border border-green-200">
                                  <p className="font-medium text-gray-800 mb-1 flex items-center">
                                    <Link className="h-4 w-4 mr-2 text-green-600" />
                                    Share Link:
                                  </p>
                                  <div className="flex items-center">
                                    <input
                                      type="text"
                                      className="flex-grow p-2 bg-gray-50 rounded text-sm text-gray-600 border border-gray-200"
                                      value={`${window.location.origin}/video-call?roomId=${roomId}`}
                                      readOnly
                                    />
                                    <button
                                      onClick={copyRoomLink}
                                      className="ml-2 bg-green-100 p-2 rounded text-green-600 hover:bg-green-200 transition-colors duration-200"
                                    >
                                      <Copy className="h-5 w-5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <button
                                  className="bg-gray-400 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-300 transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                                  onClick={joinRoom}
                                >
                                  <Video className="h-5 w-5 mr-2" />
                                  Join Room Now
                                </button>
                                <button
                                  className="text-gray-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 flex items-center"
                                  onClick={() => setRoomId("")}
                                >
                                  <X className="h-5 w-5 mr-2" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === "join" && (
                        <div className="bg-gray-400 rounded-lg p-6 border border-blue-100">
                          <h3 className="text-lg font-medium text-blue-800 mb-4 flex items-center">
                            <LogIn className="h-5 w-5 mr-2" />
                            Join Existing Room
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Enter a room ID to join an existing video call
                            session.
                          </p>
                          <div className="mb-4">
                            <input
                              type="text"
                              className="w-full p-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all duration-200"
                              placeholder="Enter room ID"
                              value={roomId}
                              onChange={(e) => setRoomId(e.target.value)}
                              maxLength={6}
                            />
                          </div>
                          <button
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            onClick={joinRoom}
                            disabled={!roomId}
                          >
                            <Users className="h-5 w-5 mr-2" />
                            Join Room
                          </button>
                        </div>
                      )}

                      {activeTab === "history" && (
                        <div className="bg-gray-400 rounded-lg p-6 border border-gray-200">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-800 flex items-center">
                              <Clock className="h-5 w-5 mr-2" />
                              Room History
                            </h3>
                            {existingRooms.length > 0 && (
                              <button
                                className="text-red-500 hover:text-red-700 text-sm flex items-center"
                                onClick={clearHistory}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Clear All
                              </button>
                            )}
                          </div>

                          {existingRooms.length > 0 ? (
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                              {existingRooms.map((room) => (
                                <div
                                  key={room.roomId}
                                  className="bg-gray-500 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="flex items-center">
                                        <span className="font-medium text-gray-800">
                                          Room ID:{" "}
                                        </span>
                                        <span className="ml-2 bg-purple-100 text-black px-2 py-0.5 rounded text-sm font-mono">
                                          {room.roomId}
                                        </span>
                                      </div>
                                      <p className="text-sm text-black mt-1 flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        Created:{" "}
                                        {new Date(
                                          room.createdAt
                                        ).toLocaleString()}
                                      </p>
                                      {room.createdBy && (
                                        <p className="text-sm text-black flex items-center">
                                          <User className="h-4 w-4 mr-1" />
                                          Created by: {room.createdBy}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        className="bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition-colors duration-200 flex items-center"
                                        onClick={() => {
                                          setRoomId(room.roomId);
                                          setActiveTab("join");
                                        }}
                                      >
                                        <ExternalLink className="h-4 w-4 mr-1" />
                                        Select
                                      </button>
                                      <button
                                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors duration-200"
                                        onClick={() => deleteRoom(room.roomId)}
                                      >
                                        <Trash2 className="h-5 w-5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <FileText className="h-12 w-12 mx-auto text-gray-400" />
                              <p className="mt-4 text-gray-800">
                                No room history found
                              </p>
                              <p className="text-sm text-gray-800">
                                Create a new room to get started
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Student Interface
                    <div className="p-6">
                      <div className="mb-6">
                        <div className="flex items-center mb-4">
                          <img
                            src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                            alt="Student learning"
                            className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-purple-200"
                          />
                          <div>
                            <h2 className="text-xl font-semibold text-gray-800">
                              Welcome, {userName}
                            </h2>
                            <p className="text-gray-900">
                              Join your teacher's virtual classroom
                            </p>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-gray-500 to-zinc-600 rounded-lg p-6 border border-purple-100 mb-6">
                          <h3 className="text-lg font-medium text-purple-800 mb-4 flex items-center">
                            <Info className="h-5 w-5 mr-2" />
                            Join Video Call
                          </h3>
                          <p className="text-sm text-gray-800 mb-4">
                            Paste the video call link shared by your teacher to
                            join the session.
                          </p>
                          <form
                            onSubmit={handleLinkSubmit}
                            className="space-y-4"
                          >
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Link className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                className="block w-full  pl-10 pr-3 py-3 border border-gray-900 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-purple-500 transition-all duration-200"
                                placeholder="HEY..! BUDDY PUT THE LINK HERE"
                                value={linkInput}
                                onChange={handleLinkInput}
                              />
                            </div>
                            <button
                              type="submit"
                              className="w-full bg-gradient-to-r from-yellow-600 to-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:from-lime-500 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                              disabled={!roomId}
                            >
                              <Video className="h-5 w-5 mr-2" />
                              Join Video Call
                            </button>
                          </form>
                        </div>

                        {existingRooms.length > 0 && (
                          <div className="bg-gray-500 rounded-lg p-6 border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium text-gray-800 flex items-center">
                                <History className="h-5 w-5 mr-2" />
                                Recent Sessions
                              </h3>
                              <button
                                className="text-red-500 hover:text-red-700 text-sm flex items-center"
                                onClick={clearHistory}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Clear
                              </button>
                            </div>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                              {existingRooms.map((room) => (
                                <div
                                  key={room.roomId}
                                  className="bg-gray-400 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <div className="flex items-center">
                                        <span className="font-medium text-gray-900">
                                          Room ID:{" "}
                                        </span>
                                        <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-sm font-mono">
                                          {room.roomId}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-900 mt-1 flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        {new Date(
                                          room.createdAt
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        className="bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition-colors duration-200 flex items-center"
                                        onClick={() => {
                                          setRoomId(room.roomId);
                                          joinRoom();
                                        }}
                                      >
                                        <Video className="h-4 w-4 mr-1" />
                                        Join
                                      </button>
                                      <button
                                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors duration-200"
                                        onClick={() => deleteRoom(room.roomId)}
                                      >
                                        <Trash2 className="h-5 w-5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold flex items-center">
                        <Video className="h-5 w-5 mr-2" />
                        Video Call Session
                      </h3>
                      <div className="flex items-center">
                        <div className="h-3 w-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                        <span className="text-sm flex items-center">
                          <Zap className="h-4 w-4 mr-1" />
                          Live
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 bg-gray-100 border-b flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1 text-gray-600" />
                      <span className="text-sm text-gray-600">
                        Room ID:{" "}
                        <span className="font-mono font-medium">{roomId}</span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                  <div id="zego-container" className="w-full h-[600px]" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
