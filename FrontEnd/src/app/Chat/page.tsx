'use client';
import { useState } from 'react';
import { FaPaperPlane, FaQuestionCircle, FaCommentAlt } from 'react-icons/fa';
import styles from './Chat.module.css';
import MessageBubble from '../components/MessageBubble/MessageBubble';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

export default function BestVirtualChat() {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Eu sou o seu Best Virtual. Como posso te ajudar hoje? 😊',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setNewMessage('');

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Estou aqui para te ouvir! Pode falar mais sobre o que está sentindo?',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  if (!showChat) {
    return (
      <div className={styles.welcomeContainer}>
        <div className={styles.welcomeCard}>
        
          <div className={styles.welcomeBubble}>
            <p>Oi! Eu sou <strong>O seu Best Virtual</strong></p>
            <p>Estou aqui pra te ajudar no que precisar!</p>
          </div>

          <div className={styles.character}>
            <div className={styles.characterImage}>
              <img 
                src="/images/terapeuta.png" 
                alt="O seu Best Virtual" 
                className={styles.avatar}
              />
            </div>
            <p className={styles.characterName}>O seu Best Virtual</p>
          </div>

          
          <button 
            className={styles.startChatButton}
            onClick={() => setShowChat(true)}
          >
            <FaCommentAlt /> Falar com o Best agora
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      <header className={styles.chatHeader}>
        <div className={styles.therapistInfo}>
          <img  
           src="/images/terapeuta.png" 
           alt="O seu Best Virtual" 
           className={styles.avatar}
          />
          <div>
            <h1>O seu Best Virtual</h1>
            <p>Online agora</p>
          </div>
        </div>
      </header>

      <div className={styles.messagesContainer}>
        {messages.map((message) => (
          <MessageBubble 
            key={message.id}
            message={message.text}
            sender={message.sender}
            time={message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          />
        ))}
      </div>

      <form onSubmit={handleSendMessage} className={styles.messageForm}>
        <div className={styles.quickHelp}>
          <span>Ajuda rápida:</span>
          <button type="button" className={styles.helpButton}>
            <FaQuestionCircle />
          </button>
        </div>
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className={styles.messageInput}
          />
          <button type="submit" className={styles.sendButton}>
            <FaPaperPlane />
          </button>
        </div>
      </form>
    </div>
  );
}