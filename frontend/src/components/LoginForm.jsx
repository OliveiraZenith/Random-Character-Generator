import { useState } from 'react';
import { login } from '../services/api.js';
import { navigateWithTransition } from '../services/navigation.js';

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      </div>
    </div>
  );
};

export default LoginForm;
