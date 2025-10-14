// src/pages/professionals.tsx
import React from 'react';
import Navbar from '../../src/app/components/NavBar/NavBar';
import ProfessionalsList from './components/Professionals/ProfessionalsList';
import Footer from '../app/components/Footer/Footer';

const Professionals: React.FC = () => {
  return (
    <div>
      <Navbar />
      <ProfessionalsList />
      <Footer />
    </div>
  );
}

export default Professionals;
