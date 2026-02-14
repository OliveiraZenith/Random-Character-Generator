import { useState } from 'react';

const defaultForm = {
  name: '',
  gender: 'male',
  race: '',
  appearance: '',
  history: ''
};

const defaultGenerate = {
  name: true,
  race: true,
  appearance: true,
  history: true
};

const CharacterForm = ({ onCreate, loading }) => {
  const [form, setForm] = useState(defaultForm);
  const [generate, setGenerate] = useState(defaultGenerate);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const toggleGenerate = (field) => {
    setGenerate((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!form.gender) return 'Selecione o gênero.';
    if (!generate.name && !form.name.trim()) return 'Informe o nome ou marque aleatório.';
    if (!generate.race && !form.race.trim()) return 'Informe a raça ou marque aleatório.';
    if (!generate.appearance && !form.appearance.trim()) return 'Descreva a aparência ou marque aleatório.';
    if (!generate.history && !form.history.trim()) return 'Inclua a história ou marque aleatório.';
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

    const payload = {
      name: form.name.trim() || undefined,
      gender: form.gender,
      race: form.race.trim() || undefined,
      appearance: form.appearance.trim() || undefined,
      history: form.history.trim() || undefined,
      generate
    };

    try {
      await onCreate(payload);
      setForm(defaultForm);
      setGenerate(defaultGenerate);
      setSuccess('Personagem criado!');
    } catch (err) {
      setError(err.message || 'Erro ao criar personagem.');
    }
  };

  return (
    <div className="characters-card fade-in">
      <h3 className="create-title">Novo personagem</h3>
      <form className="create-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label className="label">Gênero</label>
          <div className="gender-pills">
            <button
              type="button"
              className={`pill ${form.gender === 'male' ? 'pill-active' : ''}`}
              onClick={() => handleChange('gender', 'male')}
              disabled={loading}
            >
              Masculino
            </button>
            <button
              type="button"
              className={`pill ${form.gender === 'female' ? 'pill-active' : ''}`}
              onClick={() => handleChange('gender', 'female')}
              disabled={loading}
            >
              Feminino
            </button>
          </div>
        </div>

        <div className="field-group">
          <div className="field-header">
            <label className="label" htmlFor="char-name">Nome</label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={generate.name}
                onChange={() => toggleGenerate('name')}
                disabled={loading}
              />
              <span>Gerar aleatoriamente</span>
            </label>
          </div>
          <input
            id="char-name"
            className="input input-glow"
            type="text"
            placeholder="Nome do personagem"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            disabled={generate.name || loading}
          />
        </div>

        <div className="field-group">
          <div className="field-header">
            <label className="label" htmlFor="char-race">Raça</label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={generate.race}
                onChange={() => toggleGenerate('race')}
                disabled={loading}
              />
              <span>Gerar aleatoriamente</span>
            </label>
          </div>
          <input
            id="char-race"
            className="input input-glow"
            type="text"
            placeholder="Humano, elfo, orc..."
            value={form.race}
            onChange={(e) => handleChange('race', e.target.value)}
            disabled={generate.race || loading}
          />
        </div>

        <div className="field-group field-wide">
          <div className="field-header">
            <label className="label" htmlFor="char-appearance">Aparência</label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={generate.appearance}
                onChange={() => toggleGenerate('appearance')}
                disabled={loading}
              />
              <span>Gerar aleatoriamente</span>
            </label>
          </div>
          <textarea
            id="char-appearance"
            className="textarea"
            placeholder="Traços físicos marcantes, vestes, adereços"
            rows="3"
            value={form.appearance}
            onChange={(e) => handleChange('appearance', e.target.value)}
            disabled={generate.appearance || loading}
          />
        </div>

        <div className="field-group field-wide">
          <div className="field-header">
            <label className="label" htmlFor="char-history">História</label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={generate.history}
                onChange={() => toggleGenerate('history')}
                disabled={loading}
              />
              <span>Gerar aleatoriamente</span>
            </label>
          </div>
          <textarea
            id="char-history"
            className="textarea"
            placeholder="Passado, motivações, segredos"
            rows="3"
            value={form.history}
            onChange={(e) => handleChange('history', e.target.value)}
            disabled={generate.history || loading}
          />
        </div>

        {error && <div className="alert error" role="alert">{error}</div>}
        {success && <div className="alert success" role="status">{success}</div>}

        <button className="button-primary" type="submit" disabled={loading}>
          {loading ? 'Gerando...' : 'Criar personagem'}
        </button>
      </form>
    </div>
  );
};

export default CharacterForm;
