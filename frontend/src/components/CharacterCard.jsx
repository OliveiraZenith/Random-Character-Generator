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
    dragOver ? 'is-drag-over' : '',
    open ? 'is-open' : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cardClass}
      role="article"
      data-character-id={character.id}
      onDragOver={dragProps?.onDragOver}
      onDragLeave={dragProps?.onDragLeave}
      onDrop={dragProps?.onDrop}
      onTouchMove={dragProps?.onTouchMove}
      onTouchEnd={dragProps?.onTouchEnd}
    >
      <div className="character-card-bar">
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
        <button
          type="button"
          className="drag-handle"
          draggable={draggable}
          aria-label="Reordenar"
          disabled={disabled}
          onMouseDown={(e) => e.stopPropagation()}
          onDragStart={dragProps?.onDragStart}
          onDragEnd={dragProps?.onDragEnd}
          onTouchStart={dragProps?.onTouchStart}
        >
          {' '}
        </button>
      </div>

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
