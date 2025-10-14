
import React, { useEffect, useState } from 'react';
import Navbar from './components/NavBar/NavBar';
import Footer from './components/Footer/Footer'; 
import { listarPlanos } from './components/Services'; 
import { useAuth } from './context/AuthContext';
import Link from 'next/link';
import homeStyles from './home.module.css';
const HomeAfterLogin: React.FC = () => {
  const [planos, setPlanos] = useState<{ id: number, nome: string, descricao: string, preco: string }[]>([]);

 
  useEffect(() => {
    const fetchPlanos = async () => {
      try {
        const planosFetched = await listarPlanos();  
        setPlanos(planosFetched);  
      } catch (error) {
        console.error("Erro ao carregar os planos:", error);
      }
    };
    
    fetchPlanos();
  }, []);

  return (
    <div>
      <Navbar />

      <div className="container">
        {/* Painel de controle visível apenas para ADMIN */}
        <AuthArea />

        <h1>Planos</h1>
        <ul>
          {planos.map((plano) => (
            <li key={plano.id}>
              <h2>{plano.nome}</h2>
              <p>{plano.descricao}</p>
              <p>{plano.preco}</p>
            </li>
          ))}
        </ul>
      </div>
      
  
      
      <Footer />
    </div>
  );
}

export default HomeAfterLogin;

function AuthArea() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role !== 'ADMIN') return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <Link href="/admin/collaborators">
        <button className={homeStyles.panelButton}>Painel de Controle</button>
      </Link>
    </div>
  );
}
