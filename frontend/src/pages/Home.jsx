import React from 'react';
import { Navigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import PickleVarieties from '../components/PickleVarieties';
import AboutSection from '../components/AboutSection';
import TestimonialSection from '../components/TestimonialSection';

const Home = () => {
  const userInfoStr = localStorage.getItem('userInfo');
  const user = userInfoStr ? JSON.parse(userInfoStr) : null;

  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="home-page">
      <HeroSection />
      <PickleVarieties />
      <AboutSection />
      <TestimonialSection />
    </div>
  );
};

export default Home;
