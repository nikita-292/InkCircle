import React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ChevronUp,
} from "lucide-react";
import { TfiBook } from 'react-icons/tfi';
import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className="z-10 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-4 px-4  transition-colors duration-300">
  <div className="max-w-7xl mx-auto grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

        {/* Branding */}
        <div className="text-center sm:text-left">
  <h2 className="text-3xl font-extrabold flex items-center justify-center sm:justify-start gap-2">
    <TfiBook className="text-4xl text-green-600" />
    <span className="text-green-600">Ink</span>
    <span className="text-blue-600">Circle</span>
  </h2>
  <p className="mt-2 text-sm">
    Your ultimate platform for reading, adding, saving books all in one.
  </p>
</div>


        {/* Contact */}
        <div className="text-center sm:text-left">
          <h3 className="text-xl font-semibold mb-2">Contact Us</h3>
          <p className="text-sm">📧 support@inkcircle.com</p>
          <p className="text-sm">📞 +880 1234-567890</p>
          <p className="text-sm mt-1">🏢 123 University Ave, Campus Center</p>
        </div>

        {/* Legal */}
        <div className="text-center sm:text-left">
          <h3 className="text-xl font-semibold mb-2">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/terms" className="hover:text-primary transition-colors duration-200">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/Privacy" className="hover:text-primary transition-colors duration-200">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div className="text-center sm:text-left">
          <h3 className="text-xl font-semibold mb-2">Follow Us</h3>
          <div className="flex justify-center sm:justify-start space-x-4 mt-3 text-xl">
            <a href="#" className="hover:text-white text-gray-300">
              <Facebook size={20} />
            </a>
            <a href="#" className="hover:text-white text-gray-300">
              <Twitter size={20} />
            </a>
            <a href="#" className="hover:text-white text-gray-300">
              <Instagram size={20} />
            </a>
            <a href="#" className="hover:text-white text-gray-300">
              <Linkedin size={20} />
            </a>
          </div>
          
        </div>
        
      </div>
      {/* Bottom copyright */}
      <div className="mt-6 border-t border-blue-800 pt-4 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} InkCircle. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
