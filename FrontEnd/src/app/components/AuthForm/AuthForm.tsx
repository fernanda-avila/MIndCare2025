import React, { useState } from 'react';
import styles from './AuthForm.module.css';
import { useAuth } from '../../context/AuthContext';

const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

 
  const { login, register, loading, error } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const name = formData.name.trim();

    if (isLogin) {
      await login(email, password, { redirectTo: '/' });
    } else {
      await register({ name, email, password }, { redirectTo: '/' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer} autoComplete="on">
      <div className={styles.inputGroup}>
        <label className={styles.label}>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={styles.input}
          required
          autoComplete="email"
          disabled={loading}              
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className={styles.input}
          required
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          disabled={loading}              // ✅
        />
      </div>

      {!isLogin && (
        <div className={styles.inputGroup}>
          <label className={styles.label}>Nome:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={styles.input}
            required                        
            disabled={loading}             
          />
        </div>
      )}

      {/* ✅ Mostra erro do contexto (409, etc.) */}
      {error && (
        <div className={styles.inputGroup}>
          <p style={{ color: '#e11d48', fontSize: 12 }}>{error}</p>
        </div>
      )}

      <button type="submit" className={styles.button} disabled={loading}>
        {loading ? 'Enviando...' : isLogin ? 'Login' : 'Cadastrar'}
      </button>

      <button
        type="button"
        onClick={() => !loading && setIsLogin(!isLogin)} 
        className={styles.toggleButton}
        disabled={loading}                                
      >
        {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
      </button>
    </form>
  );
};

export default AuthForm;
