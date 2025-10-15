"use client"

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './ContactModal.module.css'
import { swalConfirm, swalError, swalSuccess } from '../../utils/swal'

type Props = {
  isOpen: boolean
  onCloseAction: () => void
}

export default function ContactModal({ isOpen, onCloseAction }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  // prevent SSR issues
  if (typeof document === 'undefined') return null

  const validate = () => {
    if (!name.trim()) return 'Informe seu nome'
    if (!email.trim()) return 'Informe seu e-mail'
    // simples validação de e-mail
    const re = /\S+@\S+\.\S+/
    if (!re.test(email)) return 'E-mail inválido'
    if (!message.trim()) return 'Escreva uma mensagem'
    return null
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const err = validate()
    if (err) {
      await swalError('Validação', err)
      return
    }

    const confirmed = await swalConfirm({ title: 'Enviar mensagem?', text: 'Deseja enviar sua mensagem para o suporte?' })
    if (!confirmed || !(confirmed as any).isConfirmed) return

    setLoading(true)
    try {
      const payload = { name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, message: message.trim(), sentAt: new Date().toISOString() }
      // aqui você pode chamar um endpoint real. Por enquanto apenas logamos e simulamos delay
      console.log('Contact payload:', payload)
      await new Promise((r) => setTimeout(r, 700))
  await swalSuccess('Mensagem enviada', 'Recebemos sua mensagem. Entraremos em contato em breve.')
  onCloseAction()
      // reset form
      setName('')
      setEmail('')
      setPhone('')
      setMessage('')
    } catch (err) {
      console.error(err)
      await swalError('Erro', 'Não foi possível enviar a mensagem. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${name}\n${email}\n${phone || ''}\n\n${message}`)
    const phoneNumber = '554799999999' // placeholder - substitua pelo número real
    const url = `https://wa.me/${phoneNumber}?text=${text}`
    window.open(url, '_blank')
  }

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" onClick={onCloseAction}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Entrar em contato</h2>
          <button aria-label="Fechar" className={styles.close} onClick={onCloseAction}>✕</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <input className={styles.input} placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} />
            <input className={styles.input} placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className={styles.row}>
            <input className={styles.input} placeholder="Telefone (opcional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <textarea className={styles.textarea} placeholder="Escreva sua mensagem" value={message} onChange={(e) => setMessage(e.target.value)} />

          <div className={styles.actions}>
            <button type="button" className={styles.btnWhatsApp} onClick={handleWhatsApp} aria-label="Abrir WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.52 3.48A11.88 11.88 0 0 0 12 .5C6.21.5 1.5 5.21 1.5 11c0 1.94.5 3.83 1.45 5.5L.5 23.5l6.2-2.05A11.86 11.86 0 0 0 12 22.5c5.79 0 10.5-4.71 10.5-10.5 0-2.82-1.09-5.44-3.98-8.52z" stroke="#fff" strokeWidth="0" fill="#fff" opacity="0"/>
                <path d="M20.5 3.5a11.9 11.9 0 0 0-8.5-3.3C6.1.2 1.5 4.8 1.5 11c0 1.9.5 3.8 1.5 5.4L.5 23.5l6.3-2.1A11.9 11.9 0 0 0 12 22.5c5.8 0 10.5-4.7 10.5-10.5 0-2.8-1.1-5.4-3.9-8.5z" fill="#fff" opacity="0.06"/>
                <path d="M17.6 14.2c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.6.9-.7 1.1-.1.2-.2.2-.5.1-1.1-.5-3.6-1.9-4.8-3.4-.2-.2 0-.3.1-.5.1-.1.3-.3.5-.5.1-.2.2-.3.3-.5.1-.1.05-.3 0-.4-.1-.1-.7-1.7-.9-2.3-.2-.6-.4-.5-.6-.5-.2 0-.4 0-.6 0-.2 0-.5.1-.7.2-.2.1-.6.3-.9.9-.3.6-1 2.1-1 4 .1 1.9 1.3 3.6 1.5 3.9.2.3 2.5 3.9 6 5.3 3.5 1.4 3.5.9 4.1.9.6 0 1.8-.7 2-1.3.2-.6.2-1.3.1-1.4-.1-.1-1-.3-1.3-.5z" fill="#fff"/>
              </svg>
              WhatsApp
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? 'Enviando...' : (
                <>
                  Enviar mensagem
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" fill="#fff" />
                  </svg>
                </>
              )}
            </button>
            <button type="button" className={styles.btnSecondary} onClick={onCloseAction}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
