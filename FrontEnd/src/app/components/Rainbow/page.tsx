'use client'
import React from 'react';
import Link from 'next/link';

const GuiaArcoIris: React.FC = () => {
  return (
    <div className="bannerContainer">
      {/* Barra arco-íris */}
      <div className="rainbowBar"></div>
      
      <div className="textSection">
        <span className="tagline">Saiba mais sobre o que o MindCare pode oferecer!</span>
        <h1 className="title">Guia Arco-Íris</h1>
        <p className="description">
          MindCare: O caminho para um bem-estar mental completo. Conheça as vantagens que nossa plataforma oferece para a comunidade LGBTQIA+.
        </p>
        
        <div className="buttonContainer">
          <Link href="/GuiaArcoIris" className="demoButton">
            Conheça o Guia
          </Link>
         
        </div>
      </div>
      
      <div className="imageSection">
        <div className="sessionReminder">
          <div>
            <div className="bubbleImageContainer">
              <div className="bubbleImage">🌈</div>
            </div>
            Descubra recursos exclusivos!
          </div>
        </div>
        <div className="mainImagePlaceholder">
          <div className="placeholderContent">
            <img src="https://images.unsplash.com/photo-1637631531662-cea0fb4b1d97?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGxnYnR8ZW58MHx8MHx8fDA%3D" alt="Arco-íris" className="placeholderIcon" style={{width: '790px', height: '370px', borderRadius: '20px'}} />

          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
        
        .bannerContainer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 60px 80px;
          background-color: #f9f9fc;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
          position: relative;
          overflow: hidden;
          font-family: 'Roboto', sans-serif;
          margin: 2rem 0;
          border-radius: 12px;
        }
        
        .rainbowBar {
          position: absolute;
          top: 0;
          left: 0;
          height: 8px;
          width: 100%;
          background: linear-gradient(90deg, 
            #FF0018 0%, #FFA52C 16%, #FFFF41 33%, 
            #008018 50%, #0000F9 66%, #86007D 83%);
          animation: rainbow-move 3s linear infinite;
        }
        
        @keyframes rainbow-move {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        
        .textSection {

          max-width: 700px;
          z-index: 2;
        }
        
        .tagline {
          display: inline-block;
          background-color: #ece4e4;
          color: #000000b7;
          padding: 5px 15px;
          border-radius: 12px;
          font-size: 14px;
          margin-bottom: 15px;
        }
        
        .title {
          font-size: 48px;
          color: #000000b7;
          margin-bottom: 20px;
          line-height: 1.2;
          font-weight: 400;
        }

            
        :global(.demoButton) {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          background: linear-gradient(135deg, #6A3093 0%, #8E44AD 100%);
          color: white;
          padding: 15px 20px;
          font-size: 20px;
          font-weight: 700;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          box-shadow: 0 10px 30px rgba(106, 48, 147, 0.3);
          min-width: 300px;
         

        }
        :global(.demoButton:hover) {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 15px 40px rgba(106, 48, 147, 0.4);
          background: linear-gradient(135deg, #8E44AD 0%, #6A3093 100%);
        }
        .description {
          font-size: 18px;
          color: #6f7287;
          margin-bottom: 30px;
        }
        
        .buttonContainer {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 20px;
        }
     
        
        .chatIcon {
          font-size: 1.2rem;
        }
        
        .speechBubble {
          position: relative;
          background-color: white;
          color: #333;
          padding: 12px 18px;
          border-radius: 20px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          max-width: 200px;
          margin-top: 10px;
          animation: fadeIn 0.5s ease-out 1s forwards;
          opacity: 0;
        }
        
        .speechBubble::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 20px;
          border-width: 10px 10px 0;
          border-style: solid;
          border-color: white transparent transparent;
        }
        
        .bubbleImageContainer {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 50%, #6A3093 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }
        
        .bubbleImage {
          color: white;
          font-size: 20px;
        }
        
        .speechBubble p {
          font-weight: bold;
          margin: 0;
          font-size: 14px;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .imageSection {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .sessionReminder {
          background-color: white;
          border-radius: 8px;
          padding: 10px 20px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          position: absolute;
          top: 30px;
          left: -15px;
          z-index: 3;
        }
        
        .sessionReminder p {
          font-weight: bold;
          width: 200px;
          margin-bottom: 5px;
          color: #6A3093;
          font-size: 14px;
        }
        
        .mainImagePlaceholder {
          width: 500px;
          height: 380px;
          border-radius: 10px;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ec 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          margin-right: 150px;
        }
        
        .placeholderContent {
          width: 100%;
          text-align: center;
          color: #6A3093;
        }
        
        
        .placeholderContent p {
          font-weight: 500;
          font-size: 18px;
          margin: 0;
        }
        
        @media (max-width: 968px) {
          .bannerContainer {
            flex-direction: column;
            padding: 40px 20px;
            text-align: center;
          }
          
          .textSection {
            max-width: 100%;
            margin-bottom: 40px;
          }
          
          .title {
            font-size: 36px;
          }
          
          .buttonContainer {
            justify-content: center;
          }
          
          .mainImagePlaceholder {
            width: 100%;
            max-width: 400px;
          }
          
          .sessionReminder {
            left: 50%;
            transform: translateX(-50%);
            top: -20px;
          }
        }
        
        @media (max-width: 640px) {
          .title {
            font-size: 32px;
          }
          
          .description {
            font-size: 16px;
          }
          
          .demoButton {
            padding: 12px 24px;
            font-size: 14px;
          }
          
          .speechBubble {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default GuiaArcoIris;