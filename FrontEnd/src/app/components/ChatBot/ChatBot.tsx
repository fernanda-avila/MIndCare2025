"use client";

import { useState, useEffect, useRef } from "react";
import { FaComments, FaRainbow, FaTimes, FaPaperPlane } from "react-icons/fa";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  userId?: string;
}

export default function ChatBot() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Gera ou recupera ID único do usuário
  const getUserId = () => {
    if (typeof window === 'undefined') return 'anonymous';
    let id = localStorage.getItem('mindcare_user_id');
    if (!id) {
      id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('mindcare_user_id', id);
    }
    return id;
  };

  // Busca histórico do usuário
  const fetchHistorico = async () => {
    try {
      const currentUserId = getUserId();
      setUserId(currentUserId);
      const res = await fetch(`/api/historico?userId=${currentUserId}`);
      if (!res.ok) throw new Error("Erro ao buscar histórico");
      const data = await res.json();
      const loadedMessages: Message[] = data.map((m: any) => ({
        id: m.id.toString(),
        text: m.texto,
        sender: m.remetente === "user" ? "user" : "bot",
        timestamp: new Date(m.criadoEm),
        userId: m.userId || 'anonymous'
      }));
      setMessages(loadedMessages);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchHistorico(); }, []);

  // Envia mensagem
  const sendMessage = async () => {
    if (!input.trim()) return;

    const currentUserId = userId || getUserId();
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
      userId: currentUserId
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    // Salva mensagem do usuário
    try {
      await fetch("/api/historico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: userMessage.text,
          sender: userMessage.sender,
          timestamp: userMessage.timestamp,
          userId: currentUserId
        }),
      });
    } catch (err) {
      console.error("Erro ao salvar histórico:", err);
    }

    try {
      // Cria prompt baseado no histórico do usuário
      const prompt = `
Você é um assistente de saúde mental chamado Best Virtual.
Diretrizes:
1. Seja empático e acolhedor
2. Use linguagem simples em português
3. Ressalte que você não substitui ajuda profissional
4. Sugira contatar MindCare em casos de crise
5. Responda em 2-4 frases

Histórico:
${updatedMessages
  .filter(msg => msg.userId === currentUserId)
  .map((m) => `${m.sender === "user" ? "Usuário" : "Bot"}: ${m.text}`)
  .join("\n")}

Última pergunta:
${input}
`;

      // Chama a API backend que acessa o Gemini
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      const botText = data.text || "Desculpe, não consegui gerar resposta.";

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: "bot",
        timestamp: new Date(),
        userId: currentUserId
      };

      setMessages(prev => [...prev, botMessage]);

      // Salva resposta do bot
      await fetch("/api/historico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: botText,
          sender: "bot",
          timestamp: new Date(),
          userId: currentUserId
        }),
      });
    } catch (err) {
      console.error(err);
      const fallbackMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: "Houve um erro ao processar sua mensagem. Pode reformular?",
        sender: "bot",
        timestamp: new Date(),
        userId: currentUserId
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => { if(e.key === "Enter") sendMessage(); };

  return (
    <>
      {!isChatOpen && (
        <div className="chatbot-floating-btn" onClick={() => setIsChatOpen(true)}>
          <FaComments size={28} />
        </div>
      )}

      {isChatOpen && (
        <div className="chatbot-modal">
          <div className="chatbot-header">
            <div className="chatbot-title"><FaRainbow size={24}/> <h3>Best Virtual</h3></div>
            <button className="chatbot-close" onClick={() => setIsChatOpen(false)}><FaTimes size={22}/></button>
          </div>

          <div className="chatbot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                <div className="message-content">
                  <p>{msg.text}</p>
                  <span className="message-time">{msg.timestamp.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span>
                </div>
              </div>
            ))}
            {isTyping && <div className="message bot"><div className="message-content">Digitando...</div></div>}
            <div ref={messagesEndRef}/>
          </div>

          <div className="chatbot-input">
            <input type="text" placeholder="Digite sua mensagem..." value={input} onChange={(e)=>setInput(e.target.value)} onKeyPress={handleKeyPress} disabled={isTyping}/>
            <button onClick={sendMessage} disabled={!input.trim() || isTyping} className="send-btn"><FaPaperPlane size={22}/></button>
          </div>
        </div>
      )}

      <style jsx>{`
        .chatbot-floating-btn { position: fixed; bottom: 30px; right:30px; width:60px; height:60px; background:linear-gradient(135deg,#6d28d9,#a855f7); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 8px 25px rgba(109,40,217,0.3); z-index:1000; }
        .chatbot-modal { position:fixed; bottom:100px; right:30px; width:380px; height:500px; background:white; border-radius:20px; box-shadow:0 10px 40px rgba(0,0,0,0.15); display:flex; flex-direction:column; z-index:1001; overflow:hidden; }
        .chatbot-header { background:linear-gradient(135deg,#6d28d9,#a855f7); color:white; padding:20px; display:flex; justify-content:space-between; align-items:center; }
        .chatbot-title { display:flex; align-items:center; gap:10px; }
        .chatbot-title h3 { margin:0; font-size:1.2rem; }
        .chatbot-close { background:none; border:none; color:white; cursor:pointer; font-size:1.2rem; }

        .chatbot-messages { flex:1; padding:20px; overflow-y:auto; display:flex; flex-direction:column; gap:15px; }
        .message { display:flex; max-width:80%; }
        .message.user { align-self:flex-end; }
        .message.bot { align-self:flex-start; }
        .message-content { padding:12px 16px; border-radius:18px; position:relative; }
        .message.user .message-content { background:#6d28d9; color:white; border-bottom-right-radius:5px; }
        .message.bot .message-content { background:#f3f4f6; color:#111; border-bottom-left-radius:5px; }
        .message-time { font-size:0.7rem; opacity:0.7; display:block; margin-top:5px; }

        .chatbot-input { padding:15px 20px; display:flex; gap:10px; background:white; border-top:1px solid #ddd; }
        .chatbot-input input { flex:1; padding:12px; border:1px solid #ddd; border-radius:25px; outline:none; }
        .send-btn { width:45px; height:45px; background:linear-gradient(135deg,#6d28d9,#a855f7); color:white; border:none; border-radius:50%; cursor:pointer; transition:all 0.2s; }
        .send-btn:hover:not(:disabled){ transform:scale(1.05); }
        .send-btn:disabled { background:#ccc; cursor:not-allowed; }

        @media(max-width:480px){ .chatbot-modal{ width:90vw; right:5vw; bottom:80px; height:70vh; } }
      `}</style>
    </>
  );
}