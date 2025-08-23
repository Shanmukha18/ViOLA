import React, { useState } from 'react';
import { Mail, Send } from 'lucide-react';

const CustomerSupport = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement email sending functionality
    console.log('Email form submitted:', formData);
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2C3333] via-[#395B64] to-[#A5C9CA] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Customer Support
          </h1>
          <p className="text-[#E7F6F2] text-lg">
            We're here to help! Send us a message and we'll get back to you soon.
          </p>
        </div>

        {/* Email Form */}
        <div className="gradient-card rounded-lg p-8 hover-lift">
          <div className="flex items-center mb-6">
            <Mail className="h-8 w-8 text-[#395B64] mr-3" />
            <h2 className="text-2xl font-semibold text-[#2C3333]">
              Contact Us
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#2C3333] mb-2">
                Your Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="input-focus w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#395B64] focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#2C3333] mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="input-focus w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#395B64] focus:border-transparent"
                placeholder="Enter your email address"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-[#2C3333] mb-2">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="input-focus w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#395B64] focus:border-transparent"
                placeholder="Brief description of your issue"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-[#2C3333] mb-2">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows="6"
                className="input-focus w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#395B64] focus:border-transparent resize-none"
                placeholder="Please describe your issue or question in detail..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="btn-primary text-white px-8 py-3 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300 flex items-center cursor-pointer"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </button>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-[#E7F6F2] text-sm">
            We typically respond within 24 hours during business days.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupport;
