import { useEffect, useMemo, useState } from 'react';
import CharacterForm from '../components/CharacterForm.jsx';
import CharacterList from '../components/CharacterList.jsx';
import SidebarNav from '../components/SidebarNav.jsx';
import {
  createCharacter as apiCreateCharacter,
  deleteCharacter as apiDeleteCharacter,
  getCharactersByWorld,
  getNotesByWorld,
  getWorlds,
  createNote as apiCreateNote,
  updateNote as apiUpdateNote,
  deleteNote as apiDeleteNote,
  reorderCharacters as apiReorderCharacters,
  reorderNotes as apiReorderNotes
} from '../services/api.js';
import { navigateWithTransition } from '../services/navigation.js';
import NotesPanel from '../components/NotesPanel.jsx';

const normalizeTagString = (raw) => {
  if (!raw) return [];
  return raw
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
};

const filterCharactersByTags = (characters, search) => {
  const filters = normalizeTagString(search);
  if (!filters.length) return characters;
  return characters.filter((character) => {
    const tagSet = new Set((character.tags || []).map((t) => t.toLowerCase()));
    return filters.every((tag) => tagSet.has(tag));
  });
};

const parseWorldId = () => {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const idx = parts.findIndex((segment) => segment === 'worlds');
  if (idx !== -1 && parts[idx + 1]) return Number(parts[idx + 1]);
  return null;
};

const Characters = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ open: false, character: null });
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState('');
  const [noteSavingId, setNoteSavingId] = useState(null);
  const [noteModal, setNoteModal] = useState({ open: false, note: null });
  const [reorderingCharacters, setReorderingCharacters] = useState(false);
  const [reorderingNotes, setReorderingNotes] = useState(false);
  const [searchTags, setSearchTags] = useState('');

  const token = useMemo(() => localStorage.getItem('rcc_token'), []);
  const worldId = useMemo(() => parseWorldId(), []);
  const syncChannel = useMemo(() => new BroadcastChannel('rcc-sync'), []);

  useEffect(() => {
    return () => syncChannel.close();
  }, [syncChannel]);

  useEffect(() => {
    if (!token || !worldId) {
      setError('Mundo não encontrado ou sessão expirada.');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [, charactersData] = await Promise.all([
          getWorlds(token),
          getCharactersByWorld(token, worldId)
        ]);
        setCharacters(charactersData);
      } catch (err) {
        setError(err.message || 'Erro ao carregar personagens.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, worldId]);

  const fetchNotes = async () => {
    setNotesLoading(true);
    setNotesError('');
    try {
      const data = await getNotesByWorld(token, worldId);
      setNotes(data);
    } catch (err) {
      setNotesError(err.message || 'Erro ao carregar anotações.');
    } finally {
      setNotesLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !worldId) return;
    fetchNotes();
  }, [token, worldId]);

  useEffect(() => {
    const handler = (event) => {
      const { type, payload } = event.data || {};
      if (!payload || (payload.worldId && payload.worldId !== worldId)) return;

      if (type === 'noteUpdated') {
        setNotes((prev) => {
          const exists = prev.some((n) => n.id === payload.id);
          if (exists) {
            return prev.map((n) => (n.id === payload.id ? { ...n, ...payload } : n));
          }
          return [payload, ...prev];
        });
      }

      if (type === 'characterUpdated') {
        setCharacters((prev) => prev.map((c) => (c.id === payload.id ? { ...c, ...payload } : c)));
      }
    };

    syncChannel.addEventListener('message', handler);
    return () => syncChannel.removeEventListener('message', handler);
  }, [syncChannel, worldId]);

  const handleCreate = async (payload) => {
    setActionLoading(true);
    setError('');
    try {
      const created = await apiCreateCharacter(token, worldId, payload);
      setCharacters((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      setError(err.message || 'Erro ao criar personagem.');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (character) => {
    setModal({ open: true, character });
  };

  const confirmDelete = async () => {
    if (!modal.character) return;
    setActionLoading(true);
    setError('');
    try {
      await apiDeleteCharacter(token, modal.character.id);
      setCharacters((prev) => prev.filter((c) => c.id !== modal.character.id));
      setModal({ open: false, character: null });
    } catch (err) {
      setError(err.message || 'Erro ao excluir personagem.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (character) => {
    // Keep tags for fallback in edit view in case API returns stale data
    try {
      sessionStorage.setItem('rcc_last_character_tags', JSON.stringify({ id: character.id, tags: character.tags || [] }));
    } catch (err) {
      // ignore storage issues
    }
    window.open(`/characters/${character.id}`, '_blank');
  };

  const handleReorder = (nextOrder) => {
    const previous = characters;
    setCharacters(nextOrder);
    setReorderingCharacters(true);
    setError('');

    const persist = async () => {
      try {
        const ordered = await apiReorderCharacters(token, worldId, nextOrder.map((c) => c.id));
        setCharacters(ordered);
      } catch (err) {
        setCharacters(previous);
        setError(err.message || 'Erro ao salvar ordem dos personagens.');
      } finally {
        setReorderingCharacters(false);
      }
    };

    persist();
  };

  const handleAddNote = async () => {
    if (!token || !worldId) return;
    setNoteSavingId('new');
    setNotesError('');
    try {
      const created = await apiCreateNote(token, worldId, { title: 'Nova anotação', content: '' });
      setNotes((prev) => [created, ...prev]);
    } catch (err) {
      setNotesError(err.message || 'Erro ao criar anotação.');
    } finally {
      setNoteSavingId(null);
    }
  };

  const handleSaveNote = async (id, payload) => {
    setNoteSavingId(id);
    setNotesError('');
    try {
      const updated = await apiUpdateNote(token, id, payload);
      setNotes((prev) => prev.map((note) => (note.id === id ? updated : note)));
    } catch (err) {
      setNotesError(err.message || 'Erro ao salvar anotação.');
    } finally {
      setNoteSavingId(null);
    }
  };

  const handleDeleteNote = async (note) => {
    setNoteModal({ open: true, note });
  };

  const handleReorderNotes = (nextOrder) => {
    const previous = notes;
    setNotes(nextOrder);
    setReorderingNotes(true);
    setNotesError('');

    const persist = async () => {
      try {
        const ordered = await apiReorderNotes(token, worldId, nextOrder.map((n) => n.id));
        setNotes(ordered);
      } catch (err) {
        setNotes(previous);
        setNotesError(err.message || 'Erro ao salvar ordem das anotações.');
      } finally {
        setReorderingNotes(false);
      }
    };

    persist();
  };

  const confirmDeleteNote = async () => {
    if (!noteModal.note) return;
    setNoteSavingId(noteModal.note.id);
    setNotesError('');
    try {
      await apiDeleteNote(token, noteModal.note.id);
      setNotes((prev) => prev.filter((n) => n.id !== noteModal.note.id));
      setNoteModal({ open: false, note: null });
    } catch (err) {
      setNotesError(err.message || 'Erro ao excluir anotação.');
    } finally {
      setNoteSavingId(null);
    }
  };

  return (
    <>
      <SidebarNav worldId={worldId} />
      <div className="register-page characters-page" role="presentation">
        <div className="register-overlay" aria-hidden />
        <div className="register-particles" aria-hidden />
        <div className="register-content worlds-wrapper">
          <div className="characters-grid">
            <div className="characters-column">
              <h1 className="characters-title">Seus personagens</h1>

              <div className="field-group">
                <label className="label" htmlFor="tag-search">Buscar por tag</label>
                <input
                  id="tag-search"
                  className="input input-glow"
                  type="text"
                  placeholder="mago, vilão, npc"
                  value={searchTags}
                  onChange={(e) => setSearchTags(e.target.value)}
                />
              </div>

              {error && <div className="alert error" role="alert">{error}</div>}
              {loading && <div className="worlds-loading">Carregando personagens...</div>}

              <CharacterList
                characters={filterCharactersByTags(characters, searchTags)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReorder={handleReorder}
                disabled={actionLoading || reorderingCharacters}
              />
            </div>

            <div className="characters-column">
              <CharacterForm onCreate={handleCreate} loading={actionLoading} />
            </div>

            <NotesPanel
              notes={notes}
              loading={notesLoading}
              error={notesError}
              savingId={noteSavingId}
              onAdd={handleAddNote}
              onSave={handleSaveNote}
              onDelete={handleDeleteNote}
              onReorder={handleReorderNotes}
              reordering={reorderingNotes}
            />
          </div>
        </div>
      </div>

      {modal.open && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3 className="modal-title">Excluir personagem</h3>
            <p className="modal-text">Deseja remover "{modal.character?.name}"?</p>
            <div className="modal-actions">
              <button className="button-secondary" type="button" onClick={() => setModal({ open: false, character: null })}>
                Cancelar
              </button>
              <button className="button-primary" type="button" onClick={confirmDelete} disabled={actionLoading}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {noteModal.open && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3 className="modal-title">Excluir anotação</h3>
            <p className="modal-text">Deseja remover "{noteModal.note?.title || 'Nova anotação'}"?</p>
            <div className="modal-actions">
              <button className="button-secondary" type="button" onClick={() => setNoteModal({ open: false, note: null })}>
                Cancelar
              </button>
              <button className="button-primary" type="button" onClick={confirmDeleteNote} disabled={noteSavingId === noteModal.note?.id}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Characters;
