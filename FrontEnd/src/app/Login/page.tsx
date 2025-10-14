"use client"
import React from 'react';
import AuthForm from '../components/AuthForm/AuthForm';

const Login: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f2f2f2' }}>
      
      <img
        src="/logo.png"
        alt="Descrição da imagem"
        style={{ maxWidth: '350px', marginBottom: '20px', objectFit: 'contain' }}
      />
      <AuthForm />
    </div>
  );
};

export default Login;
