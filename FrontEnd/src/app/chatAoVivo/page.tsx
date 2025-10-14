'use client'
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  FiSend,
  FiVideo,
  FiMic,
  FiPhone,
  FiClock,
  FiUser,
  FiMessageCircle,
  FiSmile,
  FiPaperclip,
  FiArrowLeft
} from 'react-icons/fi';
import { 
  HiOutlinePhone,
  HiOutlineVideoCamera,
} from 'react-icons/hi';

import { useRouter } from 'next/navigation';
import styles from './CollaboratorChat.module.css';

const DirectChatWithProfessional: React.FC = () => {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'mode-selection' | 'chat' | 'call'>('mode-selection');
  const [selectedMode, setSelectedMode] = useState<'text' | 'audio' | 'video' | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const availableProfessionals = [
    { 
      id: 1, 
      name: 'Dra. Ana Silva', 
      specialty: 'Psicóloga Clínica', 
      rating: 4.9, 
      status: 'online',
      avatar: '👩‍⚕️',
      waitTime: 'Disponível agora'
    },
    { 
      id: 2, 
      name: 'Dr. Carlos Oliveira', 
      specialty: 'Terapeuta Cognitivo', 
      rating: 4.8, 
      status: 'online',
      avatar: '👨‍⚕️',
      waitTime: '2-5 minutos'
    }
  ];

  useEffect(() => {
    const available = availableProfessionals.find(p => p.status === 'online');
    if (available) {
      setSelectedProfessional(available);
    }
  }, []);

  const handleModeSelection = (mode: 'text' | 'audio' | 'video') => {
    setSelectedMode(mode);
    if (mode === 'text') {
      setActiveView('chat');
      setMessages([
        {
          id: 1,
          text: `Olá! Sou ${selectedProfessional.name}. Como posso ajudar você hoje?`,
          sender: 'professional',
          timestamp: new Date(Date.now() - 300000),
        }
      ]);
    } else {
      setActiveView('call');
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    const userMessage = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages([...messages, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const responses = [
        "Entendo perfeitamente sua situação. Vamos trabalhar juntos nisso.",
        "Agradeço por compartilhar isso comigo. É importante falarmos sobre.",
        "Como isso tem afetado seu dia a dia?",
        "Você já tentou alguma estratégia para lidar com essa situação?",
        "Isso é mais comum do que imagina. Muitas pessoas passam por experiências similares."
      ];
      const professionalResponse = {
        id: messages.length + 2,
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'professional',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, professionalResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleEndCall = () => {
    setActiveView('mode-selection');
    setSelectedMode(null);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderModeSelection = () => (
    <div className={styles.modeSelectionContainer}>
      <div className={styles.header}>
        <h1>
          <FiMessageCircle className={styles.headerIcon} />
          Conectar com Profissional
        </h1>
        <p>Escolha como deseja se comunicar</p>
      </div>

      {selectedProfessional && (
        <div className={styles.professionalInfo}>
          <div className={styles.avatar}>{selectedProfessional.avatar}</div>
          <div className={styles.details}>
            <h3>{selectedProfessional.name}</h3>
            <p>{selectedProfessional.specialty}</p>
            <span className={styles.status}>• {selectedProfessional.status}</span>
          </div>
        </div>
      )}

      <div className={styles.modeOptions}>
        <div className={styles.modeCard} onClick={() => handleModeSelection('text')}>
          <div className={styles.modeIcon}><FiMessageCircle /></div>
          <h3>Chat por Texto</h3>
          <p>Conversa por mensagens instantâneas</p>
          <button className={styles.selectButton}>Iniciar Chat</button>
        </div>

        <div className={styles.modeCard} onClick={() => handleModeSelection('audio')}>
          <div className={styles.modeIcon}><HiOutlinePhone /></div>
          <h3>Chamada de Áudio</h3>
          <p>Conversa por voz em tempo real</p>
          <button className={styles.selectButton}>Iniciar Chamada</button>
        </div>

        <div className={styles.modeCard} onClick={() => handleModeSelection('video')}>
          <div className={styles.modeIcon}><HiOutlineVideoCamera /></div>
          <h3>Videochamada</h3>
          <p>Vídeo e áudio em tempo real</p>
          <button className={styles.selectButton}>Iniciar Videochamada</button>
        </div>
      </div>
    </div>
  );

  const renderChatView = () => (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <div className={styles.professionalInfo}>
          <div className={styles.avatar}>{selectedProfessional?.avatar}</div>
          <div>
            <h3>{selectedProfessional?.name}</h3>
            <p>{selectedProfessional?.specialty}</p>
          </div>
        </div>
        <div className={styles.callOptions}>
          <button onClick={() => handleModeSelection('audio')}><HiOutlinePhone /></button>
          <button onClick={() => handleModeSelection('video')}><HiOutlineVideoCamera /></button>
        </div>
      </div>

      <div className={styles.chatMessages}>
        {messages.map((message) => (
          <div key={message.id} className={`${styles.message} ${styles[message.sender]}`}>
            <div className={styles.messageContent}>
              <p>{message.text}</p>
              <span className={styles.messageTime}>{formatTime(message.timestamp)}</span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className={styles.typingIndicator}>
            <div className={styles.typingDots}><span></span><span></span><span></span></div>
            <span>{selectedProfessional?.name} está digitando...</span>
          </div>
        )}
      </div>

      <div className={styles.chatInput}>
        <button className={styles.attachmentButton}><FiPaperclip /></button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Digite sua mensagem..."
        />
        <button className={styles.emojiButton}><FiSmile /></button>
        <button className={styles.sendButton} onClick={handleSendMessage}><FiSend /></button>
      </div>
    </div>
  );

  const renderCallView = () => (
    <div className={styles.callContainer}>
      <div className={styles.callHeader}>
        <h3>{selectedMode === 'audio' ? 'Chamada de Áudio' : 'Videochamada'} com {selectedProfessional?.name}</h3>
        <div className={styles.callTimer}><FiClock /><span>00:05:32</span></div>
      </div>

      <div className={styles.callContent}>
        <div className={styles.videoFeed}>
          {selectedMode === 'video' && (
            <div className={styles.remoteVideo}>
              <div className={styles.videoPlaceholder}>
                {selectedProfessional?.avatar}
                <p>{selectedProfessional?.name}</p>
              </div>
            </div>
          )}
          <div className={styles.localPreview}>
            <div className={styles.previewContent}><FiUser /><span>Você</span></div>
          </div>
        </div>

        <div className={styles.callControls}>
          <button className={styles.controlButton}><FiMic /><span>Mudo</span></button>
          <button className={`${styles.controlButton} ${styles.endCall}`} onClick={handleEndCall}>
            <FiPhone /><span>Encerrar</span>
          </button>
          {selectedMode === 'video' && (
            <button className={styles.controlButton}><FiVideo /><span>Câmera</span></button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => router.push('/')} style={{ position: 'absolute', top: 20, left: 20, background: 'none', border: 'none', cursor: 'pointer', zIndex: 10 }} aria-label="Voltar para Home">
        <FiArrowLeft size={28} />
      </button>
      <div className={styles.directChatApp}>
        <Head><title>Chat Direto - MindCare</title></Head>
        <main className={styles.appContent}>
          {activeView === 'mode-selection' && renderModeSelection()}
          {activeView === 'chat' && renderChatView()}
          {activeView === 'call' && renderCallView()}
        </main>
      </div>
    </div>

  );
}

export default DirectChatWithProfessional;
