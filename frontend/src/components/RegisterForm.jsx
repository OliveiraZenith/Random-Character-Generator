import { useState } from 'react';
import { register } from '../services/api.js';
import { navigateWithTransition } from '../services/navigation.js';

const isEmailValid = (value) => /\S+@\S+\.\S+/.test(value);

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validate = () => {
    if (!name.trim()) return 'Nome é obrigatório';
    if (!email.trim()) return 'Email é obrigatório';
    if (!isEmailValid(email)) return 'Email inválido';
    if (password.trim().length < 6) return 'Senha deve ter ao menos 6 caracteres';
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    setLoading(true);
    try {
      const data = await register({ name, email, password });
      setSuccess('Conta criada! Entrando...');
      localStorage.setItem('rcc_token', data.token);
      if (data.user?.name) {
        localStorage.setItem('rcc_user_name', data.user.name);
      } else {
        localStorage.setItem('rcc_user_name', name);
      }
      setTimeout(() => navigateWithTransition('/worlds'), 400);
    } catch (err) {
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigateWithTransition('/');
  };

  return (
    <div className="register-card fade-in">
      <div className="register-card-border" aria-hidden />
      <h1 className="register-title">Criar conta</h1>
      <form className="register-form" onSubmit={handleSubmit}>
        <label className="label" htmlFor="name">Nome:</label>
        <input
          id="name"
          className="input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome"
          autoComplete="name"
        />

        <label className="label" htmlFor="email">Email:</label>
        <input
          id="email"
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          autoComplete="email"
        />

        <label className="label" htmlFor="password">Senha:</label>
        <input
          id="password"
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
        />

        {error && <div className="alert error" role="alert">{error}</div>}
        {success && <div className="alert success" role="status">{success}</div>}

        <button className="button-primary" type="submit" disabled={loading}>
          {loading ? 'Criando...' : 'Criar'}
        </button>
        <button className="button-secondary" type="button" onClick={handleBack}>
          Voltar
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
