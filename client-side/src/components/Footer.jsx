import React from 'react';
import { Mail, Github, Linkedin, Heart, Car } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#2C3333] to-[#395B64] text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-[#A5C9CA]" />
              <span className="text-2xl font-bold text-[#E7F6F2]">ViOLA</span>
            </div>
            <p className="text-[#A5C9CA] text-sm leading-relaxed">
              Your trusted ride-sharing platform exclusively for VIT University students. 
              Connect, share rides, split expenses, and travel together safely.
            </p>
            <p className="text-[#A5C9CA] text-sm leading-relaxed">
              Built with modern web technologies and a focus on user experience, ViOLA connects students who are traveling to
              the same destinations, helping them save money, reduce environmental impact, and build connections within the VIT
              community.
            </p>
          </div>

          {/* About Us Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#E7F6F2]">About Us</h3>
            <div className="space-y-2 text-[#A5C9CA] text-sm">
              <p>
                ViOLA is designed to provide a safe, and cost-effective way 
                for VIT students to share rides and travel together.
              </p>
              <p>    
                Our platform features real-time chat, secure authentication, and a user-friendly interface that makes ride-sharing
                simple and enjoyable.
              </p>
            </div>
          </div>

          {/* Contact & Social Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#E7F6F2]">Contact & Connect</h3>
            
            {/* Contact Email */}
            <div className="flex items-center space-x-2 text-[#A5C9CA] text-sm">
              <Mail className="h-4 w-4 text-[#A5C9CA]" />
              <a 
                href="mailto:shanmukha.thadavarthi@gmail.com"
                className="hover:text-[#E7F6F2] transition-colors cursor-pointer"
              >
                shanmukha.thadavarthi@gmail.com
              </a>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 pt-2">
              <a 
                href="https://github.com/Shanmukha18"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-[#395B64] rounded-full hover:bg-[#2C3333] transition-colors cursor-pointer"
              >
                <Github className="h-5 w-5 text-[#A5C9CA]" />
              </a>
              <a 
                href="https://www.linkedin.com/in/shanmukha-thadavarthi/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-[#395B64] rounded-full hover:bg-[#2C3333] transition-colors cursor-pointer"
              >
                <Linkedin className="h-5 w-5 text-[#A5C9CA]" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#395B64] mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-[#A5C9CA] text-sm">
              © 2024 ViOLA. All rights reserved.
            </div>
            <div className="flex items-center space-x-1 text-[#A5C9CA] text-sm">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-400 fill-current" />
              <span>for VIT students</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
