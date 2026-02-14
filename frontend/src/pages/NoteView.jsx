import { useEffect, useMemo, useState } from 'react';
import EditableField from '../components/EditableField.jsx';
import SaveButton from '../components/SaveButton.jsx';
import { getNoteById, updateNote } from '../services/api.js';

const parseNoteId = () => {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const idx = parts.findIndex((segment) => segment === 'notes');
  if (idx !== -1 && parts[idx + 1]) return Number(parts[idx + 1]);
  return null;
};

const normalizePayload = (form) => ({
  title: form.title?.trim() || 'Sem título',
  content: form.content ?? ''
});

const NoteView = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [original, setOriginal] = useState({ title: '', content: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [worldId, setWorldId] = useState(null);

  const token = useMemo(() => localStorage.getItem('rcc_token'), []);
  const noteId = useMemo(() => parseNoteId(), []);
  const syncChannel = useMemo(() => new BroadcastChannel('rcc-sync'), []);

  const postSyncMessage = (message) => {
    try {
      syncChannel.postMessage(message);
    } catch (err) {
      // Recreate channel if it was closed unexpectedly (e.g., dev HMR or tab lifecycle)
      try {
        const fresh = new BroadcastChannel('rcc-sync');
        fresh.postMessage(message);
      } catch (innerErr) {
        console.error('Sync broadcast failed', innerErr);
      }
    }
  };

  const isDirty = () => JSON.stringify(normalizePayload(form)) !== JSON.stringify(normalizePayload(original));

  useEffect(() => {
    return () => syncChannel.close();
  }, [syncChannel]);

  useEffect(() => {
    if (!token || !noteId) {
      setError('Sessão expirada ou anotação não encontrada.');
      setLoading(false);
      return;
    }

    const fetchNote = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getNoteById(token, noteId);
        const base = {
          title: data.title || '',
          content: data.content || ''
        };
        setForm(base);
        setOriginal(base);
        setWorldId(data.worldId || data.world_id || null);
      } catch (err) {
        setError(err.message || 'Erro ao carregar anotação.');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [token, noteId]);

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
      const updated = await updateNote(token, noteId, payload);
      const base = {
        title: updated.title || payload.title,
        content: updated.content || payload.content
      };
      setForm(base);
      setOriginal(base);
      postSyncMessage({ type: 'noteUpdated', payload: { ...base, id: noteId, worldId } });
      setMessage('Anotação salva com sucesso!');
      setTimeout(() => setMessage(''), 2500);
    } catch (err) {
      setError(err.message || 'Erro ao salvar anotação.');
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
        <div className="character-view">
          <div className="character-view-header">
            <h1 className="character-view-title">{form.title || 'Anotação'}</h1>
            <p className="character-view-subtitle">Edite os detalhes da anotação</p>
          </div>

          <div className="character-view-body">
            <EditableField
              label="Título"
              name="title"
              placeholder="Nova anotação"
              value={form.title}
              onChange={(val) => handleFieldChange('title', val)}
            />

            <EditableField
              label="Conteúdo"
              name="content"
              type="textarea"
              rows={8}
              placeholder="Escreva suas anotações..."
              value={form.content}
              onChange={(val) => handleFieldChange('content', val)}
            />
          </div>

          <div className="character-view-footer">
            <SaveButton onClick={handleSave} loading={saving} disabled={!isDirty()}>
              Salvar anotação
            </SaveButton>
            <button className="button-secondary" type="button" onClick={handleBack}>
              Voltar
            </button>
            {message && <div className="toast success" role="status">{message}</div>}
            {error && <div className="toast error" role="alert">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteView;
