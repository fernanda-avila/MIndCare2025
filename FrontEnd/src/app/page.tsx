
import React from 'react';
import Navbar from './components/NavBar/NavBar';
import Banner from './components/Banner/Banner';
import Footer from './components/Footer/Footer';
import Benefits from './components/Benefits/page';
import Planos from './components/Plans/Plans';
import Chatbot from './components/ChatBot/ChatBot';
import GuiaArcoIris from './components/Rainbow/page';
import ResourcesMap from './components/ResourcesMap/ResourcesMap';
import AdminPanelButton from './components/AdminPanelButton/AdminPanelButton';

const Home: React.FC = () => {
  return (
    <div>
      <Navbar />
      <AdminPanelButton />
      <Banner />
      <Chatbot />
      <Benefits />
      <ResourcesMap />
      <GuiaArcoIris />
      <Planos />
      <Footer />

    </div>
  );
}

export default Home;
