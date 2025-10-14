"use client"
// src/pages/booking.tsx
import React from 'react';
import Navbar from '../components/NavBar/NavBar';
import BookingForm from '../components/BookingForm/BookingForm';
import Footer from '../components/Footer/Footer';

const Booking: React.FC = () => {
  return (
    <div>
      <Navbar />
      <BookingForm />
      <Footer />
    </div>
  );
}

export default Booking;
