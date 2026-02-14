import { useEffect, useMemo, useState } from 'react';
import CharacterDetails from '../components/CharacterDetails.jsx';
import { getCharacterById, updateCharacter } from '../services/api.js';

const parseCharacterId = () => {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const idx = parts.findIndex((p) => p === 'characters');
  if (idx !== -1 && parts[idx + 1]) return Number(parts[idx + 1]);
  return null;
};

const normalizePayload = (form) => ({
  name: form.name,
  gender: form.gender,
  race: form.race?.trim() || null,
  appearance: form.appearance?.trim() || null,
  history: form.history?.trim() || null
});

const CharacterView = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [original, setOriginal] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [worldId, setWorldId] = useState(null);

  const token = useMemo(() => localStorage.getItem('rcc_token'), []);
  const characterId = useMemo(() => parseCharacterId(), []);

  const isDirty = () => JSON.stringify(normalizePayload(form)) !== JSON.stringify(normalizePayload(original));

  useEffect(() => {
    if (!token || !characterId) {
      setError('Sessão expirada ou personagem não encontrado.');
      setLoading(false);
      return;
    }

    const fetchCharacter = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getCharacterById(token, characterId);
        const base = {
          name: data.name || '',
          gender: data.gender || 'male',
          race: data.race || '',
          appearance: data.appearance || '',
          history: data.story || data.history || ''
        };
        setForm(base);
        setOriginal(base);
        setWorldId(data.worldId || data.world?.id || null);
      } catch (err) {
        setError(err.message || 'Erro ao carregar personagem.');
      } finally {
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [token, characterId]);

  useEffect(() => {
    const handler = (event) => {
      if (isDirty()) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [form, original]);

  const handleFieldChange = (field, value) => {
    setMessage('');
    setError('');
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!isDirty()) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = normalizePayload(form);
      const updated = await updateCharacter(token, characterId, payload);
      const next = {
        name: updated.name,
        gender: updated.gender || 'male',
        race: updated.race || '',
        appearance: updated.appearance || '',
        history: updated.story || updated.history || ''
      };
      setForm(next);
      setOriginal(next);
      setMessage('Personagem salvo com sucesso!');
      setTimeout(() => setMessage(''), 2500);
    } catch (err) {
      setError(err.message || 'Erro ao salvar personagem.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (worldId) {
      window.location.href = `/worlds/${worldId}/characters`;
      return;
    }
    window.history.back();
  };

  if (loading) {
    return (
      <div className="character-view-page">
        <div className="register-overlay" aria-hidden />
        <div className="register-particles" aria-hidden />
        <div className="character-view-shell">
          <div className="worlds-loading">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="character-view-page">
      <div className="character-bg" aria-hidden />
      <div className="register-overlay" aria-hidden />
      <div className="character-view-shell">
        <CharacterDetails
          name={form.name}
          form={form}
          onFieldChange={handleFieldChange}
          onSave={handleSave}
          onBack={handleBack}
          loading={saving}
          dirty={isDirty()}
          message={message}
          error={error}
        />
      </div>
    </div>
  );
};

export default CharacterView;
