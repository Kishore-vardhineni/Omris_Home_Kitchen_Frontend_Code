import React from 'react';
import HeroSection from '../components/HeroSection';
import PickleVarieties from '../components/PickleVarieties';
import AboutSection from '../components/AboutSection';
import TestimonialSection from '../components/TestimonialSection';

const Home = () => {
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
