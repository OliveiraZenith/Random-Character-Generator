import { useState } from 'react';
import { login, requestPasswordReset } from '../services/api.js';
import { navigateWithTransition } from '../services/navigation.js';

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !password.trim()) {
      setError('Preencha email e senha.');
      return;
    }

    setLoading(true);
    try {
      const data = await login({ email, password });
      localStorage.setItem('rcc_token', data.token);
      if (data.user?.name) {
        localStorage.setItem('rcc_user_name', data.user.name);
      }
      setSuccess('Login realizado com sucesso! Redirecionando...');
      if (onLoginSuccess) {
        onLoginSuccess(data);
      } else {
        setTimeout(() => {
          navigateWithTransition('/worlds');
        }, 400);
      }
    } catch (err) {
      setError(err.message || 'Falha no login.');
    } finally {
      setLoading(false);
    }
  };

  const openResetModal = (event) => {
    event.preventDefault();
    setShowReset(true);
    setResetEmail(email || '');
    setResetError('');
    setResetSuccess('');
  };

  const closeResetModal = () => {
    setShowReset(false);
    setResetLoading(false);
  };

  const handleResetSubmit = async (event) => {
    event.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!resetEmail.trim()) {
      setResetError('Informe o email cadastrado.');
      return;
    }

    setResetLoading(true);
    try {
      await requestPasswordReset(resetEmail.trim());
      setResetSuccess('Link enviado para seu grimório. Confira a caixa de entrada e spam.');
    } catch (err) {
      setResetError(err.message || 'Não foi possível enviar o link.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="login-card">
      <h2 className="card-title">Entrar</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label className="label" htmlFor="email">Email</label>
        <input
          id="email"
          className="input"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <label className="label" htmlFor="password">Senha</label>
        <input
          id="password"
          className="input"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        {error && <div className="alert error" role="alert">{error}</div>}
        {success && <div className="alert success" role="status">{success}</div>}

        <button className="button-primary" type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <div className="helper-text">
        <a
          className="link-secondary"
          href="/register"
          onClick={(e) => {
            e.preventDefault();
            navigateWithTransition('/register');
          }}
        >
          Criar Conta
        </a>
        <button className="link-tertiary" type="button" onClick={openResetModal}>
          Esqueci minha senha
        </button>
      </div>

      {showReset && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3 className="modal-title">Recuperar senha</h3>
            <p className="modal-text">Envie o email cadastrado para receber um link de redefinição.</p>
            <form className="form" onSubmit={handleResetSubmit}>
              <label className="label" htmlFor="reset-email">Email cadastrado</label>
              <input
                id="reset-email"
                className="input"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
              />
              {resetError && <div className="alert error" role="alert">{resetError}</div>}
              {resetSuccess && <div className="alert success" role="status">{resetSuccess}</div>}
              <div className="modal-actions">
                <button className="button-primary" type="submit" disabled={resetLoading}>
                  {resetLoading ? 'Enviando...' : 'Enviar link de recuperação'}
                </button>
                <button className="button-secondary" type="button" onClick={closeResetModal} disabled={resetLoading}>
                  Fechar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
