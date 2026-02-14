import { useState } from 'react';
import ThemeSelector from './ThemeSelector.jsx';
import CountrySelect from './CountrySelect.jsx';
import { createWorld } from '../services/api.js';
import { navigateWithTransition } from '../services/navigation.js';

const WorldForm = () => {
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('fantasia');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const shouldShowCountry = theme === 'modern';

  const validate = () => {
    if (!name.trim()) return 'Nome do mundo é obrigatório';
    if (!theme) return 'Selecione um tema';
    if (shouldShowCountry && !country.trim()) return 'Informe o país para Tempos atuais';
    return '';
  };

  const mapThemeToBackend = (t) => {
    if (t === 'modern') return { theme: 'atual', country };
    if (t === 'medieval') return { theme: 'medieval', country: null };
    return { theme: 'fantasia', country: null };
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
      const token = localStorage.getItem('rcc_token');
      const { theme: backendTheme, country: backendCountry } = mapThemeToBackend(theme);
      await createWorld(token, {
        name,
        theme: backendTheme,
        country: backendCountry,
      });
      setSuccess('Mundo criado!');
      setTimeout(() => navigateWithTransition('/worlds'), 500);
    } catch (err) {
      setError(err.message || 'Erro ao criar mundo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-card fade-in">
      <h1 className="create-title">Crie seu mundo</h1>
      <form className="create-form" onSubmit={handleSubmit}>
        <label className="label" htmlFor="world-name">Nome do mundo</label>
        <input
          id="world-name"
          className="input input-glow"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do mundo"
        />

        <ThemeSelector value={theme} onChange={setTheme} />
        <CountrySelect value={country} onChange={setCountry} visible={shouldShowCountry} />

        {error && <div className="alert error" role="alert">{error}</div>}
        {success && <div className="alert success" role="status">{success}</div>}

        <div className="worlds-actions">
          <button className="button-primary" type="submit" disabled={loading}>
            {loading ? 'Criando...' : 'Criar'}
          </button>
          <button className="button-secondary" type="button" onClick={() => navigateWithTransition('/worlds')}>
            Voltar
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorldForm;
