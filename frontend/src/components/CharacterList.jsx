import { useState } from 'react';
import CharacterCard from './CharacterCard.jsx';

const CharacterList = ({ characters, onEdit, onDelete, onReorder, disabled }) => {
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const resetDrag = () => {
    setDraggingId(null);
    setDragOverId(null);
  };

  const handleDragStart = (event, characterId) => {
    if (disabled) return;
    setDraggingId(characterId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(characterId));
  };

  const handleDragOver = (event, characterId) => {
    if (disabled) return;
    event.preventDefault();
    if (dragOverId !== characterId) {
      setDragOverId(characterId);
    }
  };

  const handleDrop = (event, targetId) => {
    if (disabled) return;
    event.preventDefault();
    const sourceId = Number(event.dataTransfer.getData('text/plain'));
    if (!sourceId || sourceId === targetId) {
      resetDrag();
      return;
    }

    const currentIndex = characters.findIndex((c) => c.id === sourceId);
    const targetIndex = characters.findIndex((c) => c.id === targetId);
    if (currentIndex === -1 || targetIndex === -1) {
      resetDrag();
      return;
    }

    const updated = [...characters];
    const [moved] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, moved);
    onReorder?.(updated);
    resetDrag();
  };

  const handleDragEnd = () => resetDrag();

  const handleDragLeave = (characterId) => {
    if (disabled) return;
    if (dragOverId === characterId) {
      setDragOverId(null);
    }
  };

  if (!characters.length) {
    return <div className="characters-empty">Nenhum personagem criado neste mundo.</div>;
  }

  return (
    <div className="characters-list">
      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          onEdit={onEdit}
          onDelete={onDelete}
          disabled={disabled}
          dragProps={{
            draggable: !disabled,
            isDragging: draggingId === character.id,
            isDragOver: dragOverId === character.id,
            onDragStart: (event) => handleDragStart(event, character.id),
            onDragOver: (event) => handleDragOver(event, character.id),
            onDragLeave: () => handleDragLeave(character.id),
            onDrop: (event) => handleDrop(event, character.id),
            onDragEnd: handleDragEnd
          }}
        />
      ))}
    </div>
  );
};

export default CharacterList;
