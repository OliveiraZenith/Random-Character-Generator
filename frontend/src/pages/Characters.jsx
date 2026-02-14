import { useEffect, useMemo, useState } from 'react';
import CharacterForm from '../components/CharacterForm.jsx';
import CharacterList from '../components/CharacterList.jsx';
import {
  createCharacter as apiCreateCharacter,
  deleteCharacter as apiDeleteCharacter,
  getCharactersByWorld,
  getWorlds
} from '../services/api.js';
import { navigateWithTransition } from '../services/navigation.js';

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

  const token = useMemo(() => localStorage.getItem('rcc_token'), []);
  const worldId = useMemo(() => parseWorldId(), []);

  useEffect(() => {
    if (!token || !worldId) {
      setError('Mundo não encontrado ou sessão expirada.');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [worldsData, charactersData] = await Promise.all([
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
    window.open(`/characters/${character.id}`, '_blank');
  };

  const handleBack = () => {
    navigateWithTransition('/worlds');
  };

  return (
    <>
      <div className="register-page characters-page" role="presentation">
        <div className="register-overlay" aria-hidden />
        <div className="register-particles" aria-hidden />
        <div className="register-content worlds-wrapper">
          <div className="characters-grid">
            <div className="characters-column">
              <h1 className="characters-title">Seus personagens</h1>

              {error && <div className="alert error" role="alert">{error}</div>}
              {loading && <div className="worlds-loading">Carregando personagens...</div>}

              <CharacterList
                characters={characters}
                onEdit={handleEdit}
                onDelete={handleDelete}
                disabled={actionLoading}
              />

              <div className="characters-footer">
                <button className="button-secondary" type="button" onClick={handleBack}>
                  Voltar
                </button>
              </div>
            </div>

            <div className="characters-column">
              <CharacterForm onCreate={handleCreate} loading={actionLoading} />
            </div>
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
    </>
  );
};

export default Characters;
