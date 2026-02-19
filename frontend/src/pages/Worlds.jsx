import { useEffect, useMemo, useState } from 'react';
import HeaderUser from '../components/HeaderUser.jsx';
import WorldList from '../components/WorldList.jsx';
import { createWorld, deleteWorld, getWorlds, updateWorld } from '../services/api.js';
import { navigateWithTransition } from '../services/navigation.js';

const Worlds = () => {
  const [worlds, setWorlds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const [modal, setModal] = useState({ open: false, type: null, world: null, value: '' });

  const token = useMemo(() => localStorage.getItem('rcc_token'), []);

  useEffect(() => {
    const storedName = localStorage.getItem('rcc_user_name');
    if (storedName) setUserName(storedName);
  }, []);

  useEffect(() => {
    const fetchWorlds = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getWorlds(token);
        setWorlds(data);
      } catch (err) {
        setError(err.message || 'Erro ao carregar mundos');
      } finally {
        setLoading(false);
      }
    };

    fetchWorlds();
  }, [token]);

  const handleCreate = async () => {
    navigateWithTransition('/worlds/create');
  };

  const handleEdit = async (world) => {
    setModal({ open: true, type: 'rename', world, value: world.name });
  };

  const handleDelete = async (world) => {
    setModal({ open: true, type: 'delete', world, value: '' });
  };

  const handleOpen = (world) => {
    navigateWithTransition(`/worlds/${world.id}/characters`);
  };

  const handleOpenGrid = (world) => {
    navigateWithTransition(`/worlds/${world.id}/grid`);
  };

  const handleBack = () => {
    navigateWithTransition('/');
  };

  const closeModal = () => setModal({ open: false, type: null, world: null, value: '' });

  const confirmModal = async () => {
    if (!modal.open || !modal.world) return;
    try {
      setLoading(true);
      if (modal.type === 'rename') {
        const newName = modal.value?.trim();
        if (!newName) return;
        const updated = await updateWorld(token, modal.world.id, { name: newName });
        setWorlds((prev) => prev.map((w) => (w.id === modal.world.id ? updated : w)));
      }
      if (modal.type === 'delete') {
        await deleteWorld(token, modal.world.id);
        setWorlds((prev) => prev.filter((w) => w.id !== modal.world.id));
      }
      closeModal();
    } catch (err) {
      setError(err.message || 'Erro ao atualizar mundo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page" role="presentation">
      <div className="register-overlay" aria-hidden />
      <div className="register-particles" aria-hidden />
      <div className="register-content worlds-wrapper">
        <div className="worlds-card fade-in">
          <HeaderUser name={userName} />

          {error && <div className="alert error" role="alert">{error}</div>}
          {loading && <div className="worlds-loading">Carregando...</div>}

          <WorldList
            worlds={worlds}
            onOpen={handleOpen}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpenGrid={handleOpenGrid}
          />

          <div className="worlds-actions">
            <button className="button-primary" type="button" onClick={handleCreate} disabled={loading}>
              Criar mais mundos
            </button>
            <button className="button-secondary" type="button" onClick={handleBack}>
              Voltar
            </button>
          </div>
        </div>
      </div>

      {modal.open && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3 className="modal-title">
              {modal.type === 'rename' ? 'Renomear mundo' : 'Excluir mundo'}
            </h3>
            {modal.type === 'rename' ? (
              <>
                <p className="modal-text">Digite o novo nome para "{modal.world?.name}"</p>
                <input
                  className="parchment-input"
                  value={modal.value}
                  onChange={(e) => setModal((m) => ({ ...m, value: e.target.value }))}
                  autoFocus
                />
              </>
            ) : (
              <p className="modal-text">Tem certeza que deseja excluir "{modal.world?.name}"?</p>
            )}
            <div className="modal-actions">
              <button className="button-secondary" type="button" onClick={closeModal}>
                Cancelar
              </button>
              <button className="button-primary" type="button" onClick={confirmModal} disabled={loading}>
                {modal.type === 'rename' ? 'Salvar' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Worlds;
