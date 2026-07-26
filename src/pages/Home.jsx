import React from 'react';
import HeroSection from '../components/HeroSection';
import PickleVarieties from '../components/PickleVarieties';
import AboutSection from '../components/AboutSection';
import ReviewsSummary from '../components/ReviewsSummary';
import TestimonialSection from '../components/TestimonialSection';

const Home = () => {
  return (
    <div className="home-page">
      <HeroSection />
      <PickleVarieties />
      <AboutSection />
      <ReviewsSummary onWriteReview={() => alert('Write a Review modal / section opened!')} />
      <TestimonialSection />
    </div>
  );
};

export default Home;
