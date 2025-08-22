import React, { useState } from 'react';
import { Mail, Phone, MessageCircle, Clock, MapPin, Send } from 'lucide-react';

const CustomerSupport = () => {
  const [supportForm, setSupportForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSupportForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send the support request
    alert('Thank you for your message. We will get back to you soon!');
    setSupportForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Customer Support
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          We're here to help! Get in touch with our support team for any questions, 
          issues, or feedback about ViOLA.
        </p>
      </div>

      {/* Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Email Support */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
          <p className="text-gray-600 mb-4">
            Send us an email and we'll respond within 24 hours
          </p>
          <a
            href="mailto:support@viola.ac.in"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            support@viola.ac.in
          </a>
        </div>

        {/* Phone Support */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Phone className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h3>
          <p className="text-gray-600 mb-4">
            Call us during business hours for immediate assistance
          </p>
          <a
            href="tel:+91-44-3993-9999"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            +91-44-3993-9999
          </a>
        </div>

        {/* In-App Chat */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="mx-auto h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">In-App Chat</h3>
          <p className="text-gray-600 mb-4">
            Chat with our support team directly in the app
          </p>
          <a
            href="/chat"
            className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            Start Chat
          </a>
        </div>
      </div>

      {/* Support Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send us a Message</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={supportForm.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={supportForm.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              name="subject"
              value={supportForm.subject}
              onChange={handleInputChange}
              required
              placeholder="Brief description of your issue"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              name="message"
              value={supportForm.message}
              onChange={handleInputChange}
              required
              rows="5"
              placeholder="Please describe your issue or question in detail..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Send className="h-4 w-4" />
              <span>Send Message</span>
            </button>
          </div>
        </form>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Hours */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
          </div>
          <div className="space-y-2 text-gray-600">
            <p><span className="font-medium">Monday - Friday:</span> 9:00 AM - 6:00 PM</p>
            <p><span className="font-medium">Saturday:</span> 10:00 AM - 4:00 PM</p>
            <p><span className="font-medium">Sunday:</span> Closed</p>
            <p className="text-sm text-gray-500 mt-2">
              * Emergency support available 24/7 for critical issues
            </p>
          </div>
        </div>

        {/* Office Location */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <MapPin className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Office Location</h3>
          </div>
          <div className="text-gray-600">
            <p className="font-medium">VIT University</p>
            <p>Vellore Campus</p>
            <p>Vellore - 632014</p>
            <p>Tamil Nadu, India</p>
            <p className="text-sm text-gray-500 mt-2">
              * Support team is located in the IT Department
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              How do I report a safety concern?
            </h3>
            <p className="text-gray-600">
              If you have a safety concern, please contact us immediately via phone or email. 
              We take all safety reports seriously and will respond within 2 hours.
            </p>
          </div>
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              What if I need to cancel a ride I posted?
            </h3>
            <p className="text-gray-600">
              You can deactivate your ride post at any time from your profile page. 
              This will remove it from the active rides list.
            </p>
          </div>
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              How do I verify my VIT student status?
            </h3>
            <p className="text-gray-600">
              Your student status is automatically verified when you sign in with your 
              @vit.ac.in email address through Google OAuth.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Can I use ViOLA if I'm not a VIT student?
            </h3>
            <p className="text-gray-600">
              No, ViOLA is exclusively for VIT students. Only email addresses ending 
              with @vit.ac.in are allowed to register and use the platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupport;
