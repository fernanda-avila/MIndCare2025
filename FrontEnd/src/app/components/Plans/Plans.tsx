"use client";
import React, { useState, useEffect } from 'react';
import { listarPlanos } from '../Services';
import styles from './plan.module.css';

type Plano = {
  id: string;
  nome: string;
  descricao: string;
  preco: string;
  beneficios: string[];
  tempoAdesao: string;
  suporte: string;
  permiteAgendamento: boolean;
  permiteChat: boolean;
  maisPopular?: boolean;
};

const Planos: React.FC = () => {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [indexSelecionado, setIndexSelecionado] = useState<number>(1); // Começa no meio para melhor visualização

  useEffect(() => {
    const fetchPlanos = async () => {
      try {
        const dados = await listarPlanos();
        if (dados && Array.isArray(dados)) {
          const planosFormatados = dados.map((plano: any, index: number) => ({ 
            ...plano, 
            id: plano.id.toString(),
            maisPopular: index === 1 // Marca o segundo plano como mais popular por padrão
          }));
          setPlanos(planosFormatados);
        } else {
          console.error('Erro: Dados de planos não são um array');
        }
      } catch (error) {
        console.error('Erro ao carregar os planos', error);
      }
    };
    fetchPlanos();
  }, []);

  const handleAnterior = () => {
    setIndexSelecionado((prevIndex) => (prevIndex === 0 ? planos.length - 1 : prevIndex - 1));
  };

  const handleProximo = () => {
    setIndexSelecionado((prevIndex) => (prevIndex === planos.length - 1 ? 0 : prevIndex + 1));
  };

  const handleContratar = (planoId: string) => {
    alert(`Plano ${planoId} contratado com sucesso!`);
  };

  const handleAgendarConsulta = (planoId: string) => {
    alert(`Agendando consulta para o plano ${planoId}`);
  };

  const handleIniciarChat = (planoId: string) => {
    alert(`Iniciando chat de apoio emocional para o plano ${planoId}`);
  };

  // Função para calcular a classe de destaque baseada na posição
  const getPlanClass = (index: number) => {
    const distance = Math.abs(index - indexSelecionado);
    
    if (distance === 0) return styles.planoSelecionado;
    if (distance === 1) return styles.planoAdjacente;
    return styles.planoDistante;
  };

  return (
    <div className={styles.planosContainer}>
      <h1 className={styles.titulo}>Escolha seu Plano</h1>
      
      <div className={styles.carrosselContainer}>
        <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={handleAnterior}>
          &lt;
        </button>
        
        <div className={styles.carrosselTrack}>
          {planos.length > 0 ? (
            planos.map((plano, index) => (
              <div
                key={plano.id}
                className={`${styles.plano} ${getPlanClass(index)} ${
                  plano.maisPopular ? styles.planoPopular : ''
                }`}
                style={{
                  transform: `translateX(${(index - indexSelecionado) * 110}%) scale(${
                    index === indexSelecionado ? 1.05 : 0.9
                  })`,
                  zIndex: index === indexSelecionado ? 10 : 1,
                  opacity: index === indexSelecionado ? 1 : 0.8,
                }}
              >
                {plano.maisPopular && (
                  <div className={styles.popularBadge}>Mais Popular</div>
                )}
                
                <h3 className={styles.planoNome}>{plano.nome}</h3>
                <p className={styles.planoDescricao}>{plano.descricao}</p>
                
                <div className={styles.planoPreco}>
                  R$ {plano.preco}
                  <span>/mês</span>
                </div>
                
                <ul className={styles.beneficios}>
                  {plano.beneficios.map((beneficio, i) => (
                    <li key={i}>
                      <span className={styles.beneficioIcon}>✓</span>
                      {beneficio}
                    </li>
                  ))}
                </ul>
                
                <div className={styles.planoInfo}>
                  <p>Tempo de adesão: {plano.tempoAdesao}</p>
                  <p>Suporte: {plano.suporte}</p>
                </div>
                
                <div className={styles.buttonsContainer}>
                  {plano.permiteAgendamento && (
                    <button
                      className={`${styles.contratarButton} ${styles.agendarButton}`}
                      onClick={() => handleAgendarConsulta(plano.id)}
                    >
                      Agendar Consulta
                    </button>
                  )}
                  {plano.permiteChat && (
                    <button
                      className={`${styles.contratarButton} ${styles.chatButton}`}
                      onClick={() => handleIniciarChat(plano.id)}
                    >
                      Iniciar Chat
                    </button>
                  )}
                  <button
                    className={`${styles.contratarButton} ${styles.planoButton}`}
                    onClick={() => handleContratar(plano.id)}
                  >
                    Contratar Plano
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.carregando}>
              <p>Carregando planos...</p>
            </div>
          )}
        </div>
        
        <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={handleProximo}>
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Planos;