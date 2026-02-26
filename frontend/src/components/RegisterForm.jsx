import { useEffect, useState } from 'react';
import { register, resetPassword, validateResetToken } from '../services/api.js';
import { navigateWithTransition } from '../services/navigation.js';

const isEmailValid = (value) => /\S+@\S+\.\S+/.test(value);

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mode, setMode] = useState('register');
  const [resetToken, setResetToken] = useState('');
  const [checkingToken, setCheckingToken] = useState(false);

  const isResetMode = mode === 'reset';

  const validate = () => {
    if (!isResetMode && !name.trim()) return 'Nome é obrigatório';
    if (!email.trim()) return 'Email é obrigatório';
    if (!isEmailValid(email)) return 'Email inválido';
    if (password.trim().length < 6) return 'Senha deve ter ao menos 6 caracteres';
    return '';
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    if (!tokenFromUrl) return;

    setCheckingToken(true);
    setResetToken(tokenFromUrl);
    validateResetToken(tokenFromUrl)
      .then((data) => {
        if (data?.user) {
          setMode('reset');
          setName(data.user.name || '');
          setEmail(data.user.email || '');
          setSuccess('Redefina sua senha');
          setError('');
        }
      })
      .catch(() => {
        setError('Link de recuperação inválido ou expirado.');
        setMode('register');
        setResetToken('');
      })
      .finally(() => setCheckingToken(false));
  }, []);

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
      if (isResetMode) {
        const data = await resetPassword({ token: resetToken, password });
        setSuccess('Senha atualizada! Entrando...');
        if (data?.token) {
          localStorage.setItem('rcc_token', data.token);
        }
        if (data?.user?.name) {
          localStorage.setItem('rcc_user_name', data.user.name);
        }
        setTimeout(() => navigateWithTransition('/worlds'), 400);
        return;
      }

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
      setError(err.message || (isResetMode ? 'Erro ao redefinir senha.' : 'Erro ao criar conta.'));
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
      <h1 className="register-title">{isResetMode ? 'Resetar senha' : 'Criar conta'}</h1>
      {isResetMode && (
        <p className="register-subtitle" aria-live="polite">Redefina sua senha</p>
      )}
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
          disabled={checkingToken && isResetMode}
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
          disabled={checkingToken && isResetMode}
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

        <button className="button-primary" type="submit" disabled={loading || checkingToken}>
          {checkingToken ? 'Validando...' : loading ? (isResetMode ? 'Atualizando...' : 'Criando...') : isResetMode ? 'Atualizar dados' : 'Criar'}
        </button>
        <button className="button-secondary" type="button" onClick={handleBack} disabled={loading}>
          Voltar
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
