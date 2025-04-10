import { Loader, Send, Video } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import customFetch from "../utils/customFetch";

const Chat = ({ appointmentId, teacherId, studentId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [appointmentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data } = await customFetch.get(`/messages/${appointmentId}`);
      setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    const tempId = Date.now();

    try {
      const receiverId = currentUser.role === "teacher" ? studentId : teacherId;

      setMessages((prev) => [
        ...prev,
        {
          _id: tempId,
          content: newMessage,
          sender: currentUser.userId,
          senderModel: currentUser.role === "teacher" ? "Teacher" : "User",
          status: "sending",
          createdAt: new Date(),
        },
      ]);

      const { data } = await customFetch.post("/messages/send", {
        receiverId,
        content: newMessage,
        appointmentId,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempId ? { ...data.message, status: "sent" } : msg
        )
      );

      setNewMessage("");

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.message._id ? { ...msg, status: "delivered" } : msg
          )
        );
      }, 2000);
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempId ? { ...msg, status: "failed" } : msg
        )
      );
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white/50 backdrop-blur-sm rounded-lg">
        <Loader className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b bg-gray-500 backdrop-blur-md rounded-t-lg">
        <h3 className="text-lg font-semibold text-black">Messages</h3>
        <p className="text-sm text-black">
          {currentUser.role === "teacher"
            ? "Chat with Student"
            : "Chat with Teacher"}
        </p>
      </div>

      {/* Messages Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-700 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
      >
        {messages.map((message) => {
          const isTeacher = message.senderModel === "Teacher";
          const isSender = message.sender === currentUser.userId;
          const shouldAlignRight =
            (isTeacher && currentUser.role === "teacher") ||
            (!isTeacher && currentUser.role === "user");
          return (
            <div
              key={message._id}
              className={`flex ${
                shouldAlignRight ? "justify-end" : "justify-start"
              } w-full`}
            >
              <div
                className={`flex items-end gap-2 max-w-[80%] ${
                  shouldAlignRight ? "flex-row" : "flex-row-reverse"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white bg-gradient-to-br ${
                    shouldAlignRight
                      ? "from-teal-600 to-indigo-600"
                      : "from-green-500 to-teal-300"
                  }`}
                >
                  {isTeacher ? "T" : "S"}
                </div>
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    shouldAlignRight
                      ? "bg-teal-500 text-white rounded-br-none"
                      : "bg-teal-500 text-gray-900 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div
                    className={`flex items-center justify-between mt-1 space-x-1 text-xs ${
                      shouldAlignRight ? "text-blue-100" : "text-gray-700"
                    }`}
                  >
                    <span>
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t bg-white/50 backdrop-blur-sm rounded-b-lg"
      >
        <div className="flex space-x-3 items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="input flex-1 bg-white text-black h-10"
            disabled={isSending}
          />

          {/* Video Call Button */}

          <Link to="/video-call">
            <button
              type="button"
           
              className="btn btn-secondary btn-sm px-4 bg-gradient-to-r from-blue-600 to-indigo-600 border-none hover:opacity-90"
            >
              <Video className="h-8 w-5 text-white" />
            </button>
          </Link>

          <button
            type="submit"
            className="btn btn-primary btn-sm px-4 bg-gradient-to-r from-green-600 to-yellow-600 border-none hover:opacity-90"
            disabled={isSending || !newMessage.trim()}
          >
            {isSending ? (
              <Loader className="animate-spin h-4 w-4" />
            ) : (
              <Send className="h-8 w-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
