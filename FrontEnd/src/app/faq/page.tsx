"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './faq.module.css'

type QA = { q: string; a: string }

const faqs: QA[] = [
  { q: 'Como agendo uma consulta?', a: 'Para agendar uma consulta, escolha um profissional na lista, selecione data e hora e confirme. Você precisa estar logado para finalizar o agendamento.' },
  { q: 'Quais formas de pagamento são aceitas?', a: 'Aceitamos cartão de crédito, débito e PIX. Em alguns casos, também é possível pagamento por transferência bancária.' },
  { q: 'Posso cancelar ou reagendar meu agendamento?', a: 'Sim. Você pode cancelar ou reagendar pelo menu de "Meus Agendamentos" dentro da sua conta, respeitando o prazo mínimo definido pelo profissional.' },
  { q: 'Como encontro um profissional por especialidade?', a: 'Use os filtros de especialidade e abordagem na página de agendamento para refinar a busca.' },
  { q: 'Existe suporte para casos de urgência?', a: 'Se você estiver em situação de emergência, procure os serviços de emergência locais. O MindCare oferece suporte emocional, mas não substitui atendimentos de urgência.' },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const router = useRouter()

  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i))

  return (
    <main className={styles.container}>
      <div className={styles.backButtonContainer}>
        <button aria-label="Voltar" className={styles.backButton} onClick={() => router.back()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h1>FAQ</h1>
          <p>Perguntas frequentes sobre agendamentos, pagamentos e uso da plataforma.</p>
        </div>

        <div className={styles.list} role="list">
          {faqs.map((item, i) => (
            <div className={styles.item} key={i} role="listitem">
              <button
                className={styles.question}
                aria-expanded={openIndex === i}
                aria-controls={`faq-panel-${i}`}
                onClick={() => toggle(i)}
              >
                <span>{item.q}</span>
                <span className={`${styles.icon} ${openIndex === i ? styles.openIcon : ''}`} aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>

              <div
                id={`faq-panel-${i}`}
                role="region"
                aria-hidden={openIndex !== i}
                className={`${styles.answer} ${openIndex === i ? styles.open : ''}`}
              >
                {item.a}
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
