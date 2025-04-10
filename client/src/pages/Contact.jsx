import emailjs from "@emailjs/browser";
import { Mail, MapPin, Phone } from "lucide-react";
import React, { useRef, useState } from "react";
import { toast } from "react-toastify";

const Contact = () => {
  const formRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const serviceId = "service_nkh3h2o";
    const templateId = "template_9j52fmf";
    const publicKey = "H-Pf9nDC3WyS-5kuc";
    const toName = "Theja Ashwin";
    const toEmail = "thejaashwin62@gmail.com";

    const templateParams = {
      from_name: formData.name,
      to_name: toName,
      from_email: formData.email,
      to_email: toEmail,
      subject: formData.subject,
      message: formData.message,
    };

    try {
      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );
      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white pt-20 flex items-center justify-center">
      <div className="max-w-5xl w-full mx-auto px-6 py-12 bg-gray-800 rounded-3xl shadow-lg backdrop-blur-lg border border-gray-700">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-extrabold text-blue-400">
                Contact Us
              </h1>
              <p className="mt-4 text-lg text-gray-300">
                We’d love to hear from you! Send us a message and we’ll get back
                as soon as possible.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center p-6 bg-gray-800 rounded-xl shadow-md">
                <Mail className="h-6 w-6 text-blue-400" />
                <div className="ml-6">
                  <h3 className="text-lg font-semibold">Email</h3>
                  <p className="mt-1 text-gray-300">
                    guhansaminathan2003@gmail.com
                  </p>
                </div>
              </div>

              <div className="flex items-center p-6 bg-gray-800 rounded-xl shadow-md">
                <Phone className="h-6 w-6 text-green-400" />
                <div className="ml-6">
                  <h3 className="text-lg font-semibold">Phone</h3>
                  <p className="mt-1 text-gray-300">+91 7868901457</p>
                </div>
              </div>

              <div className="flex items-center p-6 bg-gray-800 rounded-xl shadow-md">
                <MapPin className="h-6 w-6 text-purple-400" />
                <div className="ml-6">
                  <h3 className="text-lg font-semibold">Address</h3>
                  <p className="mt-1 text-gray-300">
                    Thanjavur, Tamil Nadu, India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-800 rounded-2xl p-8 shadow-md">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/50"
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/50"
                required
              />
              <input
                type="text"
                placeholder="Subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/50"
                required
              />
              <textarea
                placeholder="Your Message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/50 h-32"
                required
              ></textarea>
              <button
                type="submit"
                className="w-full px-6 py-3 rounded-lg bg-blue-800 hover:bg-blue-500 text-white font-medium shadow-md transition-transform transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
