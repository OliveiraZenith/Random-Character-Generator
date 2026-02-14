import { useEffect, useMemo, useState } from 'react';

const NotesPanel = ({
  notes,
  loading,
  error,
  savingId,
  onAdd,
  onSave,
  onDelete,
  onOpen
}) => {
  const [drafts, setDrafts] = useState({});
  const [openNotes, setOpenNotes] = useState({});
  const [savingAll, setSavingAll] = useState(false);

  useEffect(() => {
    const initial = Object.fromEntries(
      (notes || []).map((note) => [
        note.id,
        {
          // Treat placeholder title as empty so the placeholder shows and the user types directly
          title: note.title === 'Nova anotação' ? '' : note.title,
          content: note.content
        }
      ])
    );
    setDrafts(initial);

    const initialOpen = Object.fromEntries((notes || []).map((note) => [note.id, true]));
    setOpenNotes(initialOpen);
  }, [notes]);

  const toggleOpen = (id) => {
    setOpenNotes((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
  };

  const handleChange = (id, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const getDraft = (note) => drafts[note.id] || { title: note.title, content: note.content };

  const handleSave = async (note) => {
    const payload = getDraft(note);
    return onSave?.(note.id, payload);
  };

  const saveAllDirtyNotes = async () => {
    const tasks = [];
    (notes || []).forEach((note) => {
      const draft = getDraft(note);
      const originalTitle = note.title === 'Nova anotação' ? '' : note.title;
      const changed = draft.title !== originalTitle || draft.content !== note.content;
      if (changed) tasks.push(handleSave(note));
    });
    await Promise.all(tasks);
  };

  const handleAddWithSave = async () => {
    if (savingAll) return;
    try {
      setSavingAll(true);
      await saveAllDirtyNotes();
      await onAdd?.();
    } finally {
      setSavingAll(false);
    }
  };

  const handleOpen = async (note) => {
    const draft = getDraft(note);
    const originalTitle = note.title === 'Nova anotação' ? '' : note.title;
    const changed = draft.title !== originalTitle || draft.content !== note.content;

    if (changed) {
      await handleSave(note);
    }

    onOpen?.(note.id, draft);
    window.open(`/notes/${note.id}`, '_blank', 'noopener,noreferrer');
  };

  const hasNotes = useMemo(() => (notes || []).length > 0, [notes]);

  return (
    <div className="notes-column">
      <div className="notes-header">
        <h2 className="notes-title">Suas anotações</h2>
        <button className="button-primary" type="button" onClick={handleAddWithSave} disabled={loading || savingAll}>
          {savingAll ? 'Salvando...' : 'Nova anotação'}
        </button>
      </div>

      {error && <div className="alert error" role="alert">{error}</div>}
      {loading && <div className="worlds-loading">Carregando anotações...</div>}

      {!loading && !hasNotes && (
        <div className="worlds-empty">Sem anotações ainda. Crie a primeira.</div>
      )}

      <div className="notes-list">
        {notes.map((note) => {
          const draft = getDraft(note);
          const isSaving = savingId === note.id;
          const isOpen = openNotes[note.id] ?? true;

          return (
            <div className="note-card" key={note.id}>
              <div className="note-summary-row">
                <button
                  type="button"
                  className="note-summary"
                  onClick={() => toggleOpen(note.id)}
                  aria-expanded={isOpen}
                  disabled={savingAll}
                >
                  <span className="note-summary-title">{draft.title || 'Nova anotação'}</span>
                  <span className="note-arrow" aria-hidden>{isOpen ? '▲' : '▼'}</span>
                </button>
                <button
                  className="icon-btn"
                  type="button"
                  aria-label="Excluir anotação"
                  onClick={() => onDelete(note)}
                  disabled={isSaving || savingAll}
                >
                  🗑️
                </button>
              </div>

              {isOpen && (
                <div className="note-body">
                  <input
                    className="input note-title-input"
                    value={draft.title}
                    onChange={(e) => handleChange(note.id, 'title', e.target.value)}
                    placeholder="Nova anotação"
                    disabled={savingAll}
                  />

                  <textarea
                    className="textarea note-content"
                    value={draft.content}
                    onChange={(e) => handleChange(note.id, 'content', e.target.value)}
                    placeholder="Escreva suas anotações..."
                    rows={6}
                    disabled={savingAll}
                  />

                  <div className="note-actions">
                    <button
                      className="link-button"
                      type="button"
                      onClick={() => handleSave(note)}
                      disabled={isSaving || savingAll}
                    >
                      {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button className="link-button" type="button" onClick={() => handleOpen(note)} disabled={isSaving || savingAll}>
                      Abrir em nova guia
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotesPanel;
