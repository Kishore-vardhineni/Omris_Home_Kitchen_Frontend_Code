import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, PhoneCall, Mail, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-col brand-col">
          <h3>Omris Home Kitchen</h3>
          <p>Traditional Taste Made with Love. Home-made Pickles with Pure Ingredients & Authentic Taste.</p>
          <div className="social-icons">
            <a href="#"><Facebook size={20} /></a>
            <a href="https://www.instagram.com/omrishomekichen?utm_source=qr&igsh=cHQ0ZXFzb3NjN200"><Instagram size={20} /></a>
            <a href="#"><PhoneCall size={20} /></a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/veg-pickles">Veg Pickles</Link></li>
            <li><Link to="/non-veg-pickles">Non-Veg Pickles</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Customer Service</h4>
          <ul>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/shipping">Shipping Policy</Link></li>
            <li><Link to="/returns">Returns & Refunds</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact Us</h4>
          <ul className="contact-list">
            <li><MapPin size={16} /> H.No.2-3-84/1/A, Lalitha Nilyam, Quadribagh, Amberpet, Hyderabad, Telangana, Pin - 500013</li>
            <li><PhoneCall size={16} /> +91 7670851967</li>
            <li><Mail size={16} /> omrishomekitchen@gmail.com</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Omris Home Kitchen. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
