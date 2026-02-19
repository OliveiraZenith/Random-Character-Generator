import { useState } from 'react';

const genderLabel = {
  male: 'Masculino',
  female: 'Feminino'
};

const CharacterCard = ({ character, onEdit, onDelete, disabled, dragProps }) => {
  const [open, setOpen] = useState(false);

  const dragging = dragProps?.isDragging;
  const dragOver = dragProps?.isDragOver;
  const draggable = Boolean(dragProps?.draggable);
  const cardClass = [
    'character-card glow-hover fade-in',
    draggable ? 'is-draggable' : '',
    dragging ? 'is-dragging' : '',
    dragOver ? 'is-drag-over' : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cardClass}
      role="article"
      draggable={draggable}
      aria-grabbed={dragging || undefined}
      onDragStart={dragProps?.onDragStart}
      onDragOver={dragProps?.onDragOver}
      onDragLeave={dragProps?.onDragLeave}
      onDrop={dragProps?.onDrop}
      onDragEnd={dragProps?.onDragEnd}
    >
      <button
        type="button"
        className="character-summary"
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
        aria-expanded={open}
      >
        <div className="character-summary-head">
          <span className="character-name">{character.name}</span>
          {Array.isArray(character.tags) && character.tags.length > 0 && (
            <div className="chip-row chip-row-tight" aria-label="Tags do personagem">
              {character.tags.map((tag) => (
                <span key={tag} className="chip chip-small">{tag}</span>
              ))}
            </div>
          )}
        </div>
        <span className="character-arrow" aria-hidden>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="character-body">
          <p className="character-line"><strong>Raça:</strong> {character.race || 'Não informada'}</p>
          <p className="character-line"><strong>Aparência:</strong> {character.appearance || 'Sem descrição'}</p>
          <p className="character-line"><strong>História:</strong> {character.story || 'Sem história registrada'}</p>
          <p className="character-line"><strong>Gênero:</strong> {genderLabel[character.gender] || 'Indefinido'}</p>

          <div className="character-actions" onClick={(e) => e.stopPropagation()}>
            <button className="icon-btn" type="button" aria-label="Editar" onClick={() => onEdit(character)} disabled={disabled}>
              ✏️
            </button>
            <button className="icon-btn" type="button" aria-label="Excluir" onClick={() => onDelete(character)} disabled={disabled}>
              🗑️
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterCard;
