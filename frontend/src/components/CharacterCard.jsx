import { useState } from 'react';

const genderLabel = {
  male: 'Masculino',
  female: 'Feminino'
};

const CharacterCard = ({ character, onEdit, onDelete, disabled }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="character-card glow-hover fade-in" role="article">
      <button
        type="button"
        className="character-summary"
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
        aria-expanded={open}
      >
        <span className="character-name">{character.name}</span>
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
