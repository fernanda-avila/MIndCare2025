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
  const [showPassword, setShowPassword] = useState(false);
  const [asHelper, setAsHelper] = useState(false);
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [crp, setCrp] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

 
  const { login, register, loading, error } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLocalError(null);
    setSuccessMsg(null);
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const name = formData.name.trim();
    if (isLogin) {
      await login(email, password, { redirectTo: '/' });
      return;
    }

    // registration flow
    if (asHelper) {
      if (!crp.trim()) { setLocalError('CRP é obrigatório para se candidatar como colaborador'); return; }
      if (!specialty.trim()) { setLocalError('Especialidade é obrigatória para se candidatar como colaborador'); return; }
    }

    setLocalLoading(true);
    try {
      let avatarUrl: string | undefined = undefined;
      if (avatarFile) {
        const fd = new FormData(); fd.append('file', avatarFile);
        const upl = await fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/uploads', { method: 'POST', body: fd });
        if (!upl.ok) throw new Error('Falha ao enviar imagem');
        const dj = await upl.json();
        avatarUrl = dj.url;
      }
      const payload: any = { name, email, password };
      if (asHelper) { payload.role = 'HELPER'; payload.specialty = specialty; payload.bio = bio; payload.avatarUrl = avatarUrl; payload.crp = crp; }
      await register(payload, { redirectTo: '/' });
      setSuccessMsg(asHelper ? 'Sua solicitação de colaborador foi enviada. Aguarde aprovação do admin.' : 'Cadastro realizado com sucesso.');
      // clear fields
      setFormData({ email: '', password: '', name: '' });
      setAsHelper(false); setCrp(''); setSpecialty(''); setBio(''); setAvatarFile(null); setAvatarPreview(null);
    } catch (err: any) {
      setLocalError(err?.message || 'Erro no cadastro');
    } finally {
      setLocalLoading(false);
    }
  };

  const onAvatarChange = (f?: File) => {
    if (!f) { setAvatarFile(null); setAvatarPreview(null); return; }
    setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f));
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

      <div className={styles.inputGroup} style={{ position: 'relative' }}>
        <label className={styles.label}>Password:</label>
        <input
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className={styles.input}
          required
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          disabled={loading}              // ✅
        />
        <button
          type="button"
          aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
          onClick={() => setShowPassword((s) => !s)}
          className={styles.eyeBtn}
        >
          {showPassword ? (
            // olho aberto
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : (
            // olho com risquinho (fechado)
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7 1.63-2.54 4.1-4.55 7.02-5.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 1l22 22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          )}
        </button>
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

      {!isLogin && (
        <div style={{ marginTop: 10 }}>
          <button type="button" className={styles.secondary} onClick={() => setAsHelper(!asHelper)}>
            {asHelper ? 'Cancelar candidatura como colaborador' : 'Se candidatar como colaborador'}
          </button>
          {asHelper && (
            <div style={{ marginTop: 8 }}>
              <input placeholder="CRP" value={crp} onChange={(e) => setCrp(e.target.value)} />
              <input placeholder="Especialidade" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
              <input placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <input type="file" accept="image/*" onChange={(e) => onAvatarChange(e.target.files?.[0])} />
                {avatarPreview && <img src={avatarPreview} alt="preview" className={styles.avatarPreview} /> }
              </div>
            </div>
          )}
        </div>
      )}

      {/* ✅ Mostra erro do contexto (409, etc.) */}
      {error && (
        <div className={styles.inputGroup}>
          <p style={{ color: '#e11d48', fontSize: 12 }}>{error}</p>
        </div>
      )}
      {localError && <div className={styles.message + ' ' + styles.error}>{localError}</div>}
      {successMsg && <div className={styles.message + ' ' + styles.success}>{successMsg}</div>}

      <button type="submit" className={styles.button} disabled={loading || localLoading}>
        {(loading || localLoading) ? 'Enviando...' : isLogin ? 'Login' : 'Cadastrar'}
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
